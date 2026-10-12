'use client';

import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { assessmentService } from '../services/assessment-service';
import { roadmapService, type RoadmapPhase } from '../services/roadmap-service';
import { authService } from '../services/auth-service';
import HollandAssessment from './holland-assessment';
import SkillGapAnalysis from './skill-gap-analysis';

const assessmentSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  role: z.string().min(1, 'Pilih peran'),
  jenjang: z.string().min(1, 'Pilih jenjang'),
  target: z.string().min(3, 'Target jalur wajib diisi'),
  selectedSkills: z.array(z.string()).min(1, 'Pilih minimal satu kompetensi'),
});

const skillOptions = ['Data Science', 'UI/UX', 'Web Development', 'Marketing', 'Product', 'Cyber Security'];
const questionnaireItems = [
  'Saya nyaman dalam proyek yang menuntut analisis dan data.',
  'Saya lebih tertarik pada aktivitas kreatif dan visual.',
  'Saya suka memecahkan masalah teknis dengan logika.',
  'Saya bersemangat dalam kegiatan sosial dan komunikasi.',
];
const assessmentSteps = ['Profil', 'Unggah CV', 'Kuesioner', 'Target Karier', 'Penilaian Mandiri', 'Tinjauan', 'Analisis'];
const studentSteps = ['Profil', 'Minat & Bakat', 'Kuesioner', 'Target Studi', 'Penilaian Mandiri', 'Tinjauan', 'Analisis'];
// Jalur khusus: Pelajar yang ingin Kuliah
const studentKuliahSteps = ['Profil', 'Tujuan Studi', 'Nilai Rapor', 'Kuesioner Holland', 'Rekomen Jurusan', 'Tinjauan', 'Analisis'];
// Jalur khusus: Pelajar yang ingin Kerja
const studentKerjaSteps = ['Profil', 'Tujuan Kerja', 'Upload CV/Porto', 'Minat Bidang IT', 'Skill Check', 'Tinjauan', 'Analisis'];
const skillLevels = ['Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert'] as const;

type RoadmapStep = {
  phase: string;
  title: string;
  goal: string;
  duration: string;
  skills?: string[];
  resources?: string[];
  certification?: string;
  project?: string;
  status?: RoadmapPhase['status'];
  tasks?: string[];
};

type CertificationItem = {
  name: string;
  provider: string;
  reason: string;
};

type JobOpening = {
  title: string;
  fit: string;
  match: number;
  salary: string;
};

type GeneratedRecommendation = {
  primarySkill: string;
  matchScore: number;
  skillGap: number;
  strengths: string[];
  gaps: string[];
  roadmap: RoadmapStep[];
  certifications: CertificationItem[];
  jobOpenings: JobOpening[];
};

