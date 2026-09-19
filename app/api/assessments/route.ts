import { NextResponse } from 'next/server';
import { assessmentResponseSchema, createAssessmentSchema, type AssessmentInput } from '../../lib/schemas';
import { hasSession } from '../../lib/auth';

const assessments: AssessmentInput[] = [
  { id: '1', name: 'Ayu Lestari', category: 'Mahasiswa', target: 'Data Science', match: '89%', status: 'valid' },
  { id: '2', name: 'Rizky Putra', category: 'Siswa', target: 'UI/UX', match: '82%', status: 'review' },
  { id: '3', name: 'Nadya Sari', category: 'Mahasiswa', target: 'Web Development', match: '91%', status: 'valid' },
];

export function GET(request: Request) {
  if (!hasSession(request)) return NextResponse.json({ success: false, message: 'Session required.' }, { status: 401 });
  return NextResponse.json({ success: true, data: assessmentResponseSchema.parse(assessments) });
}

export async function POST(request: Request) {
  if (!hasSession(request)) return NextResponse.json({ success: false, message: 'Session required.' }, { status: 401 });
  try {
    const payload = createAssessmentSchema.parse(await request.json());
    const assessment: AssessmentInput = {
      ...payload,
      id: crypto.randomUUID(),
      match: '88%',
      status: 'review',
    };

    assessments.push(assessment);
    return NextResponse.json({ success: true, data: assessment }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, message: 'Payload assessment tidak valid.' }, { status: 400 });
  }
}