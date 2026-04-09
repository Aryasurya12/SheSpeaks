import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  
  let reports = db.getReports();
  
  if (userId) {
    reports = reports.filter(r => r.userId === userId);
  }
  
  return NextResponse.json(reports);
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

    const newReport = await db.addReport({
      userId,
      type,
      description,
      location: {
        address: location?.address || "Current Geolocation",
        lat: location?.lat || 0,
        lng: location?.lng || 0
      },
      evidence: evidence || [],
      name,
      email,
      phone
    });

    return NextResponse.json(newReport, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, assignedTo } = body;
    const updatedReport = await db.updateReportStatus(id, status, assignedTo);
    return NextResponse.json(updatedReport);
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, message: "ID required" }, { status: 400 });
    
    await db.deleteReport(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