const generateRecommendation = (payload: {
  role: string;
  jenjang: string;
  target: string;
  selectedSkills: string[];
  questionnaire: Record<string, number>;
  uploadedCv: string;
}): GeneratedRecommendation => {
  const selectedSkills = payload.selectedSkills.length ? payload.selectedSkills : ['Data Science'];
  const targetSkill = payload.target || selectedSkills[0] || 'Data Science';
  const values = Object.values(payload.questionnaire);
  const averageQuestionnaire = values.length ? values.reduce((total, current) => total + current, 0) / values.length : 3;
  const interestBoost = Math.min(18, selectedSkills.length * 3);
  const matchScore = Math.max(72, Math.min(96, Math.round(62 + averageQuestionnaire * 5 + interestBoost)));
  const skillGap = Math.max(8, Math.min(28, Math.round(26 - averageQuestionnaire + (payload.jenjang.includes('Pelajar') ? 8 : 4))));
  const primarySkill = selectedSkills.includes(targetSkill) ? targetSkill : selectedSkills[0] || 'Data Science';

  const strengthTemplates: Record<string, string[]> = {
    'Data Science': ['Analisis data dan pengambilan insight', 'Kecenderungan logis dan kuantitatif', 'Kemampuan memahami pola dari dataset'],
    'UI/UX': ['Visual storytelling dan desain yang jelas', 'Pemahaman kebutuhan pengguna', 'Membuat pengalaman digital yang lebih intuitif'],
    'Web Development': ['Logika pemecahan masalah', 'Membangun produk digital yang praktis', 'Adaptasi cepat terhadap teknologi frontend-backend'],
    Marketing: ['Komunikasi dan storytelling', 'Pengetahuan tren pasar', 'Menganalisa kebutuhan audiens'],
    Product: ['Menghubungkan kebutuhan user dengan produk', 'Prioritasi fitur berbasis value', 'Kolaborasi lintas fungsi'],
    'Cyber Security': ['Berpikir analitis dan detil', 'Kesadaran keamanan digital', 'Mengenali risiko sistem'],
  };

  const gapTemplates: Record<string, string[]> = {
    'Data Science': ['Diperlukan penguatan SQL, statistik, dan visualisasi insight', 'Perlu projek end-to-end dari dataset ke dashboard', 'Harus meningkatkan kemampuan komunikasi hasil analisis'],
    'UI/UX': ['Diperlukan riset pengguna yang lebih konsisten', 'Perlu latihan prototyping dan usability testing', 'Harus meningkatkan kemampuan membuat system design yang scalable'],
    'Web Development': ['Diperlukan penguatan backend logic dan API integration', 'Perlu proyek full-stack dengan deployment nyata', 'Harus meningkatkan kualitas testing dan performance'],
    Marketing: ['Perlu ketajaman analisis data campaign', 'Harus memperkuat content strategy dan SEO', 'Perlu pengalaman analisis kinerja kanal pemasaran'],
    Product: ['Perlu penguatan roadmap dan prioritas produk', 'Harus belajar product analytics dan experiment design', 'Perlu kemampuan stakeholder management'],
    'Cyber Security': ['Perlu latihan forensics dan incident response', 'Harus kuat pada security testing dan policy', 'Perlu pemahaman keamanan aplikasi modern'],
  };

  const roadmapBySkill: Record<string, RoadmapStep[]> = {
    'Data Science': [
      { phase: 'Tahap 1', title: 'SQL & data cleaning', goal: 'Menguasai query, join, dan pembersihan dataset', duration: '4 minggu' },
      { phase: 'Tahap 2', title: 'Python for analysis', goal: 'Mahir pandas, numpy, dan exploratory analysis', duration: '6 minggu' },
      { phase: 'Tahap 3', title: 'Visualization & dashboard', goal: 'Membuat dashboard insight yang komunikatif', duration: '5 minggu' },
      { phase: 'Tahap 4', title: 'Portfolio & case study', goal: 'Menyusun project end-to-end yang relevan untuk kerja', duration: '6 minggu' },
    ],
    'UI/UX': [
      { phase: 'Tahap 1', title: 'Riset pengguna', goal: 'Mengidentifikasi pain point dan kebutuhan user', duration: '3 minggu' },
      { phase: 'Tahap 2', title: 'Wireframe & flow', goal: 'Membuat struktur informasi yang jelas', duration: '4 minggu' },
      { phase: 'Tahap 3', title: 'Prototype & testing', goal: 'Menguji usability dan iterasi desain', duration: '5 minggu' },
      { phase: 'Tahap 4', title: 'Portofolio case study', goal: 'Menyusun studi kasus untuk portofolio profesional', duration: '5 minggu' },
    ],
    'Web Development': [
      { phase: 'Tahap 1', title: 'HTML, CSS, JavaScript', goal: 'Membangun UI dan pengalaman dasar', duration: '4 minggu' },
      { phase: 'Tahap 2', title: 'React & state management', goal: 'Membuat aplikasi interaktif dan modular', duration: '6 minggu' },
      { phase: 'Tahap 3', title: 'API & backend integration', goal: 'Menghubungkan frontend dengan API dan database', duration: '6 minggu' },
      { phase: 'Tahap 4', title: 'Deployment & product polish', goal: 'Mempersiapkan proyek siap kerja', duration: '5 minggu' },
    ],
    Marketing: [
      { phase: 'Tahap 1', title: 'Fundamental brand strategy', goal: 'Memahami positioning, audience, dan value proposition', duration: '4 minggu' },
      { phase: 'Tahap 2', title: 'Content & campaign planning', goal: 'Menyusun materi kampanye yang relevan', duration: '5 minggu' },
      { phase: 'Tahap 3', title: 'Analytics & optimization', goal: 'Mempelajari KPI dan insight performa campaign', duration: '5 minggu' },
      { phase: 'Tahap 4', title: 'Portfolio brand case', goal: 'Membuat studi kasus kampanye nyata', duration: '4 minggu' },
    ],
    Product: [
      { phase: 'Tahap 1', title: 'Product thinking', goal: 'Membedakan masalah user dan prioritas fitur', duration: '3 minggu' },
      { phase: 'Tahap 2', title: 'Roadmap & validation', goal: 'Menyusun strategi produk dan eksperimen', duration: '5 minggu' },
      { phase: 'Tahap 3', title: 'Analytics & decision making', goal: 'Menggunakan data untuk keputusan produk', duration: '4 minggu' },
      { phase: 'Tahap 4', title: 'Portfolio product case', goal: 'Menyiapkan studi kasus produk', duration: '5 minggu' },
    ],
    'Cyber Security': [
      { phase: 'Tahap 1', title: 'Networking & OS security', goal: 'Memahami konfigurasi dan keamanan sistem dasar', duration: '4 minggu' },
      { phase: 'Tahap 2', title: 'Ethical hacking basics', goal: 'Belajar scanning, enumeration, dan exploitation awareness', duration: '5 minggu' },
      { phase: 'Tahap 3', title: 'Incident response', goal: 'Menguji deteksi, analisis, dan mitigasi risiko', duration: '5 minggu' },
      { phase: 'Tahap 4', title: 'Lab & certification prep', goal: 'Menyusun portofolio lab dan persiapan ujian', duration: '6 minggu' },
    ],
  };

  const certificationMap: Record<string, CertificationItem[]> = {
    'Data Science': [
      { name: 'Google Data Analytics', provider: 'Google / Coursera', reason: 'Linear dengan analisis data dan dashboard dasar' },
      { name: 'Microsoft PL-300', provider: 'Microsoft', reason: 'Sesuai untuk power BI dan storytelling insight' },
      { name: 'SQL for Data Science', provider: 'IBM / Coursera', reason: 'Meningkatkan kemampuan query dan eksplorasi data' },
    ],
    'UI/UX': [
      { name: 'Google UX Design', provider: 'Google / Coursera', reason: 'Cocok untuk riset pengguna dan prototyping' },
      { name: 'Adobe Certified Professional', provider: 'Adobe', reason: 'Mendukung desain visual dan presentasi ide' },
      { name: 'Interaction Design Foundation', provider: 'IDF', reason: 'Menguatkan desain pengalaman interaksi' },
    ],
    'Web Development': [
      { name: 'Meta Front-End Developer', provider: 'Meta', reason: 'Relevan untuk frontend modern dan komponen UI' },
      { name: 'AWS Cloud Practitioner', provider: 'AWS', reason: 'Cocok untuk deployment dan cloud basics' },
      { name: 'JavaScript Algorithms and Data Structures', provider: 'freeCodeCamp', reason: 'Meningkatkan logika coding dan problem solving' },
    ],
    Marketing: [
      { name: 'HubSpot Content Marketing', provider: 'HubSpot', reason: 'Relevan untuk content strategy dan funnel' },
      { name: 'Google Ads Certification', provider: 'Google', reason: 'Sesuai dengan digital marketing dan kampanye' },
      { name: 'Meta Certified Digital Marketing Associate', provider: 'Meta', reason: 'Linear untuk strategi iklan dan analisis performa' },
    ],
    Product: [
      { name: 'Certified Scrum Product Owner', provider: 'Scrum Alliance', reason: 'Mendukung roadmap produk dan prioritas fitur' },
      { name: 'Product School / Product Analytics', provider: 'Product School', reason: 'Cocok untuk decision making berbasis data' },
      { name: 'Google PM Certificate', provider: 'Google', reason: 'Linear untuk jalur product management' },
    ],
    'Cyber Security': [
      { name: 'CompTIA Security+', provider: 'CompTIA', reason: 'Dasar keamanan siber yang paling linear' },
      { name: 'CEH (Certified Ethical Hacker)', provider: 'EC-Council', reason: 'Cocok untuk jalur ethical hacking' },
      { name: 'ISC2 CC', provider: 'ISC2', reason: 'Mendukung fondasi keamanan dan risk awareness' },
    ],
  };

  const jobBySkill: Record<string, JobOpening[]> = {
    'Data Science': [
      { title: 'Data Analyst', fit: 'Cocok untuk analisis data, dashboard, dan insight bisnis', match: 92, salary: 'Rp 6-12 Juta' },
      { title: 'Business Intelligence Analyst', fit: 'Linear untuk reporting dan decision support', match: 89, salary: 'Rp 7-14 Juta' },
      { title: 'Data Scientist Junior', fit: 'Bermanfaat untuk pengolahan data dan model prediktif', match: 86, salary: 'Rp 8-15 Juta' },
    ],
    'UI/UX': [
      { title: 'UI Designer', fit: 'Sesuai dengan desain visual dan komponen interface', match: 91, salary: 'Rp 5-11 Juta' },
      { title: 'UX Researcher', fit: 'Linear untuk riset user dan testing experience', match: 87, salary: 'Rp 7-13 Juta' },
      { title: 'Product Designer', fit: 'Cocok untuk desain sistem dan strategi pengalaman produk', match: 90, salary: 'Rp 8-16 Juta' },
    ],
    'Web Development': [
      { title: 'Frontend Developer', fit: 'Relevan untuk design system dan UI implementation', match: 94, salary: 'Rp 6-13 Juta' },
      { title: 'Fullstack Developer', fit: 'Linear dengan React, API, dan deployment', match: 90, salary: 'Rp 8-16 Juta' },
      { title: 'Web Developer', fit: 'Cocok untuk produk digital dan portal berbasis web', match: 89, salary: 'Rp 6-12 Juta' },
    ],
    Marketing: [
      { title: 'Marketing Specialist', fit: 'Cocok dengan strategi konten, promosi, dan brand', match: 90, salary: 'Rp 5-11 Juta' },
      { title: 'Digital Marketing Analyst', fit: 'Linear dengan KPI, campaign, dan insight performa', match: 88, salary: 'Rp 6-12 Juta' },
      { title: 'Brand Strategist', fit: 'Sesuai untuk positioning dan pengembangan brand', match: 85, salary: 'Rp 7-13 Juta' },
    ],
    Product: [
      { title: 'Product Associate', fit: 'Cocok untuk pengelolaan roadmap dan kebutuhan user', match: 87, salary: 'Rp 7-14 Juta' },
      { title: 'Business Analyst', fit: 'Linear dengan requirement dan keputusan produk', match: 86, salary: 'Rp 6-12 Juta' },
      { title: 'Product Manager Junior', fit: 'Ideal untuk membangun produk dan prioritas fitur', match: 84, salary: 'Rp 9-17 Juta' },
    ],
    'Cyber Security': [
      { title: 'Security Analyst', fit: 'Cocok untuk monitoring dan mitigasi risiko', match: 92, salary: 'Rp 7-15 Juta' },
      { title: 'SOC Analyst', fit: 'Linear dengan log monitoring dan incident handling', match: 89, salary: 'Rp 6-13 Juta' },
      { title: 'Penetration Tester Junior', fit: 'Relevan untuk keamanan aplikasi dan jaringan', match: 86, salary: 'Rp 8-16 Juta' },
    ],
  };

  return {
    primarySkill,
    matchScore,
    skillGap,
    strengths: strengthTemplates[primarySkill] ?? ['Kreativitas', 'Analisis', 'Belajar cepat'],
    gaps: gapTemplates[primarySkill] ?? ['Perlu penguatan portofolio dan prakteknya', 'Perlu target belajar yang lebih spesifik'],
    roadmap: roadmapBySkill[primarySkill] ?? roadmapBySkill['Data Science'] ?? [],
    certifications: certificationMap[primarySkill] ?? certificationMap['Data Science'] ?? [],
    jobOpenings: jobBySkill[primarySkill] ?? jobBySkill['Data Science'] ?? [],
  };
};

