export type AssessmentReport = {
  primarySkill: string;
  matchScore: number;
  skillGap: number;
  strengths: string[];
  gaps: string[];
  roadmap: Array<{
    phase: string;
    title: string;
    goal: string;
    duration: string;
    skills?: string[];
    resources?: string[];
    certification?: string;
    project?: string;
    status?: 'Not Started' | 'In Progress' | 'Completed';
    tasks?: Array<{ label: string; completed: boolean }>;
  }>;
  skillAnalysis: Array<{
    skill: string;
    category: string;
    current: number;
    required: number;
    gap: number;
    status: string;
  }>;
  certifications: Array<{
    name: string;
    provider: string;
    reason: string;
    match?: number;
    priority?: string;
    relatedGap?: number;
    relatedSkills?: string[];
    description?: string;
    targetLevel?: string;
    duration?: string;
    officialUrl?: string | null;
    prerequisites?: string;
    imageUrl?: string;
  }>;
  jobOpenings: Array<{
    title: string;
    fit: string;
    match: number;
    salary: string;
  }>;
};

export type AssessmentHistoryItem = {
  id: string;
  submittedAt: string;
  target: string;
  matchScore: number;
  skillGap: number;
  role?: string;
  jenjang?: string;
  report: AssessmentReport;
};

const HISTORY_KEY = 'skillgap-assessment-history';
const ACTIVE_REPORT_KEY = 'skillgap-report';
const ACTIVE_ASSESSMENT_KEY = 'skillgap-assessment';

export const defaultStudentReport: AssessmentReport = {
  primarySkill: 'Data Science',
  matchScore: 87,
  skillGap: 14,
  strengths: [
    'Analisis data dan ekstraksi pola numerik',
    'Logika kuantitatif dan statistik dasar',
    'Kemampuan adaptasi tools analitik baru',
  ],
  gaps: [
    'Perlu penguatan syntax SQL tingkat lanjut (JOIN, Window Functions)',
    'Belum memiliki portofolio end-to-end dengan dataset bisnis nyata',
    'Perlu peningkatan visualisasi dan data storytelling untuk stakeholder',
  ],
  skillAnalysis: [
    { skill: 'SQL Querying', category: 'Technical', current: 55, required: 90, gap: 35, status: 'Gap' },
    { skill: 'Python (Pandas/Numpy)', category: 'Technical', current: 80, required: 90, gap: 10, status: 'Developing' },
    { skill: 'Data Visualization', category: 'Technical', current: 65, required: 85, gap: 20, status: 'Developing' },
    { skill: 'Business Storytelling', category: 'Interpersonal', current: 60, required: 80, gap: 20, status: 'Developing' },
    { skill: 'Problem Solving', category: 'Interpersonal', current: 90, required: 80, gap: 0, status: 'Strong' },
  ],
  roadmap: [
    {
      phase: 'PHASE 1',
      title: 'SQL Fundamentals',
      goal: 'Improve SQL skill gap from 55% → 80%',
      duration: '4 weeks',
      skills: ['SQL', 'Relational Database'],
      resources: ['PostgreSQL Official Docs', 'Mode Analytics SQL Tutorial', 'LeetCode SQL 50'],
      certification: 'Google Data Analytics',
      project: 'SQL Case Study: E-Commerce Funnel Analysis',
      status: 'In Progress',
      tasks: [
        { label: 'SELECT & filtering queries', completed: true },
        { label: 'JOIN multi-table analysis', completed: true },
        { label: 'Aggregation & GROUP BY', completed: false },
        { label: 'Subquery & CTE window functions', completed: false },
      ],
    },
    {
      phase: 'PHASE 2',
      title: 'Python for Data Analysis',
      goal: 'Mahir pandas, data wrangling, dan exploratory analysis',
      duration: '6 weeks',
      skills: ['Python', 'Pandas', 'NumPy'],
      resources: ['Python for Data Analysis by Wes McKinney', 'Kaggle Python Course'],
      certification: 'IBM Data Analyst Certificate',
      project: 'Data Cleaning & EDA on Indonesian Fintech Dataset',
      status: 'Not Started',
      tasks: [
        { label: 'Data types and pandas DataFrames', completed: false },
        { label: 'Handling missing values & outliers', completed: false },
        { label: 'Feature engineering basics', completed: false },
        { label: 'Exploratory data visualization', completed: false },
      ],
    },
    {
      phase: 'PHASE 3',
      title: 'Interactive Dashboard & Storytelling',
      goal: 'Membangun dashboard visual insight berbasis bisnis',
      duration: '5 weeks',
      skills: ['Tableau / Power BI', 'Data Storytelling'],
      resources: ['Storytelling with Data by Cole Nussbaumer', 'Microsoft Learn PL-300'],
      certification: 'Microsoft PL-300 Power BI Data Analyst',
      project: 'Executive Sales & Churn Dashboard',
      status: 'Not Started',
      tasks: [
        { label: 'Data modeling in Power BI / Tableau', completed: false },
        { label: 'Designing KPI cards and interactive filters', completed: false },
        { label: 'Writing executive business summaries', completed: false },
      ],
    },
    {
      phase: 'PHASE 4',
      title: 'Portfolio & Career Preparation',
      goal: 'Menyusun studi kasus portofolio dan simulasi interview teknis',
      duration: '5 weeks',
      skills: ['Portfolio Building', 'Technical Interview'],
      resources: ['GitHub Portfolio Best Practices', 'Data Science Interview Prep'],
      certification: 'Associate Data Scientist Certification',
      project: 'End-to-End Published Case Study on GitHub/Medium',
      status: 'Not Started',
      tasks: [
        { label: 'Review and refine GitHub code repository', completed: false },
        { label: 'Publish case study writeup with actionable insights', completed: false },
        { label: 'Mock technical interview and CV tailoring', completed: false },
      ],
    },
  ],
  certifications: [
    {
      name: 'Google Data Analytics Professional Certificate',
      provider: 'Google / Coursera',
      reason: 'Sangat cocok untuk membangun fondasi analisis data, SQL, dan dashboard visual.',
      match: 95,
      priority: 'High',
      relatedGap: 35,
      relatedSkills: ['SQL', 'Data Cleaning', 'Tableau'],
      description: 'Program sertifikasi industri profesional dari Google untuk mempersiapkan analis data entry-level.',
      targetLevel: 'Pemula - Menengah',
      duration: '6 bulan (10 jam/minggu)',
      prerequisites: 'Tidak ada prasyarat khusus.',
      officialUrl: 'https://www.coursera.org/professional-certificates/google-data-analytics',
    },
    {
      name: 'Microsoft Certified: Power BI Data Analyst (PL-300)',
      provider: 'Microsoft',
      reason: 'Mendukung visualisasi data, pelaporan KPI bisnis, dan data modeling relasional.',
      match: 91,
      priority: 'High',
      relatedGap: 20,
      relatedSkills: ['Power BI', 'DAX', 'Dashboarding'],
      description: 'Sertifikasi resmi Microsoft untuk mendesain dan membangun aset analitik bisnis interaktif.',
      targetLevel: 'Menengah',
      duration: '3 bulan persiapan',
      prerequisites: 'Pemahaman dasar relasi data dan SQL.',
      officialUrl: 'https://learn.microsoft.com/certifications/exams/pl-300/',
    },
    {
      name: 'Dicoding: Belajar Machine Learning untuk Pemula',
      provider: 'Dicoding Academy',
      reason: 'Membantu transisi dari pengolahan data analitik dasar menuju pemodelan prediktif berbasis Python.',
      match: 90,
      priority: 'High',
      relatedGap: 18,
      relatedSkills: ['Machine Learning', 'Python', 'TensorFlow'],
      description: 'Kurikulum standar industri Indonesia untuk menguasai supervised & unsupervised learning dengan code review profesional Dicoding.',
      targetLevel: 'Pemula - Menengah',
      duration: '1.5 bulan (60 jam)',
      prerequisites: 'Dasar Python dan logika analitik.',
      officialUrl: 'https://www.dicoding.com/academies/184',
    },
  ],
  jobOpenings: [
    {
      title: 'Junior Data Analyst',
      fit: 'Sangat linear dengan kemampuan SQL, visualisasi, dan reporting yang sedang dibangun.',
      match: 92,
      salary: 'Rp 6.000.000 - Rp 11.000.000',
    },
    {
      title: 'Business Intelligence Analyst',
      fit: 'Cocok untuk penyusunan dashboard KPI dan otomasi reporting bisnis.',
      match: 88,
      salary: 'Rp 7.500.000 - Rp 13.000.000',
    },
    {
      title: 'Junior Data Scientist',
      fit: 'Jalur lanjutan setelah menguasai exploratory data analysis dan pemodelan prediktif.',
      match: 85,
      salary: 'Rp 8.000.000 - Rp 15.000.000',
    },
  ],
};

