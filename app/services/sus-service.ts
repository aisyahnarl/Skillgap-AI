export type SUSQuestion = {
  id: number;
  text: string;
  isNegative: boolean;
};

export const susQuestions: SUSQuestion[] = [
  { id: 1, text: 'Saya pikir saya akan sering menggunakan sistem ini.', isNegative: false },
  { id: 2, text: 'Saya menemukan sistem ini tidak perlu terlalu kompleks.', isNegative: true },
  { id: 3, text: 'Saya pikir sistem ini mudah digunakan.', isNegative: false },
  { id: 4, text: 'Saya pikir saya butuh bantuan orang teknis untuk dapat menggunakan sistem ini.', isNegative: true },
  { id: 5, text: 'Saya menemukan berbagai fungsi dalam sistem ini terintegrasi dengan sangat baik.', isNegative: false },
  { id: 6, text: 'Saya pikir ada terlalu banyak hal yang tidak konsisten dalam sistem ini.', isNegative: true },
  { id: 7, text: 'Saya yakin kebanyakan orang akan mudah dan cepat belajar menggunakan sistem ini.', isNegative: false },
  { id: 8, text: 'Saya menemukan sistem ini sangat rumit dan membingungkan untuk digunakan.', isNegative: true },
  { id: 9, text: 'Saya merasa sangat percaya diri saat menggunakan sistem ini.', isNegative: false },
  { id: 10, text: 'Saya harus mempelajari banyak hal terlebih dahulu sebelum dapat menggunakan sistem ini.', isNegative: true },
];

export type SUSGrade = 'Marginal (< 68)' | 'Good (68–80.3)' | 'Excellent (> 80.3)';

export type SUSResponse = {
  id: string;
  userName: string;
  role: 'Mahasiswa' | 'Pelajar';
  scores: Record<number, number>; // question id -> 1..5
  calculatedScore: number;
  grade: SUSGrade;
  submittedAt: string;
};

const SUS_STORAGE_KEY = 'skillgap-sus-responses';

const seedResponses: SUSResponse[] = [
  {
    id: 'sus-seed-1',
    userName: 'Nadia A.',
    role: 'Mahasiswa',
    scores: { 1: 5, 2: 2, 3: 5, 4: 1, 5: 5, 6: 1, 7: 5, 8: 1, 9: 4, 10: 2 },
    calculatedScore: 87.5,
    grade: 'Excellent (> 80.3)',
    submittedAt: '2026-09-18T10:00:00.000Z',
  },
  {
    id: 'sus-seed-2',
    userName: 'Fajar Pratama',
    role: 'Pelajar',
    scores: { 1: 4, 2: 2, 3: 4, 4: 2, 5: 4, 6: 2, 7: 4, 8: 1, 9: 4, 10: 2 },
    calculatedScore: 77.5,
    grade: 'Good (68–80.3)',
    submittedAt: '2026-09-18T11:00:00.000Z',
  },
  {
    id: 'sus-seed-3',
    userName: 'Ayu Lestari',
    role: 'Mahasiswa',
    scores: { 1: 5, 2: 1, 3: 5, 4: 1, 5: 4, 6: 1, 7: 5, 8: 1, 9: 5, 10: 1 },
    calculatedScore: 92.5,
    grade: 'Excellent (> 80.3)',
    submittedAt: '2026-09-18T14:30:00.000Z',
  },
];

export const susService = {
  calculateScore: (scores: Record<number, number>): { score: number; grade: SUSGrade } => {
    let totalContribution = 0;
    for (let i = 1; i <= 10; i++) {
      const val = scores[i] ?? 3;
      if (i % 2 === 1) {
        // Odd item (1, 3, 5, 7, 9)
        totalContribution += val - 1;
      } else {
        // Even item (2, 4, 6, 8, 10)
        totalContribution += 5 - val;
      }
    }
    const score = Number((totalContribution * 2.5).toFixed(1));
    let grade: SUSGrade = 'Marginal (< 68)';
    if (score > 80.3) {
      grade = 'Excellent (> 80.3)';
    } else if (score >= 68) {
      grade = 'Good (68–80.3)';
    }
    return { score, grade };
  },

  saveResponse: (payload: {
    userName: string;
    role: 'Mahasiswa' | 'Pelajar';
    scores: Record<number, number>;
  }): SUSResponse => {
    const { score, grade } = susService.calculateScore(payload.scores);
    const newResponse: SUSResponse = {
      id: `sus-${Date.now()}`,
      userName: payload.userName,
      role: payload.role,
      scores: payload.scores,
      calculatedScore: score,
      grade,
      submittedAt: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      const existing = susService.getAllResponses();
      const updated = [newResponse, ...existing];
      localStorage.setItem(SUS_STORAGE_KEY, JSON.stringify(updated));
    }
    return newResponse;
  },

  getAllResponses: (): SUSResponse[] => {
    if (typeof window === 'undefined') return seedResponses;
    try {
      const raw = localStorage.getItem(SUS_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
      localStorage.setItem(SUS_STORAGE_KEY, JSON.stringify(seedResponses));
      return seedResponses;
    } catch {
      return seedResponses;
    }
  },

  getStats: () => {
    const responses = susService.getAllResponses();
    if (!responses.length) {
      return {
        total: 0,
        averageScore: 0,
        grade: 'Belum ada data',
        mahasiswaAvg: 0,
        pelajarAvg: 0,
      };
    }
    const sumAll = responses.reduce((acc, r) => acc + r.calculatedScore, 0);
    const averageScore = Number((sumAll / responses.length).toFixed(1));

    const mhs = responses.filter((r) => r.role === 'Mahasiswa');
    const mhsAvg = mhs.length
      ? Number((mhs.reduce((acc, r) => acc + r.calculatedScore, 0) / mhs.length).toFixed(1))
      : averageScore;

    const plj = responses.filter((r) => r.role === 'Pelajar');
    const pljAvg = plj.length
      ? Number((plj.reduce((acc, r) => acc + r.calculatedScore, 0) / plj.length).toFixed(1))
      : averageScore;

    let grade: SUSGrade = 'Marginal (< 68)';
    if (averageScore > 80.3) {
      grade = 'Excellent (> 80.3)';
    } else if (averageScore >= 68) {
      grade = 'Good (68–80.3)';
    }

    return {
      total: responses.length,
      averageScore,
      grade,
      mahasiswaAvg: mhsAvg,
      pelajarAvg: pljAvg,
    };
  },
};
