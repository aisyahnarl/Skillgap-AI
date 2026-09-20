import { z } from 'zod';

const competencyCategorySchema = z.enum([
  'Technical',
  'Data',
  'Design',
  'Business',
  'Communication',
  'Management',
  'Cyber Security',
  'Cloud',
  'Soft Skill',
  'Teknis',
  'Interpersonal',
  'Manajerial',
]);

export const competencySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2),
  category: competencyCategorySchema,
  level: z.enum(['Pemula', 'Menengah', 'Lanjutan']),
  description: z.string().min(10),
  roles: z.array(z.string().min(1)).min(1),
  certifications: z.array(z.string().min(1)),
  nama_skill: z.string().min(2),
  kategori: competencyCategorySchema,
  deskripsi: z.string().min(10),
  bobot_permintaan: z.number().min(0).max(100),
  sumber: z.string().min(2),
  status: z.enum(['active', 'inactive']),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

const competencyInputRawSchema = z.object({
  name: z.string().optional(),
  category: competencyCategorySchema.optional(),
  level: z.enum(['Pemula', 'Menengah', 'Lanjutan']).optional(),
  description: z.string().optional(),
  roles: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  nama_skill: z.string().optional(),
  kategori: competencyCategorySchema.optional(),
  deskripsi: z.string().optional(),
  bobot_permintaan: z.number().optional(),
  sumber: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const competencyInputSchema = z.preprocess((value) => {
  const input = competencyInputRawSchema.parse(value);
  const now = new Date().toISOString();
  const name = input.nama_skill ?? input.name ?? '';
  const category = input.kategori ?? input.category ?? 'Technical';
  const description = input.deskripsi ?? input.description ?? '';
  return {
    name,
    category,
    level: input.level ?? 'Menengah',
    description,
    roles: input.roles?.length ? input.roles : ['Generalist'],
    certifications: input.certifications ?? [],
    nama_skill: name,
    kategori: category,
    deskripsi: description,
    bobot_permintaan: input.bobot_permintaan ?? 50,
    sumber: input.sumber ?? 'Katalog internal SkillGap.AI',
    status: input.status ?? 'active',
    created_at: input.created_at ?? now,
    updated_at: input.updated_at ?? now,
  };
}, competencySchema.omit({ id: true }));
export type Competency = z.infer<typeof competencySchema>;
export type CompetencyInput = z.infer<typeof competencyInputSchema>;

const seedCompetencies: Competency[] = [
  {
    id: 'comp-data-analysis',
    name: 'Analisis Data',
    category: 'Data',
    level: 'Menengah',
    description: 'Mengolah data menjadi insight yang dapat ditindaklanjuti.',
    roles: ['Data Analyst', 'Business Intelligence Analyst', 'Data Scientist'],
    certifications: ['Google Data Analytics', 'Microsoft PL-300', 'Dicoding: Belajar Machine Learning'],
    nama_skill: 'Analisis Data',
    kategori: 'Data',
    deskripsi: 'Mengolah data menjadi insight yang dapat ditindaklanjuti.',
    bobot_permintaan: 92,
    sumber: 'World Economic Forum / SKKNI 2017',
    status: 'active',
    created_at: '2026-09-01T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'comp-user-research',
    name: 'Riset Pengguna & Desain UI/UX',
    category: 'Design',
    level: 'Menengah',
    description: 'Menggali kebutuhan pengguna melalui wawancara, wireframe Figma, dan usability testing.',
    roles: ['UX Researcher', 'Product Designer', 'UI/UX Designer'],
    certifications: ['Google UX Design', 'Meta Front-End Developer'],
    nama_skill: 'Riset Pengguna & Desain UI/UX',
    kategori: 'Design',
    deskripsi: 'Menggali kebutuhan pengguna melalui wawancara, wireframe Figma, dan usability testing.',
    bobot_permintaan: 84,
    sumber: 'SKKNI Desain Komunikasi Visual',
    status: 'active',
    created_at: '2026-09-01T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'comp-api-engineering',
    name: 'API Engineering & Back-End Architecture',
    category: 'Technical',
    level: 'Lanjutan',
    description: 'Merancang arsitektur microservices dan API yang aman, teruji, dan mudah diintegrasikan.',
    roles: ['Fullstack Developer', 'Backend Developer', 'Software Engineer'],
    certifications: ['Meta Back-End Developer', 'Dicoding: Belajar Fundamental Back-End', 'AWS Cloud Practitioner'],
    nama_skill: 'API Engineering & Back-End Architecture',
    kategori: 'Technical',
    deskripsi: 'Merancang arsitektur microservices dan API yang aman, teruji, dan mudah diintegrasikan.',
    bobot_permintaan: 88,
    sumber: 'SKKNI Software Development 2017',
    status: 'active',
    created_at: '2026-09-01T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'comp-frontend-engineering',
    name: 'Pengembangan Web Front-End Modern',
    category: 'Technical',
    level: 'Menengah',
    description: 'Membangun antarmuka interaktif responsif menggunakan React, JavaScript modern ES6, dan CSS Grid.',
    roles: ['Frontend Developer', 'Web Developer', 'Software Engineer'],
    certifications: ['Meta Front-End Developer', 'Dicoding: Belajar Fundamental Front-End Web', 'BNSP Junior Web Developer'],
    nama_skill: 'Pengembangan Web Front-End Modern',
    kategori: 'Technical',
    deskripsi: 'Membangun antarmuka interaktif responsif menggunakan React, JavaScript modern ES6, dan CSS Grid.',
    bobot_permintaan: 90,
    sumber: 'SKKNI Software Development 2017',
    status: 'active',
    created_at: '2026-09-01T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'comp-dasar-web-pelajar',
    name: 'Dasar Pemrograman Web & Logika Komputasi',
    category: 'Technical',
    level: 'Pemula',
    description: 'Pemahaman fundamental algoritma, struktur halaman HTML5, styling responsif CSS, dan pengenalan database.',
    roles: ['Pelajar SMA/SMK', 'Junior Web Developer', 'Teknik Komputer & Jaringan'],
    certifications: ['Dicoding: Belajar Dasar Pemrograman Web', 'BNSP Junior Web Developer', 'Microsoft AZ-900'],
    nama_skill: 'Dasar Pemrograman Web & Logika Komputasi',
    kategori: 'Technical',
    deskripsi: 'Pemahaman fundamental algoritma, struktur halaman HTML5, styling responsif CSS, dan pengenalan database.',
    bobot_permintaan: 82,
    sumber: 'Kurikulum Merdeka SMK & SKKNI',
    status: 'active',
    created_at: '2026-09-01T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
  },
];

type CompetencyStore = { competencies: Competency[] };

const globalStore = globalThis as typeof globalThis & { __skillgapCompetencyStore?: CompetencyStore };
const store = globalStore.__skillgapCompetencyStore ?? { competencies: structuredClone(seedCompetencies) };
globalStore.__skillgapCompetencyStore = store;

export function listCompetencies() {
  return store.competencies;
}

export function createCompetency(input: unknown) {
  const parsed = competencyInputSchema.parse(input);
  const competency = competencySchema.parse({ ...parsed, id: `comp-${crypto.randomUUID()}` });
  store.competencies.push(competency);
  return competency;
}

export function createCompetencies(inputs: unknown[]) {
  return inputs.map((input) => createCompetency(input));
}

export function updateCompetency(id: string, input: unknown) {
  const index = store.competencies.findIndex((item) => item.id === id);
  if (index === -1) return null;
  const current = store.competencies[index];
  const parsed = competencyInputSchema.parse({
    ...current,
    ...(typeof input === 'object' && input !== null ? input : {}),
  });
  const competency = competencySchema.parse({
    ...parsed,
    id,
    created_at: current?.created_at ?? new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  store.competencies[index] = competency;
  return competency;
}

export function deleteCompetency(id: string) {
  const index = store.competencies.findIndex((item) => item.id === id);
  if (index === -1) return false;
  store.competencies.splice(index, 1);
  return true;
}
