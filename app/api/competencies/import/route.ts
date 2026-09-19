import { NextResponse } from 'next/server';
import { competencyInputSchema, createCompetencies, listCompetencies } from '../../../lib/competencies';
import { hasAdminSession } from '../../../lib/auth';

export async function POST(request: Request) {
  if (!hasAdminSession(request)) return NextResponse.json({ success: false, message: 'Admin session required.' }, { status: 403 });
  try {
    const body = await request.json() as { rows?: unknown[] };
    const rows = body.rows ?? [];
    const parsed = rows.map((row) => competencyInputSchema.parse(row));
    const existingNames = new Set(listCompetencies().map((item) => item.nama_skill.toLowerCase()));
    const seenNames = new Set<string>();
    const duplicates: string[] = [];
    const unique = parsed.filter((item) => {
      const key = item.nama_skill.toLowerCase();
      if (existingNames.has(key) || seenNames.has(key)) { duplicates.push(item.nama_skill); return false; }
      seenNames.add(key);
      return true;
    });
    const data = createCompetencies(unique);
    return NextResponse.json({ success: true, data, imported: data.length, duplicates }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, message: 'Satu atau beberapa baris import tidak valid.' }, { status: 400 });
  }
}