export default function AssessmentForm() {
  const router = useRouter();
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['Data Science']);
  const [form, setForm] = useState({
    name: '',
    role: 'Mahasiswa',
    jenjang: 'Mahasiswa',
    target: '',
    notes: '',
  });
  const [uploadedCv, setUploadedCv] = useState('');
  const [uploadedCvSize, setUploadedCvSize] = useState(0);
  const [questionnaire, setQuestionnaire] = useState<Record<string, number>>({});
  const [skillLevelsByName, setSkillLevelsByName] = useState<Record<string, typeof skillLevels[number]>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [studentProfile, setStudentProfile] = useState({ school: '', major: '', interests: '', activities: '', aspiration: '', story: '', birthDate: '', consent: false });
  const [reportGrades, setReportGrades] = useState({ Matematika: '', 'Bahasa Indonesia': '', 'Bahasa Inggris': '', Informatika: '', Fisika: '', IPA: '' });
  const [error, setError] = useState<string | null>(null);
  // ── State baru: tujuan pelajar SMA/SMK ──────────────────────────────────
  const [studentGoal, setStudentGoal] = useState<'kuliah' | 'kerja' | ''>('');
  const [itJobInterest, setItJobInterest] = useState(''); // bidang IT yang diminati (untuk jalur kerja)
  const [uploadedCvType, setUploadedCvType] = useState<'pdf' | 'doc' | 'ppt' | 'video' | 'image' | ''>(''); // tipe file yang diunggah

  useEffect(() => {
    // Muat data pengguna yang sedang login
    const user = authService.getCurrentUser();
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: user.name || prev.name,
        role: user.role || prev.role,
        jenjang: user.jenjang || prev.jenjang,
      }));
    }

    const savedCv = localStorage.getItem('skillgap-cv');
    if (savedCv) {
      try {
        const parsed = JSON.parse(savedCv);
        if (parsed.name) {
          setUploadedCv(parsed.name);
          setUploadedCvSize(Number(parsed.size) || 0);
        }
      } catch {
        // ignore invalid cache
      }
    }
  }, []);

  const summary = useMemo(
    () => (selectedSkills.length ? selectedSkills.map((skill) => ({ skill })) : [{ skill: 'Belum ada profil yang dipilih.' }]),
    [selectedSkills],
  );

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((item) => item !== skill) : [...prev, skill],
    );
  };

  const handleQuestionChange = (index: string, value: number) => {
    setQuestionnaire((prev) => ({ ...prev, [index]: value }));
  };

  const goNext = () => setCurrentStep((step) => Math.min(7, step + 1));
  const goPrevious = () => setCurrentStep((step) => Math.max(1, step - 1));

  const handleCvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Extension daftar terlarang (keamanan)
    const forbiddenExtensions = ['exe', 'zip', 'rar', 'tar', 'sh', 'bat', 'cmd', 'msi', 'bin', 'apk', 'dmg'];
    const extension = file.name.toLowerCase().split('.').pop() ?? '';

    if (forbiddenExtensions.includes(extension)) {
      setError(`File berekstensi .${extension} ditolak demi keamanan sistem.`);
      event.target.value = '';
      return;
    }

    // Tipe file yang diizinkan (diperluas sesuai saran: PDF, PPT, video, dll)
    const docExtensions = ['pdf', 'docx', 'doc'];
    const pptExtensions = ['ppt', 'pptx'];
    const videoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'webm'];
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

    const allAllowed = [...docExtensions, ...pptExtensions, ...videoExtensions, ...imageExtensions];

    if (!allAllowed.includes(extension)) {
      setError(`Format .${extension} tidak didukung. Format yang diterima: PDF, DOCX, PPT, PPTX, MP4, MOV, JPG, PNG.`);
      event.target.value = '';
      return;
    }

    // Batas ukuran file
    const isVideo = videoExtensions.includes(extension);
    const maxSize = isVideo ? 50 * 1024 * 1024 : 20 * 1024 * 1024; // 50MB untuk video, 20MB untuk lainnya
    if (file.size > maxSize) {
      setError(`Ukuran file melebihi batas maksimal (${isVideo ? '50 MB untuk video' : '20 MB untuk dokumen/gambar'}).`);
      event.target.value = '';
      return;
    }

    // Tentukan tipe file
    let fileType: typeof uploadedCvType = '';
    if (docExtensions.includes(extension)) fileType = extension === 'pdf' ? 'pdf' : 'doc';
    else if (pptExtensions.includes(extension)) fileType = 'ppt';
    else if (videoExtensions.includes(extension)) fileType = 'video';
    else if (imageExtensions.includes(extension)) fileType = 'image';

    const fileName = file.name;
    setUploadedCv(fileName);
    setUploadedCvSize(file.size);
    setUploadedCvType(fileType);
    setError(null);
    localStorage.setItem(
      'skillgap-cv',
      JSON.stringify({
        name: fileName,
        size: file.size,
        type: fileType,
        extension,
        uploadedAt: new Date().toISOString(),
      }),
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (currentStep < 7) {
      goNext();
      return;
    }
    setIsGenerating(true);

    const payload = {
      ...form,
      selectedSkills,
    };

    const validation = assessmentSchema.safeParse(payload);
    if (!validation.success) {
      setError(validation.error.issues[0]?.message ?? 'Form tidak valid');
      setIsGenerating(false);
      return;
    }

    if (isPelajar && (!studentProfile.school || !studentProfile.major || !studentProfile.aspiration || (isMinor && !studentProfile.consent))) {
      setError(isMinor && !studentProfile.consent ? 'Consent orang tua/wali wajib diisi untuk user di bawah 18 tahun.' : 'Lengkapi asal sekolah, jurusan sekolah, dan cita-cita pelajar.');
      setIsGenerating(false);
      return;
    }

    const assessmentResult = {
      ...payload,
      uploadedCv,
      questionnaire,
      studentProfile: isPelajar ? studentProfile : undefined,
      reportGrades: isPelajar ? reportGrades : undefined,
      skillLevels: skillLevelsByName,
      submittedAt: new Date().toISOString(),
    };

    let generatedRecommendation: GeneratedRecommendation;
    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: form.role,
          jenjang: form.jenjang,
          target: form.target,
          selectedSkills,
          questionnaire,
          skillLevels: skillLevelsByName,
        }),
      });
      if (!response.ok) throw new Error('Recommendation API failed');
      const result = await response.json() as { data: GeneratedRecommendation };
      generatedRecommendation = result.data;
    } catch {
      generatedRecommendation = generateRecommendation({
        role: form.role,
        jenjang: form.jenjang,
        target: form.target,
        selectedSkills,
        questionnaire,
        uploadedCv,
      });
    }

    const roadmapPhases = generatedRecommendation.roadmap.map((phase) => ({
      ...phase,
      skills: phase.skills ?? selectedSkills,
      resources: phase.resources ?? ['Learning resources akan ditambahkan.'],
      certification: phase.certification ?? 'Belum ditentukan',
      project: phase.project ?? `${form.target} project`,
      status: phase.status ?? ('Not Started' as const),
      tasks: (phase.tasks ?? ['Pelajari materi', 'Latihan', 'Review']).map((label) => ({ label, completed: false })),
    }));

    const fullReport = {
      ...generatedRecommendation,
      skillAnalysis: [
        { skill: `${form.target || selectedSkills[0] || 'Keahlian'} Utama`, category: 'Teknis', current: Math.max(45, generatedRecommendation.matchScore - 15), required: 90, gap: Math.max(10, 90 - (generatedRecommendation.matchScore - 15)), status: 'Gap' },
        { skill: 'Implementasi Proyek Praktis', category: 'Teknis', current: generatedRecommendation.matchScore - 5, required: 85, gap: Math.max(5, 85 - (generatedRecommendation.matchScore - 5)), status: 'Developing' },
        { skill: 'Pemecahan Masalah & Logika', category: 'Interpersonal', current: 88, required: 80, gap: 0, status: 'Strong' },
        { skill: 'Komunikasi & Penyampaian Ide', category: 'Interpersonal', current: 82, required: 80, gap: 0, status: 'Strong' },
      ],
      roadmap: roadmapPhases,
    };

    localStorage.setItem('skillgap-assessment', JSON.stringify(assessmentResult));
    localStorage.setItem('skillgap-report', JSON.stringify(fullReport));
    const currentUser = authService.getCurrentUser();
    assessmentService.addHistory({
      id: crypto.randomUUID(),
      submittedAt: assessmentResult.submittedAt,
      userName: form.name || currentUser?.name || 'Pengguna Baru',
      userEmail: currentUser?.email,
      target: form.target,
      matchScore: generatedRecommendation.matchScore,
      skillGap: generatedRecommendation.skillGap,
      role: form.role,
      jenjang: form.jenjang,
      school: studentProfile.school || (isPelajar ? 'SMA/SMK Sederajat' : undefined),
      grade: studentProfile.major ? `Jurusan ${studentProfile.major}` : undefined,
      primaryInterest: isPelajar ? (studentProfile.interests || form.target) : undefined,
      reportGrades: isPelajar ? reportGrades : undefined,
      careerAspiration: studentProfile.aspiration || form.target,
      studentGoal: isPelajar ? studentGoal : undefined,
      nim: !isPelajar ? 'MHS-' + Math.floor(1000000000 + Math.random() * 9000000000) : undefined,
      programStudi: !isPelajar ? (form.target || 'Informatika') : undefined,
      report: fullReport,
    });
    roadmapService.save(roadmapPhases);
    setError(null);
    setIsGenerating(false);
    router.push('/dashboard');
  };

  const isPelajar = form.jenjang === 'Pelajar SMA-SMK Sederajat' || form.role === 'Pelajar';
  // Gunakan step yang sesuai dengan jalur yang dipilih
  const visibleSteps = isPelajar
    ? (studentGoal === 'kuliah' ? studentKuliahSteps : studentGoal === 'kerja' ? studentKerjaSteps : studentSteps)
    : assessmentSteps;
  const isMinor = studentProfile.birthDate ? (Date.now() - new Date(studentProfile.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000) < 18 : false;

  // Helper: apakah grade rapor cukup untuk dihitung rata-rata
  const gradeValues = Object.values(reportGrades).filter(v => v !== '').map(Number).filter(n => !isNaN(n));
  const gradeAverage = gradeValues.length > 0 ? gradeValues.reduce((a, b) => a + b, 0) / gradeValues.length : 0;


  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="mb-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex items-center gap-2 mb-2">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-indigo-600">Pengisian Data Asesmen</p>
        </div>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-900">Formulir Asesmen Kompetensi & Minat</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
          Formulir ini mencakup profil pengguna, dokumen pendukung, dan kuesioner minat untuk menyusun rekomendasi karier dan roadmap belajar yang akurat.
        </p>
        <div className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-7">
          {visibleSteps.map((step, index) => {
            const stepNumber = index + 1;
            return <button key={step} type="button" onClick={() => stepNumber <= currentStep && setCurrentStep(stepNumber)} className={`rounded-xl px-2 py-2 text-xs font-bold transition ${stepNumber === currentStep ? 'bg-indigo-600 text-white' : stepNumber < currentStep ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-400'}`}><span className="block text-[10px] opacity-70">0{stepNumber}</span>{step}</button>;
          })}
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100" aria-label={`Progress assessment ${Math.round((currentStep / 7) * 100)} persen`}><div className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-sky-500 transition-all" style={{ width: `${(currentStep / 7) * 100}%` }} /></div>
      </section>

      <form className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]" onSubmit={handleSubmit} noValidate>
        <article className="space-y-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
          {/* ── Step 2 untuk NON-PELAJAR: Upload CV multi-format ─────────────── */}
          {!isPelajar && <div hidden={currentStep !== 2} className="rounded-[24px] border border-indigo-200 bg-gradient-to-r from-indigo-50 via-white to-sky-50 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">Unggah CV / Portofolio</p>
                <p className="mt-2 text-sm text-slate-600">
                  Upload CV, portofolio, presentasi, atau video profil. Format yang diterima: PDF, DOCX, PPT, PPTX, MP4, MOV, JPG, PNG (maks. 50 MB untuk video, 20 MB untuk dokumen).
                </p>
              </div>
            </div>

            <label className="mt-4 flex cursor-pointer items-center justify-center rounded-2xl border border-dashed border-indigo-300 bg-white px-4 py-6 text-sm font-semibold text-indigo-700 transition hover:border-indigo-400 hover:bg-indigo-50">
              <input
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.mov,.avi,.mkv,.webm,.jpg,.jpeg,.png,.gif,.webp"
                className="hidden"
                onChange={handleCvUpload}
              />
              <span className="inline-flex items-center gap-2">
                <span className="text-lg">
                  {uploadedCvType === 'video' ? '🎥' : uploadedCvType === 'ppt' ? '📊' : uploadedCvType === 'image' ? '🖼️' : '📄'}
                </span>
                {uploadedCv ? 'Ganti file CV / portofolio' : 'Pilih file CV / portofolio'}
              </span>
            </label>

            <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
              {[{label:'📄 PDF', ext:'pdf'},{label:'📝 DOCX',ext:'docx'},{label:'📊 PPT/PPTX',ext:'ppt'},{label:'🎥 Video MP4/MOV',ext:'video'},{label:'🖼️ JPG/PNG',ext:'image'}].map(t => (
                <span key={t.ext} className="rounded-md bg-slate-100 px-2 py-1 font-semibold text-slate-600">{t.label}</span>
              ))}
            </div>

            <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4 text-sm text-indigo-700">
              {uploadedCv
                ? `✅ File berhasil diunggah · ${uploadedCv} · ${(uploadedCvSize / (1024 * 1024)).toFixed(1)} MB${uploadedCvType ? ` · Tipe: ${uploadedCvType.toUpperCase()}` : ''}`
                : 'Belum ada file yang diunggah. AI (Gemini) akan membaca dan menganalisis konten dokumen/video kamu secara langsung.'}
            </div>
          </div>}

          {/* ── Step 2 untuk PELAJAR: Konfirmasi Tujuan (Kuliah atau Kerja) ─── */}
          {isPelajar && <div hidden={currentStep !== 2} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">Konfirmasi Tujuan Setelah Lulus</p>
            <p className="mt-2 text-sm text-slate-600">
              Setelah lulus SMA/SMK, apa rencanamu? Pilih salah satu untuk mendapatkan rekomendasi yang lebih akurat.
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {/* Pilihan KULIAH */}
              <button
                type="button"
                onClick={() => setStudentGoal('kuliah')}
                className={`rounded-2xl border-2 p-5 text-left transition ${
                  studentGoal === 'kuliah'
                    ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-indigo-300'
                }`}
              >
                <span className="text-3xl">🎓</span>
                <h3 className={`mt-3 text-lg font-black ${studentGoal === 'kuliah' ? 'text-indigo-700' : 'text-slate-900'}`}>
                  Lanjut Kuliah
                </h3>
                <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                  Dapatkan rekomendasi jurusan yang sesuai dengan minat dan bakatmu berdasarkan nilai rapor dan kuesioner Holland Code RIASEC.
                </p>
                <ul className="mt-3 space-y-1 text-xs text-slate-500">
                  <li>✅ Input nilai rapor lengkap</li>
                  <li>✅ Kuesioner Holland Code RIASEC</li>
                  <li>✅ Rekomendasi jurusan + universitas</li>
                  <li>✅ Peluang karier per jurusan</li>
                </ul>
                {studentGoal === 'kuliah' && (
                  <span className="mt-3 inline-block rounded-full bg-indigo-600 px-3 py-1 text-xs font-bold text-white">
                    ✓ Dipilih
                  </span>
                )}
              </button>

              {/* Pilihan KERJA */}
              <button
                type="button"
                onClick={() => setStudentGoal('kerja')}
                className={`rounded-2xl border-2 p-5 text-left transition ${
                  studentGoal === 'kerja'
                    ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-emerald-300'
                }`}
              >
                <span className="text-3xl">💼</span>
                <h3 className={`mt-3 text-lg font-black ${studentGoal === 'kerja' ? 'text-emerald-700' : 'text-slate-900'}`}>
                  Langsung Kerja
                </h3>
                <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                  Upload CV/portofolio dan dapatkan analisis skill gap IT yang dibutuhkan sesuai bidang yang kamu minati.
                </p>
                <ul className="mt-3 space-y-1 text-xs text-slate-500">
                  <li>✅ Upload CV, video, PPT, atau portofolio</li>
                  <li>✅ Kuesioner minat bidang IT spesifik</li>
                  <li>✅ Analisis skill yang dimiliki vs dibutuhkan</li>
                  <li>✅ Rekomendasi kursus & sertifikasi</li>
                </ul>
                {studentGoal === 'kerja' && (
                  <span className="mt-3 inline-block rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white">
                    ✓ Dipilih
                  </span>
                )}
              </button>
            </div>
            {!studentGoal && (
              <p className="mt-4 text-xs text-amber-600 font-semibold">
                ⚠ Pilih tujuanmu terlebih dahulu untuk melanjutkan ke langkah berikutnya.
              </p>
            )}
          </div>}

          {/* ── Step 3 (Jalur KERJA): Upload CV Multi-format ─────────────────── */}
          {isPelajar && studentGoal === 'kerja' && <div hidden={currentStep !== 3} className="rounded-[24px] border border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-sky-50 p-5">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-600">Upload CV / Portofolio</p>
            <p className="mt-2 text-sm text-slate-600">
              Upload dokumen CV, portofolio desain, video perkenalan diri, atau presentasi PPT yang dimiliki.
              Format yang diterima: PDF, DOCX, PPT, PPTX, MP4, MOV, JPG, PNG.
            </p>

            <label className="mt-4 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-emerald-300 bg-white px-4 py-8 text-sm font-semibold text-emerald-700 transition hover:border-emerald-400 hover:bg-emerald-50">
              <input
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.mov,.avi,.mkv,.webm,.jpg,.jpeg,.png,.gif,.webp"
                className="hidden"
                onChange={handleCvUpload}
              />
              <span className="text-4xl">
                {uploadedCvType === 'video' ? '🎥' : uploadedCvType === 'ppt' ? '📊' : uploadedCvType === 'image' ? '🖼️' : '📤'}
              </span>
              <span>{uploadedCv ? 'Ganti file yang diunggah' : 'Klik atau seret file ke sini'}</span>
              <span className="text-xs font-normal text-slate-500">
                PDF, DOCX, PPT, PPTX, MP4, MOV, JPG, PNG • Maks 50 MB untuk video, 20 MB lainnya
              </span>
            </label>

            {uploadedCv && (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-sm font-bold text-emerald-800">
                  {uploadedCvType === 'video' ? '🎥' : uploadedCvType === 'ppt' ? '📊' : uploadedCvType === 'image' ? '🖼️' : '📄'}{' '}
                  {uploadedCv}
                </p>
                <p className="mt-1 text-xs text-emerald-600">
                  {(uploadedCvSize / (1024 * 1024)).toFixed(1)} MB •{' '}
                  {uploadedCvType === 'video' ? 'Video profil/portofolio'
                    : uploadedCvType === 'ppt' ? 'Presentasi/slide portofolio'
                    : uploadedCvType === 'image' ? 'Gambar portofolio'
                    : 'Dokumen CV/portofolio'} berhasil diunggah
                </p>
                <p className="mt-1.5 text-xs text-emerald-700">
                  🤖 AI (Gemini) akan menganalisis konten file ini untuk mendeteksi skill dan pengalaman yang dimiliki.
                </p>
              </div>
            )}

            {!uploadedCv && (
              <p className="mt-3 text-xs text-slate-500">
                Belum ada file yang diunggah — kamu bisa melewati langkah ini dan mengisi skill secara manual di langkah berikutnya.
              </p>
            )}
          </div>}

          {/* ── Step 3 (Jalur KULIAH): Input Nilai Rapor ─────────────────────── */}
          {isPelajar && studentGoal === 'kuliah' && <div hidden={currentStep !== 3} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">Input Nilai Rapor</p>
            <p className="mt-2 text-xs text-slate-600">
              Masukkan nilai rapor semester terakhir (skala 0-100). Nilai ini digunakan untuk menentukan kesesuaian dengan persyaratan minimum jurusan yang direkomendasikan.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {Object.keys(reportGrades).map(subject => (
                <label key={subject} className="text-xs text-slate-600 font-semibold">
                  {subject}
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={reportGrades[subject as keyof typeof reportGrades]}
                    onChange={(e) => setReportGrades({ ...reportGrades, [subject]: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-800 focus:border-indigo-300 focus:outline-none"
                    placeholder="0-100"
                  />
                </label>
              ))}
            </div>
            {gradeAverage > 0 && (
              <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
                <p className="text-sm font-bold text-indigo-700">
                  Rata-rata nilai rapor: <span className="text-xl font-black">{gradeAverage.toFixed(1)}</span>
                </p>
                <p className="mt-1 text-xs text-indigo-600">
                  {gradeAverage >= 85 ? '🟢 Sangat baik — memenuhi syarat sebagian besar jurusan unggulan'
                    : gradeAverage >= 75 ? '🟡 Baik — memenuhi syarat jurusan standar'
                    : '🔴 Perlu ditingkatkan — beberapa jurusan memiliki nilai minimum 75-80'}
                </p>
              </div>
            )}
          </div>}

          {/* ── Step 4 (Jalur KERJA): Kuesioner Minat Bidang IT ─────────────── */}
          {isPelajar && studentGoal === 'kerja' && <div hidden={currentStep !== 4} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">Pilih Bidang IT yang Diminati</p>
            <p className="mt-2 text-xs text-slate-600">
              Pilih bidang IT yang paling ingin kamu tekuni setelah lulus. Sistem akan menampilkan analisis skill gap yang relevan dengan bidang tersebut.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                { key: 'webDev', label: 'Web Development', icon: '🌐', desc: 'Membangun website & aplikasi web' },
                { key: 'dataScience', label: 'Data Science & AI', icon: '📊', desc: 'Analisis data & machine learning' },
                { key: 'cybersecurity', label: 'Cybersecurity', icon: '🛡️', desc: 'Keamanan siber & perlindungan sistem' },
                { key: 'mobileDev', label: 'Mobile Development', icon: '📱', desc: 'Aplikasi iOS & Android' },
                { key: 'uiux', label: 'UI/UX Design', icon: '🎨', desc: 'Desain tampilan & pengalaman pengguna' },
                { key: 'cloudDevops', label: 'Cloud & DevOps', icon: '☁️', desc: 'Infrastruktur cloud & otomasi' },
                { key: 'gameDev', label: 'Game Development', icon: '🎮', desc: 'Pengembangan game & aplikasi interaktif' },
                { key: 'iot', label: 'IoT & Embedded', icon: '⚙️', desc: 'Perangkat cerdas & mikrokontroler' },
              ].map(field => (
                <button
                  key={field.key}
                  type="button"
                  onClick={() => setItJobInterest(field.key)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    itJobInterest === field.key
                      ? 'border-indigo-400 bg-indigo-50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-indigo-200'
                  }`}
                >
                  <span className="text-2xl">{field.icon}</span>
                  <p className={`mt-2 text-sm font-bold ${itJobInterest === field.key ? 'text-indigo-700' : 'text-slate-800'}`}>
                    {field.label}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">{field.desc}</p>
                  {itJobInterest === field.key && (
                    <span className="mt-2 inline-block rounded-full bg-indigo-600 px-2.5 py-0.5 text-[10px] font-bold text-white">
                      ✓ Dipilih
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>}

          {/* ── Step 4 (Jalur KULIAH): Kuesioner Holland Code RIASEC ─────────── */}
          {isPelajar && studentGoal === 'kuliah' && <div hidden={currentStep !== 4} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">Kuesioner Minat Holland Code (RIASEC)</p>
            <p className="mt-1 text-xs text-slate-500">
              Berbasis riset Holland (1997) — digunakan oleh BK/Counselor di seluruh dunia untuk menentukan arah karier dan studi.
            </p>
            <div className="mt-4">
              <HollandAssessment reportMatchScore={87} studentMajor={studentProfile.major} gradeAverage={gradeAverage} />
            </div>
          </div>}

          {/* ── Step 5 (Jalur KERJA): Skill Check / Analisis Gap IT ─────────── */}
          {isPelajar && studentGoal === 'kerja' && <div hidden={currentStep !== 5} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">Analisis Skill Gap IT</p>
            <p className="mt-1 text-xs text-slate-500">
              Centang skill yang sudah kamu miliki. Sistem akan menampilkan gap antara skill-mu dan kebutuhan industri.
            </p>
            <div className="mt-4">
              <SkillGapAnalysis selectedField={itJobInterest} />
            </div>
          </div>}



          <div hidden={currentStep !== 1 && currentStep !== 4} className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Nama</label>
              <input
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                placeholder="Nama lengkap"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Peran</label>
              <select
                value={form.role}
                onChange={(event) => setForm({ ...form, role: event.target.value })}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <option>Mahasiswa</option>
                <option>Pelajar</option>
                <option>Dosen</option>
                <option>Guru BK</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Jenjang</label>
              <select
                value={form.jenjang}
                onChange={(event) => setForm({ ...form, jenjang: event.target.value })}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <option>Mahasiswa</option>
                <option>Pelajar SMA-SMK Sederajat</option>
                <option>Dosen</option>
                <option>Guru BK</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Target jalur</label>
              <input
                value={form.target}
                onChange={(event) => setForm({ ...form, target: event.target.value })}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                placeholder="Contoh: Data Science / UI/UX / Web Development"
              />
            </div>
          </div>

          {isPelajar && (currentStep === 1 || currentStep === 2 || currentStep === 4) && (
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">Input Profil Alternatif Pelajar</p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Asal sekolah</label>
                  <input value={studentProfile.school} onChange={(event) => setStudentProfile({ ...studentProfile, school: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3" placeholder="Nama sekolah" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Jurusan sekolah</label>
                  <input value={studentProfile.major} onChange={(event) => setStudentProfile({ ...studentProfile, major: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3" placeholder="IPA, IPS, RPL, TKJ..." />
                </div>
                <input value={studentProfile.interests} onChange={(event) => setStudentProfile({ ...studentProfile, interests: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3" placeholder="Pilihan bidang / minat dan bakat" />
                <input value={studentProfile.activities} onChange={(event) => setStudentProfile({ ...studentProfile, activities: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3" placeholder="Aktivitas yang disukai" />
                <input value={studentProfile.aspiration} onChange={(event) => setStudentProfile({ ...studentProfile, aspiration: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3" placeholder="Cita-cita" />
                <input type="date" value={studentProfile.birthDate} onChange={(event) => setStudentProfile({ ...studentProfile, birthDate: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3" aria-label="Tanggal lahir" />
                <textarea value={studentProfile.story} onChange={(event) => setStudentProfile({ ...studentProfile, story: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 md:col-span-2" rows={2} placeholder="Cerita singkat tentang dirimu" />
                {isMinor && <label className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 md:col-span-2"><input type="checkbox" checked={studentProfile.consent} onChange={(event) => setStudentProfile({ ...studentProfile, consent: event.target.checked })} className="mt-0.5" required />Saya menyatakan telah mendapat persetujuan orang tua/wali untuk mengikuti assessment ini.</label>}
                <div className="rounded-2xl border border-indigo-100 bg-white p-4 md:col-span-2"><p className="text-sm font-semibold text-slate-700">Nilai rapor</p><div className="mt-3 grid gap-3 sm:grid-cols-4">{Object.keys(reportGrades).map((subject) => <label key={subject} className="text-xs text-slate-500">{subject}<input type="number" min={0} max={100} value={reportGrades[subject as keyof typeof reportGrades]} onChange={(event) => setReportGrades({ ...reportGrades, [subject]: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800" /></label>)}</div></div>
              </div>
            </div>
          )}

          <div hidden={currentStep !== 3} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">Kuesioner Minat & Skill</p>
            <div className="mt-4 space-y-4">
              {questionnaireItems.map((item, index) => (
                <div key={item} className="rounded-2xl border border-slate-200 bg-white p-3">
                  <p className="text-sm font-medium text-slate-700">{item}</p>
                  <div className="mt-3 flex gap-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <label key={value} className="flex items-center gap-1 text-xs text-slate-600">
                        <input
                          type="radio"
                          name={`q-${index}`}
                          value={value}
                          checked={questionnaire[`${index}`] === value}
                          onChange={() => handleQuestionChange(`${index}`, value)}
                          className="h-4 w-4 accent-indigo-600"
                        />
                        {value}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div hidden={currentStep !== 1} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <label className="mb-2 block text-sm font-medium text-slate-700">Catatan / Kekuatan utama</label>
            <textarea
              value={form.notes}
              onChange={(event) => setForm({ ...form, notes: event.target.value })}
              rows={4}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3"
              placeholder="Ceritakan kekuatan, passion, atau pengalaman yang paling menonjol..."
            />
          </div>
        </article>

        <aside className="space-y-6">
          <div hidden={currentStep !== 7} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
            <p className="text-sm text-slate-500">Ringkasan profil</p>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              {summary.map(({ skill }) => (
                <div key={skill} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  {skill}
                </div>
              ))}
            </div>
          </div>

          <div hidden={currentStep !== 5} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
            <p className="text-sm text-slate-500">Kompetensi minat</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {skillOptions.map((skill) => {
                const active = selectedSkills.includes(skill);
                return (
                  <button
                    type="button"
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`rounded-full border px-3 py-1.5 text-sm transition ${
                      active ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-indigo-200 hover:text-indigo-600'
                    }`}
                  >
                    {skill}
                  </button>
                );
              })}
            </div>
          </div>

          <div hidden={currentStep !== 5} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
            <p className="text-sm text-slate-500">Penilaian mandiri keterampilan</p>
            <p className="mt-2 text-xs leading-5 text-slate-500">Tentukan level kemampuan saat ini untuk setiap kompetensi yang dipilih.</p>
            <div className="mt-4 space-y-3">
              {selectedSkills.map((skill) => <label key={skill} className="block text-sm font-semibold text-slate-700">{skill}<select value={skillLevelsByName[skill] ?? 'Beginner'} onChange={(event) => setSkillLevelsByName({ ...skillLevelsByName, [skill]: event.target.value as typeof skillLevels[number] })} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-normal">{skillLevels.map((level) => <option key={level}>{level}</option>)}</select></label>)}
            </div>
          </div>

          <div hidden={currentStep !== 6} className="rounded-[28px] border border-indigo-100 bg-indigo-50/70 p-6">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">Tinjauan Akhir</p>
            <h2 className="mt-2 text-xl font-black text-slate-900">Siap lakukan analisis kebutuhan skill?</h2>
            <dl className="mt-4 space-y-2 text-sm text-slate-700"><div className="flex justify-between gap-3"><dt>Profil</dt><dd className="font-semibold">{form.name || 'Belum diisi'}</dd></div><div className="flex justify-between gap-3"><dt>Target</dt><dd className="font-semibold">{form.target || 'Belum diisi'}</dd></div><div className="flex justify-between gap-3"><dt>Kompetensi</dt><dd className="font-semibold">{selectedSkills.length} skill</dd></div><div className="flex justify-between gap-3"><dt>CV</dt><dd className="font-semibold">{uploadedCv || 'Belum diunggah'}</dd></div></dl>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
            <p className="text-sm text-slate-500">Prediksi kesesuaian</p>
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-2xl font-black text-slate-900">87%</p>
              <p className="mt-2 text-sm text-emerald-700">Kecocokan dengan jalur prioritas yang paling sesuai untukmu.</p>
            </div>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <div className="flex gap-3">
            {currentStep > 1 && <button type="button" onClick={goPrevious} className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-700">Kembali</button>}
            <button type="submit" disabled={isGenerating} className="inline-flex flex-1 items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 to-sky-500 px-4 py-3.5 text-sm font-semibold text-white shadow-soft">
              {isGenerating ? 'Menganalisis...' : currentStep === 7 ? 'Mulai Analisis & Rekomendasi' : 'Lanjutkan'}
            </button>
          </div>
        </aside>
      </form>
    </main>
  );
}
