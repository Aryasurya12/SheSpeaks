import { NextResponse } from 'next/server';
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    // Fetch all profiles with the role 'police'
    const { data: officers, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'police');

    if (profilesError) throw profilesError;

    // We also need to calculate activeCases dynamically for each officer
    // Fetch all reports assigned to these officers that are not resolved
    const { data: activeReports, error: reportsError } = await supabase
      .from('reports')
      .select('assigned_to')
      .neq('status', 'resolved');

    if (reportsError) throw reportsError;

    // Count cases per officer
    const caseCounts: Record<string, number> = {};
    activeReports?.forEach(report => {
      if (report.assigned_to) {
        caseCounts[report.assigned_to] = (caseCounts[report.assigned_to] || 0) + 1;
      }
    });

    // Map to frontend expected shape
    const formattedPolice = officers?.map(officer => ({
      id: officer.id,
      name: officer.full_name,
      status: officer.is_on_duty ? "ON_DUTY" : "OFF_DUTY",
      activeCases: caseCounts[officer.id] || 0,
      sector: officer.sector || 'Unassigned',
      avatar: officer.avatar_url || ''
    })) || [];

    return NextResponse.json(formattedPolice);
  } catch (error) {
    console.error("GET Police Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();
    
    const updateData: any = {};
    if (status) {
      updateData.is_on_duty = status === "ON_DUTY";
    }
    
    const { data: updatedOfficer, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // The activeCasesDelta logic is completely removed because active cases are calculated dynamically on GET!
    
    return NextResponse.json({ 
      success: true, 
      officer: {
        id: updatedOfficer.id,
        name: updatedOfficer.full_name,
        status: updatedOfficer.is_on_duty ? "ON_DUTY" : "OFF_DUTY",
        sector: updatedOfficer.sector || 'Unassigned',
        avatar: updatedOfficer.avatar_url || ''
      }
    });
  } catch (error) {
    console.error("PATCH Police Error:", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, email, password, sector } = await request.json();

    if (!name || !email || !password || !sector) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    const uuid = crypto.randomUUID();
    const policeAnonId = `POLICE-${Math.floor(1000 + Math.random() * 9000)}`;

    const { data: newOfficer, error } = await supabase
      .from('profiles')
      .insert([{
        id: uuid,
        full_name: name,
        email: email,
        password: password,
        role: 'police',
        sector: sector,
        anonymous_id: policeAnonId,
        is_on_duty: true
      }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Postgres unique violation (email)
        return NextResponse.json({ success: false, message: "Email already exists" }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({ 
      success: true, 
      officer: {
        id: newOfficer.id,
        name: newOfficer.full_name,
        status: newOfficer.is_on_duty ? "ON_DUTY" : "OFF_DUTY",
        activeCases: 0,
        sector: newOfficer.sector || 'Unassigned',
        avatar: newOfficer.avatar_url || ''
      }
    }, { status: 201 });
  } catch (error) {
    console.error("POST Police Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
