import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { email, password, role } = await request.json();

    const { data: user, error } = await supabase
      .from('profiles')
      .select('email, role, full_name, id')
      .eq('email', email)
      .eq('password', password)
      .eq('role', role)
      .single();

    if (user && !error) {
      return NextResponse.json({ 
        success: true, 
        user: { 
          id: user.id,
          email: user.email, 
          role: user.role,
          name: user.full_name
        } 
      });
    }

    return NextResponse.json({ success: false, message: "Invalid credentials or unauthorized role" }, { status: 401 });
  } catch (error) {
    console.error("Global Login Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
