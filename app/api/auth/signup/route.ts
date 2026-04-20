import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { email, password, fullName, isAnonymous } = await request.json();

    const anonId = `ANON-${Math.floor(100000 + Math.random() * 900000)}`;
    const authUserId = crypto.randomUUID();

    if (!isAnonymous) {
      // Check if email already exists in profiles
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();
        
      if (existingUser) {
        return NextResponse.json(
          { success: false, message: "User already exists" },
          { status: 400 }
        );
      }
    }

    // Insert into Supabase 'profiles' table directly (Bypassing Auth completely)
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: authUserId,
          full_name: isAnonymous ? "Anonymous User" : fullName,
          anonymous_id: anonId,
          email: isAnonymous ? null : email,
          password: isAnonymous ? null : password
          // role and phone will use database defaults
        }
      ]);

    if (profileError) {
      console.error("Profile insertion error:", profileError);
      return NextResponse.json(
        { success: false, message: `Database error: ${profileError.message}` },
        { status: 500 }
      );
    }

    // Return the response structure the frontend expects
    const userToReturn = {
      id: authUserId,
      email: isAnonymous ? undefined : email,
      fullName: isAnonymous ? "Anonymous User" : fullName,
      isAnonymous,
      anonId 
    };

    return NextResponse.json({ success: true, user: userToReturn });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
