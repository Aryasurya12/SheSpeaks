import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    
    let query = supabase.from('reports').select('*').order('created_at', { ascending: false });
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data: reports, error } = await query;
    if (error) throw error;

    // Map database shape to frontend shape
    const formattedReports = reports?.map(r => ({
      id: r.id,
      userId: r.user_id,
      type: r.type,
      description: r.description,
      location: {
        address: r.location_name,
        lat: r.latitude,
        lng: r.longitude
      },
      evidence: r.evidence || [],
      status: r.status,
      assignedTo: r.assigned_to,
      createdAt: new Date(r.created_at).getTime(),
      updatedAt: new Date(r.updated_at).getTime(),
      name: r.reporter_name,
      email: r.reporter_email,
      phone: r.reporter_phone
    })) || [];
    
    return NextResponse.json(formattedReports);
  } catch (error) {
    console.error("GET Report Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      userId, 
      type, 
      description, 
      location, 
      evidence,
      name,
      email,
      phone 
    } = body;

    if (!userId || !type || !description) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    const { data: newReport, error } = await supabase
      .from('reports')
      .insert([{
        user_id: userId,
        type: type,
        description: description,
        location_name: location?.address || "Current Geolocation",
        latitude: location?.lat || 0,
        longitude: location?.lng || 0,
        evidence: evidence || [],
        reporter_name: name,
        reporter_email: email,
        reporter_phone: phone,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) throw error;

    // Convert back to frontend shape
    const frontendReport = {
      ...newReport,
      id: newReport.id,
      userId: newReport.user_id,
      location: {
        address: newReport.location_name,
        lat: newReport.latitude,
        lng: newReport.longitude
      },
      createdAt: new Date(newReport.created_at).getTime(),
      updatedAt: new Date(newReport.updated_at).getTime(),
      assignedTo: newReport.assigned_to
    };

    return NextResponse.json(frontendReport, { status: 201 });
  } catch (error) {
    console.error("POST Report Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, assignedTo } = body;
    
    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (assignedTo !== undefined) updateData.assigned_to = assignedTo;
    
    const { data: updatedReport, error } = await supabase
      .from('reports')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;

    // Send mock back just to satisfy frontend schema if needed, though usually just the updated object is passed
    return NextResponse.json(updatedReport);
  } catch (error) {
    console.error("PATCH Report Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, message: "ID required" }, { status: 400 });
    
    const { error } = await supabase.from('reports').delete().eq('id', id);
    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE Report Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
