/**
 * SkillGap.AI — LLM Service (Google Gemini / OpenAI Compatible / Grounded RAG)
 * Implementasi Pemanggilan LLM API Sungguhan dengan Template Prompt per Jenjang (FR-08).
 * Mematuhi prinsip keamanan: API key dikirim via HTTP header 'x-goog-api-key' (bukan query parameter).
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
  source: 'llm' | 'rule_based_fallback';
  modelUsed?: string;
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
    const gradesStr = input.reportGrades && Object.keys(input.reportGrades).length > 0
      ? Object.entries(input.reportGrades).map(([k, v]) => `${k}: ${v}`).join(', ')
      : 'Data nilai rapor belum diinput oleh siswa (evaluasi berbasis keahlian deklaratif)';

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
  "matchScore": <number skala 0-100>,
  "skillGap": <number skala 0-100>,
  "strengths": ["<kekuatan 1>", "<kekuatan 2>", "<kekuatan 3>"],
  "gaps": ["<gap 1>", "<gap 2>", "<gap 3>"],
  "aiNarrative": "<narasi edukatif motivatif ramah pelajar>",
  "roadmap": [
    {
      "phase": "PHASE 1",
      "title": "<judul fase>",
      "goal": "<tujuan spesifik>",
      "duration": "4 minggu",
      "skills": ["<skill 1>", "<skill 2>"],
      "resources": ["<sumber belajar gratis/resmi>"],
      "certification": "<sertifikasi tingkat pelajar>",
      "project": "<nama proyek mini>",
      "status": "In Progress",
      "tasks": ["<task 1>", "<task 2>", "<task 3>"]
    },
    {
      "phase": "PHASE 2",
      "title": "<judul fase>",
      "goal": "<tujuan spesifik>",
      "duration": "6 minggu",
      "skills": ["<skill 1>", "<skill 2>"],
      "resources": ["<sumber belajar>"],
      "certification": "<sertifikasi>",
      "project": "<nama proyek>",
      "status": "Not Started",
      "tasks": ["<task 1>", "<task 2>"]
    },
    {
      "phase": "PHASE 3",
      "title": "<judul fase>",
      "goal": "<tujuan spesifik>",
      "duration": "8 minggu",
      "skills": ["<skill 1>", "<skill 2>"],
      "resources": ["<sumber belajar>"],
      "certification": "<sertifikasi>",
      "project": "<nama proyek>",
      "status": "Not Started",
      "tasks": ["<task 1>", "<task 2>"]
    }
  ],
  "suggestedStudyPaths": [
    {
      "title": "<Nama Prodi>",
      "jenjang": "D4/S1 Vokasi",
      "match": 90,
      "description": "<alasan>",
      "careers": ["<karier 1>", "<karier 2>"]
    }
  ]
}
`;
  }

  if (isMahasiswa) {
    return `
Anda adalah AI Career Advisor & Dosen Pembimbing Karier Kampus di SkillGap.AI.
Tugas Anda: Analisis kesiapan industri mahasiswa untuk target: ${input.target}.
Profil Keahlian: ${input.selectedSkills.join(', ')}.
${input.extractedCvText ? `Kutipan Portofolio/CV: ${input.extractedCvText.slice(0, 500)}` : ''}

[INSTRUKSI KHUSUS JENJANG MAHASISWA]
1. Pendekatan analitis, profesional, mengacu pada standar kompetensi industri kerja (SKKNI/ACM).
2. Roadmap 3 Fase berorientasi pada:
   - PHASE 1: Penguasaan framework industri dan arsitektur kode bersih.
   - PHASE 2: Proyek kolaboratif atau skripsi/tugas akhir aplikatif berbasis database dan cloud.
   - PHASE 3: Persiapan magang bersertifikat MSIB Kemendikbudristek dan sertifikasi profesional (e.g. AWS / Google Cloud / Dicoding).

KEMBALIKAN OUTPUT DALAM FORMAT JSON MURNI TANPA MARKDOWN BACKTICKS:
{
  "matchScore": <number skala 0-100>,
  "skillGap": <number skala 0-100>,
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
    {
      "phase": "PHASE 2",
      "title": "<judul fase>",
      "goal": "<tujuan spesifik>",
      "duration": "6 minggu",
      "skills": ["<skill 1>", "<skill 2>"],
      "resources": ["<sumber resmi>"],
      "certification": "<sertifikasi>",
      "project": "<nama proyek>",
      "status": "Not Started",
      "tasks": ["<task 1>", "<task 2>"]
    },
    {
      "phase": "PHASE 3",
      "title": "<judul fase>",
      "goal": "<tujuan spesifik>",
      "duration": "8 minggu",
      "skills": ["<skill 1>", "<skill 2>"],
      "resources": ["<sumber resmi>"],
      "certification": "<sertifikasi>",
      "project": "<nama proyek>",
      "status": "Not Started",
      "tasks": ["<task 1>", "<task 2>"]
    }
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
KEMBALIKAN OUTPUT DALAM FORMAT JSON MURNI TANPA MARKDOWN BACKTICKS:
{
  "matchScore": <number skala 0-100>,
  "skillGap": <number skala 0-100>,
  "strengths": ["<kekuatan 1>", "<kekuatan 2>"],
  "gaps": ["<gap 1>", "<gap 2>"],
  "aiNarrative": "<narasi analisis gap percepatan karier>",
  "roadmap": [
    {
      "phase": "PHASE 1",
      "title": "<judul fase>",
      "goal": "<tujuan spesifik>",
      "duration": "4 minggu",
      "skills": ["<skill 1>", "<skill 2>"],
      "resources": ["<sumber resmi>"],
      "certification": "<sertifikasi>",
      "project": "<nama proyek>",
      "status": "Not Started",
      "tasks": ["<task 1>", "<task 2>"]
    }
  ]
}
`;
}

/**
 * Panggil LLM API sungguhan (Google Gemini API / OpenAI API) dengan fallback teruji.
 * Kunci API dikirim melalui header (x-goog-api-key) untuk mencegah eksposur di URL / log jaringan.
 */
