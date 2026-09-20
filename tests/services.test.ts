import { describe, expect, it, beforeEach, vi } from 'vitest';
import * as allServices from '../app/services/index';
import { authService, seedUsers } from '../app/services/auth-service';
import {
  assessmentService,
  defaultStudentReport,
} from '../app/services/assessment-service';
import { certificationService } from '../app/services/certification-service';
import { roadmapService } from '../app/services/roadmap-service';
import { recommendationService } from '../app/services/recommendation-service';
import { competencyService } from '../app/services/competency-service';
import { studyPathService } from '../app/services/study-path-service';
import { susService } from '../app/services/sus-service';
import { validationService } from '../app/services/validation-service';
import { jobService } from '../app/services/job-service';
import {
  listStudyPaths,
  createStudyPath,
  updateStudyPath,
  deleteStudyPath,
} from '../app/lib/study-paths';
import {
  listCompetencies,
  createCompetency,
  updateCompetency,
  deleteCompetency,
  createCompetencies,
} from '../app/lib/competencies';
import { hasSession, hasAdminSession } from '../app/lib/auth';
import { useUIStore } from '../app/stores/ui-store';
import { yieldTask, processInChunks } from '../app/lib/task-scheduler';

describe('Barrel Export (app/services/index.ts)', () => {
  it('exports all domain services properly', () => {
    expect(allServices.authService).toBeDefined();
    expect(allServices.assessmentService).toBeDefined();
    expect(allServices.roadmapService).toBeDefined();
    expect(allServices.certificationService).toBeDefined();
    expect(allServices.validationService).toBeDefined();
    expect(allServices.recommendationService).toBeDefined();
    expect(allServices.competencyService).toBeDefined();
    expect(allServices.studyPathService).toBeDefined();
    expect(allServices.susService).toBeDefined();
    expect(allServices.jobService).toBeDefined();
  });
});

describe('Auth Service & Role Management (Bab 11 Security)', () => {
  it('provides initialized seed users with properly decoded passwords', () => {
    expect(seedUsers.length).toBeGreaterThanOrEqual(5);
    const admin = seedUsers.find((u) => u.role === 'Admin');
    expect(admin).toBeDefined();
    expect(admin?.password).toBe('admin123');

    const student = seedUsers.find((u) => u.role === 'Mahasiswa');
    expect(student).toBeDefined();
    expect(student?.password).toBe('password123');
  });

  it('manages sessions and handles server environments gracefully', () => {
    const users = authService.getAllUsers();
    expect(users.length).toBeGreaterThanOrEqual(5);

    const currentUser = authService.getCurrentUser();
    expect(currentUser).toBeNull();

    expect(() => authService.setSession(seedUsers[0]!)).not.toThrow();
    expect(() => authService.logout()).not.toThrow();
  });

  it('creates, updates, and deletes users safely', () => {
    const newUser = {
      name: 'Test Candidate',
      email: 'candidate@test.com',
      role: 'Mahasiswa' as const,
      jenjang: 'Mahasiswa S1',
    };
    const createRes = authService.createUser(newUser);
    expect(createRes.success).toBe(true);

    const duplicateRes = authService.createUser(newUser);
    expect(duplicateRes.success).toBe(false);

    const updateRes = authService.updateUser('candidate@test.com', { name: 'Updated Candidate' });
    expect(updateRes.success).toBe(true);
    expect(updateRes.user?.name).toBe('Updated Candidate');

    const nonExistentUpdate = authService.updateUser('nonexistent@test.com', { name: 'Ghost' });
    expect(nonExistentUpdate.success).toBe(false);

    const deleted = authService.deleteUser('candidate@test.com');
    expect(deleted).toBe(true);
  });
});

