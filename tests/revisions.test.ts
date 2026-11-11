import { describe, expect, it, vi, afterEach } from 'vitest';
import bcrypt from 'bcrypt';
import { getJwtSecret, signJWT, verifyJWT, decodeJWTPayload, type JWTPayload } from '../app/lib/jwt';
import { middleware } from '../middleware';
import { NextRequest } from 'next/server';
import {
  saveFileToStorage,
  extractTextPureJs,
  extractSkillsWithLlm,
  computeCvCosineSimilarity,
  processCvUpload,
  extractSkillsFromText,
} from '../app/lib/cv-parser';
import { buildPromptForJenjang, callRealLLM } from '../app/lib/llm-service';
import * as dbModule from '../app/lib/db';
import { getDbPool, query, isDbConnected } from '../app/lib/db';
import { assessmentService } from '../app/services/assessment-service';
import { GET as getAssessments, POST as postAssessments } from '../app/api/assessments/route';
import { POST as uploadDocument } from '../app/api/documents/upload/route';
import { POST as apiLogin } from '../app/api/login/route';
import { POST as apiRegister } from '../app/api/register/route';
import { POST as getRecommendations } from '../app/api/recommendations/route';
import { POST as apiEmail } from '../app/api/notifications/email/route';

describe('Item 1: Keamanan JWT & Middleware RBAC', () => {
  it('validates JWT_SECRET in production and development', () => {
    expect(getJwtSecret('my-custom-secret-key')).toBe('my-custom-secret-key');
    const defaultSecret = getJwtSecret();
    expect(defaultSecret.length).toBeGreaterThan(10);

    const envObj = process.env as Record<string, string | undefined>;
    const oldEnv = envObj.NODE_ENV;
    const oldSecret = envObj.JWT_SECRET;
    try {
      envObj.NODE_ENV = 'production';
      delete envObj.JWT_SECRET;
      expect(() => getJwtSecret()).toThrow(/FATAL: JWT_SECRET/);
    } finally {
      envObj.NODE_ENV = oldEnv;
      if (oldSecret) envObj.JWT_SECRET = oldSecret;
    }
  });

  it('signs and verifies JWT tokens with HMAC-SHA256', async () => {
    const payload: JWTPayload = {
      id: 101,
      email: 'user@skillgap.ai',
      name: 'Test User',
      role: 'Mahasiswa',
    };

    const token = await signJWT(payload);
    expect(token.split('.').length).toBe(3);

    const verified = await verifyJWT(token);
    expect(verified).not.toBeNull();
    expect(verified?.email).toBe('user@skillgap.ai');
    expect(verified?.role).toBe('Mahasiswa');

    const decoded = decodeJWTPayload(token);
    expect(decoded?.name).toBe('Test User');
  });

  it('rejects tampered and expired JWT tokens', async () => {
    const payload: JWTPayload = {
      email: 'hacker@skillgap.ai',
      name: 'Attacker',
      role: 'Admin',
    };
    const validToken = await signJWT(payload);
    const parts = validToken.split('.');

    const tamperedPayload = Buffer.from(JSON.stringify({ ...payload, role: 'SuperAdmin' })).toString('base64url');
    const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;
    expect(await verifyJWT(tamperedToken)).toBeNull();

    expect(await verifyJWT('invalid.jwt')).toBeNull();
    expect(await verifyJWT('')).toBeNull();
    expect(decodeJWTPayload('bad')).toBeNull();

    const expiredToken = await signJWT({ ...payload, exp: Math.floor(Date.now() / 1000) - 100 });
    expect(await verifyJWT(expiredToken)).toBeNull();
  });

  it('middleware strictly rejects demo bypass "session=valid" and enforces RBAC', async () => {
    // 1. Unauthenticated request to protected route
    const reqNoAuth = new NextRequest('http://localhost:3000/dashboard');
    const resNoAuth = await middleware(reqNoAuth);
    expect(resNoAuth.status).toBe(307);
    expect(resNoAuth.headers.get('location')).toContain('/login');

    // 2. Unprotected route passes through
    const reqPublic = new NextRequest('http://localhost:3000/about');
    const resPublic = await middleware(reqPublic);
    expect(resPublic.status).toBe(200);

    // 3. Insecure demo bypass 'session=valid' is rejected in middleware (Item 1)
    const reqDemo = new NextRequest('http://localhost:3000/dashboard', {
      headers: { cookie: 'session=valid; session-role=Admin' },
    });
    const resDemo = await middleware(reqDemo);
    expect(resDemo.status).toBe(307);
    expect(resDemo.headers.get('location')).toContain('/login');

    // 4. Valid student accessing /admin is redirected to /dashboard (RBAC)
    const studentToken = await signJWT({
      email: 'student@skillgap.ai',
      name: 'Student',
      role: 'Mahasiswa',
    });
    const reqStudentAdmin = new NextRequest('http://localhost:3000/admin', {
      headers: { cookie: `session=${studentToken}` },
    });
    const resStudentAdmin = await middleware(reqStudentAdmin);
    expect(resStudentAdmin.status).toBe(307);
    expect(resStudentAdmin.headers.get('location')).toContain('/dashboard');

    // 5. Valid student accessing /lecturer is redirected to /dashboard
    const reqStudentLecturer = new NextRequest('http://localhost:3000/lecturer', {
      headers: { cookie: `session=${studentToken}` },
    });
    const resStudentLecturer = await middleware(reqStudentLecturer);
    expect(resStudentLecturer.status).toBe(307);

    // 6. Valid student accessing /counselor is redirected to /dashboard
    const reqStudentCounselor = new NextRequest('http://localhost:3000/counselor', {
      headers: { cookie: `session=${studentToken}` },
    });
    const resStudentCounselor = await middleware(reqStudentCounselor);
    expect(resStudentCounselor.status).toBe(307);

    // 7. Lecturer accessing /lecturer is allowed
    const lecturerToken = await signJWT({ email: 'dosen@skillgap.ai', name: 'Dosen', role: 'Dosen' });
    const reqLecturer = new NextRequest('http://localhost:3000/lecturer', {
      headers: { cookie: `session=${lecturerToken}` },
    });
    const resLecturer = await middleware(reqLecturer);
    expect(resLecturer.status).toBe(200);

    // 8. Counselor accessing /counselor is allowed
    const counselorToken = await signJWT({ email: 'bk@skillgap.ai', name: 'Guru BK', role: 'Guru BK' });
    const reqCounselor = new NextRequest('http://localhost:3000/counselor', {
      headers: { cookie: `session=${counselorToken}` },
    });
    const resCounselor = await middleware(reqCounselor);
    expect(resCounselor.status).toBe(200);

    // 9. Valid admin accessing /admin is allowed through
    const adminToken = await signJWT({
      email: 'admin@skillgap.ai',
      name: 'Admin',
      role: 'Admin',
    });
    const reqAdmin = new NextRequest('http://localhost:3000/admin', {
      headers: { cookie: `session=${adminToken}` },
    });
    const resAdmin = await middleware(reqAdmin);
    expect(resAdmin.status).toBe(200);
    expect(resAdmin.headers.get('x-user-role')).toBe('Admin');
  });
});

