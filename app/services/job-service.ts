import { type AssessmentReport, defaultStudentReport, assessmentService } from './assessment-service';

export type WorkplaceType = 'Remote' | 'Hybrid' | 'Onsite';
export type JobType = 'Penuh Waktu' | 'Magang / Internship' | 'Fresh Graduate' | 'Kontrak';
export type JobCategory =
  | 'Data Science'
  | 'Web Development'
  | 'UI/UX'
  | 'Cloud & DevOps'
  | 'Cyber Security'
  | 'Product'
  | 'Marketing';

export type JobVacancy = {
  id: string;
  title: string;
  company: string;
  companyInitial: string;
  companyColor: string; // Tailwind bg color class
  location: string;
  workplaceType: WorkplaceType;
  type: JobType;
  experienceLevel: string;
  salary: string;
  category: JobCategory;
  postedDate: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  requiredSkills: string[];
  benefits: string[];
  urgentHiring?: boolean;
};

export type MatchedJobVacancy = JobVacancy & {
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  whyFit: string;
  roadmapAdvice: string;
  isBookmarked: boolean;
  hasApplied: boolean;
  appliedDate?: string;
  applicationStatus?: 'Lamaran Terkirim' | 'Direview HR' | 'Wawancara';
};

export type JobApplication = {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  applicantName: string;
  email: string;
  cvName: string;
  portfolioUrl?: string;
  notes?: string;
  appliedAt: string;
  status: 'Lamaran Terkirim' | 'Direview HR' | 'Wawancara';
};

const SAVED_JOBS_KEY = 'skillgap-saved-jobs';
const APPLICATIONS_KEY = 'skillgap-job-applications';

