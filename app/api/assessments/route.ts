import { NextResponse } from 'next/server';
import { assessmentResponseSchema, createAssessmentSchema, type AssessmentInput } from '../../lib/schemas';
import { getVerifiedUser, hasSession } from '../../lib/auth';
import { query } from '../../lib/db';

const assessments: AssessmentInput[] = [
  { id: '1', name: 'Ayu Lestari', category: 'Mahasiswa', target: 'Data Science', match: '89%', status: 'valid' },
  { id: '2', name: 'Rizky Putra', category: 'Siswa', target: 'UI/UX', match: '82%', status: 'review' },
  { id: '3', name: 'Nadya Sari', category: 'Mahasiswa', target: 'Web Development', match: '91%', status: 'valid' },
];

/**
 * GET: Mengambil riwayat asesmen dari database PostgreSQL (dengan fallback cache/seed memori) (Item 6)
 */
export async function GET(request: Request) {
  if (!hasSession(request)) {
    return NextResponse.json({ success: false, message: 'Session required.' }, { status: 401 });
  }

  try {
    const res = await query(`
      SELECT a.id, COALESCE(u.name, 'Pengguna') as name, 
             COALESCE(u.jenjang, 'Mahasiswa') as category, 
             a.target_career as target, 
             CONCAT(a.match_score, '%') as match, 
             COALESCE(a.validation_status, 'review') as status
      FROM assessments a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.submitted_at DESC
      LIMIT 50
    `);
    if (res && res.rows.length > 0) {
      const dbAssessments: AssessmentInput[] = res.rows.map((r: any) => ({
        id: String(r.id),
        name: r.name || 'Pengguna',
        category: r.category || 'Mahasiswa',
        target: r.target,
        match: r.match,
        status: (['valid', 'review', 'pending'].includes(r.status) ? r.status : 'review') as 'valid' | 'review' | 'pending',
      }));
      return NextResponse.json({
        success: true,
        data: assessmentResponseSchema.parse(dbAssessments),
      });
    }
  } catch (err) {
    console.warn('[Assessments DB Query Warning]:', err);
  }

  return NextResponse.json({
    success: true,
    data: assessmentResponseSchema.parse(assessments),
  });
}

/**
 * POST: Menyimpan hasil asesmen ke database PostgreSQL dan cache memori (Item 6)
 */
export async function POST(request: Request) {
  if (!hasSession(request)) {
    return NextResponse.json({ success: false, message: 'Session required.' }, { status: 401 });
  }

  try {
    const rawBody = await request.json();
    const payload = createAssessmentSchema.parse(rawBody);
    const user = await getVerifiedUser(request);
    const userId = user?.id ? Number(user.id) : null;

    const matchNumber = 88;
    const assessment: AssessmentInput = {
      ...payload,
      id: crypto.randomUUID(),
      match: `${matchNumber}%`,
      status: 'review',
    };

    assessments.unshift(assessment);

    // Tulis ke PostgreSQL
    try {
      await query(`
        INSERT INTO assessments (user_id, target_career, match_score, skill_gap, validation_status)
        VALUES ($1, $2, $3, $4, $5)
      `, [userId, payload.target, matchNumber, 100 - matchNumber, 'review']);
    } catch {
      try {
        await query(`
          INSERT INTO assessments (user_id, target_career, match_score, skill_gap)
          VALUES ($1, $2, $3, $4)
        `, [userId, payload.target, matchNumber, 100 - matchNumber]);
      } catch (insertErr) {
        console.warn('[Assessments DB Insert Warning]:', insertErr);
      }
    }

    return NextResponse.json({ success: true, data: assessment }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, message: 'Payload assessment tidak valid.' }, { status: 400 });
  }
}