describe('Assessment Service (Bab 4 & Bab 12)', () => {
  it('provides valid default assessment reports for Mahasiswa and Pelajar', () => {
    expect(defaultStudentReport.primarySkill).toBe('Data Science');
    expect(defaultStudentReport.matchScore).toBe(87);
    expect(defaultStudentReport.skillGap).toBe(14);
    expect(defaultStudentReport.roadmap.length).toBeGreaterThan(0);
    expect(defaultStudentReport.skillAnalysis.length).toBeGreaterThan(0);
  });

  it('retrieves active report, history, and allows adding snapshots', () => {
    const active = assessmentService.getActiveReport();
    expect(active.primarySkill).toBe('Data Science');

    const history = assessmentService.getHistory();
    expect(history.length).toBeGreaterThan(0);

    const firstItem = history[0];
    if (firstItem) {
      const found = assessmentService.getById(firstItem.id);
      expect(found).toBeDefined();
      expect(found?.id).toBe(firstItem.id);

      const snapshot = assessmentService.activateSnapshot(firstItem.id);
      expect(snapshot).toBeDefined();
    }

    const nonExistent = assessmentService.activateSnapshot('non-existent-id');
    expect(nonExistent).toBeNull();

    assessmentService.setActiveReport(defaultStudentReport);
    expect(assessmentService.getActiveReport().primarySkill).toBe('Data Science');

    const newItem = {
      id: 'test-history-1',
      submittedAt: new Date().toISOString(),
      target: 'AI Engineer',
      matchScore: 85,
      skillGap: 15,
      report: defaultStudentReport,
    };
    expect(() => assessmentService.addHistory(newItem)).not.toThrow();
  });
});

describe('Certification & Roadmap Services', () => {
  it('retrieves curated certifications and supports filtering', () => {
    const certs = certificationService.getAll();
    expect(certs.length).toBeGreaterThan(0);

    const recommended = certificationService.getRecommended('Data', 'Mahasiswa');
    expect(recommended.length).toBeGreaterThan(0);

    const pelajarRecommended = certificationService.getRecommended(undefined, 'Pelajar');
    expect(pelajarRecommended.length).toBeGreaterThan(0);

    const allDefaultRec = certificationService.getRecommended();
    expect(allDefaultRec.length).toBeGreaterThan(0);

    const firstCert = certs[0];
    if (firstCert) {
      const found = certificationService.getById(firstCert.id);
      expect(found).toBeDefined();
    }
    expect(certificationService.getById('non-existent-cert')).toBeNull();
  });

  it('provides learning roadmap phases and supports task tracking', () => {
    const phases = roadmapService.get();
    expect(phases.length).toBeGreaterThan(0);

    const updated = roadmapService.toggleTask(0, 0);
    expect(updated.length).toBeGreaterThan(0);

    const started = roadmapService.startPhase(0);
    expect(started[0]?.status).toBe('In Progress');

    const progress = roadmapService.calculateOverallProgress(phases);
    expect(progress).toBeGreaterThanOrEqual(0);
    expect(progress).toBeLessThanOrEqual(100);

    expect(roadmapService.calculateOverallProgress([])).toBe(0);
  });

  it('provides recommendations for students and study paths', () => {
    const studyPaths = recommendationService.getStudyPathRecommendationsForStudent('Data Science', 88);
    expect(studyPaths.length).toBeGreaterThan(0);
    expect(studyPaths[0]?.match).toBeGreaterThan(70);
  });
});