const seedHistory: AssessmentHistoryItem[] = [
  {
    id: 'hist-1',
    submittedAt: '2026-09-18T10:30:00.000Z',
    target: 'Data Analyst',
    matchScore: 87,
    skillGap: 13,
    role: 'Mahasiswa',
    jenjang: 'Mahasiswa',
    report: defaultStudentReport,
  },
  {
    id: 'hist-2',
    submittedAt: '2026-09-10T14:15:00.000Z',
    target: 'UI/UX Designer',
    matchScore: 78,
    skillGap: 22,
    role: 'Mahasiswa',
    jenjang: 'Mahasiswa',
    report: {
      ...defaultStudentReport,
      primarySkill: 'UI/UX Designer',
      matchScore: 78,
      skillGap: 22,
      strengths: ['Visual design', 'Empati pengguna', 'Figma prototyping'],
      gaps: ['Design system tokens', 'Usability testing terstruktur', 'Hand-off developer'],
    },
  },
];

export const assessmentService = {
  getHistory(): AssessmentHistoryItem[] {
    if (typeof window === 'undefined') return seedHistory;
    try {
      const value = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]');
      if (!Array.isArray(value) || value.length === 0) {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(seedHistory));
        return seedHistory;
      }
      return value;
    } catch {
      return seedHistory;
    }
  },

  addHistory(item: AssessmentHistoryItem): void {
    if (typeof window === 'undefined') return;
    const history = this.getHistory();
    const updated = [item, ...history];
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    this.setActiveReport(item.report);
  },

  getById(id: string): AssessmentHistoryItem | null {
    const history = this.getHistory();
    return history.find((item) => item.id === id) ?? null;
  },

  getActiveReport(): AssessmentReport {
    if (typeof window === 'undefined') return defaultStudentReport;
    try {
      const saved = localStorage.getItem(ACTIVE_REPORT_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
      localStorage.setItem(ACTIVE_REPORT_KEY, JSON.stringify(defaultStudentReport));
      return defaultStudentReport;
    } catch {
      return defaultStudentReport;
    }
  },

  setActiveReport(report: AssessmentReport): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ACTIVE_REPORT_KEY, JSON.stringify(report));
  },

  activateSnapshot(id: string): AssessmentReport | null {
    const item = this.getById(id);
    if (!item) return null;
    this.setActiveReport(item.report);
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        ACTIVE_ASSESSMENT_KEY,
        JSON.stringify({
          target: item.target,
          submittedAt: item.submittedAt,
          role: item.role,
          jenjang: item.jenjang,
        }),
      );
    }
    return item.report;
  },
};
