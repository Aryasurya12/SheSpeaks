import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    console.log("📥 Hardware trigger received from ESP32!");

    // 1. Extract coordinates safely
    const url = new URL(req.url);
    const lat = parseFloat(url.searchParams.get('lat') || '0');
    const lng = parseFloat(url.searchParams.get('lng') || '0');

    // 2. Read the raw image buffer from the ESP32
    const imageBuffer = await req.arrayBuffer();
    if (!imageBuffer || imageBuffer.byteLength === 0) {
      console.error("❌ Error: Empty image buffer received.");
      return NextResponse.json({ error: 'No image data' }, { status: 400 });
    }
    console.log(`📸 Image received. Size: ${imageBuffer.byteLength} bytes`);

    // 3. Upload to Supabase Storage (Using your 'Images' bucket)
    const fileName = `iot-alert-${Date.now()}.jpg`;
    const { data: storageData, error: storageError } = await supabase.storage
      .from('Images')
      .upload(fileName, imageBuffer, {
        contentType: 'image/jpeg',
        upsert: false
      });

    if (storageError) {
      console.error("❌ Supabase Storage Error:", storageError.message);
      return NextResponse.json({ error: 'Storage failed', details: storageError.message }, { status: 500 });
    }

    const { data: publicUrlData } = supabase.storage
      .from('Images')
      .getPublicUrl(fileName);

    console.log("✅ Image saved. URL:", publicUrlData.publicUrl);

    // AI Vision step: Generate description
    let aiDescription = 'Automated image captured by hardware device, awaiting manual review.';
    try {
      console.log("🤖 Analyzing image with Gemini Vision...");
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      
      const prompt = "You are an automated forensic analyzer for a women's safety platform. Briefly describe the scene in this image, noting the environment (e.g., indoor, outdoor, street, parking lot), lighting conditions, and any visible persons or potential threats. Keep it under 3 sentences.";
      
      const imageParts = [
        {
          inlineData: {
            data: Buffer.from(imageBuffer).toString("base64"),
            mimeType: "image/jpeg"
          }
        }
      ];

      const aiResponse = await model.generateContent([prompt, ...imageParts]);
      const responseText = aiResponse.response.text().trim();
      
      if (responseText) {
        aiDescription = responseText;
        console.log("✅ AI Analysis Complete:", aiDescription);
      }
    } catch (aiError) {
      console.error("❌ AI Vision Error:", aiError);
      // Fallback is handled by the default value of aiDescription
    }

    // 4. Save to the Database with ultra-safe default values
    const newReport = {
      type: 'Hardware SOS',
      description: aiDescription,
      latitude: lat,
      longitude: lng,
      evidence: [publicUrlData.publicUrl], // Array format to match your JSONB schema
      status: 'pending',
      is_anonymous: true,
      reporter_name: 'IoT Device'
    };

    const { error: dbError } = await supabase
      .from('reports')
      .insert([newReport]);

    if (dbError) {
      console.error("❌ Supabase Database Error:", dbError.message, dbError.details);
      return NextResponse.json({ error: 'DB insert failed', details: dbError.message }, { status: 500 });
    }

    console.log("🎉 SUCCESS! Alert fully registered.");
    return NextResponse.json({ success: true, url: publicUrlData.publicUrl }, { status: 201 });

  } catch (error) {
    console.error('🔥 Critical System Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: String(error) }, { status: 500 });
  }
}