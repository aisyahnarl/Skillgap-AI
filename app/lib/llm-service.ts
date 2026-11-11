/**
 * SkillGap.AI — LLM Service (Google Gemini / OpenAI Compatible / Grounded RAG)
 * Implementasi Pemanggilan LLM API Sungguhan dengan Template Prompt per Jenjang (FR-08).
 */

export interface LLMRecommendationPrompt {
  role: string;
  jenjang: string;
  target: string;
  selectedSkills: string[];
  questionnaire: Record<string, number>;
  skillLevels?: Record<string, string>;
  studentProfile?: {
    school?: string;
    major?: string;
    aspiration?: string;
    interests?: string;
    studentGoal?: 'kuliah' | 'kerja';
  };
  reportGrades?: Record<string, number>;
  extractedCvText?: string;
}

export interface LLMRoadmapPhase {
  phase: string;
  title: string;
  goal: string;
  duration: string;
  skills: string[];
  resources: string[];
  certification: string;
  project: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  tasks: string[];
}

export interface LLMRecommendationOutput {
  matchScore: number;
  skillGap: number;
  strengths: string[];
  gaps: string[];
  aiNarrative: string;
  roadmap: LLMRoadmapPhase[];
  suggestedStudyPaths?: Array<{
    title: string;
    jenjang: string;
    match: number;
    description: string;
    careers: string[];
  }>;
}

/**
 * Menyusun template prompt kontekstual spesifik per jenjang (Pelajar SMA/SMK vs Mahasiswa vs Career Switcher)
 */
