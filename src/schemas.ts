import { z } from 'zod';

const studentIdSchema = z.string().min(1).brand<'StudentId'>();
const productIdSchema = z.string().min(1).brand<'ProductId'>();
const orderIdSchema = z.string().min(1).brand<'OrderId'>();

export const loginSchema = z.object({
  email: z.string().email('Format email tidak valid.'),
  password: z.string().min(8, 'Password minimal 8 karakter.'),
  remember: z.boolean().default(false),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Nama minimal 2 karakter.'),
  role: z.enum(['Mahasiswa', 'Siswa', 'Dosen']),
  email: z.string().email(),
  password: z.string().min(8),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const assessmentSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  interest: z.string().min(2),
  goals: z.string().min(10),
  experience: z.string().min(10),
});

export type AssessmentInput = z.infer<typeof assessmentSchema>;

export const certificateSchema = z.object({
  id: productIdSchema,
  name: z.string().min(2),
  issuer: z.string().min(2),
  category: z.enum(['AI', 'Data', 'UI/UX', 'Web', 'Career']),
  level: z.enum(['Foundation', 'Intermediate', 'Advanced']),
  badgeColor: z.string().min(3),
});

export const studentSchema = z.object({
  id: studentIdSchema,
  name: z.string().min(2),
  email: z.string().email(),
  role: z.enum(['Mahasiswa', 'Siswa', 'Dosen']),
  program: z.string().min(2),
  matchScore: z.number().min(0).max(100),
  status: z.enum(['Valid', 'Review', 'Pending']),
});

export const orderSchema = z.object({
  id: orderIdSchema,
  studentId: studentIdSchema,
  certificateId: productIdSchema,
  purchaseDate: z.string().datetime({ offset: true }).or(z.string().min(1)),
  amount: z.number().nonnegative(),
  status: z.enum(['Paid', 'Pending', 'Reviewed']),
});

export const apiResponseSchema = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({
    success: z.boolean(),
    data: schema,
    message: z.string().optional(),
  });

export const brandIds = {
  studentId: studentIdSchema,
  productId: productIdSchema,
  orderId: orderIdSchema,
};

export type StudentId = z.infer<typeof studentIdSchema>;
export type ProductId = z.infer<typeof productIdSchema>;
export type OrderId = z.infer<typeof orderIdSchema>;
