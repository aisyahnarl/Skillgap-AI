import { NextResponse } from 'next/server';
import {
  competencyInputSchema,
  deleteCompetency,
  updateCompetency,
} from '../../../lib/competencies';
import { hasAdminSession } from '../../../lib/auth';

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: RouteContext) {
  if (!hasAdminSession(request)) return NextResponse.json({ success: false, message: 'Admin session required.' }, { status: 403 });
  try {
    const { id } = await context.params;
    const input = competencyInputSchema.parse(await request.json());
    const competency = updateCompetency(id, input);
    if (!competency) return NextResponse.json({ success: false, message: 'Kompetensi tidak ditemukan.' }, { status: 404 });
    return NextResponse.json({ success: true, data: competency });
  } catch {
    return NextResponse.json({ success: false, message: 'Data kompetensi tidak valid.' }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  if (!hasAdminSession(_request)) return NextResponse.json({ success: false, message: 'Admin session required.' }, { status: 403 });
  const { id } = await context.params;
  if (!deleteCompetency(id)) return NextResponse.json({ success: false, message: 'Kompetensi tidak ditemukan.' }, { status: 404 });
  return NextResponse.json({ success: true });
}