describe('Item 2, 3, 5: CV Extraction, Vercel Storage, & Score Validity', () => {
  const originalFetch = globalThis.fetch;
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('saves file to storage safely with cloud/local fallback and Vercel Blob support', async () => {
    const buffer = Buffer.from('CV Test Content for SkillGap.AI');
    const result = await saveFileToStorage(buffer, 'resume_john.pdf', 'hash1234567890');
    expect(result.sanitizedName).toContain('resume_john');
    expect(result.fileUrl).toBeDefined();

    // Mock Vercel Blob storage
    process.env.BLOB_READ_WRITE_TOKEN = 'test_blob_token';
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ url: 'https://blob.vercel-storage.com/uploaded_cv.pdf' }),
    });
    const blobRes = await saveFileToStorage(buffer, 'resume_blob.pdf', 'hashblob123456');
    expect(blobRes.fileUrl).toContain('vercel-storage');
    delete process.env.BLOB_READ_WRITE_TOKEN;
  });

  it('extracts pure text in JavaScript without Python dependency', () => {
    const textBuffer = Buffer.from('Software Engineer with 3 years React and Node.js experience.');
    const extracted = extractTextPureJs(textBuffer, '.txt');
    expect(extracted).toContain('Software Engineer');

    const binaryBuffer = Buffer.from('PDF-1.5 %... JavaScript developer with SQL database skills');
    const scanned = extractTextPureJs(binaryBuffer, '.pdf');
    expect(scanned.length).toBeGreaterThan(0);
    expect(extractSkillsFromText('React and Python').hardSkills).toContain('React');
  });

  it('extracts skills using fallback SKKNI dictionary with level and evidence (Item 3)', async () => {
    const cvText = `
      Saya berpengalaman 2 tahun sebagai Frontend Developer menggunakan React, TypeScript, dan Next.js.
      Terbiasa merancang database PostgreSQL dan Docker untuk containerization.
      Memiliki kemampuan komunikasi dan kerja tim yang baik.
    `;

    const result = await extractSkillsWithLlm(Buffer.from(cvText), 'cv.txt', cvText, 'Frontend Developer');
    expect(result.structuredSkills.length).toBeGreaterThan(0);
    expect(result.extractedSkills).toContain('React');
    expect(result.extractedSkills).toContain('TypeScript');
    expect(result.softSkills).toContain('Komunikasi');

    const firstSkill = result.structuredSkills.find((s) => s.skill === 'React');
    expect(firstSkill).toBeDefined();
    expect(firstSkill?.level).toBe('Menengah');
    expect(firstSkill?.evidence.length).toBeGreaterThan(5);
  });

  it('extracts skills via mock LLM response when GEMINI_API_KEY is configured', async () => {
    process.env.GEMINI_API_KEY = 'test_gemini_key';
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                skills: [{ skill: 'FastAPI', level: 'Lanjutan', evidence: 'Membangun backend microservice' }],
                softSkills: ['Problem Solving'],
                summary: 'Software Engineer handal',
              }),
            }],
          },
        }],
      }),
    });

    const llmCv = await extractSkillsWithLlm(Buffer.from('dummy'), 'doc.pdf', 'dummy text', 'Backend Developer');
    expect(llmCv.source).toBe('llm');
    expect(llmCv.extractedSkills).toContain('FastAPI');
    expect(llmCv.structuredSkills[0]?.level).toBe('Lanjutan');
    delete process.env.GEMINI_API_KEY;
  });

  it('computes Cosine Similarity and eliminates fake default values (Item 5)', () => {
    const emptySim = computeCvCosineSimilarity([], 'Frontend Developer');
    expect(emptySim.cosine).toBe(0);
    expect(emptySim.matchScore).toBe(0);

    const matchingSim = computeCvCosineSimilarity(['React', 'TypeScript', 'HTML5 & CSS3', 'JavaScript'], 'Frontend Developer');
    expect(matchingSim.cosine).toBeGreaterThan(0.4);
    expect(matchingSim.matchScore).toBeGreaterThanOrEqual(50);
    expect(matchingSim.matchScore).toBeLessThanOrEqual(100);
  });

  it('runs complete processCvUpload pipeline and caches per file hash', async () => {
    const buffer = Buffer.from('CV Portfolio for Fullstack: React, Next.js, PostgreSQL, Docker, Git');
    const res = await processCvUpload(buffer, 'portfolio.txt', buffer.length, 1, 'Frontend Developer');

    expect(res.fileName).toBeDefined();
    expect(res.fileHash.length).toBe(64);
    expect(res.extractedSkills.length).toBeGreaterThan(0);
    expect(res.cosineSimilarity).toBeGreaterThan(0);
    expect(res.matchScore).toBeGreaterThan(0);
  });
});

