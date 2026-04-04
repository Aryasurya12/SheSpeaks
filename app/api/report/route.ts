import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const reports = await db.getReports();
  return NextResponse.json(reports);
}

export async function POST(request: Request) {
  const body = await request.json();
  const newReport = await db.addReport(body);
  return NextResponse.json(newReport, { status: 201 });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const { id, status, assignedTo } = body;
  const updatedReport = await db.updateReportStatus(id, status, assignedTo);
  return NextResponse.json(updatedReport);
}
