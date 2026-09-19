import { z } from 'zod';

export const assessmentInputSchema = z.object({
  id: z.string(),
  name: z.string().min(2),
  category: z.string().min(1),
  target: z.string().min(3),
  match: z.string(),
  status: z.enum(['valid', 'review', 'pending']),
});

export type AssessmentInput = z.infer<typeof assessmentInputSchema>;

export const assessmentResponseSchema = z.array(assessmentInputSchema);
export type AssessmentResponse = z.infer<typeof assessmentResponseSchema>;

export const createAssessmentSchema = assessmentInputSchema.pick({ name: true, category: true, target: true });
export type CreateAssessmentInput = z.infer<typeof createAssessmentSchema>;

export const assessmentApiResponseSchema = z.object({
  success: z.literal(true),
  data: assessmentResponseSchema,
});