describe('Item 4: LLM Service & Header Authentication', () => {
  const originalFetch = globalThis.fetch;
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('generates prompt templates for Pelajar without fabricated grades', () => {
    const promptNoGrades = buildPromptForJenjang({
      role: 'Pelajar',
      jenjang: 'Pelajar',
      target: 'Junior Web Dev',
      selectedSkills: ['HTML5 & CSS3'],
      questionnaire: { q1: 4 },
      studentProfile: { school: 'SMK 1', major: 'RPL' },
    });

    expect(promptNoGrades).toContain('Data nilai rapor belum diinput oleh siswa');
    expect(promptNoGrades).not.toContain('Rata-rata 85');
    expect(promptNoGrades).toContain('matchScore');

    const promptGeneral = buildPromptForJenjang({
      role: 'Umum',
      jenjang: 'Umum',
      target: 'DevOps Engineer',
      selectedSkills: ['Docker'],
      questionnaire: {},
    });
    expect(promptGeneral).toContain('Senior Tech Recruiter');
  });

  it('safely handles real LLM calling with header auth and fallbacks', async () => {
    // 1. Offline test
    const resultOffline = await callRealLLM({
      role: 'Mahasiswa',
      jenjang: 'Mahasiswa',
      target: 'Cloud Engineer',
      selectedSkills: ['Docker', 'Linux', 'Python'],
      questionnaire: { q1: 5 },
    });
    expect(resultOffline === null || resultOffline.source === 'llm').toBe(true);

    // 2. Mock Gemini API with header 'x-goog-api-key'
    process.env.GEMINI_API_KEY = 'test_key';
    process.env.GEMINI_MODEL = 'gemini-1.5-flash';
    let interceptedHeaders: any = null;
    globalThis.fetch = vi.fn().mockImplementation((url, opts) => {
      interceptedHeaders = opts.headers;
      return Promise.resolve({
        ok: true,
        json: async () => ({
          candidates: [{
            content: {
              parts: [{
                text: JSON.stringify({
                  matchScore: 92,
                  skillGap: 8,
                  strengths: ['Cloud architecture'],
                  gaps: ['CI/CD automation'],
                  aiNarrative: 'Kandidat sangat siap industri',
                  roadmap: [{
                    phase: 'PHASE 1',
                    title: 'CI/CD Pipeline',
                    goal: 'Menguasai GitHub Actions',
                    duration: '3 minggu',
                    skills: ['GitHub Actions'],
                    resources: ['Docs'],
                    certification: 'AWS DevOps',
                    project: 'Automated Pipeline',
                    status: 'In Progress',
                    tasks: ['Config workflow'],
                  }],
                }),
              }],
            },
          }],
        }),
      });
    });

    const resultOnline = await callRealLLM({
      role: 'Mahasiswa',
      jenjang: 'Mahasiswa',
      target: 'DevOps',
      selectedSkills: ['Docker'],
      questionnaire: { q1: 5 },
    });

    expect(resultOnline).not.toBeNull();
    expect(resultOnline?.source).toBe('llm');
    expect(resultOnline?.matchScore).toBe(92);
    expect(interceptedHeaders?.['x-goog-api-key']).toBe('test_key');
    delete process.env.GEMINI_API_KEY;

    // 3. Mock OpenAI Compatible API
    process.env.OPENAI_API_KEY = 'test_openai_key';
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{
          message: {
            content: JSON.stringify({
              matchScore: 88,
              skillGap: 12,
              strengths: ['OpenAI prompt test'],
              gaps: [],
              aiNarrative: 'OpenAI generation',
              roadmap: [],
            }),
          },
        }],
      }),
    });
    const openAiRes = await callRealLLM({
      role: 'Mahasiswa',
      jenjang: 'Mahasiswa',
      target: 'AI Engineer',
      selectedSkills: ['Python'],
      questionnaire: { q1: 5 },
    });
    expect(openAiRes?.source).toBe('llm');
    delete process.env.OPENAI_API_KEY;
  });
});