export const jobCatalog: JobVacancy[] = [
  // 1. DATA SCIENCE & ANALYTICS
  {
    id: 'job-data-1',
    title: 'Junior Data Analyst',
    company: 'Tokopedia (GoTo Group)',
    companyInitial: 'TK',
    companyColor: 'bg-emerald-600',
    location: 'Jakarta Selatan',
    workplaceType: 'Hybrid',
    type: 'Fresh Graduate',
    experienceLevel: 'Fresh Graduate / < 1 Tahun',
    salary: 'Rp 7.500.000 - Rp 11.000.000',
    category: 'Data Science',
    postedDate: '1 hari yang lalu',
    urgentHiring: true,
    description:
      'Bergabunglah dengan tim Data Tokopedia untuk mengekstrak pola perilaku jutaan pengguna e-commerce, mengotomasi dashboard metrik transaksi, dan mendukung pengambilan keputusan divisi bisnis.',
    responsibilities: [
      'Menulis query SQL kompleks untuk mengekstraksi dan membersihkan dataset transaksi harian.',
      'Membangun serta merawat dashboard analitik interaktif di Tableau / Looker Studio.',
      'Berkolaborasi erat dengan Product Manager untuk merumuskan metrik KPI fitur baru.',
      'Melakukan analisis funnel dan visualisasi churn rate berkala.',
    ],
    requirements: [
      'Lulusan S1/D4 jurusan Informatika, Sistem Informasi, Matematika, atau bidang terkait.',
      'Kuat dalam syntax SQL (JOIN, Aggregation, Subquery, Window Functions).',
      'Memahami dasar pemrograman Python (Pandas/NumPy) untuk data wrangling.',
      'Pengalaman membuat portofolio visualisasi data nyata menggunakan BI tools.',
    ],
    requiredSkills: ['SQL', 'Python', 'Tableau', 'Data Visualization', 'Problem Solving'],
    benefits: ['Asuransi Kesehatan Kelas A', 'Subsidi Laptop & Perangkat Kerja', 'Akses Pelatihan Internal & Coursera Enterprise', 'Fleksibilitas Kerja Hybrid'],
  },
  {
    id: 'job-data-2',
    title: 'Business Intelligence Analyst',
    company: 'Bank Mandiri (Livin’ by Mandiri)',
    companyInitial: 'BM',
    companyColor: 'bg-blue-700',
    location: 'Jakarta Pusat',
    workplaceType: 'Hybrid',
    type: 'Penuh Waktu',
    experienceLevel: 'Junior (0-2 Tahun)',
    salary: 'Rp 8.500.000 - Rp 13.500.000',
    category: 'Data Science',
    postedDate: '3 hari yang lalu',
    description:
      'Mendukung transformasi perbankan digital terbesar di Indonesia dengan menganalisis portofolio pengguna aplikasi mobile banking, retensi nasabah, dan mendesain model pelaporan berbasis Power BI.',
    responsibilities: [
      'Merancang arsitektur model data relasional untuk pelaporan divisi perbankan digital.',
      'Menyusun rumus DAX kompleks untuk mengukur efisiensi konversi fitur pembayaran.',
      'Menghasilkan laporan insight eksekutif bulanan bagi jajaran manajemen.',
    ],
    requirements: [
      'Memiliki pemahaman solid mengenai data modeling relasional dan data warehouse.',
      'Keahlian tinggi dalam Microsoft Power BI dan sintaks DAX.',
      'Komunikasi interpersonal yang baik dan kemampuan menyajikan insight bisnis (data storytelling).',
    ],
    requiredSkills: ['Power BI', 'SQL', 'Data Modeling', 'Business Storytelling', 'Relational Database'],
    benefits: ['Bonus Tahunan & Kinerja', 'Fasilitas BPJS & Asuransi Swasta Tambahan', 'Jalur Karier Perbankan BUMN'],
  },
  {
    id: 'job-data-3',
    title: 'Data Science Intern',
    company: 'Traveloka',
    companyInitial: 'TV',
    companyColor: 'bg-sky-500',
    location: 'Tangerang Selatan (BSD)',
    workplaceType: 'Hybrid',
    type: 'Magang / Internship',
    experienceLevel: 'Mahasiswa Tingkat Akhir',
    salary: 'Rp 4.500.000 - Rp 6.000.000',
    category: 'Data Science',
    postedDate: 'Baru saja',
    urgentHiring: true,
    description:
      'Program magang intensif 6 bulan di divisi Traveloka Flight & Hotel Recommendation. Dapatkan bimbingan langsung dari Senior Data Scientist untuk mengimplementasikan algoritma machine learning pada industri travel lifestyle.',
    responsibilities: [
      'Membantu eksplorasi data (EDA) pada dataset pencarian tiket dan reservasi hotel.',
      'Melakukan data preprocessing, feature engineering, dan normalisasi fitur.',
      'Membantu implementasi baseline model machine learning dengan Scikit-Learn dan TensorFlow.',
    ],
    requirements: [
      'Mahasiswa aktif semester 6-8 atau fresh graduate di bidang STEM.',
      'Fasih menggunakan Python, Pandas, Matplotlib, dan Jupyter Notebook.',
      'Memahami konsep dasar statistik deskriptif dan inferensial.',
    ],
    requiredSkills: ['Python', 'Pandas', 'Machine Learning', 'Problem Solving', 'Data Visualization'],
    benefits: ['Uang Saku Bulanan Kompetitif', 'Sertifikat Magang Resmi & Peluang Kontrak Kerja', 'Makan Siang Gratis & Snack'],
  },

  // 2. WEB & SOFTWARE ENGINEERING
  {
    id: 'job-web-1',
    title: 'Junior Frontend Developer (React / Next.js)',
    company: 'Blibli (PT Global Digital Niaga)',
    companyInitial: 'BB',
    companyColor: 'bg-blue-600',
    location: 'Jakarta Barat',
    workplaceType: 'Hybrid',
    type: 'Fresh Graduate',
    experienceLevel: 'Fresh Graduate / < 1 Tahun',
    salary: 'Rp 7.000.000 - Rp 11.500.000',
    category: 'Web Development',
    postedDate: '2 hari yang lalu',
    urgentHiring: true,
    description:
      'Membangun antarmuka e-commerce modern dengan kecepatan render tinggi menggunakan ekosistem Next.js, React, dan Tailwind CSS. Berkontribusi pada jutaan interaksi belanja online setiap hari.',
    responsibilities: [
      'Menerjemahkan wireframe dan desain Figma ke dalam komponen React/Next.js yang modular dan responsif.',
      'Mengintegrasikan frontend dengan RESTful API backend dan GraphQL endpoint.',
      'Mengoptimalkan performa halaman (Core Web Vitals) dan aksesibilitas ramah pengguna.',
    ],
    requirements: [
      'Menguasai HTML5, CSS3/Tailwind CSS, dan JavaScript modern (ES6+ / TypeScript).',
      'Pengalaman membangun aplikasi berbasis React atau Next.js.',
      'Memahami penggunaan Git untuk kolaborasi tim (Pull Requests, branch management).',
    ],
    requiredSkills: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Git'],
    benefits: ['Tunjangan Kesehatan & Kebugaran', 'Peralatan MacBook Pro', 'Diskon Karyawan Blibli & Tiket.com'],
  },
  {
    id: 'job-web-2',
    title: 'Junior Backend Developer (Node.js / Go)',
    company: 'DANA Indonesia',
    companyInitial: 'DN',
    companyColor: 'bg-sky-600',
    location: 'Jakarta Selatan',
    workplaceType: 'Onsite',
    type: 'Penuh Waktu',
    experienceLevel: 'Junior (0-2 Tahun)',
    salary: 'Rp 8.000.000 - Rp 13.000.000',
    category: 'Web Development',
    postedDate: '4 hari yang lalu',
    description:
      'Bergabung dengan tim infrastruktur transaksi dompet digital DANA untuk memproses jutaan request transaksi finansial harian dengan arsitektur microservices berlatensi rendah.',
    responsibilities: [
      'Merancang dan membangun RESTful API dan gRPC services dengan Node.js atau Golang.',
      'Mengoptimalkan database query pada PostgreSQL dan Redis caching layer.',
      'Menulis unit test dan integration test untuk menjamin keandalan transaksi.',
    ],
    requirements: [
      'Pemahaman kuat mengenai OOP, REST architecture, dan struktur data.',
      'Familiar dengan database relasional (PostgreSQL/MySQL) dan NoSQL.',
      'Pernah membuat proyek backend dengan Express/NestJS atau Go Gin.',
    ],
    requiredSkills: ['Node.js', 'PostgreSQL', 'REST API', 'Git', 'Problem Solving'],
    benefits: ['Asuransi Medis Kelas Satu', 'Tunjangan Transportasi & Parkir', 'Program Mentorship FinTech'],
  },
  {
    id: 'job-web-3',
    title: 'Fullstack Web Developer Intern',
    company: 'Dicoding Indonesia',
    companyInitial: 'DC',
    companyColor: 'bg-indigo-700',
    location: 'Bandung / Remote',
    workplaceType: 'Remote',
    type: 'Magang / Internship',
    experienceLevel: 'Mahasiswa / Fresh Graduate',
    salary: 'Rp 4.000.000 - Rp 5.500.000',
    category: 'Web Development',
    postedDate: '2 hari yang lalu',
    description:
      'Kembangkan platform edukasi teknologi nomor satu di Indonesia. Anda akan terlibat dalam fitur kelas interaktif, forum diskusi, dan integrasi submission code review otomatis.',
    responsibilities: [
      'Mengembangkan fitur baru pada portal platform Dicoding.',
      'Memperbaiki issue bug antarmuka dan API secara berkala.',
      'Melakukan code review bersama tech lead senior.',
    ],
    requirements: [
      'Mahasiswa aktif atau lulusan baru yang bersemangat dalam web development.',
      'Paham JavaScript, React, dan Express/Node.js.',
      'Memiliki portofolio aplikasi web fungsional yang dapat didemokan.',
    ],
    requiredSkills: ['JavaScript', 'React', 'Node.js', 'HTML/CSS', 'Git'],
    benefits: ['Kerja Penuh Remote dari Mana Saja', 'Akses Semua Kelas Dicoding Academy Gratis', 'Peluang Rekrutmen Karyawan Tetap'],
  },

  // 3. UI/UX DESIGN & PRODUCT
  {
    id: 'job-uiux-1',
    title: 'Junior UI/UX Designer',
    company: 'Kitabisa.com',
    companyInitial: 'KB',
    companyColor: 'bg-teal-600',
    location: 'Jakarta Selatan',
    workplaceType: 'Hybrid',
    type: 'Fresh Graduate',
    experienceLevel: 'Fresh Graduate / < 1 Tahun',
    salary: 'Rp 6.500.000 - Rp 10.500.000',
    category: 'UI/UX',
    postedDate: '3 hari yang lalu',
    urgentHiring: true,
    description:
      'Ciptakan pengalaman donasi dan tolong-menolong yang mudah, transparan, dan penuh empati bagi jutaan masyarakat Indonesia melalui aplikasi Kitabisa.',
    responsibilities: [
      'Menyusun alur pengguna (user flow), wireframe, dan prototipe interaktif di Figma.',
      'Menjalankan usability testing berkala untuk memvalidasi kemudahan halaman kampanye donasi.',
      'Menjaga konsistensi design tokens dan komponen design system Kitabisa.',
    ],
    requirements: [
      'Portofolio studi kasus UI/UX yang menunjukkan proses berpikir (design thinking).',
      'Mahir menggunakan Figma (auto-layout, components, interactive prototyping).',
      'Memiliki empati kuat terhadap kebutuhan pengguna awam.',
    ],
    requiredSkills: ['Figma', 'UI Design', 'UX Research', 'Usability Testing', 'Prototyping'],
    benefits: ['Budaya Kerja Sosial & Berdampak Nyata', 'Fasilitas Kesehatan Mental & Konseling', 'Tunjangan Pembelajaran Desain'],
  },
  {
    id: 'job-uiux-2',
    title: 'Associate Product Manager',
    company: 'Shopee Indonesia',
    companyInitial: 'SP',
    companyColor: 'bg-orange-600',
    location: 'Jakarta Selatan',
    workplaceType: 'Onsite',
    type: 'Fresh Graduate',
    experienceLevel: 'Fresh Graduate / < 1 Tahun',
    salary: 'Rp 9.000.000 - Rp 14.000.000',
    category: 'Product',
    postedDate: '5 hari yang lalu',
    description:
      'Memimpin inisiatif produk digital pada ekosistem Shopee. Anda akan berkolaborasi dengan engineer, desainer UX, dan tim operasional untuk menghadirkan fitur marketplace berdaya saing tinggi.',
    responsibilities: [
      'Menyusun dokumen PRD (Product Requirement Document) yang jelas dan terstruktur.',
      'Menganalisis metrik adopsi produk dan kepuasan pengguna.',
      'Memprioritaskan product backlog dengan metodologi Agile/Scrum.',
    ],
    requirements: [
      'Gelar S1 di bidang Teknologi, Manajemen, atau Teknik.',
      'Kemampuan berpikir logis, analitis, dan pemecahan masalah yang tajam.',
      'Fasilitas komunikasi bahasa Indonesia dan Inggris yang profesional.',
    ],
    requiredSkills: ['Product Thinking', 'Roadmap Planning', 'Agile/Scrum', 'Data Analytics', 'Communication'],
    benefits: ['Gaji & Bonus Kompetitif Skala Regional', 'Makan Siang Harian Disediakan', 'Jalur Fast-Track Karier Manajemen'],
  },
  {
    id: 'job-uiux-3',
    title: 'UI/UX Design Intern',
    company: 'Bukalapak',
    companyInitial: 'BL',
    companyColor: 'bg-rose-600',
    location: 'Jakarta / Hybrid',
    workplaceType: 'Hybrid',
    type: 'Magang / Internship',
    experienceLevel: 'Mahasiswa Tingkat Akhir',
    salary: 'Rp 4.200.000 - Rp 5.800.000',
    category: 'UI/UX',
    postedDate: '3 hari yang lalu',
    description:
      'Program magang desain produk Bukalapak. Belajar langsung dari product designer berpengalaman mengenai design system, aksesibilitas, dan riset kuantitatif dalam skala platform besar.',
    responsibilities: [
      'Membantu pembuatan asset visual dan micro-interactions aplikasi.',
      'Mendokumentasikan varian komponen UI ke dalam design system.',
      'Membantu desainer senior dalam pencatatan sesi usability testing pengguna.',
    ],
    requirements: [
      'Mahasiswa jurusan DKV, Desain Produk, Informatika, atau sejenisnya.',
      'Menguasai dasar-dasar Figma dan prinsip tipografi & warna digital.',
      'Menyertakan link portofolio Figma / Behance / Dribbble saat melamar.',
    ],
    requiredSkills: ['Figma', 'Visual Design', 'Wireframing', 'Prototyping'],
    benefits: ['Uang Saku Magang Bulanan', 'Mentorship 1-on-1 dengan Senior Designer', 'Lingkungan Kerja Terbuka'],
  },

  // 4. CLOUD, DEVOPS & INFRASTRUCTURE
  {
    id: 'job-cloud-1',
    title: 'Junior Cloud Infrastructure Engineer',
    company: 'Telkom Indonesia (Indibiz / Telkom Cloud)',
    companyInitial: 'TI',
    companyColor: 'bg-red-600',
    location: 'Jakarta Pusat / Bandung',
    workplaceType: 'Hybrid',
    type: 'Penuh Waktu',
    experienceLevel: 'Junior (0-2 Tahun)',
    salary: 'Rp 8.000.000 - Rp 12.500.000',
    category: 'Cloud & DevOps',
    postedDate: '4 hari yang lalu',
    description:
      'Kelola infrastruktur cloud telekomunikasi terbesar di Indonesia. Berperan dalam penyediaan server virtual, orkestrasi container, serta monitoring keandalan layanan digital BUMN.',
    responsibilities: [
      'Melakukan konfigurasi dan pemeliharaan server Linux di lingkungan cloud AWS/GCP/OpenStack.',
      'Mengimplementasikan otomasi deployment menggunakan Docker dan CI/CD pipeline.',
      'Memantau performa server dan utilisasi jaringan menggunakan Prometheus & Grafana.',
    ],
    requirements: [
      'Familiar dengan administrasi sistem operasi Linux (Ubuntu/Debian/CentOS).',
      'Dasar pemahaman konsep jaringan komputer (TCP/IP, DNS, VPN, Firewalls).',
      'Memiliki sertifikasi cloud pemula seperti AWS Cloud Practitioner atau AZ-900 merupakan nilai tambah.',
    ],
    requiredSkills: ['Linux', 'Docker', 'Cloud Basics (AWS/GCP)', 'Networking', 'Git'],
    benefits: ['Status Karyawan BUMN', 'Asuransi Kesehatan Keluarga', 'Pelatihan Sertifikasi Internasional Dibiayai Perusahaan'],
  },
  {
    id: 'job-cloud-2',
    title: 'DevOps Intern',
    company: 'Astra Digital',
    companyInitial: 'AD',
    companyColor: 'bg-slate-800',
    location: 'Jakarta Utara',
    workplaceType: 'Hybrid',
    type: 'Magang / Internship',
    experienceLevel: 'Mahasiswa Tingkat Akhir',
    salary: 'Rp 4.500.000 - Rp 6.200.000',
    category: 'Cloud & DevOps',
    postedDate: '5 hari yang lalu',
    description:
      'Rasakan pengalaman mengelola pipeline deployment otomasi pada ekosistem digital grup otomotif terbesar di Indonesia. Anda akan belajar praktik modern GitOps dan containerization.',
    responsibilities: [
      'Membantu pemeliharaan skrip GitHub Actions CI/CD.',
      'Mengonfigurasi container Docker untuk lingkungan testing.',
      'Membantu troubleshooting logging aplikasi bersama tim developer.',
    ],
    requirements: [
      'Mahasiswa aktif semester 6-8 jurusan Teknik Komputer, Informatika, atau Elektro.',
      'Paham dasar shell scripting (Bash) dan Git commands.',
      'Memiliki minat besar dalam otomatisasi rilis software.',
    ],
    requiredSkills: ['Linux', 'Bash Scripting', 'Git', 'Docker', 'Problem Solving'],
    benefits: ['Uang Saku Kompetitif', 'Jalur Unggulan Astra Graduate Program', 'Gym & Sarana Olahraga Kantor'],
  },

  // 5. CYBER SECURITY
  {
    id: 'job-sec-1',
    title: 'Junior Cyber Security Analyst',
    company: 'BCA Digital (blu by BCA)',
    companyInitial: 'BC',
    companyColor: 'bg-blue-800',
    location: 'Jakarta Barat',
    workplaceType: 'Onsite',
    type: 'Penuh Waktu',
    experienceLevel: 'Fresh Graduate / < 1 Tahun',
    salary: 'Rp 8.500.000 - Rp 13.000.000',
    category: 'Cyber Security',
    postedDate: '1 hari yang lalu',
    urgentHiring: true,
    description:
      'Jadilah garda depan pengamanan ekosistem perbankan digital blu by BCA Digital. Lindungi data nasabah dari ancaman siber, lakukan vulnerability assessment, dan pastikan kepatuhan regulasi UU PDP.',
    responsibilities: [
      'Melakukan pemantauan log keamanan sistem secara real-time via SIEM tools.',
      'Melakukan scanning kerentanan (vulnerability assessment) berkala pada endpoint dan server.',
      'Membantu analisis insiden siber dan menyusun laporan mitigasi risiko.',
    ],
    requirements: [
      'Lulusan S1 Keamanan Siber, Teknik Informatika, atau Ilmu Komputer.',
      'Memahami prinsip OWASP Top 10, enkripsi data, dan network security.',
      'Nilai tambah memiliki sertifikasi CompTIA Security+, Google Cybersecurity, atau CEH.',
    ],
    requiredSkills: ['Cyber Security', 'Network Security', 'OWASP', 'Vulnerability Assessment', 'Linux'],
    benefits: ['Remunerasi Bank BCA Terkemuka', 'Asuransi Rawat Inap & Rawat Jalan Premium', 'Fasilitas Gadget & Keamanan Kerja'],
  },
  {
    id: 'job-sec-2',
    title: 'Security Operations Center (SOC) Intern',
    company: 'Defenxor Cyber Security',
    companyInitial: 'DX',
    companyColor: 'bg-purple-800',
    location: 'Jakarta Selatan',
    workplaceType: 'Hybrid',
    type: 'Magang / Internship',
    experienceLevel: 'Mahasiswa / Fresh Graduate',
    salary: 'Rp 4.000.000 - Rp 5.500.000',
    category: 'Cyber Security',
    postedDate: '4 hari yang lalu',
    description:
      'Program magang intensif di Managed Security Service Provider terkemuka. Terlibat dalam triase alert keamanan, analisa traffic anomali, dan pembuatan laporan kepatuhan.',
    responsibilities: [
      'Membantu analis SOC menelaah notifikasi alert keamanan harian.',
      'Melakukan investigasi dasar terhadap dugaan phishing atau brute-force attempt.',
      'Menyusun rangkuman tren threat intelligence mingguan.',
    ],
    requirements: [
      'Mahasiswa aktif tingkat akhir yang mendalami cyber security atau jaringan.',
      'Paham protokol jaringan TCP/IP, DNS, Wireshark packet capture.',
      'Teliti, analitis, dan memiliki integritas etika yang tinggi.',
    ],
    requiredSkills: ['Cyber Security', 'Network Analysis', 'Incident Response', 'Problem Solving'],
    benefits: ['Mentorship Praktisi Cyber Security Berpengalaman', 'Sertifikat Magang Industri Resmi', 'Akses Lab Hands-on Security'],
  },

  // 6. DIGITAL MARKETING & GROWTH
  {
    id: 'job-mkt-1',
    title: 'Digital Marketing & Growth Associate',
    company: 'Bibit.id (PT Bibit Tumbuh Bersama)',
    companyInitial: 'BB',
    companyColor: 'bg-emerald-700',
    location: 'Jakarta Selatan',
    workplaceType: 'Hybrid',
    type: 'Fresh Graduate',
    experienceLevel: 'Fresh Graduate / < 1 Tahun',
    salary: 'Rp 7.000.000 - Rp 11.000.000',
    category: 'Marketing',
    postedDate: '3 hari yang lalu',
    description:
      'Bantu jutaan investor pemula di Indonesia mencapai kebebasan finansial. Anda akan merancang strategi kampanye digital berbasis performa data, optimasi kanal Meta Ads dan Google Ads.',
    responsibilities: [
      'Menjalankan dan mengoptimasi iklan berbayar (Paid Ads) di kanal Google, Meta, dan TikTok.',
      'Menganalisis metriks CAC (Customer Acquisition Cost), ROAS, dan rasio konversi pendaftaran.',
      'Berkolaborasi dengan tim kreatif dalam memproduksi materi iklan interaktif berkinerja tinggi.',
    ],
    requirements: [
      'Ketertarikan tinggi pada industri FinTech dan edukasi investasi reksa dana/saham.',
      'Familiar dengan Google Analytics 4, Meta Ads Manager, dan spreadsheet.',
      'Kemampuan analitis numerik yang kuat berpadu dengan kreativitas pesan promosi.',
    ],
    requiredSkills: ['Digital Marketing', 'Data Analytics', 'Google Ads', 'Meta Ads', 'Storytelling'],
    benefits: ['Tunjangan Investasi Bulanan Bibit', 'Snack & Kopi Tak Terbatas', 'Program Asuransi Lengkap'],
  },
];

