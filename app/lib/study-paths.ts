import { z } from 'zod';

export const studyPathSchema = z.object({
  id: z.string().min(1),
  nama_jurusan: z.string().min(2),
  jenjang_target: z.enum(['SMA', 'SMK', 'Diploma', 'Sarjana']),
  bidang: z.string().min(2),
  deskripsi: z.string().min(10),
  skill_terkait: z.array(z.string().min(1)).min(1),
  prospek_karier: z.array(z.string().min(1)).min(1),
  sertifikasi_terkait: z.array(z.string().min(1)),
  status: z.enum(['active', 'inactive']),
});

export const studyPathInputSchema = studyPathSchema.omit({ id: true });
export type StudyPath = z.infer<typeof studyPathSchema>;
export type StudyPathInput = z.infer<typeof studyPathInputSchema>;

const seed: StudyPath[] = [
  {
    id: 'path-si',
    nama_jurusan: 'Sistem Informasi',
    jenjang_target: 'Sarjana',
    bidang: 'Manajemen Data & IT',
    deskripsi: 'Jalur studi yang memadukan teknologi komputer dengan strategi bisnis, analisis proses, dan pengelolaan data organisasi.',
    skill_terkait: ['Analisis Kebutuhan Bisnis', 'SQL & Database', 'Manajemen Proyek TI'],
    prospek_karier: ['Business Analyst', 'System Analyst', 'Product Specialist'],
    sertifikasi_terkait: ['Microsoft Power BI PL-300', 'Google Data Analytics'],
    status: 'active',
  },
  {
    id: 'path-if',
    nama_jurusan: 'Informatika / Ilmu Komputer',
    jenjang_target: 'Sarjana',
    bidang: 'Software & Komputasi',
    deskripsi: 'Jalur studi berfokus pada algoritma komputasi, pengembangan aplikasi perangkat lunak, arsitektur AI, dan logika pemrograman.',
    skill_terkait: ['Algoritma Pemrograman', 'Python & TypeScript', 'Kecerdasan Buatan (AI)'],
    prospek_karier: ['Software Engineer', 'AI Engineer', 'Full Stack Developer'],
    sertifikasi_terkait: ['Meta Front-End Developer', 'AWS Certified Developer'],
    status: 'active',
  },
  {
    id: 'path-ti',
    nama_jurusan: 'Teknologi Informasi',
    jenjang_target: 'Diploma',
    bidang: 'Infrastruktur & Cloud',
    deskripsi: 'Jalur kejuruan/vokasi terapan yang menekankan implementasi jaringan, keamanan siber, administrasi server, dan sistem cloud.',
    skill_terkait: ['Jaringan TCP/IP', 'Linux Administration', 'Cloud Infrastructure'],
    prospek_karier: ['Cloud Engineer', 'Network Specialist', 'IT Support Specialist'],
    sertifikasi_terkait: ['CompTIA Security+', 'Cisco CCNA'],
    status: 'active',
  },
  {
    id: 'path-dkv',
    nama_jurusan: 'Desain Komunikasi Visual (DKV)',
    jenjang_target: 'Sarjana',
    bidang: 'Kreativitas & Desain',
    deskripsi: 'Jalur studi yang mempelajari perancangan antarmuka digital, desain visual, pengalaman pengguna (UI/UX), dan branding kreatif.',
    skill_terkait: ['UI/UX Design', 'Design System Figma', 'Visual Branding'],
    prospek_karier: ['Product Designer', 'UI/UX Researcher', 'Visual Brand Strategist'],
    sertifikasi_terkait: ['Google UX Design', 'Adobe Certified Professional'],
    status: 'active',
  },
  {
    id: 'path-rpl',
    nama_jurusan: 'Rekayasa Perangkat Lunak',
    jenjang_target: 'SMK',
    bidang: 'Teknologi Kejuruan',
    deskripsi: 'Jalur kejuruan tingkat menengah (SMK) untuk membangun aplikasi web, mobile, dan API fungsional siap kerja.',
    skill_terkait: ['Web Development', 'Pemrograman Berorientasi Objek', 'Git Version Control'],
    prospek_karier: ['Junior Web Developer', 'QA Tester Junior', 'Technical Support'],
    sertifikasi_terkait: ['BNSP Pemrogram Madya', 'freeCodeCamp Web Responsive'],
    status: 'active',
  },
  {
    id: 'path-tkj',
    nama_jurusan: 'Teknik Komputer & Jaringan (TKJ)',
    jenjang_target: 'SMK',
    bidang: 'Infrastruktur Jaringan',
    deskripsi: 'Jalur kejuruan SMK untuk instalasi LAN/WAN, routing, keamanan jaringan kabel/nirkabel, dan perakitan hardware komputer.',
    skill_terkait: ['Perakitan Komputer', 'MikroTik Routing', 'Kabel Fiber & UTP'],
    prospek_karier: ['Teknisi Jaringan', 'Network Administrator Junior', 'Hardware Support'],
    sertifikasi_terkait: ['MTCNA MikroTik', 'BNSP Teknisi Jaringan Komputer'],
    status: 'active',
  },
];

type Store = { paths: StudyPath[] };
const globalStore = globalThis as typeof globalThis & { __skillgapStudyPathStore?: Store };
const store = globalStore.__skillgapStudyPathStore ?? { paths: structuredClone(seed) };
globalStore.__skillgapStudyPathStore = store;

export const listStudyPaths = () => store.paths;
export const createStudyPath = (input: StudyPathInput) => { const item = { ...input, id: `path-${crypto.randomUUID()}` }; store.paths.push(item); return item; };
export const updateStudyPath = (id: string, input: StudyPathInput) => { const index = store.paths.findIndex((item) => item.id === id); if (index < 0) return null; const item = { ...input, id }; store.paths[index] = item; return item; };
export const deleteStudyPath = (id: string) => { const index = store.paths.findIndex((item) => item.id === id); if (index < 0) return false; store.paths.splice(index, 1); return true; };
