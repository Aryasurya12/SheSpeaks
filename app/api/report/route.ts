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
      phone: r.reporter_phone,
      anonymousMode: r.is_anonymous !== null && r.is_anonymous !== undefined 
        ? r.is_anonymous 
        : (!r.reporter_name || r.reporter_name.startsWith('ANONYMOUS')),
      statusHistory: r.status_history || []
    })) || [];
    
    return NextResponse.json(formattedReports);
  } catch (error: any) {
    console.error("GET Report Error:", error);
    return NextResponse.json({ success: false, message: error.message || "Server error", stack: error.stack }, { status: 500 });
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
      phone,
      isAnonymous
    } = body;

    if (!userId || !type || !description) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    let { data: newReport, error } = await supabase
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
        status: 'pending',
        is_anonymous: isAnonymous
      }])
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST204' || error.message?.includes('is_anonymous')) {
        // Fallback for missing column in database schema
        const { data: fallbackReport, error: fallbackError } = await supabase
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
          
        if (fallbackError) throw fallbackError;
        newReport = fallbackReport;
      } else {
        throw error;
      }
    }

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
      assignedTo: newReport.assigned_to,
      anonymousMode: isAnonymous !== undefined ? isAnonymous : (!name || (name && name.startsWith('ANONYMOUS')))
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
    
    // Fetch current state for transition validation
    const { data: currentReport, error: fetchError } = await supabase
      .from('reports')
      .select('status, status_history, assigned_to')
      .eq('id', id)
      .single();
      
    if (fetchError) throw fetchError;

    const updateData: any = { updated_at: new Date().toISOString() };
    const history = currentReport.status_history || [];

    if (assignedTo !== undefined) {
      updateData.assigned_to = assignedTo;
      history.push({
        status: currentReport.status,
        message: `Investigator ${assignedTo} assigned to case`,
        timestamp: new Date().toISOString()
      });
    }

    if (status !== undefined) {
      // ENFORCE LOGICAL SEQUENCE: pending -> in-progress -> completed -> resolved
      const statusOrder = ['pending', 'in-progress', 'completed', 'resolved'];
      const currentIndex = statusOrder.indexOf(currentReport.status);
      const nextIndex = statusOrder.indexOf(status);

      if (nextIndex > currentIndex || (status === currentReport.status)) {
        updateData.status = status;
        history.push({
          status: status,
          message: `Status updated to ${status.toUpperCase()}`,
          timestamp: new Date().toISOString()
        });
      } else {
        return NextResponse.json({ 
          success: false, 
          message: `Invalid status transition from ${currentReport.status} to ${status}` 
        }, { status: 400 });
      }
    }
    
    updateData.status_history = history;
    
    const { data: updatedReport, error } = await supabase
      .from('reports')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;

    // Real-time broadcast for instant user dashboard update
    const channel = supabase.channel(`report_${id}`);
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.send({
          type: 'broadcast',
          event: 'status_update',
          payload: updatedReport
        });
        setTimeout(() => supabase.removeChannel(channel), 1000);
      }
    });

    return NextResponse.json(updatedReport);
  } catch (error: any) {
    console.error("PATCH Report Error:", error);
    return NextResponse.json({ success: false, message: error.message || "Server error" }, { status: 500 });
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
