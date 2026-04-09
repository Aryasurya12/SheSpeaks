import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { email, password, fullName, isAnonymous } = await request.json();

    const users = db.getUsers();
    
    if (!isAnonymous) {
      const existingUser = users.find(u => u.email === email);
      if (existingUser) {
        return NextResponse.json({ success: false, message: "User already exists" }, { status: 400 });
      }
    }

    const newUser = await db.addUser({
      email: isAnonymous ? undefined : email,
      password: isAnonymous ? undefined : password,
      fullName: isAnonymous ? "Anonymous User" : fullName,
      isAnonymous
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