export function buildPromptForJenjang(input: LLMRecommendationPrompt): string {
  const isPelajar = input.jenjang.toLowerCase().includes('pelajar') || input.role.toLowerCase() === 'pelajar';
  const isMahasiswa = input.jenjang.toLowerCase().includes('mahasiswa') || input.role.toLowerCase() === 'mahasiswa';

  if (isPelajar) {
    const goal = input.studentProfile?.studentGoal === 'kerja' ? 'Bekerja / Magang Industri (PKL)' : 'Kuliah / Studi Lanjut Vokasi/Akademik';
    const gradesStr = input.reportGrades
      ? Object.entries(input.reportGrades).map(([k, v]) => `${k}: ${v}`).join(', ')
      : 'Rata-rata 85';

    return `
Anda adalah Konselor AI Akademik & Karier Vokasi untuk pelajar SMA/SMK di SkillGap.AI.
Tugas Anda: Berikan bimbingan terarah yang ramah pemula, menyemangati, dan realistis berdasarkan profil berikut:

[PROFIL PELAJAR]
- Asal Sekolah: ${input.studentProfile?.school || 'SMK/SMA Sederajat'}
- Jurusan Saat Ini: ${input.studentProfile?.major || 'Rekayasa Perangkat Lunak / IPA'}
- Cita-cita Karier: ${input.studentProfile?.aspiration || input.target}
- Rencana Pasca Lulus: ${goal}
- Nilai Rapor: ${gradesStr}
- Keahlian yang Dipelajari: ${input.selectedSkills.join(', ')}
${input.extractedCvText ? `- Cuplikan Portofolio/CV: ${input.extractedCvText.slice(0, 500)}` : ''}

[INSTRUKSI KHUSUS JENJANG PELAJAR]
1. Gunakan bahasa Indonesia yang ramah pemula, mendidik, dan menginspirasi.
2. Roadmap 3 Fase harus berfokus pada:
   - PHASE 1: Penguatan fondasi logika, matematika terapan, dan dasar web/algoritma.
   - PHASE 2: Proyek mini portofolio sekolah atau latihan persiapan PKL / portofolio SNBP/SNBT.
   - PHASE 3: Uji kompetensi kejuruan (UKK) atau sertifikasi dasar (misal Dicoding Pemrograman Web atau BNSP Junior).
3. Sertakan saran program studi lanjutan (misal D3/D4 Teknik Informatika atau S1 Sistem Informasi).

KEMBALIKAN OUTPUT DALAM FORMAT JSON MURNI TANPA MARKDOWN BACKTICKS:
{
  "matchScore": <number 50-95>,
  "skillGap": <number 5-50>,
  "strengths": ["<kelebihan 1>", "<kelebihan 2>", "<kelebihan 3>"],
  "gaps": ["<gap prioritas 1>", "<gap prioritas 2>", "<gap prioritas 3>"],
  "aiNarrative": "<narasi personal 2-3 paragraf bimbingan pelajar>",
  "roadmap": [
    {
      "phase": "PHASE 1",
      "title": "<judul fase>",
      "goal": "<tujuan spesifik>",
      "duration": "4 minggu",
      "skills": ["<skill 1>", "<skill 2>"],
      "resources": ["<sumber belajar>"],
      "certification": "<nama sertifikasi>",
      "project": "<proyek latihan>",
      "status": "Not Started",
      "tasks": ["<tugas 1>", "<tugas 2>", "<tugas 3>"]
    },
    ...
  ],
  "suggestedStudyPaths": [
    {
      "title": "<nama prodi>",
      "jenjang": "<D3 / D4 / S1>",
      "match": <number 75-98>,
      "description": "<deskripsi>",
      "careers": ["<karier 1>", "<karier 2>"]
    }
  ]
}
`;
  }

  if (isMahasiswa) {
    return `
Anda adalah Lead AI Career Coach & Software Architect untuk mahasiswa perguruan tinggi teknik di SkillGap.AI.
Tugas Anda: Analisis kesiapan karier profesional mahasiswa terhadap standar industri modern & SKKNI.

[PROFIL MAHASISWA]
- Target Peran Kerja: ${input.target}
- Keahlian Dikuasai: ${input.selectedSkills.join(', ')}
- Tingkat Kemahiran: ${JSON.stringify(input.skillLevels || {})}
${input.extractedCvText ? `- Ekstraksi CV: ${input.extractedCvText.slice(0, 600)}` : ''}

[INSTRUKSI KHUSUS JENJANG MAHASISWA]
1. Gunakan bahasa profesional, teknis, dan mengacu pada standar rekayasa perangkat lunak modern (clean code, scalable architecture, RESTful API, database design).
2. Roadmap 3 Fase harus mencakup:
   - PHASE 1: Fondasi Arsitektur & Best Practices (Framework inti, Type Safety, Git flow).
   - PHASE 2: Proyek Portofolio Terapan Dunia Nyata (Full-stack CRUD, testing, integrasi database).
   - PHASE 3: Validasi Industri, Uji Sertifikasi (Google/AWS/Meta/BNSP), dan Persiapan Rekrutmen.

KEMBALIKAN OUTPUT DALAM FORMAT JSON MURNI TANPA MARKDOWN BACKTICKS:
{
  "matchScore": <number 55-98>,
  "skillGap": <number 2-45>,
  "strengths": ["<kekuatan 1>", "<kekuatan 2>", "<kekuatan 3>"],
  "gaps": ["<gap 1>", "<gap 2>", "<gap 3>"],
  "aiNarrative": "<narasi mendalam analisis gap dan strategi karier>",
  "roadmap": [
    {
      "phase": "PHASE 1",
      "title": "<judul fase>",
      "goal": "<tujuan spesifik>",
      "duration": "4 minggu",
      "skills": ["<skill 1>", "<skill 2>"],
      "resources": ["<sumber resmi/dokumentasi>"],
      "certification": "<sertifikasi relevan>",
      "project": "<nama proyek>",
      "status": "Not Started",
      "tasks": ["<task 1>", "<task 2>", "<task 3>"]
    },
    ...
  ]
}
`;
  }

  // Jenjang Umum / Job Seeker / Career Switcher
  return `
Anda adalah Senior Tech Recruiter & AI Career Advisor di SkillGap.AI.
Tugas Anda: Susun rencana percepatan akselerasi karier (fast-track) untuk menutup skill gap ke posisi ${input.target}.
Keahlian pengguna: ${input.selectedSkills.join(', ')}.
${input.extractedCvText ? `Ekstraksi Portofolio: ${input.extractedCvText.slice(0, 500)}` : ''}

Fokuskan pada portofolio industri siap rilis, eliminasi gap teknis, dan sertifikasi bernilai tinggi.
KEMBALIKAN OUTPUT DALAM FORMAT JSON MURNI:
{
  "matchScore": <number>,
  "skillGap": <number>,
  "strengths": [...],
  "gaps": [...],
  "aiNarrative": "...",
  "roadmap": [...]
}
`;
}

/**
 * Panggil LLM API sungguhan (Google Gemini API / OpenAI API) dengan fallback teruji
 */
export async function callRealLLM(input: LLMRecommendationPrompt): Promise<LLMRecommendationOutput | null> {
  const prompt = buildPromptForJenjang(input);

  // 1. Coba Google Gemini API jika GEMINI_API_KEY tersedia
  const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (geminiApiKey) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.4,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (textContent) {
          const parsed = JSON.parse(textContent.trim().replace(/^```json/, '').replace(/```$/, ''));
          return parsed as LLMRecommendationOutput;
        }
      }
    } catch (err) {
      console.warn('[Gemini LLM Call Warning]:', err);
    }
  }

  // 2. Coba OpenAI Compatible API jika OPENAI_API_KEY tersedia
  const openAiApiKey = process.env.OPENAI_API_KEY;
  if (openAiApiKey) {
    try {
      const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openAiApiKey}`,
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'Anda adalah mesin AI pembuat kurikulum dan roadmap karier terstruktur.' },
            { role: 'user', content: prompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.4,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const textContent = data.choices?.[0]?.message?.content;
        if (textContent) {
          const parsed = JSON.parse(textContent);
          return parsed as LLMRecommendationOutput;
        }
      }
    } catch (err) {
      console.warn('[OpenAI LLM Call Warning]:', err);
    }
  }

  return null;
}
