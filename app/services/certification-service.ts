export type Certification = {
  id: string;
  name: string;
  provider: string;
  category: string;
  description: string;
  targetLevel: string;
  duration: string;
  prerequisites: string;
  officialUrl?: string | null;
  imageUrl?: string;
  relatedSkills: string[];
  match?: number;
  priority?: 'High' | 'Medium' | 'Low';
  relatedGap?: number;
  reason?: string;
};

export const defaultCertifications: Certification[] = [
  // --- PLATFORM COURSERA & GOOGLE / IBM ---
  {
    id: 'cert-google-data',
    name: 'Google Data Analytics Professional Certificate',
    provider: 'Google / Coursera',
    category: 'Data',
    description: 'Program persiapan karier analitik data formal berskala global mencakup spreadsheet, SQL, R, dan visualisasi Tableau.',
    targetLevel: 'Pemula - Menengah',
    duration: '6 bulan (10 jam/minggu)',
    prerequisites: 'Tidak ada prasyarat khusus.',
    officialUrl: 'https://www.coursera.org/professional-certificates/google-data-analytics',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
    relatedSkills: ['SQL', 'Data Cleaning', 'Tableau', 'R Programming', 'Data Analysis'],
    match: 95,
    priority: 'High',
    relatedGap: 35,
    reason: 'Sangat direkomendasikan untuk menutup gap SQL, visualisasi data, dan pelaporan metrik industri.',
  },
  {
    id: 'cert-ms-pl300',
    name: 'Microsoft Certified: Power BI Data Analyst (PL-300)',
    provider: 'Microsoft',
    category: 'Data',
    description: 'Standar resmi industri Microsoft untuk mendesain, memodelkan, dan memvisualisasikan data analitik bisnis dengan Power BI.',
    targetLevel: 'Menengah',
    duration: '3 bulan persiapan',
    prerequisites: 'Pemahaman konsep database relasional dan pelaporan bisnis.',
    officialUrl: 'https://learn.microsoft.com/certifications/exams/pl-300/',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
    relatedSkills: ['Power BI', 'DAX', 'Data Modeling', 'Business Intelligence'],
    match: 91,
    priority: 'High',
    relatedGap: 20,
    reason: 'Mempercepat penguasaan dashboard interaktif, pemodelan data relasional, dan pelaporan eksekutif.',
  },
  {
    id: 'cert-ibm-data-science',
    name: 'IBM Data Science Professional Certificate',
    provider: 'IBM / Coursera',
    category: 'Data',
    description: 'Materi mendalam tentang metodologi data science, Python, SQL, visualisasi data, dan machine learning praktis.',
    targetLevel: 'Menengah',
    duration: '5 bulan',
    prerequisites: 'Pengetahuan matematika dan logika dasar.',
    officialUrl: 'https://www.coursera.org/professional-certificates/ibm-data-science',
    imageUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80',
    relatedSkills: ['Python', 'SQL', 'Machine Learning', 'Data Science', 'Pandas'],
    match: 88,
    priority: 'Medium',
    relatedGap: 15,
    reason: 'Mendukung transisi dari analisis data dasar menuju pemodelan prediktif berbasis machine learning.',
  },
  {
    id: 'cert-google-ux',
    name: 'Google UX Design Professional Certificate',
    provider: 'Google / Coursera',
    category: 'Design',
    description: 'Alur desain produk digital komprehensif mulai dari riset pengguna, wireframing, prototipe Figma interaktif, hingga usability testing.',
    targetLevel: 'Pemula - Menengah',
    duration: '6 bulan',
    prerequisites: 'Tidak ada prasyarat khusus.',
    officialUrl: 'https://www.coursera.org/professional-certificates/google-ux-design',
    imageUrl: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=600&q=80',
    relatedSkills: ['User Research', 'Wireframing', 'Figma', 'Prototyping', 'Usability Testing'],
    match: 94,
    priority: 'High',
    relatedGap: 30,
    reason: 'Membantu menyusun 3 studi kasus portofolio desain UI/UX nyata yang siap dipresentasikan ke industri.',
  },
  {
    id: 'cert-google-cyber',
    name: 'Google Cybersecurity Professional Certificate',
    provider: 'Google / Coursera',
    category: 'Cloud',
    description: 'Pelatihan fondasi keamanan informasi, deteksi ancaman siber, protokol jaringan, mitigasi risiko, dan tools SIEM (Chronicle/Splunk).',
    targetLevel: 'Pemula - Menengah',
    duration: '6 bulan',
    prerequisites: 'Kemampuan komputer dasar.',
    officialUrl: 'https://www.coursera.org/professional-certificates/google-cybersecurity',
    imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80',
    relatedSkills: ['Cyber Security', 'Network Security', 'Linux', 'Incident Response', 'Python'],
    match: 89,
    priority: 'High',
    relatedGap: 28,
    reason: 'Sertifikasi global paling diminati untuk persiapan karier Security Analyst dan SOC Defender.',
  },

  // --- PLATFORM META ---
  {
    id: 'cert-meta-frontend',
    name: 'Meta Front-End Developer Professional Certificate',
    provider: 'Meta / Coursera',
    category: 'Technical',
    description: 'Kurikulum resmi rekayasa web dari Meta (Facebook) meliputi HTML5, CSS3, JavaScript modern, React, dan Version Control Git.',
    targetLevel: 'Pemula - Menengah',
    duration: '7 bulan (7 jam/minggu)',
    prerequisites: 'Kemampuan komputer dasar dan kemauan belajar logika.',
    officialUrl: 'https://www.coursera.org/professional-certificates/meta-front-end-developer',
    imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=600&q=80',
    relatedSkills: ['HTML', 'CSS', 'JavaScript', 'React', 'Git', 'UI Engineering'],
    match: 96,
    priority: 'High',
    relatedGap: 25,
    reason: 'Direkomendasikan langsung oleh insinyur Meta untuk membangun antarmuka web modern dengan React.',
  },
  {
    id: 'cert-meta-backend',
    name: 'Meta Back-End Developer Professional Certificate',
    provider: 'Meta / Coursera',
    category: 'Technical',
    description: 'Program arsitektur server dari Meta mencakup Python, Linux, basis data relasional (MySQL/PostgreSQL), Django, dan RESTful APIs.',
    targetLevel: 'Pemula - Menengah',
    duration: '8 bulan (7 jam/minggu)',
    prerequisites: 'Dasar pemecahan masalah dan logika aljabar.',
    officialUrl: 'https://www.coursera.org/professional-certificates/meta-back-end-developer',
    imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80',
    relatedSkills: ['Python', 'Django', 'SQL', 'Database Design', 'RESTful API', 'Cloud Deployment'],
    match: 93,
    priority: 'High',
    relatedGap: 24,
    reason: 'Standar rekayasa backend industri global untuk membangun layanan web yang scalable dan aman.',
  },

  // --- PLATFORM DICODING ACADEMY (STANDAR INDUSTRI INDONESIA) ---
  {
    id: 'cert-dicoding-frontend',
    name: 'Dicoding: Belajar Fundamental Front-End Web Development',
    provider: 'Dicoding Academy',
    category: 'Technical',
    description: 'Kurikulum standar industri Indonesia terakreditasi Kemendikbudristek untuk menguasai Web Components, ES6, Webpack, dan konsumsi RESTful API.',
    targetLevel: 'Pemula - Menengah',
    duration: '2 bulan (80 jam belajar)',
    prerequisites: 'Memahami dasar HTML, CSS, dan sintaks JavaScript.',
    officialUrl: 'https://www.dicoding.com/academies/163',
    imageUrl: 'https://images.unsplash.com/photo-1593720213428-28a5b9e94613?auto=format&fit=crop&w=600&q=80',
    relatedSkills: ['JavaScript ES6', 'Web Components', 'Webpack', 'RESTful API', 'Front-End'],
    match: 95,
    priority: 'High',
    relatedGap: 22,
    reason: 'Sertifikasi kompetensi nomor satu di Indonesia yang diakui mitra industri teknologi untuk level Junior Front-End.',
  },
  {
    id: 'cert-dicoding-backend',
    name: 'Dicoding: Belajar Fundamental Aplikasi Back-End',
    provider: 'Dicoding Academy',
    category: 'Technical',
    description: 'Pembangunan RESTful API dengan Node.js, framework Hapi, manajemen basis data PostgreSQL, message broker, serta implementasi clean architecture.',
    targetLevel: 'Menengah',
    duration: '2.5 bulan (90 jam belajar)',
    prerequisites: 'Memahami dasar pemrograman JavaScript & konsep client-server.',
    officialUrl: 'https://www.dicoding.com/academies/261',
    imageUrl: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&w=600&q=80',
    relatedSkills: ['Node.js', 'PostgreSQL', 'RESTful API', 'Authentication', 'Clean Architecture'],
    match: 92,
    priority: 'High',
    relatedGap: 26,
    reason: 'Menutup kesenjangan arsitektur server, manajemen database transaksional, dan autentikasi JWT.',
  },
  {
    id: 'cert-dicoding-ml',
    name: 'Dicoding: Belajar Machine Learning untuk Pemula',
    provider: 'Dicoding Academy',
    category: 'Data',
    description: 'Materi terstruktur konsep supervised & unsupervised learning, regresi, klasifikasi, clustering, dan implementasi TensorFlow/Scikit-Learn.',
    targetLevel: 'Pemula - Menengah',
    duration: '1.5 bulan (60 jam belajar)',
    prerequisites: 'Dasar sintaks Python dan pemahaman matriks dasar.',
    officialUrl: 'https://www.dicoding.com/academies/184',
    imageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=600&q=80',
    relatedSkills: ['Machine Learning', 'Python', 'TensorFlow', 'Scikit-Learn', 'Data Modeling'],
    match: 90,
    priority: 'High',
    relatedGap: 18,
    reason: 'Mempersiapkan portofolio kecerdasan buatan terapan dengan review kode manual oleh profesional industri.',
  },
  {
    id: 'cert-dicoding-dasar-web',
    name: 'Dicoding: Belajar Dasar Pemrograman Web',
    provider: 'Dicoding Academy',
    category: 'Technical',
    description: 'Fundamental pembuatan website modern dengan HTML5 semantik, CSS Flexbox/Grid, responsivitas multi-device, dan publish ke web hosting.',
    targetLevel: 'Pemula (Pelajar SMA/SMK & Mahasiswa Tingkat 1)',
    duration: '1 bulan (45 jam belajar)',
    prerequisites: 'Tidak ada prasyarat khusus.',
    officialUrl: 'https://www.dicoding.com/academies/123',
    imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80',
    relatedSkills: ['HTML5', 'CSS3', 'Flexbox', 'Responsive Web Design'],
    match: 97,
    priority: 'High',
    relatedGap: 15,
    reason: 'Sangat cocok untuk siswa SMA/SMK dan pemula dalam membangun website pertama yang valid standar W3C.',
  },

  // --- STANDAR NASIONAL BNSP / LSP TELEMATIKA ---
  {
    id: 'cert-bnsp-junior-web',
    name: 'BNSP: Sertifikasi Profesi Junior Web Developer',
    provider: 'Badan Nasional Sertifikasi Profesi (BNSP)',
    category: 'Technical',
    description: 'Sertifikasi kompetensi kerja resmi Republik Indonesia mengacu pada SKKNI Software Development (Kepmenaker No. 282 Tahun 2016/2017).',
    targetLevel: 'Menengah (Vokasi, SMK, Mahasiswa)',
    duration: 'Uji kompetensi 1 hari (persiapan 1-2 bulan)',
    prerequisites: 'Memiliki portofolio aplikasi web berbasis database yang siap didemonstrasikan kepada asesor.',
    officialUrl: 'https://bnsp.go.id/',
    imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80',
    relatedSkills: ['Standar SKKNI', 'Web Programming', 'Database Relasional', 'Software Testing'],
    match: 94,
    priority: 'High',
    relatedGap: 20,
    reason: 'Lisensi resmi negara berstandar SKKNI yang menjadi nilai plus utama pada rekrutmen BUMN, instansi pemerintah, dan korporasi.',
  },

  // --- CLOUD & INFRASTRUKTUR (AWS & MICROSOFT) ---
  {
    id: 'cert-aws-cloud',
    name: 'AWS Certified Cloud Practitioner',
    provider: 'Amazon Web Services',
    category: 'Cloud',
    description: 'Validasi fundamental tentang arsitektur cloud global AWS, keamanan data, model penetapan harga, dan tata kelola infrastruktur IT.',
    targetLevel: 'Pemula - Menengah',
    duration: '2 bulan persiapan',
    prerequisites: 'Pengetahuan dasar komputasi dan jaringan.',
    officialUrl: 'https://aws.amazon.com/certification/certified-cloud-practitioner/',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
    relatedSkills: ['Cloud Infrastructure', 'AWS', 'Security & Compliance', 'DevOps Fundamentals'],
    match: 87,
    priority: 'Medium',
    relatedGap: 18,
    reason: 'Sertifikasi internasional bergengsi untuk membuktikan pemahaman infrastruktur komputasi awan modern.',
  },
  {
    id: 'cert-ms-az900',
    name: 'Microsoft Certified: Azure Fundamentals (AZ-900)',
    provider: 'Microsoft',
    category: 'Cloud',
    description: 'Fondasi konsep komputasi cloud, layanan inti Microsoft Azure, manajemen identitas dan tata kelola keamanan perusahaan.',
    targetLevel: 'Pemula',
    duration: '1.5 bulan persiapan',
    prerequisites: 'Tidak ada prasyarat formal.',
    officialUrl: 'https://learn.microsoft.com/certifications/exams/az-900/',
    imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80',
    relatedSkills: ['Cloud Computing', 'Microsoft Azure', 'Cloud Governance', 'Security'],
    match: 86,
    priority: 'Medium',
    relatedGap: 16,
    reason: 'Sangat cocok untuk membangun kredensial teknologi enterprise pertama pada resume.',
  },
  {
    id: 'cert-deeplearning-ml',
    name: 'DeepLearning.AI: Machine Learning Specialization',
    provider: 'DeepLearning.AI & Stanford / Coursera',
    category: 'Data',
    description: 'Program otoritatif dari Andrew Ng mengenai algoritma pembelajaran mesin terapan, jaringan saraf tiruan (neural networks), dan sistem rekomendasi.',
    targetLevel: 'Menengah - Lanjutan',
    duration: '3 bulan (9 jam/minggu)',
    prerequisites: 'Dasar kalkulus, aljabar linier, dan pengkodean Python.',
    officialUrl: 'https://www.coursera.org/specializations/machine-learning-introduction',
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=600&q=80',
    relatedSkills: ['Machine Learning', 'Neural Networks', 'Python', 'Algorithms', 'Deep Learning'],
    match: 92,
    priority: 'High',
    relatedGap: 25,
    reason: 'Rujukan akademik dan industri paling prestisius di dunia untuk spesialisasi Artificial Intelligence.',
  },
];

export const certificationService = {
  getAll(): Certification[] {
    return defaultCertifications;
  },

  getById(id: string): Certification | null {
    return defaultCertifications.find((c) => c.id === id) ?? null;
  },

  getRecommended(targetSkill?: string, userRole?: string): Certification[] {
    if (!targetSkill) {
      if (userRole === 'Pelajar') {
        return defaultCertifications.filter(
          (c) => c.targetLevel.toLowerCase().includes('pemula') || c.provider.includes('Dicoding') || c.provider.includes('BNSP'),
        ).slice(0, 6);
      }
      return defaultCertifications.slice(0, 6);
    }
    const normalized = targetSkill.toLowerCase();
    const matches = defaultCertifications.filter(
      (c) =>
        c.category.toLowerCase().includes(normalized) ||
        c.relatedSkills.some((s) => s.toLowerCase().includes(normalized)) ||
        c.name.toLowerCase().includes(normalized) ||
        c.description.toLowerCase().includes(normalized),
    );
    return matches.length ? matches : defaultCertifications.slice(0, 6);
  },
};