export async function callRealLLM(input: LLMRecommendationPrompt): Promise<LLMRecommendationOutput | null> {
  const prompt = buildPromptForJenjang(input);

  // 1. Coba Google Gemini API jika GEMINI_API_KEY tersedia
  const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (geminiApiKey) {
    try {
      const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
      // Keamanan: Pindahkan API key ke header 'x-goog-api-key', jangan di query param URL
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelName)}:generateContent`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': geminiApiKey,
        },
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
          const cleanedText = textContent.trim().replace(/^```json/, '').replace(/```$/, '').trim();
          const parsed = JSON.parse(cleanedText) as LLMRecommendationOutput;
          parsed.source = 'llm';
          parsed.modelUsed = modelName;
          return parsed;
        }
      } else {
        console.warn(`[Gemini LLM Call Warning] HTTP ${res.status}: ${res.statusText}`);
      }
    } catch (err) {
      console.warn('[Gemini LLM Call Exception]:', err);
    }
  }

  // 2. Coba OpenAI Compatible API jika OPENAI_API_KEY tersedia
  const openAiApiKey = process.env.OPENAI_API_KEY;
  if (openAiApiKey) {
    try {
      const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
      const modelName = process.env.OPENAI_MODEL || 'gpt-4o-mini';
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openAiApiKey}`,
        },
        body: JSON.stringify({
          model: modelName,
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
          const parsed = JSON.parse(textContent) as LLMRecommendationOutput;
          parsed.source = 'llm';
          parsed.modelUsed = modelName;
          return parsed;
        }
      } else {
        console.warn(`[OpenAI LLM Call Warning] HTTP ${res.status}: ${res.statusText}`);
      }
    } catch (err) {
      console.warn('[OpenAI LLM Call Exception]:', err);
    }
  }

  return null;
}
