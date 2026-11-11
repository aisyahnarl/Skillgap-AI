import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'success',
    message: 'Selamat datang! Sistem analitik & sinkronisasi data SkillGap.AI aktif.',
    stats: {
      total_courses: 5,
      completed: 2,
    },
  });
}