export const jobService = {
  getAll(): JobVacancy[] {
    return jobCatalog;
  },

  getJobById(id: string): JobVacancy | null {
    return jobCatalog.find((j) => j.id === id) ?? null;
  },

  getBookmarks(): string[] {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(SAVED_JOBS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  },

  toggleBookmark(jobId: string): boolean {
    if (typeof window === 'undefined') return false;
    const bookmarks = this.getBookmarks();
    const index = bookmarks.indexOf(jobId);
    let isSavedNow = false;
    if (index >= 0) {
      bookmarks.splice(index, 1);
      isSavedNow = false;
    } else {
      bookmarks.push(jobId);
      isSavedNow = true;
    }
    localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(bookmarks));
    return isSavedNow;
  },

  isBookmarked(jobId: string): boolean {
    return this.getBookmarks().includes(jobId);
  },

  getApplications(): JobApplication[] {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(APPLICATIONS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  },

  isJobApplied(jobId: string): boolean {
    return this.getApplications().some((a) => a.jobId === jobId);
  },

  applyJob(application: {
    jobId: string;
    applicantName: string;
    email: string;
    cvName?: string;
    portfolioUrl?: string;
    notes?: string;
  }): JobApplication {
    const job = this.getJobById(application.jobId);
    const newApp: JobApplication = {
      id: `app-${Date.now()}`,
      jobId: application.jobId,
      jobTitle: job?.title || 'Posisi Pekerjaan',
      company: job?.company || 'Perusahaan Mitra',
      applicantName: application.applicantName,
      email: application.email,
      cvName: application.cvName || 'CV-Portofolio.pdf',
      portfolioUrl: application.portfolioUrl,
      notes: application.notes,
      appliedAt: new Date().toISOString(),
      status: 'Lamaran Terkirim',
    };

    if (typeof window !== 'undefined') {
      const apps = this.getApplications();
      apps.unshift(newApp);
      localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(apps));
    }

    return newApp;
  },

  // AI-Powered Assessment Matching Algorithm
  getMatchedJobs(report?: AssessmentReport): MatchedJobVacancy[] {
    const activeReport = report ?? assessmentService.getActiveReport() ?? defaultStudentReport;
    const bookmarks = this.getBookmarks();
    const applications = this.getApplications();

    const targetLower = (activeReport.primarySkill || '').toLowerCase();
    const userStrengthsLower = (activeReport.strengths || []).map((s) => s.toLowerCase());
    const userGapsLower = (activeReport.gaps || []).map((g) => g.toLowerCase());
    const userSkills = (activeReport.skillAnalysis || []).map((s) => ({
      name: s.skill.toLowerCase(),
      current: s.current,
      status: s.status,
    }));

    return jobCatalog.map((job) => {
      const categoryLower = job.category.toLowerCase();
      const titleLower = job.title.toLowerCase();

      // Check category match
      const isDirectCategoryMatch =
        targetLower.includes(categoryLower) ||
        categoryLower.includes(targetLower) ||
        (targetLower.includes('data') && categoryLower.includes('data')) ||
        (targetLower.includes('web') && categoryLower.includes('web')) ||
        (targetLower.includes('ui') && categoryLower.includes('ui')) ||
        (targetLower.includes('security') && categoryLower.includes('security')) ||
        (targetLower.includes('market') && categoryLower.includes('market')) ||
        (targetLower.includes('product') && categoryLower.includes('product'));

      // Check skills matched vs missing
      const matchedSkills: string[] = [];
      const missingSkills: string[] = [];

      job.requiredSkills.forEach((reqSkill) => {
        const reqLower = reqSkill.toLowerCase();
        // Look in userSkills
        const foundSkill = userSkills.find((us) => us.name.includes(reqLower) || reqLower.includes(us.name));
        const mentionedInStrength = userStrengthsLower.some((str) => str.includes(reqLower));
        const mentionedInGap = userGapsLower.some((g) => g.includes(reqLower));

        if ((foundSkill && foundSkill.current >= 60) || mentionedInStrength) {
          matchedSkills.push(reqSkill);
        } else if (mentionedInGap || (foundSkill && foundSkill.status === 'Gap')) {
          missingSkills.push(reqSkill);
        } else {
          // General matching baseline: if category matches, consider 60% matched
          if (isDirectCategoryMatch && matchedSkills.length < 2) {
            matchedSkills.push(reqSkill);
          } else {
            missingSkills.push(reqSkill);
          }
        }
      });

      // Calculate dynamic match score
      let matchScore = 65;
      if (isDirectCategoryMatch) matchScore += 20;
      if (titleLower.includes(targetLower) || targetLower.includes(titleLower)) matchScore += 8;
      const skillMatchRatio = job.requiredSkills.length > 0 ? matchedSkills.length / job.requiredSkills.length : 0.5;
      matchScore += Math.round(skillMatchRatio * 15);

      // Clamp between 55% and 96%
      const matchPercentage = Math.min(96, Math.max(55, matchScore));

      // Generated AI fit advice
      let whyFit = `Profil dan keahlianmu di bidang ${activeReport.primarySkill} selaras dengan tanggung jawab posisi ini di ${job.company}.`;
      if (matchedSkills.length > 0) {
        whyFit += ` Kamu memiliki keunggulan pada skill: ${matchedSkills.slice(0, 3).join(', ')}.`;
      }

      let roadmapAdvice = `Selesaikan tugas pada Roadmap Belajarmu untuk menutup kesenjangan teknis.`;
      if (missingSkills.length > 0) {
        roadmapAdvice = `Prioritaskan penguatan skill ${missingSkills.slice(0, 2).join(' & ')} di Roadmap Belajar untuk meningkatkan peluang lolos wawancara.`;
      }

      const isBookmarked = bookmarks.includes(job.id);
      const appRecord = applications.find((a) => a.jobId === job.id);
      const hasApplied = !!appRecord;

      return {
        ...job,
        matchPercentage,
        matchedSkills,
        missingSkills,
        whyFit,
        roadmapAdvice,
        isBookmarked,
        hasApplied,
        appliedDate: appRecord?.appliedAt,
        applicationStatus: appRecord?.status,
      };
    }).sort((a, b) => b.matchPercentage - a.matchPercentage);
  },
};