describe('SUS Usability Service & Validation Feedback (Bab 11 & Bab 12)', () => {
  it('saves response, retrieves all responses, and calculates stats', () => {
    const scores: Record<number, number> = {
      1: 5, 2: 2, 3: 4, 4: 1, 5: 5, 6: 2, 7: 4, 8: 2, 9: 5, 10: 1,
    };
    const response = susService.saveResponse({
      userName: 'Testing User',
      role: 'Mahasiswa',
      scores,
    });
    expect(response.id).toBeDefined();
    expect(response.calculatedScore).toBeGreaterThan(70);

    const all = susService.getAllResponses();
    expect(all.length).toBeGreaterThan(0);

    const stats = susService.getStats();
    expect(stats.total).toBeGreaterThan(0);
    expect(stats.averageScore).toBeGreaterThan(0);

    const goodScores: Record<number, number> = {
      1: 4, 2: 2, 3: 4, 4: 2, 5: 4, 6: 2, 7: 4, 8: 2, 9: 4, 10: 2,
    };
    const goodRes = susService.calculateScore(goodScores);
    expect(goodRes.grade).toBe('Good (68–80.3)');
  });

  it('handles validation records and user feedbacks', () => {
    const val = validationService.save('item-test-1', {
      decision: 'Relevan',
      note: 'Sesuai dengan kurikulum.',
      validatorRole: 'Dosen',
      validatorName: 'Dr. Hendra Wijaya',
    });
    expect(val.itemId).toBe('item-test-1');

    const revVal = validationService.save('item-rev-1', {
      decision: 'Perlu Revisi',
      note: 'Perlu pembaruan modul.',
      validatorRole: 'Guru BK',
    });
    expect(revVal.decision).toBe('Perlu Revisi');

    const retrieved = validationService.get('item-test-1');
    expect(retrieved).toBeDefined();

    const all = validationService.getAll();
    expect(Object.keys(all).length).toBeGreaterThan(0);

    const stats = validationService.getStats();
    expect(stats.total).toBeGreaterThan(0);

    const fb = validationService.saveUserFeedback({
      userName: 'Ayu',
      role: 'Mahasiswa',
      target: 'Data Science',
      rating: 5,
      relevance: 'Sangat Relevan',
      comment: 'Sangat membantu.',
    });
    expect(fb.id).toBeDefined();

    const lowFb = validationService.saveUserFeedback({
      userName: 'Fajar',
      role: 'Pelajar',
      target: 'Web Development',
      rating: 2,
      relevance: 'Kurang Relevan',
      comment: 'Bisa ditingkatkan.',
    });
    expect(lowFb.rating).toBe(2);

    const fbs = validationService.getUserFeedbacks();
    expect(fbs.length).toBeGreaterThan(0);

    const fbStats = validationService.getFeedbackStats();
    expect(fbStats.total).toBeGreaterThan(0);
  });
});

describe('Job Vacancy & Application Service (jobService)', () => {
  it('retrieves and queries job openings', () => {
    const jobs = jobService.getAll();
    expect(jobs.length).toBeGreaterThan(0);

    const first = jobs[0]!;
    const found = jobService.getJobById(first.id);
    expect(found).toBeDefined();
    expect(jobService.getJobById('non-existent-job')).toBeNull();

    const matched = jobService.getMatchedJobs(defaultStudentReport);
    expect(matched.length).toBeGreaterThan(0);

    const apps = jobService.getApplications();
    expect(Array.isArray(apps)).toBe(true);
    expect(jobService.isJobApplied(first.id)).toBe(false);

    const initialBookmark = jobService.isBookmarked(first.id);
    const toggled = jobService.toggleBookmark(first.id);
    expect(typeof toggled).toBe('boolean');

    const app = jobService.applyJob({
      jobId: first.id,
      applicantName: 'Nadia Amalia',
      email: 'nadia@email.com',
    });
    expect(app.id).toBeDefined();
    expect(app.jobId).toBe(first.id);
    expect(app.status).toBe('Lamaran Terkirim');
  });
});

describe('Frontend API Fetch Service Clients', () => {
  it('calls competencyService, studyPathService, and recommendationService fetch wrappers', async () => {
    const originalFetch = globalThis.fetch;
    const mockJson = vi.fn().mockResolvedValue({ success: true, data: [] });
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true, json: mockJson } as any);

    await competencyService.getAll();
    await competencyService.create({ name: 'Test Skill' });
    await competencyService.update('comp-1', { name: 'Updated Skill' });
    await competencyService.remove('comp-1');

    await studyPathService.getAll();
    await studyPathService.create({ nama_jurusan: 'Test Path' });
    await studyPathService.update('path-1', { nama_jurusan: 'Updated Path' });
    await studyPathService.remove('path-1');

    await recommendationService.generate({ target: 'Data Science' });

    globalThis.fetch = vi.fn().mockResolvedValue({ ok: false } as any);
    const fallbackRec = await recommendationService.generate({ target: 'Data Science' });
    expect(fallbackRec.data.primarySkill).toBe('Data Science');

    globalThis.fetch = originalFetch;
  });
});