describe('Item 6: Database Storage & API Endpoints Integration', () => {
  it('manages database pool and safe query fallback', async () => {
    const pool = getDbPool();
    const res = await query('SELECT 1');
    expect(res === null || res.rows.length >= 0).toBe(true);
    expect(typeof isDbConnected()).toBe('boolean');
  });

  it('GET and POST /api/assessments connects to storage with session check', async () => {
    const reqUnauth = new Request('http://localhost:3000/api/assessments');
    const resUnauth = await getAssessments(reqUnauth);
    expect(resUnauth.status).toBe(401);

    const token = await signJWT({ email: 'user@skillgap.ai', name: 'User', role: 'Mahasiswa' });
    const reqAuth = new Request('http://localhost:3000/api/assessments', {
      headers: { authorization: `Bearer ${token}` },
    });
    const resAuth = await getAssessments(reqAuth);
    expect(resAuth.status).toBe(200);
    const data = await resAuth.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);

    // Test database branch with mock rows
    const querySpy = vi.spyOn(dbModule, 'query').mockResolvedValueOnce({
      rows: [
        { id: 10, name: 'Sari Indah', category: 'Mahasiswa', target: 'Data Scientist', match: '92%', status: 'valid' }
      ],
      rowCount: 1,
      command: 'SELECT',
      oid: 0,
      fields: [],
    } as any);

    const resFromDb = await getAssessments(reqAuth);
    expect(resFromDb.status).toBe(200);
    const dbData = await resFromDb.json();
    expect(dbData.success).toBe(true);
    expect(dbData.data[0].name).toBe('Sari Indah');

    querySpy.mockRestore();

    const reqPost = new Request('http://localhost:3000/api/assessments', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Rian Pratama',
        category: 'Mahasiswa',
        target: 'Data Engineer',
      }),
    });
    const resPost = await postAssessments(reqPost);
    expect(resPost.status).toBe(201);

    // Test assessmentService.syncFromApi
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: [{ id: '99', name: 'Dewi', category: 'Pelajar', target: 'UI Designer', match: '88%' }]
      }),
    } as any);

    const synced = await assessmentService.syncFromApi();
    expect(Array.isArray(synced)).toBe(true);
    global.fetch = originalFetch;
  });

  it('handles /api/documents/upload with file validation and size check', async () => {
    const formDataEmpty = new FormData();
    const reqEmpty = new Request('http://localhost:3000/api/documents/upload', {
      method: 'POST',
      body: formDataEmpty,
    });
    const resEmpty = await uploadDocument(reqEmpty);
    expect(resEmpty.status).toBe(400);

    const formDataBad = new FormData();
    const badFile = new File(['binary content'], 'virus.exe', { type: 'application/octet-stream' });
    formDataBad.append('file', badFile);
    const reqBad = new Request('http://localhost:3000/api/documents/upload', {
      method: 'POST',
      body: formDataBad,
    });
    const resBad = await uploadDocument(reqBad);
    expect(resBad.status).toBe(400);

    // Oversized file check
    const formDataOversized = new FormData();
    const bigFile = new File([new Uint8Array(21 * 1024 * 1024)], 'big.pdf', { type: 'application/pdf' });
    formDataOversized.append('file', bigFile);
    const reqOversized = new Request('http://localhost:3000/api/documents/upload', {
      method: 'POST',
      body: formDataOversized,
    });
    const resOversized = await uploadDocument(reqOversized);
    expect(resOversized.status).toBe(400);

    const formDataOk = new FormData();
    const goodFile = new File(['Skill: React, TypeScript, Node.js'], 'cv_alex.txt', { type: 'text/plain' });
    formDataOk.append('file', goodFile);
    formDataOk.append('targetRole', 'Frontend Developer');
    const reqOk = new Request('http://localhost:3000/api/documents/upload', {
      method: 'POST',
      body: formDataOk,
    });
    const resOk = await uploadDocument(reqOk);
    expect(resOk.status).toBe(200);
    const okJson = await resOk.json();
    expect(okJson.success).toBe(true);
  });

  it('handles /api/login and /api/register endpoints', async () => {
    const reqBadLogin = new Request('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email', password: '' }),
    });
    const resBadLogin = await apiLogin(reqBadLogin);
    expect(resBadLogin.status).toBe(400);

    const reqGoodLogin = new Request('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nadia@email.com', password: 'password123' }),
    });
    const resGoodLogin = await apiLogin(reqGoodLogin);
    expect(resGoodLogin.status).toBe(200);
    const loginJson = await resGoodLogin.json();
    expect(loginJson.token).toBeDefined();

    // Wrong password for existing user
    const reqWrongPass = new Request('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nadia@email.com', password: 'wrongpassword' }),
    });
    const resWrongPass = await apiLogin(reqWrongPass);
    expect(resWrongPass.status).toBe(401);

    const reqBadReg = new Request('http://localhost:3000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'invalid' }),
    });
    const resBadReg = await apiRegister(reqBadReg);
    expect(resBadReg.status).toBe(400);

    // Valid register
    const reqGoodReg = new Request('http://localhost:3000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Siswa Baru',
        email: `new_user_${Date.now()}@skillgap.ai`,
        password: 'password123',
        role: 'Pelajar',
        jenjang: 'Pelajar SMA-SMK Sederajat',
      }),
    });
    const resGoodReg = await apiRegister(reqGoodReg);
    expect(resGoodReg.status).toBe(201);
    const regJson = await resGoodReg.json();
    expect(regJson.success).toBe(true);
    expect(regJson.token).toBeDefined();

    // Login via DB match
    const hashedPassword = await bcrypt.hash('secret123', 10);
    const queryLoginSpy = vi.spyOn(dbModule, 'query').mockResolvedValueOnce({
      rows: [
        { id: 1, name: 'DB User', email: 'dbuser@skillgap.ai', password: hashedPassword, role: 'Mahasiswa', jenjang: 'Mahasiswa' }
      ],
      rowCount: 1,
    } as any);

    const reqDbLogin = new Request('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'dbuser@skillgap.ai', password: 'secret123' }),
    });
    const resDbLogin = await apiLogin(reqDbLogin);
    expect(resDbLogin.status).toBe(200);
    queryLoginSpy.mockRestore();

    // Register duplicate email in DB
    const queryRegSpy = vi.spyOn(dbModule, 'query').mockResolvedValueOnce({
      rows: [{ id: 5 }],
      rowCount: 1,
    } as any);

    const reqDupReg = new Request('http://localhost:3000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Duplicate',
        email: 'exist@skillgap.ai',
        password: 'password123',
        role: 'Mahasiswa',
        jenjang: 'Mahasiswa',
      }),
    });
    const resDupReg = await apiRegister(reqDupReg);
    expect(resDupReg.status).toBe(400);
    queryRegSpy.mockRestore();

    // CV cache hit branch
    const queryCvSpy = vi.spyOn(dbModule, 'query').mockResolvedValueOnce({
      rows: [
        {
          file_name: 'cached_cv.pdf',
          file_url: '/uploads/cv/cached_cv.pdf',
          file_path: '/tmp/cached_cv.pdf',
          extracted_text: 'Summary',
          extracted_skills: JSON.stringify(['React', 'TypeScript']),
          cosine_similarity: '0.85',
          match_score: '87',
          extraction_source: 'llm',
        }
      ],
      rowCount: 1,
    } as any);

    const cachedRes = await processCvUpload(Buffer.from('Cached CV content'), 'cv.pdf', 100);
    expect(cachedRes.dbSaved).toBe(true);
    expect(cachedRes.extractedSkills).toContain('React');
    queryCvSpy.mockRestore();
  });

  it('handles /api/notifications/email with authorization check', async () => {
    // Unauthenticated
    const reqUnauth = new Request('http://localhost:3000/api/notifications/email', {
      method: 'POST',
      body: JSON.stringify({ to: 'user@email.com', category: 'welcome', userName: 'User' }),
    });
    const resUnauth = await apiEmail(reqUnauth);
    expect(resUnauth.status).toBe(401);

    // Authenticated welcome email
    const token = await signJWT({ email: 'admin@skillgap.ai', name: 'Admin', role: 'Admin' });
    const reqWelcome = new Request('http://localhost:3000/api/notifications/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        to: 'user@email.com',
        category: 'welcome',
        userName: 'User Testing',
      }),
    });
    const resWelcome = await apiEmail(reqWelcome);
    expect(resWelcome.status).toBe(200);
    const welcomeJson = await resWelcome.json();
    expect(welcomeJson.success).toBe(true);

    // Authenticated assessment result email
    const reqSummary = new Request('http://localhost:3000/api/notifications/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        to: 'student@email.com',
        category: 'assessment_result',
        userName: 'Student User',
        assessmentData: {
          target: 'Data Scientist',
          matchScore: 90,
          skillGap: 10,
          certifications: ['Google Data Analytics'],
        },
      }),
    });
    const resSummary = await apiEmail(reqSummary);
    expect(resSummary.status).toBe(200);

    // Authenticated counselor feedback email
    const reqFeedback = new Request('http://localhost:3000/api/notifications/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        to: 'student@email.com',
        category: 'counselor_feedback',
        userName: 'Student User',
        counselorData: {
          validatorName: 'Dr. Hendra',
          validatorRole: 'Dosen',
          status: 'Approved',
          feedback: 'Sangat baik',
        },
      }),
    });
    const resFeedback = await apiEmail(reqFeedback);
    expect(resFeedback.status).toBe(200);
  });

  it('evaluates recommendations with calibrated score and engine attribution', async () => {
    const token = await signJWT({ email: 'mhs@skillgap.ai', name: 'Mhs', role: 'Mahasiswa' });
    const req = new Request('http://localhost:3000/api/recommendations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        role: 'Mahasiswa',
        jenjang: 'Mahasiswa',
        target: 'Frontend Developer',
        selectedSkills: ['React', 'TypeScript', 'HTML5 & CSS3'],
        questionnaire: { q1: 4, q2: 4 },
      }),
    });

    const res = await getRecommendations(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.matchScore).toBeGreaterThanOrEqual(50);
    expect(json.data.engine).toBeDefined();
    expect(json.data.roadmap.length).toBeGreaterThanOrEqual(1);
  });
});
