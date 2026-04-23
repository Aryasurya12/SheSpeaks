import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    // 1. Extract Location
    const { searchParams } = new URL(req.url);
    const lat = parseFloat(searchParams.get("lat") || "0");
    const lng = parseFloat(searchParams.get("lng") || "0");

    // 2. Read Image Data
    const arrayBuffer = await req.arrayBuffer();
    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      return NextResponse.json({ error: "Empty request body" }, { status: 400 });
    }
    const imageBuffer = Buffer.from(arrayBuffer);

    // 3. Supabase Client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Missing Supabase environment variables" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 4. Storage Upload
    const filename = `iot_${Date.now()}.jpg`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("evidence")
      .upload(filename, imageBuffer, {
        contentType: "image/jpeg",
        cacheControl: "3600",
        upsert: false
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
    }

    // 5. Get URL
    const { data: { publicUrl } } = supabase.storage
      .from("evidence")
      .getPublicUrl(filename);

    // 6. Database Insert
    const { error: insertError } = await supabase
      .from("reports")
      .insert([
        {
          type: "HARDWARE_PANIC_ALERT",
          description: "Automated SOS alert with image capture from ESP32-CAM wearable.",
          latitude: lat,
          longitude: lng,
          is_iot_trigger: true,
          evidence_urls: [publicUrl],
          status: "pending"
        }
      ]);

    if (insertError) {
      console.error("Database insert error:", insertError);
      return NextResponse.json({ error: "Failed to save report" }, { status: 500 });
    }

    // 7. Response
    return NextResponse.json({ 
      success: true, 
      imageUrl: publicUrl 
    }, { status: 201 });

  } catch (error) {
    console.error("Hardware API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