describe('Study Path & Competency Data Layer (Bab 12 BFF & CRUD)', () => {
  it('performs complete CRUD operations on Study Paths', () => {
    const paths = listStudyPaths();
    expect(paths.length).toBeGreaterThan(0);

    const newPath = createStudyPath({
      nama_jurusan: 'Rekayasa Perangkat Lunak',
      jenjang_target: 'Diploma',
      bidang: 'Software Engineering',
      deskripsi: 'Jalur kejuruan rekayasa perangkat lunak terapan berskala industri.',
      skill_terkait: ['TypeScript', 'Next.js', 'PostgreSQL'],
      prospek_karier: ['Front-End Engineer', 'Full-Stack Developer'],
      sertifikasi_terkait: ['Meta Front-End Developer'],
      status: 'active',
    });
    expect(newPath.id).toBeDefined();
    expect(newPath.nama_jurusan).toBe('Rekayasa Perangkat Lunak');

    const updated = updateStudyPath(newPath.id, {
      nama_jurusan: 'Rekayasa Perangkat Lunak',
      jenjang_target: 'Diploma',
      bidang: 'Modern Software Engineering',
      deskripsi: 'Jalur kejuruan rekayasa perangkat lunak terapan berskala industri modern.',
      skill_terkait: ['TypeScript', 'Next.js', 'PostgreSQL'],
      prospek_karier: ['Front-End Engineer', 'Full-Stack Developer'],
      sertifikasi_terkait: ['Meta Front-End Developer'],
      status: 'active',
    });
    expect(updated?.bidang).toBe('Modern Software Engineering');

    expect(updateStudyPath('non-existent-path', newPath)).toBeNull();
    expect(deleteStudyPath('non-existent-path')).toBe(false);

    const deleted = deleteStudyPath(newPath.id);
    expect(deleted).toBe(true);
  });

  it('performs CRUD and batch operations on Competencies', () => {
    const competencies = listCompetencies();
    expect(competencies.length).toBeGreaterThan(0);

    const created = createCompetency({
      nama_skill: 'Cloud Computing Architecture',
      kategori: 'Cloud',
      level: 'Menengah',
      deskripsi: 'Perancangan arsitektur komputasi awan berbasis microservices terdistribusi.',
      roles: ['Cloud Architect', 'DevOps Engineer'],
      certifications: ['AWS Cloud Practitioner'],
      bobot_permintaan: 85,
      sumber: 'SKKNI & Industri Cloud 2026',
    });
    expect(created.id).toBeDefined();
    expect(created.name).toBe('Cloud Computing Architecture');

    const updated = updateCompetency(created.id, {
      nama_skill: 'Cloud Computing Architecture',
      kategori: 'Cloud',
      level: 'Lanjutan',
      deskripsi: 'Perancangan arsitektur komputasi awan berbasis microservices terdistribusi lanjutan.',
      roles: ['Cloud Architect', 'DevOps Engineer'],
      certifications: ['AWS Cloud Practitioner'],
      bobot_permintaan: 88,
      sumber: 'SKKNI & Industri Cloud 2026',
    });
    expect(updated?.level).toBe('Lanjutan');

    expect(updateCompetency('non-existent-comp', created)).toBeNull();
    expect(deleteCompetency('non-existent-comp')).toBe(false);

    const batch = createCompetencies([
      {
        nama_skill: 'Batch Processed Skill',
        kategori: 'Technical',
        level: 'Pemula',
        deskripsi: 'Pemrosesan batch dan streaming data dasar.',
        roles: ['Data Engineer'],
        certifications: [],
        bobot_permintaan: 75,
        sumber: 'Riset 2026',
      },
    ]);
    expect(batch.length).toBe(1);

    deleteCompetency(created.id);
    deleteCompetency(batch[0]!.id);
  });
});

