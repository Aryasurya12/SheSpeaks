const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load .env.local without requiring dotenv
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

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Minimal valid 1x1 red PNG buffer (68 bytes)
function createDummyImageBuffer() {
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

async function testFullPipeline() {
  const startTime = Date.now();
  const testDeviceId = `TEST-ESP32-${Date.now().toString(36).toUpperCase()}`;
  const testLat = 19.0760;
  const testLng = 72.8777;

  console.log('\n============================================================');
  console.log('🚀 SheSpeaks IoT Pipeline — Complete End-to-End Test');
  console.log('============================================================');
  console.log(`📱 Device ID : ${testDeviceId}`);
  console.log(`📍 Location  : ${testLat}, ${testLng} (Mumbai)`);

  const verifications = {
    storageUpload: false,
    databaseInsert: false,
    edgeFunctionUpdate: false,
    realtimeInsert: false,
    realtimeUpdate: false,
  };

  // -------------------------------------------------------------------------
  // 1. Setup Realtime Subscription
  // -------------------------------------------------------------------------
  console.log('\n[1/5] 📡 Initializing Realtime Subscription...');

  let resolveRtInsert;
  let resolveRtUpdate;
  const rtInsertPromise = new Promise((resolve) => { resolveRtInsert = resolve; });
  const rtUpdatePromise = new Promise((resolve) => { resolveRtUpdate = resolve; });

  const channel = supabase
    .channel(`iot-e2e-${testDeviceId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'reports' },
      (payload) => {
        if (payload.new && payload.new.device_id === testDeviceId) {
          verifications.realtimeInsert = true;
          console.log('  ✅ [REALTIME] Received INSERT event for report:', payload.new.id);
          resolveRtInsert();
        }
      }
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'reports' },
      (payload) => {
        if (payload.new && payload.new.device_id === testDeviceId) {
          verifications.realtimeUpdate = true;
          console.log(`  ✅ [REALTIME] Received UPDATE event! Status -> "${payload.new.status}"`);
          resolveRtUpdate();
        }
      }
    )
    .subscribe((status) => {
      console.log(`  ℹ️  Realtime channel connection state: ${status}`);
    });

  // Brief pause for subscription to establish
  await new Promise((r) => setTimeout(r, 1500));

  // -------------------------------------------------------------------------
  // 2. Upload Dummy Image to Storage
  // -------------------------------------------------------------------------
  console.log('\n[2/5] 📤 Uploading Dummy Evidence Image to Supabase Storage...');
  const imageBuffer = createDummyImageBuffer();
  const timestamp = Date.now();
  const filePath = `${testDeviceId}/${timestamp}_test.png`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('evidence')
    .upload(filePath, imageBuffer, {
      contentType: 'image/png',
      upsert: false,
    });

  if (uploadError) {
    console.error('  ❌ Storage upload failed:', uploadError.message);
    supabase.removeChannel(channel);
    return;
  }

  const { data: publicUrlData } = supabase.storage
    .from('evidence')
    .getPublicUrl(filePath);

  const imageUrl = publicUrlData.publicUrl;
  verifications.storageUpload = true;
  console.log('  ✅ Upload successful!');
  console.log(`  🔗 Public URL: ${imageUrl}`);

  // -------------------------------------------------------------------------
  // 3. Insert Report to Database
  // -------------------------------------------------------------------------
  console.log('\n[3/5] 📝 Creating Incident Report in Database...');
  const reportId = crypto.randomUUID();
  const reportPayload = {
    id: reportId,
    type: 'SOS',
    description: 'Emergency triggered from device (E2E Test)',
    latitude: testLat,
    longitude: testLng,
    status: 'pending',
    is_iot_trigger: true,
    device_id: testDeviceId,
    evidence: [imageUrl],
  };

  const { data: insertedReport, error: insertError } = await supabase
    .from('reports')
    .insert(reportPayload)
    .select()
    .single();

  if (insertError) {
    console.error('  ❌ Database insert failed:', insertError.message);
    supabase.removeChannel(channel);
    return;
  }

  verifications.databaseInsert = true;
  console.log('  ✅ Report record inserted successfully!');
  console.log(`  🆔 Report ID: ${insertedReport.id}`);

  // -------------------------------------------------------------------------
  // 4. Trigger Edge Function
  // -------------------------------------------------------------------------
  console.log('\n[4/5] ⚡ Invoking Edge Function "process-incident"...');
  const edgeFunctionUrl = `${supabaseUrl}/functions/v1/process-incident`;

  try {
    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        report_id: reportId,
        device_id: testDeviceId,
        image_url: imageUrl,
        location: { latitude: testLat, longitude: testLng },
      }),
    });

    if (response.ok) {
      const responseData = await response.json();
      console.log('  ✅ Edge Function returned HTTP 200:');
      console.log('    ', JSON.stringify(responseData));
    } else {
      const errText = await response.text();
      console.warn(`  ⚠️ Edge Function HTTP status ${response.status}:`, errText);
    }
  } catch (err) {
    console.warn('  ⚠️ Edge Function invocation error (network/deploy issue):', err.message);
  }

  // -------------------------------------------------------------------------
  // 5. Verification & Status Validation
  // -------------------------------------------------------------------------
  console.log('\n[5/5] 🔍 Validating Pipeline End State...');

  // Wait briefly for asynchronous edge processing and DB update
  console.log('  ⏳ Waiting 3s for database status update...');
  await new Promise((r) => setTimeout(r, 3000));

  // Check updated row status
  const { data: verifiedReport } = await supabase
    .from('reports')
    .select('*')
    .eq('id', reportId)
    .single();

  if (verifiedReport) {
    if (verifiedReport.status === 'in-progress' || verifiedReport.status === 'sent') {
      verifications.edgeFunctionUpdate = true;
      console.log(`  ✅ Report status is "${verifiedReport.status}" (Edge Function updated the database)`);
    } else {
      console.log(`  ℹ️  Report status is "${verifiedReport.status}"`);
    }
  }

  // Wait up to 5s for realtime listeners to finish catching events
  await Promise.allSettled([
    Promise.race([rtInsertPromise, new Promise((r) => setTimeout(r, 5000))]),
    Promise.race([rtUpdatePromise, new Promise((r) => setTimeout(r, 5000))]),
  ]);

  supabase.removeChannel(channel);

  // -------------------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------------------
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  const allPassed = Object.values(verifications).every(Boolean);

  console.log('\n============================================================');
  console.log(allPassed ? '🎉 END-TO-END TEST: ALL CHECKS PASSED!' : '⚠️ END-TO-END TEST: COMPLETED WITH WARNINGS');
  console.log('============================================================');
  console.log(`⏱️  Total Duration      : ${duration}s`);
  console.log(`📁 Storage Upload      : ${verifications.storageUpload ? 'PASS ✅' : 'FAIL ❌'}`);
  console.log(`💾 Database Insert     : ${verifications.databaseInsert ? 'PASS ✅' : 'FAIL ❌'}`);
  console.log(`⚡ Edge Function Update: ${verifications.edgeFunctionUpdate ? 'PASS ✅' : 'FAIL ❌'}`);
  console.log(`📡 Realtime INSERT     : ${verifications.realtimeInsert ? 'PASS ✅' : 'FAIL ❌'}`);
  console.log(`📡 Realtime UPDATE     : ${verifications.realtimeUpdate ? 'PASS ✅' : 'FAIL ❌'}`);
  console.log('============================================================\n');
}

testFullPipeline().catch((err) => {
  console.error('Fatal error during pipeline test:', err);
});
