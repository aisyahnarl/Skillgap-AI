import type {
  AssessmentInput,
  AsyncState,
  AsyncStatus,
  Certification,
  OrderSummary,
  StudentProfile,
} from './types';

export const createIdleState = <T>(): AsyncState<T> => ({ status: 'idle' });

export const createLoadingState = <T>(): AsyncState<T> => ({
  status: 'loading',
});

export type DemoData = {
  students: StudentProfile[];
  certificates: Certification[];
  orders: OrderSummary[];
  assessment: AssessmentInput[];
};

export const demoData: DemoData = {
  students: [
    {
      id: 'student-101' as StudentProfile['id'],
      name: 'Ayu Lestari',
      email: 'ayu@email.com',
      role: 'Mahasiswa',
      program: 'Data Science',
      matchScore: 89,
      status: 'Valid',
    },
    {
      id: 'student-102' as StudentProfile['id'],
      name: 'Rizky Putra',
      email: 'rizky@email.com',
      role: 'Siswa',
      program: 'UI/UX',
      matchScore: 82,
      status: 'Review',
    },
    {
      id: 'student-103' as StudentProfile['id'],
      name: 'Nadya Sari',
      email: 'nadya@email.com',
      role: 'Mahasiswa',
      program: 'Web Development',
      matchScore: 91,
      status: 'Valid',
    },
  ],
  certificates: [
    {
      id: 'cert-201' as Certification['id'],
      name: 'AI Foundations',
      issuer: 'SkillGap Academy',
      category: 'AI',
      level: 'Foundation',
      badgeColor: 'indigo',
    },
    {
      id: 'cert-202' as Certification['id'],
      name: 'Data Storytelling',
      issuer: 'Data Masters',
      category: 'Data',
      level: 'Intermediate',
      badgeColor: 'sky',
    },
    {
      id: 'cert-203' as Certification['id'],
      name: 'UX Research Bootcamp',
      issuer: 'Product Lab',
      category: 'UI/UX',
      level: 'Advanced',
      badgeColor: 'emerald',
    },
  ],
  orders: [
    {
      id: 'order-301' as OrderSummary['id'],
      studentId: 'student-101' as OrderSummary['studentId'],
      certificateId: 'cert-201' as OrderSummary['certificateId'],
      purchaseDate: '2026-09-10',
      amount: 250000,
      status: 'Paid',
    },
    {
      id: 'order-302' as OrderSummary['id'],
      studentId: 'student-102' as OrderSummary['studentId'],
      certificateId: 'cert-203' as OrderSummary['certificateId'],
      purchaseDate: '2026-09-09',
      amount: 320000,
      status: 'Pending',
    },
  ],
  assessment: [
    {
      fullName: 'Ayu Lestari',
      email: 'ayu@email.com',
      interest: 'AI & Data',
      goals: 'Ingin masuk data science yang lebih terarah',
      experience: 'Pernah membuat dashboard portofolio kecil.',
    },
  ],
};

export const statusSequence: AsyncStatus[] = [
  'idle',
  'loading',
  'success',
  'error',
];