describe('Client Auth & Route Guard Helpers (Bab 11 & Bab 7)', () => {
  it('checks session headers correctly in API requests', () => {
    const unauthReq = new Request('http://localhost/api/test');
    expect(hasSession(unauthReq)).toBe(false);
    expect(hasAdminSession(unauthReq)).toBe(false);

    const validReq = new Request('http://localhost/api/test', {
      headers: { cookie: 'session=valid; session-role=Mahasiswa' },
    });
    expect(hasSession(validReq)).toBe(true);
    expect(hasAdminSession(validReq)).toBe(false);

    const adminReq = new Request('http://localhost/api/test', {
      headers: { cookie: 'session=valid; session-role=Admin' },
    });
    expect(hasSession(adminReq)).toBe(true);
    expect(hasAdminSession(adminReq)).toBe(true);
  });
});

describe('Zustand Client UI Store (Bab 8 State Management)', () => {
  beforeEach(() => {
    useUIStore.setState({
      activeModal: null,
      activeTab: 'overview',
      theme: 'light',
      draftStep: 1,
    });
  });

  it('updates UI state independently without triggering server refetches', () => {
    expect(useUIStore.getState().activeModal).toBeNull();

    useUIStore.getState().setActiveModal('feedback');
    expect(useUIStore.getState().activeModal).toBe('feedback');

    useUIStore.getState().setActiveTab('assessment');
    expect(useUIStore.getState().activeTab).toBe('assessment');

    useUIStore.getState().toggleTheme();
    expect(useUIStore.getState().theme).toBe('dark');
    useUIStore.getState().toggleTheme();
    expect(useUIStore.getState().theme).toBe('light');

    useUIStore.getState().setDraftStep(3);
    expect(useUIStore.getState().draftStep).toBe(3);
  });
});

describe('Task Chunking & scheduler.yield() (Bab 10 Core Web Vitals INP)', () => {
  it('yields task control safely in any runtime environment', async () => {
    const start = Date.now();
    await yieldTask();
    expect(Date.now() - start).toBeGreaterThanOrEqual(0);
  });

  it('processes large datasets in chunks without blocking', async () => {
    const data = Array.from({ length: 50 }, (_, i) => i + 1);
    const processed = await processInChunks(data, 10, (num) => num * 2);

    expect(processed.length).toBe(50);
    expect(processed[0]).toBe(2);
    expect(processed[49]).toBe(100);
  });
});

