import { NextResponse } from 'next/server';
import { z } from 'zod';
import { emailService } from '../../../services/email-service';
import { hasSession } from '../../../lib/auth';

const emailSchema = z.object({
  to: z.string().email(),
  category: z.enum(['welcome', 'assessment_result', 'counselor_feedback']),
  userName: z.string().min(1),
  userRole: z.string().optional(),
  assessmentData: z.object({
    target: z.string(),
    matchScore: z.number(),
    skillGap: z.number(),
    certifications: z.array(z.string()),
  }).optional(),
  counselorData: z.object({
    validatorName: z.string(),
    validatorRole: z.string(),
    status: z.string(),
    feedback: z.string(),
  }).optional(),
});

export async function POST(request: Request) {
  if (!hasSession(request)) {
    return NextResponse.json({ success: false, message: 'Session required.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const input = emailSchema.parse(body);

    let sent = false;
    if (input.category === 'welcome') {
      sent = await emailService.sendWelcomeEmail({
        name: input.userName,
        email: input.to,
        role: input.userRole || 'Mahasiswa',
      });
    } else if (input.category === 'assessment_result' && input.assessmentData) {
      sent = await emailService.sendAssessmentSummaryEmail(
        { name: input.userName, email: input.to },
        input.assessmentData
      );
    } else if (input.category === 'counselor_feedback' && input.counselorData) {
      sent = await emailService.sendCounselorValidationEmail(
        { name: input.userName, email: input.to },
        input.counselorData
      );
    }

    return NextResponse.json({
      success: true,
      message: `Notifikasi email kategori '${input.category}' berhasil diproses.`,
      delivered: sent,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Payload tidak valid.';
    return NextResponse.json({ success: false, message: errorMsg }, { status: 400 });
  }
}
