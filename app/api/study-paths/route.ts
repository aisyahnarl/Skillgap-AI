import { NextResponse } from 'next/server';
import { createStudyPath, listStudyPaths, studyPathInputSchema } from '../../lib/study-paths';
import { hasAdminSession } from '../../lib/auth';

export function GET(request: Request) {
  if (!hasAdminSession(request)) return NextResponse.json({ success: false, message: 'Admin session required.' }, { status: 403 });
  return NextResponse.json({ success: true, data: listStudyPaths() });
}

export async function POST(request: Request) {
  if (!hasAdminSession(request)) return NextResponse.json({ success: false, message: 'Admin session required.' }, { status: 403 });
  try { return NextResponse.json({ success: true, data: createStudyPath(studyPathInputSchema.parse(await request.json())) }, { status: 201 }); }
  catch { return NextResponse.json({ success: false, message: 'Data jalur studi tidak valid.' }, { status: 400 }); }
}