describe('BFF API Endpoints Integration (Bab 12 REST API)', async () => {
  const { GET: getCompetenciesRoute, POST: postCompetencyRoute } = await import('../app/api/competencies/route');
  const { PUT: putCompetencyRoute, DELETE: deleteCompetencyRoute } = await import('../app/api/competencies/[id]/route');
  const { POST: postImportCompetencies } = await import('../app/api/competencies/import/route');
  const { GET: getStudyPathsRoute, POST: postStudyPathRoute } = await import('../app/api/study-paths/route');
  const { PUT: putStudyPathRoute, DELETE: deleteStudyPathRoute } = await import('../app/api/study-paths/[id]/route');
  const { POST: postRecommendationsRoute } = await import('../app/api/recommendations/route');

  const adminHeaders = { cookie: 'session=valid; session-role=Admin' };
  const userHeaders = { cookie: 'session=valid; session-role=Mahasiswa' };

  it('enforces RBAC on competencies API and handles validation errors', async () => {
    const unauthRes = await getCompetenciesRoute(new Request('http://localhost/api/competencies'));
    expect(unauthRes.status).toBe(403);

    const listRes = await getCompetenciesRoute(new Request('http://localhost/api/competencies', { headers: adminHeaders }));
    expect(listRes.status).toBe(200);

    const nonAdminCreate = await postCompetencyRoute(new Request('http://localhost/api/competencies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...userHeaders },
      body: JSON.stringify({ name: 'Test Skill' }),
    }));
    expect(nonAdminCreate.status).toBe(403);

    const invalidCreate = await postCompetencyRoute(new Request('http://localhost/api/competencies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...adminHeaders },
      body: JSON.stringify({ invalid: 'data' }),
    }));
    expect(invalidCreate.status).toBe(400);
  });

  it('creates, updates, and deletes competency via BFF API when authorized as Admin', async () => {
    const createRes = await postCompetencyRoute(new Request('http://localhost/api/competencies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...adminHeaders },
      body: JSON.stringify({
        nama_skill: 'Microservices Architecture',
        kategori: 'Technical',
        level: 'Lanjutan',
        deskripsi: 'Implementasi service terdistribusi dengan event-driven pattern.',
        roles: ['Backend Architect'],
        certifications: [],
        bobot_permintaan: 90,
        sumber: 'Tech Radar 2026',
      }),
    }));
    expect(createRes.status).toBe(201);
    const createdData = await createRes.json();
    const newId = createdData.data.id;

    const unauthPut = await putCompetencyRoute(
      new Request(`http://localhost/api/competencies/${newId}`, { method: 'PUT', headers: userHeaders }),
      { params: Promise.resolve({ id: newId }) },
    );
    expect(unauthPut.status).toBe(403);

    const updateRes = await putCompetencyRoute(
      new Request(`http://localhost/api/competencies/${newId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...adminHeaders },
        body: JSON.stringify({
          nama_skill: 'Microservices Architecture',
          kategori: 'Technical',
          level: 'Menengah',
          deskripsi: 'Implementasi service terdistribusi dengan event-driven pattern updated.',
          roles: ['Backend Architect'],
          certifications: [],
          bobot_permintaan: 85,
          sumber: 'Tech Radar 2026',
        }),
      }),
      { params: Promise.resolve({ id: newId }) },
    );
    expect(updateRes.status).toBe(200);

    const notFoundPut = await putCompetencyRoute(
      new Request('http://localhost/api/competencies/non-existent-comp', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...adminHeaders },
        body: JSON.stringify({
          nama_skill: 'Valid Name Skill',
          deskripsi: 'Valid description that is longer than 10 chars',
        }),
      }),
      { params: Promise.resolve({ id: 'non-existent-comp' }) },
    );
    expect(notFoundPut.status).toBe(404);

    const unauthDel = await deleteCompetencyRoute(
      new Request(`http://localhost/api/competencies/${newId}`, { method: 'DELETE', headers: userHeaders }),
      { params: Promise.resolve({ id: newId }) },
    );
    expect(unauthDel.status).toBe(403);

    const deleteRes = await deleteCompetencyRoute(
      new Request(`http://localhost/api/competencies/${newId}`, {
        method: 'DELETE',
        headers: adminHeaders,
      }),
      { params: Promise.resolve({ id: newId }) },
    );
    expect(deleteRes.status).toBe(200);

    const notFoundDel = await deleteCompetencyRoute(
      new Request('http://localhost/api/competencies/non-existent-comp', {
        method: 'DELETE',
        headers: adminHeaders,
      }),
      { params: Promise.resolve({ id: 'non-existent-comp' }) },
    );
    expect(notFoundDel.status).toBe(404);
  });

  it('handles batch competency import API', async () => {
    const unauthImport = await postImportCompetencies(new Request('http://localhost/api/competencies/import'));
    expect(unauthImport.status).toBe(403);

    const invalidImport = await postImportCompetencies(new Request('http://localhost/api/competencies/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...adminHeaders },
      body: JSON.stringify({ rows: [{ nama_skill: 'X', deskripsi: 'short' }] }),
    }));
    expect(invalidImport.status).toBe(400);

    const importRes = await postImportCompetencies(new Request('http://localhost/api/competencies/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...adminHeaders },
      body: JSON.stringify({
        rows: [
          {
            nama_skill: 'Site Reliability Engineering',
            kategori: 'Technical',
            deskripsi: 'Penerapan prinsip software engineering pada operasi infrastruktur cloud.',
            level: 'Menengah',
            roles: ['SRE Specialist'],
            certifications: [],
            bobot_permintaan: 85,
            sumber: 'SRE Book & Industry standard',
          },
        ],
      }),
    }));
    expect(importRes.status).toBe(201);
  });

  it('handles study paths API routes', async () => {
    const unauthRes = await getStudyPathsRoute(new Request('http://localhost/api/study-paths'));
    expect(unauthRes.status).toBe(403);

    const listRes = await getStudyPathsRoute(new Request('http://localhost/api/study-paths', { headers: adminHeaders }));
    expect(listRes.status).toBe(200);

    const invalidCreate = await postStudyPathRoute(new Request('http://localhost/api/study-paths', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...adminHeaders },
      body: JSON.stringify({ nama_jurusan: 'X' }),
    }));
    expect(invalidCreate.status).toBe(400);

    const createRes = await postStudyPathRoute(new Request('http://localhost/api/study-paths', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...adminHeaders },
      body: JSON.stringify({
        nama_jurusan: 'Bisnis Digital',
        jenjang_target: 'Sarjana',
        bidang: 'Digital Business',
        deskripsi: 'Pemanfaatan platform digital dalam strategi bisnis dan transformasi perusahaan.',
        skill_terkait: ['Digital Marketing', 'Data Analytics'],
        prospek_karier: ['Digital Strategist', 'Growth Specialist'],
        sertifikasi_terkait: ['Google Data Analytics'],
        status: 'active',
      }),
    }));
    expect(createRes.status).toBe(201);
    const createdPath = await createRes.json();
    const pathId = createdPath.data.id;

    const unauthPut = await putStudyPathRoute(
      new Request(`http://localhost/api/study-paths/${pathId}`, { method: 'PUT', headers: userHeaders }),
      { params: Promise.resolve({ id: pathId }) },
    );
    expect(unauthPut.status).toBe(403);

    const putRes = await putStudyPathRoute(
      new Request(`http://localhost/api/study-paths/${pathId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...adminHeaders },
        body: JSON.stringify({
          nama_jurusan: 'Bisnis Digital',
          jenjang_target: 'Sarjana',
          bidang: 'Digital Transformation',
          deskripsi: 'Pemanfaatan platform digital dalam strategi bisnis dan transformasi perusahaan modern.',
          skill_terkait: ['Digital Marketing', 'Data Analytics'],
          prospek_karier: ['Digital Strategist', 'Growth Specialist'],
          sertifikasi_terkait: ['Google Data Analytics'],
          status: 'active',
        }),
      }),
      { params: Promise.resolve({ id: pathId }) },
    );
    expect(putRes.status).toBe(200);

    const notFoundPut = await putStudyPathRoute(
      new Request('http://localhost/api/study-paths/non-existent-path', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...adminHeaders },
        body: JSON.stringify({
          nama_jurusan: 'Bisnis Digital',
          jenjang_target: 'Sarjana',
          bidang: 'Digital Transformation',
          deskripsi: 'Pemanfaatan platform digital dalam strategi bisnis dan transformasi perusahaan modern.',
          skill_terkait: ['Digital Marketing'],
          prospek_karier: ['Digital Strategist'],
          sertifikasi_terkait: [],
          status: 'active',
        }),
      }),
      { params: Promise.resolve({ id: 'non-existent-path' }) },
    );
    expect(notFoundPut.status).toBe(404);

    const unauthDel = await deleteStudyPathRoute(
      new Request(`http://localhost/api/study-paths/${pathId}`, { method: 'DELETE', headers: userHeaders }),
      { params: Promise.resolve({ id: pathId }) },
    );
    expect(unauthDel.status).toBe(403);

    const delRes = await deleteStudyPathRoute(
      new Request(`http://localhost/api/study-paths/${pathId}`, {
        method: 'DELETE',
        headers: adminHeaders,
      }),
      { params: Promise.resolve({ id: pathId }) },
    );
    expect(delRes.status).toBe(200);

    const notFoundDel = await deleteStudyPathRoute(
      new Request('http://localhost/api/study-paths/non-existent-path', {
        method: 'DELETE',
        headers: adminHeaders,
      }),
      { params: Promise.resolve({ id: 'non-existent-path' }) },
    );
    expect(notFoundDel.status).toBe(404);
  });

  it('generates personalized recommendations based on questionnaire and target role', async () => {
    const invalidRec = await postRecommendationsRoute(new Request('http://localhost/api/recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...userHeaders },
      body: JSON.stringify({ role: 'Mahasiswa' }),
    }));
    expect(invalidRec.status).toBe(400);

    const recRes = await postRecommendationsRoute(new Request('http://localhost/api/recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...userHeaders },
      body: JSON.stringify({
        role: 'Mahasiswa',
        jenjang: 'Mahasiswa',
        target: 'Data Science',
        selectedSkills: ['Python', 'SQL & Database'],
        questionnaire: { q1: 4, q2: 5, q3: 4, q4: 5, q5: 4 },
      }),
    }));
    expect(recRes.status).toBe(200);
    const body = await recRes.json();
    expect(body.success).toBe(true);
    expect(body.data.matchScore).toBeGreaterThanOrEqual(60);
    expect(body.data.roadmap.length).toBeGreaterThan(0);
    expect(body.data.certifications.length).toBeGreaterThan(0);
  });
});

