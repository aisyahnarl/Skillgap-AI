import { NextResponse } from 'next/server';
import {
  competencyInputSchema,
  createCompetency,
  listCompetencies,
} from '../../lib/competencies';
import { hasAdminSession } from '../../lib/auth';

export function GET(request: Request) {
  if (!hasAdminSession(request)) return NextResponse.json({ success: false, message: 'Admin session required.' }, { status: 403 });
  return NextResponse.json({ success: true, data: listCompetencies() });
}

export async function POST(request: Request) {
  if (!hasAdminSession(request)) return NextResponse.json({ success: false, message: 'Admin session required.' }, { status: 403 });
  try {
    const input = competencyInputSchema.parse(await request.json());
    return NextResponse.json({ success: true, data: createCompetency(input) }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, message: 'Data kompetensi tidak valid.' }, { status: 400 });
  }
}
