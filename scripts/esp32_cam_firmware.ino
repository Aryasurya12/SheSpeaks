/**
 * ============================================================================
 * SheSpeaks - ESP32-CAM Harassment Incident Reporter
 * ============================================================================
 * Hardware: AI-Thinker ESP32-CAM module
 * Trigger: Push Button / PIR Sensor connected to GPIO 13 (or GPIO 12/14)
 * Action: Captures JPEG frame from OV2640 camera, connects to WiFi, and HTTP POSTs
 *         raw binary image to /api/hardware endpoint with GPS coords & device ID.
 * ============================================================================
 */

#include "esp_camera.h"
#include <WiFi.h>
#include <HTTPClient.h>

// ----------------------------------------------------------------------------
// 1. WiFi & Server Configuration
// ----------------------------------------------------------------------------
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// Replace with your local machine IP or deployed domain
// Example: "http://192.168.1.100:3000/api/hardware"
const char* SERVER_URL    = "http://YOUR_SERVER_IP:3000/api/hardware";

// Hardware Identification & GPS Coordinates (can be updated via GPS module or hardcoded)
const char* DEVICE_ID     = "ESP32-CAM-SECTOR-09";
const float LATITUDE      = 19.0760; // Example: Mumbai
const float LONGITUDE     = 72.8777;

// Trigger Pin (PIR sensor or panic button, active LOW with internal pull-up)
#define TRIGGER_PIN 13
#define FLASH_LED_PIN 4 // Built-in high brightness LED on ESP32-CAM

// ----------------------------------------------------------------------------
// 2. Camera Pin Definitions (AI-Thinker Model)
// ----------------------------------------------------------------------------
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27

#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

// Cooldown tracking (in addition to server-side rate limiter)
unsigned long lastTriggerTime = 0;
const unsigned long LOCAL_COOLDOWN_MS = 10000; // 10 seconds

void setupCamera() {
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sscb_sda = SIOD_GPIO_NUM;
  config.pin_sscb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;

  // Frame size & quality
  if (psramFound()) {
    config.frame_size = FRAMESIZE_VGA; // 640x480
    config.jpeg_quality = 10;          // 10-63 (lower means higher quality)
    config.fb_count = 2;
  } else {
    config.frame_size = FRAMESIZE_QVGA; // 320x240
    config.jpeg_quality = 12;
    config.fb_count = 1;
  }

  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("❌ Camera init failed with error 0x%x\n", err);
    return;
  }
  Serial.println("✅ Camera initialized successfully.");
}

void setupWiFi() {
  Serial.printf("Connecting to WiFi: %s\n", WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi connected!");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n❌ WiFi connection failed. Will retry on trigger.");
  }
}

void captureAndSendReport() {
  if (WiFi.status() != WL_CONNECTED) {
    setupWiFi();
  }

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ Cannot send report: No WiFi connection.");
    return;
  }

  // Turn on flash briefly
  pinMode(FLASH_LED_PIN, OUTPUT);
  digitalWrite(FLASH_LED_PIN, HIGH);
  delay(100);

  Serial.println("📸 Capturing photo frame...");
  camera_fb_t * fb = esp_camera_fb_get();
  
  // Turn off flash
  digitalWrite(FLASH_LED_PIN, LOW);

  if (!fb) {
    Serial.println("❌ Camera capture failed.");
    return;
  }

  Serial.printf("📸 Photo captured! Size: %u bytes\n", fb->len);

  // Construct target URL with query params
  String url = String(SERVER_URL) + "?lat=" + String(LATITUDE, 6) + "&lng=" + String(LONGITUDE, 6) + "&deviceId=" + String(DEVICE_ID);

  HTTPClient http;
  http.begin(url);
  http.addHeader("Content-Type", "image/jpeg");
  http.addHeader("x-device-id", DEVICE_ID);
  http.setTimeout(15000); // 15 second timeout

  Serial.println("📤 Sending image to SheSpeaks Police Pipeline...");
  int httpResponseCode = http.POST(fb->buf, fb->len);

  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.printf("✅ Server Response [%d]: %s\n", httpResponseCode, response.c_str());
    if (httpResponseCode == 201) {
      Serial.println("🚨 HARASSMENT REPORT CREATED & DISPATCHED TO POLICE!");
    } else if (httpResponseCode == 429) {
      Serial.println("⚠️ Rate limited: Cooldown active.");
    }
  } else {
    Serial.printf("❌ HTTP POST failed. Error: %s\n", http.errorToString(httpResponseCode).c_str());
  }

  http.end();
  esp_camera_fb_return(fb); // Release frame buffer
}

void setup() {
  Serial.begin(115200);
  Serial.println("\n=========================================");
  Serial.println("🛡️ SheSpeaks ESP32-CAM Incident Sensor");
  Serial.println("=========================================");

  pinMode(TRIGGER_PIN, INPUT_PULLUP);
  pinMode(FLASH_LED_PIN, OUTPUT);
  digitalWrite(FLASH_LED_PIN, LOW);

  setupCamera();
  setupWiFi();

  Serial.println("Ready. Waiting for sensor trigger on GPIO 13...");
}

void loop() {
  // Check if sensor is triggered (Active LOW)
  if (digitalRead(TRIGGER_PIN) == LOW) {
    unsigned long now = millis();
    if (now - lastTriggerTime > LOCAL_COOLDOWN_MS) {
      lastTriggerTime = now;
      Serial.println("\n⚡ SENSOR TRIGGER DETECTED!");
      captureAndSendReport();
    } else {
      Serial.println("⏳ Ignoring trigger: local cooldown active.");
    }
    delay(500); // Debounce
  }
  delay(50);
}
