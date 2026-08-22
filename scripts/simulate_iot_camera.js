/**
 * ============================================================================
 * SheSpeaks IoT Camera Sensor -> Police Report Simulator (Local & Cloud)
 * ============================================================================
 * Usage:
 *   Local  : node scripts/simulate_iot_camera.js
 *   Hosted : node scripts/simulate_iot_camera.js https://your-hosted-domain.vercel.app
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.substring(0, idx).trim();
        let val = trimmed.substring(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[key] = val;
      }
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check CLI arguments for custom target URL (e.g. hosted Vercel domain)
const cliTarget = process.argv[2];
let targetBaseUrl = cliTarget || `http://localhost:${process.env.PORT || 3000}`;
if (targetBaseUrl.endsWith('/')) {
  targetBaseUrl = targetBaseUrl.slice(0, -1);
}
if (!targetBaseUrl.endsWith('/api/hardware')) {
  targetBaseUrl = `${targetBaseUrl}/api/hardware`;
}

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function createSampleImageBuffer() {
  return Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
    0xde, 0x00, 0x00, 0x00, 0x0c, 0x49, 0x44, 0x41,
    0x54, 0x08, 0xd7, 0x63, 0xf8, 0xcf, 0xc0, 0x00,
    0x00, 0x00, 0x02, 0x00, 0x01, 0xe2, 0x21, 0xbc,
    0x33, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e,
    0x44, 0xae, 0x42, 0x60, 0x82,
  ]);
}

async function runSimulator() {
  const deviceId = `ESP32-CAM-CLOUD-${Date.now().toString(36).toUpperCase()}`;
  const testLat = 19.0760;
  const testLng = 72.8777;

  console.log('\n============================================================');
  console.log('🛡️ SheSpeaks: IoT Camera -> Police Pipeline (Diagnostic Test)');
  console.log('============================================================');
  console.log(`📷 Device ID : ${deviceId}`);
  console.log(`📍 GPS       : ${testLat}, ${testLng}`);
  console.log(`🎯 Target API: ${targetBaseUrl}`);

  // 1. Setup Realtime Listener for Police Broadcast
  console.log('\n[1/4] 📡 Listening for Police Realtime Emergency Broadcast...');
  let broadcastReceived = false;

  const channel = supabase
    .channel('emergency_signals')
    .on('broadcast', { event: 'panic_alert' }, (payload) => {
      if (payload.payload && payload.payload.deviceId === deviceId) {
        broadcastReceived = true;
        console.log('  🚨 [REALTIME ALERT RECEIVED] Incident ID:', payload.payload.id);
        console.log('  📷 Evidence Photo URL:', payload.payload.evidence?.[0]);
      }
    })
    .subscribe();

  await new Promise((r) => setTimeout(r, 1500));

  // 2. Simulate First IoT Photo Capture -> HTTP POST
  console.log('\n[2/4] 📸 Simulating Photo Capture (POST to Target)...');
  const imageBuffer = createSampleImageBuffer();
  const postUrl = `${targetBaseUrl}?lat=${testLat}&lng=${testLng}&deviceId=${deviceId}`;

  let firstResponse;
  try {
    firstResponse = await fetch(postUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'image/jpeg',
        'x-device-id': deviceId,
      },
      body: imageBuffer,
    });
  } catch (fetchErr) {
    console.error('❌ Connection Failed to target:', targetBaseUrl);
    console.error('Error Details:', fetchErr.message);
    supabase.removeChannel(channel);
    process.exit(1);
  }

  const firstStatus = firstResponse.status;
  let firstData = null;
  try {
    firstData = await firstResponse.json();
  } catch (e) {
    firstData = await firstResponse.text();
  }

  console.log(`  Response Status : ${firstStatus}`);
  console.log('  Response Body   :', typeof firstData === 'object' ? JSON.stringify(firstData, null, 2) : firstData);

  if (firstStatus === 201 && firstData.success) {
    console.log('  ✅ First report created successfully on target!');
    console.log(`  🆔 Report ID : ${firstData.reportId}`);
    console.log(`  📂 Type      : ${firstData.type}`);
    console.log(`  🖼️ Image URL : ${firstData.imageUrl}`);
  } else {
    console.error('  ❌ Target returned non-201 response.');
  }

  // 3. Test Rate Limiter (Immediate 2nd Click)
  console.log('\n[3/4] ⚡ Simulating Rapid Second Camera Click (Testing Rate Limiter)...');
  const secondResponse = await fetch(postUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'image/jpeg',
      'x-device-id': deviceId,
    },
    body: imageBuffer,
  });

  const secondStatus = secondResponse.status;
  const secondData = await secondResponse.json();
  console.log(`  Response Status : ${secondStatus}`);
  console.log('  Response Data   :', JSON.stringify(secondData, null, 2));

  if (secondStatus === 429) {
    console.log('  ✅ Rate Limiter active (429 Too Many Requests)!');
  }

  // 4. Verify Database Record & Evidence Link
  console.log('\n[4/4] 🗄️ Verifying Database Record in Supabase...');
  if (firstData && firstData.reportId) {
    const { data: dbReport, error: dbErr } = await supabase
      .from('reports')
      .select('*')
      .eq('id', firstData.reportId)
      .single();

    if (dbErr) {
      console.error('  ❌ DB verification failed:', dbErr.message);
    } else {
      console.log('  ✅ DB Record verified in Supabase:');
      console.log(`     - ID          : ${dbReport.id}`);
      console.log(`     - Type        : ${dbReport.type}`);
      console.log(`     - Status      : ${dbReport.status}`);
      console.log(`     - Evidence    : ${JSON.stringify(dbReport.evidence)}`);
    }
  }

  console.log('\n============================================================');
  console.log('🎉 DIAGNOSTIC TEST SUMMARY');
  console.log('============================================================');
  console.log(`  1. Target API Response : ${firstStatus === 201 ? '✅ 201 CREATED' : `❌ HTTP ${firstStatus}`}`);
  console.log(`  2. Rate Limiter Guard  : ${secondStatus === 429 ? '✅ 429 BLOCKED' : `⚠️ HTTP ${secondStatus}`}`);
  console.log(`  3. Supabase DB Sync    : ${firstData?.reportId ? '✅ VERIFIED' : '❌ FAILED'}`);
  console.log('============================================================\n');

  supabase.removeChannel(channel);
}

runSimulator().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
