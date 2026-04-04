import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email, password, role } = await request.json();

  const mockUsers = [
    { email: "admin@shespeaks.com", password: "admin123", role: "admin" },
    { email: "police@shespeaks.com", password: "police123", role: "police" }
  ];

  const user = mockUsers.find(u => u.email === email && u.password === password && u.role === role);

  if (user) {
    return NextResponse.json({ success: true, user: { email: user.email, role: user.role } });
  }

  return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 });
}