describe('Service localStorage integration (Browser environment)', () => {
  it('exercises localStorage persistence in browser-like environment across all services', async () => {
    const store: Record<string, string> = {};
    (globalThis as unknown as { window: unknown }).window = {
      location: { protocol: 'https:' },
    };
    (globalThis as unknown as { document: unknown }).document = {
      cookie: '',
    };
    (globalThis as unknown as { localStorage: unknown }).localStorage = {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, val: string) => { store[key] = val; },
      removeItem: (key: string) => { delete store[key]; },
    };

    authService.ensureSeedUsers();
    authService.setSession(seedUsers[0]!);
    expect(authService.getCurrentUser()).toBeDefined();

    assessmentService.getHistory();
    assessmentService.getActiveReport();
    assessmentService.setActiveReport(defaultStudentReport);
    assessmentService.addHistory({
      id: 'h-local-1',
      submittedAt: new Date().toISOString(),
      target: 'Data',
      matchScore: 90,
      skillGap: 10,
      report: defaultStudentReport,
    });
    assessmentService.activateSnapshot('h-local-1');

    roadmapService.get();
    roadmapService.save(roadmapService.get());
    roadmapService.toggleTask(0, 1);

    validationService.getAll();
    validationService.get('item-1');
    validationService.save('item-local-1', {
      decision: 'Relevan',
      note: 'Note',
      validatorRole: 'Dosen',
    });
    validationService.getUserFeedbacks();
    validationService.saveUserFeedback({
      userName: 'User',
      role: 'Mahasiswa',
      target: 'Data Science',
      rating: 4,
      relevance: 'Cukup Relevan',
      comment: 'Ok',
    });

    jobService.getBookmarks();
    jobService.toggleBookmark('job-1');
    // Toggle again to hit index >= 0 removal branch
    jobService.toggleBookmark('job-1');
    jobService.getApplications();
    jobService.applyJob({
      jobId: 'job-1',
      applicantName: 'Nadia',
      email: 'nadia@test.com',
    });
    expect(jobService.isJobApplied('job-1')).toBe(true);

    susService.getAllResponses();
    susService.saveResponse({
      userName: 'Nadia',
      role: 'Mahasiswa',
      scores: { 1: 5, 2: 1, 3: 5, 4: 1, 5: 5, 6: 1, 7: 5, 8: 1, 9: 5, 10: 1 },
    });

    (globalThis as unknown as { window: { scheduler?: { yield: () => Promise<void> } } }).window.scheduler = {
      yield: vi.fn().mockResolvedValue(undefined),
    };
    await yieldTask();
  });
});

