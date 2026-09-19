import { NextResponse } from 'next/server';
import { deleteStudyPath, studyPathInputSchema, updateStudyPath } from '../../../lib/study-paths';
import { hasAdminSession } from '../../../lib/auth';

type Context = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: Context) {
  if (!hasAdminSession(request)) return NextResponse.json({ success: false, message: 'Admin session required.' }, { status: 403 });
  try { const { id } = await context.params; const item = updateStudyPath(id, studyPathInputSchema.parse(await request.json())); if (!item) return NextResponse.json({ success: false, message: 'Jalur studi tidak ditemukan.' }, { status: 404 }); return NextResponse.json({ success: true, data: item }); }
  catch { return NextResponse.json({ success: false, message: 'Data jalur studi tidak valid.' }, { status: 400 }); }
}

export async function DELETE(request: Request, context: Context) {
  if (!hasAdminSession(request)) return NextResponse.json({ success: false, message: 'Admin session required.' }, { status: 403 });
  const { id } = await context.params; if (!deleteStudyPath(id)) return NextResponse.json({ success: false, message: 'Jalur studi tidak ditemukan.' }, { status: 404 }); return NextResponse.json({ success: true });
}
