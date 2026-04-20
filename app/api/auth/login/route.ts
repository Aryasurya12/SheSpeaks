import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const { data: user, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .single();

    if (user && !error) {
      // Format response exactly as frontend expects
      const userToReturn = {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        isAnonymous: false,
        anonId: user.anonymous_id
      };
      
      return NextResponse.json({ success: true, user: userToReturn });
    }

    return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 });
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
