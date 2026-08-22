import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { iotRateLimiter } from '@/lib/rate-limiter';

// Initialize Supabase with service role key if present, otherwise fallback to anon
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: NextRequest) {
  try {
    console.log("📥 Hardware trigger received from IoT camera sensor!");

    // 1. Extract device metadata and coordinates
    const url = new URL(req.url);
    const latParam = url.searchParams.get('lat');
    const lngParam = url.searchParams.get('lng');
    const deviceIdParam = url.searchParams.get('deviceId') || url.searchParams.get('device_id') || req.headers.get('x-device-id');
    
    // Identify client for rate limiting
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown-ip';
    const rateLimitKey = deviceIdParam || clientIp;

    // 2. Enforce Rate Limiter (Cooldown window)
    const rateLimitResult = iotRateLimiter.check(rateLimitKey);
    if (!rateLimitResult.allowed) {
      console.warn(`⚠️ Rate limit exceeded for ${rateLimitKey}. Cooldown: ${rateLimitResult.remainingMs}ms`);
      return NextResponse.json(
        {
          error: 'Too Many Requests',
          message: `Device trigger cooldown active. Please wait ${rateLimitResult.retryAfterSeconds}s before sending next image.`,
          retryAfterSeconds: rateLimitResult.retryAfterSeconds,
          remainingMs: rateLimitResult.remainingMs,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimitResult.retryAfterSeconds),
          },
        }
      );
    }

    // 3. Read image payload (support raw binary buffer, multipart/form-data, or JSON base64)
    const contentType = req.headers.get('content-type') || '';
    let imageBuffer: Buffer | null = null;
    let lat = parseFloat(latParam || '0');
    let lng = parseFloat(lngParam || '0');
    let deviceId = deviceIdParam || `ESP32-CAM-${Date.now().toString(36).toUpperCase()}`;

    if (contentType.includes('application/json')) {
      const jsonBody = await req.json();
      if (jsonBody.image) {
        const cleanBase64 = jsonBody.image.replace(/^data:image\/\w+;base64,/, '');
        imageBuffer = Buffer.from(cleanBase64, 'base64');
      }
      if (jsonBody.lat !== undefined) lat = parseFloat(jsonBody.lat);
      if (jsonBody.lng !== undefined) lng = parseFloat(jsonBody.lng);
      if (jsonBody.deviceId) deviceId = jsonBody.deviceId;
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('image') || formData.get('file');
      if (file && file instanceof Blob) {
        const arrayBuf = await file.arrayBuffer();
        imageBuffer = Buffer.from(arrayBuf);
      }
      const formLat = formData.get('lat');
      const formLng = formData.get('lng');
      const formDeviceId = formData.get('deviceId') || formData.get('device_id');
      if (formLat) lat = parseFloat(formLat.toString());
      if (formLng) lng = parseFloat(formLng.toString());
      if (formDeviceId) deviceId = formDeviceId.toString();
    } else {
      // Default: Raw binary buffer directly from ESP32 camera
      const arrayBuf = await req.arrayBuffer();
      if (arrayBuf && arrayBuf.byteLength > 0) {
        imageBuffer = Buffer.from(arrayBuf);
      }
    }

    if (!imageBuffer || imageBuffer.length === 0) {
      console.error("❌ Error: No valid image data received.");
      return NextResponse.json({ error: 'No image data provided' }, { status: 400 });
    }

    console.log(`📸 Image received from device [${deviceId}]. Size: ${imageBuffer.length} bytes. Coords: (${lat}, ${lng})`);

    // 4. Upload to Supabase Storage ('Images' bucket, fallback to 'evidence')
    const fileName = `iot-alert-${deviceId}-${Date.now()}.jpg`;
    let uploadBucket = 'Images';
    let { error: storageError } = await supabase.storage
      .from(uploadBucket)
      .upload(fileName, imageBuffer, {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (storageError) {
      console.warn(`Storage upload to '${uploadBucket}' failed (${storageError.message}), trying 'evidence' bucket...`);
      uploadBucket = 'evidence';
      const fallbackUpload = await supabase.storage
        .from(uploadBucket)
        .upload(fileName, imageBuffer, {
          contentType: 'image/jpeg',
          upsert: false,
        });
      storageError = fallbackUpload.error;
    }

    if (storageError) {
      console.error("❌ Supabase Storage Error:", storageError.message);
      return NextResponse.json({ error: 'Storage failed', details: storageError.message }, { status: 500 });
    }

    const { data: publicUrlData } = supabase.storage
      .from(uploadBucket)
      .getPublicUrl(fileName);

    const imageUrl = publicUrlData.publicUrl;
    console.log("✅ Image saved to storage. URL:", imageUrl);

    // 5. Check for available on-duty police officer to auto-assign
    let assignedOfficerId: string | null = null;
    try {
      const { data: officers } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'police')
        .eq('is_on_duty', true)
        .limit(1);

      if (officers && officers.length > 0) {
        assignedOfficerId = officers[0].id;
      }
    } catch (e) {
      console.warn("Could not query profiles for on-duty officer:", e);
    }

    // 6. Save Incident Report to Database (categorized as 'Harassment')
    const reportId = crypto.randomUUID();
    const newReport = {
      id: reportId,
      type: 'Harassment',
      description: 'Automated photo captured via IoT Camera Sensor - Harassment incident report',
      latitude: lat,
      longitude: lng,
      location_name: `IoT Camera Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
      evidence: [imageUrl],
      status: 'pending',
      is_anonymous: true,
      reporter_name: `IoT Device (${deviceId})`,
      device_id: deviceId,
      is_iot_trigger: true,
      assigned_to: assignedOfficerId,
    };

    const { data: insertedReport, error: dbError } = await supabase
      .from('reports')
      .insert([newReport])
      .select()
      .single();

    if (dbError) {
      console.error("❌ Supabase Database Error:", dbError.message, dbError.details);
      return NextResponse.json({ error: 'DB insert failed', details: dbError.message }, { status: 500 });
    }

    // 7. Dispatch Realtime Alert to Police System ('emergency_signals' channel)
    try {
      const policePayload = {
        id: reportId,
        type: 'Harassment',
        description: newReport.description,
        location: {
          address: newReport.location_name,
          lat: lat,
          lng: lng,
        },
        evidence: [imageUrl],
        status: 'pending',
        assignedTo: assignedOfficerId,
        createdAt: Date.now(),
        name: newReport.reporter_name,
        deviceId: deviceId,
        isIotTrigger: true,
      };

      const realtimeChannel = supabase.channel('emergency_signals');
      await realtimeChannel.send({
        type: 'broadcast',
        event: 'panic_alert',
        payload: policePayload,
      });
      console.log("📢 Realtime broadcast sent to Police Dashboard!");
    } catch (rtError) {
      console.warn("⚠️ Failed to broadcast realtime signal:", rtError);
    }

    console.log(`🎉 SUCCESS! Harassment report [${reportId}] created and dispatched to police.`);
    return NextResponse.json(
      {
        success: true,
        reportId: reportId,
        type: 'Harassment',
        imageUrl: imageUrl,
        deviceId: deviceId,
        status: 'pending',
        assignedTo: assignedOfficerId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('🔥 Critical System Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: String(error) }, { status: 500 });
  }
}