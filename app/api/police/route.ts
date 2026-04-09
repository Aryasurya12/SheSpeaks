import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const policePath = path.join(process.cwd(), 'database', 'police.json');

function getPolice() {
  const data = fs.readFileSync(policePath, 'utf8');
  return JSON.parse(data);
}

function savePolice(data: any) {
  fs.writeFileSync(policePath, JSON.stringify(data, null, 2));
}

export async function GET() {
  return NextResponse.json(getPolice());
}

export async function PATCH(request: Request) {
  const { id, status, activeCasesDelta } = await request.json();
  let police = getPolice();
  
  const idx = police.findIndex((p: any) => p.id === id);
  if (idx !== -1) {
    if (status) police[idx].status = status;
    if (activeCasesDelta !== undefined) {
      police[idx].activeCases = Math.max(0, police[idx].activeCases + activeCasesDelta);
    }
    savePolice(police);
    return NextResponse.json({ success: true, officer: police[idx] });
  }
  
  return NextResponse.json({ success: false, error: "Officer not found" }, { status: 404 });
}
