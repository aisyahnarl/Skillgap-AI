export type Brand<T, B extends string> = T & { readonly __brand: B };

export type StudentId = Brand<string, 'StudentId'>;
export type ProductId = Brand<string, 'ProductId'>;
export type OrderId = Brand<string, 'OrderId'>;

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };

export interface StudentProfile {
  id: StudentId;
  name: string;
  email: string;
  role: 'Mahasiswa' | 'Siswa' | 'Dosen';
  program: string;
  matchScore: number;
  status: 'Valid' | 'Review' | 'Pending';
}

export interface Certification {
  id: ProductId;
  name: string;
  issuer: string;
  category: 'AI' | 'Data' | 'UI/UX' | 'Web' | 'Career';
  level: 'Foundation' | 'Intermediate' | 'Advanced';
  badgeColor: string;
}

export interface OrderSummary {
  id: OrderId;
  studentId: StudentId;
  certificateId: ProductId;
  purchaseDate: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Reviewed';
}

export interface AssessmentInput {
  fullName: string;
  email: string;
  interest: string;
  goals: string;
  experience: string;
}
