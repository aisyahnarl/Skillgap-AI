import type { AssessmentReport } from './assessment-service';
import { defaultStudentReport } from './assessment-service';

export const recommendationService = {
  async generate(payload: unknown): Promise<{ data: AssessmentReport }> {
    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('API failed');
      return await response.json();
    } catch {
      return { data: defaultStudentReport };
    }
  },

  getStudyPathRecommendationsForStudent(targetSkill: string, baseScore = 88) {
    return [
      {
        title: 'Sistem Informasi',
        jenjang: 'Sarjana (S1)',
        match: Math.min(98, baseScore + 4),
        description: 'Mempelajari integrasi teknologi informasi, analisis proses bisnis, dan database.',
        careers: ['Business Analyst', 'Systems Analyst', 'IT Consultant'],
      },
      {
        title: 'Informatika',
        jenjang: 'Sarjana (S1)',
        match: baseScore,
        description: 'Fokus pada rekayasa perangkat lunak, struktur data, kecerdasan buatan, dan algoritma.',
        careers: ['Software Engineer', 'Data Scientist', 'AI Engineer'],
      },
      {
        title: 'Teknologi Informasi',
        jenjang: 'Sarjana / Terapan (S1/D4)',
        match: Math.max(70, baseScore - 4),
        description: 'Penerapan infrastruktur jaringan, keamanan siber, dan manajemen sistem komputasi.',
        careers: ['Cloud Administrator', 'Cybersecurity Specialist', 'Network Engineer'],
      },
    ];
  },
};
