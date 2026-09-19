export type ValidationDecision = 'Relevan' | 'Perlu Revisi';

export type ValidationRecord = {
  itemId: string;
  decision: ValidationDecision;
  note: string;
  validatorRole: 'Dosen' | 'Guru BK' | string;
  validatorName?: string;
  date: string;
};

export type UserFeedbackRecord = {
  id: string;
  userName?: string;
  role: 'Mahasiswa' | 'Pelajar';
  target: string;
  relevance: 'Sangat Relevan' | 'Cukup Relevan' | 'Kurang Relevan';
  rating: number; // 1 to 5
  comment: string;
  submittedAt: string;
};

const VALIDATION_PREFIX = 'skillgap-validation-';
const ALL_VALIDATIONS_KEY = 'skillgap-all-validations';
const USER_FEEDBACK_KEY = 'skillgap-user-feedback';

const seedValidations: Record<string, ValidationRecord> = {
  '1': {
    itemId: '1',
    decision: 'Relevan',
    note: 'Jalur Data Science sangat sesuai dengan transkrip nilai matematika dan algoritma mahasiswa.',
    validatorRole: 'Dosen',
    validatorName: 'Dr. Hendra Wijaya, M.Kom',
    date: '2026-09-17T09:00:00.000Z',
  },
  '2': {
    itemId: '2',
    decision: 'Relevan',
    note: 'Pilihan peminatan UI/UX cocok dengan portofolio visual dan minat desain siswa.',
    validatorRole: 'Guru BK',
    validatorName: 'Siti Rahmawati, S.Pd',
    date: '2026-09-16T14:30:00.000Z',
  },
};

const seedFeedbacks: UserFeedbackRecord[] = [
  {
    id: 'fb-1',
    userName: 'Nadia A.',
    role: 'Mahasiswa',
    target: 'Data Scientist',
    relevance: 'Sangat Relevan',
    rating: 5,
    comment: 'Roadmap sangat terstruktur dari SQL dasar sampai proyek Machine Learning terapan.',
    submittedAt: '2026-09-18T10:00:00.000Z',
  },
  {
    id: 'fb-2',
    userName: 'Fajar Pratama',
    role: 'Pelajar',
    target: 'Sistem Informasi',
    relevance: 'Sangat Relevan',
    rating: 5,
    comment: 'Sangat membantu memahami jurusan kuliah yang cocok dengan nilai rapor dan hobi coding saya.',
    submittedAt: '2026-09-18T11:30:00.000Z',
  },
];

export const validationService = {
  save: (
    itemId: string,
    payload: {
      decision: ValidationDecision;
      note: string;
      validatorRole: string;
      validatorName?: string;
    },
  ): ValidationRecord => {
    const record: ValidationRecord = {
      ...payload,
      itemId,
      date: new Date().toISOString(),
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${VALIDATION_PREFIX}${itemId}`, JSON.stringify(record));
      const all = validationService.getAll();
      const next = { ...all, [itemId]: record };
      localStorage.setItem(ALL_VALIDATIONS_KEY, JSON.stringify(next));
    }
    return record;
  },

  get: (itemId: string): ValidationRecord | null => {
    if (typeof window === 'undefined') return seedValidations[itemId] ?? null;
    try {
      const raw = localStorage.getItem(`${VALIDATION_PREFIX}${itemId}`);
      if (raw) return JSON.parse(raw);
      return seedValidations[itemId] ?? null;
    } catch {
      return seedValidations[itemId] ?? null;
    }
  },

  getAll: (): Record<string, ValidationRecord> => {
    if (typeof window === 'undefined') return seedValidations;
    try {
      const raw = localStorage.getItem(ALL_VALIDATIONS_KEY);
      if (raw) return JSON.parse(raw);
      localStorage.setItem(ALL_VALIDATIONS_KEY, JSON.stringify(seedValidations));
      return seedValidations;
    } catch {
      return seedValidations;
    }
  },

  getStats: (): { total: number; relevant: number; needsRevision: number; rate: number } => {
    const all = validationService.getAll();
    const records = Object.values(all);
    const total = records.length;
    if (total === 0) return { total: 0, relevant: 0, needsRevision: 0, rate: 0 };
    const relevant = records.filter((r) => r.decision === 'Relevan').length;
    const needsRevision = records.filter((r) => r.decision === 'Perlu Revisi').length;
    const rate = Math.round((relevant / total) * 100);
    return { total, relevant, needsRevision, rate };
  },

  saveUserFeedback: (
    payload: Omit<UserFeedbackRecord, 'id' | 'submittedAt'>,
  ): UserFeedbackRecord => {
    const record: UserFeedbackRecord = {
      ...payload,
      id: `fb-${Date.now()}`,
      submittedAt: new Date().toISOString(),
    };
    if (typeof window !== 'undefined') {
      const current = validationService.getUserFeedbacks();
      const updated = [record, ...current];
      localStorage.setItem(USER_FEEDBACK_KEY, JSON.stringify(updated));
    }
    return record;
  },

  getUserFeedbacks: (): UserFeedbackRecord[] => {
    if (typeof window === 'undefined') return seedFeedbacks;
    try {
      const raw = localStorage.getItem(USER_FEEDBACK_KEY);
      if (raw) return JSON.parse(raw);
      localStorage.setItem(USER_FEEDBACK_KEY, JSON.stringify(seedFeedbacks));
      return seedFeedbacks;
    } catch {
      return seedFeedbacks;
    }
  },

  getFeedbackStats: (): { total: number; averageRating: number; relevanceRate: number } => {
    const list = validationService.getUserFeedbacks();
    if (!list.length) return { total: 0, averageRating: 0, relevanceRate: 0 };
    const sumRating = list.reduce((acc, item) => acc + item.rating, 0);
    const relevantCount = list.filter((item) => item.relevance !== 'Kurang Relevan').length;
    return {
      total: list.length,
      averageRating: Number((sumRating / list.length).toFixed(1)),
      relevanceRate: Math.round((relevantCount / list.length) * 100),
    };
  },
};
