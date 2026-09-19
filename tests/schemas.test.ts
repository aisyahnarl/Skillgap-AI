import { describe, expect, it } from 'vitest';
import { GET, POST } from '../app/api/assessments/route';
import {
  assessmentInputSchema,
  assessmentResponseSchema,
  createAssessmentSchema,
} from '../app/lib/schemas';

describe('assessment schemas', () => {
  it('accepts a valid assessment response item', () => {
    const result = assessmentInputSchema.safeParse({
      id: 'assessment-1',
      name: 'Ayu Lestari',
      category: 'Mahasiswa',
      target: 'Data Science',
      match: '89%',
      status: 'valid',
    });

    expect(result.success).toBe(true);
  });

  it('rejects invalid status and short target', () => {
    const result = assessmentInputSchema.safeParse({
      id: 'assessment-1',
      name: 'Ayu Lestari',
      category: 'Mahasiswa',
      target: 'AI',
      match: '89%',
      status: 'unknown',
    });

    expect(result.success).toBe(false);
  });

  it('validates an API response list', () => {
    const result = assessmentResponseSchema.safeParse([
      {
        id: 'assessment-1',
        name: 'Ayu Lestari',
        category: 'Mahasiswa',
        target: 'Data Science',
        match: '89%',
        status: 'valid',
      },
    ]);

    expect(result.success).toBe(true);
  });

  it('accepts only client-owned create fields', () => {
    const result = createAssessmentSchema.safeParse({
      name: 'Budi Santoso',
      category: 'Mahasiswa',
      target: 'Cyber Security',
    });

    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toEqual({
      name: 'Budi Santoso',
      category: 'Mahasiswa',
      target: 'Cyber Security',
    });
  });
});

describe('assessment BFF route', () => {
  it('rejects requests without a session', () => {
    const response = GET(new Request('http://localhost/api/assessments'));
    expect(response.status).toBe(401);
  });

  it('rejects POST requests without a session', async () => {
    const response = await POST(new Request('http://localhost/api/assessments', {
      method: 'POST',
      body: JSON.stringify({ name: 'Budi Santoso', category: 'Mahasiswa', target: 'Cyber Security' }),
    }));
    expect(response.status).toBe(401);
  });

  it('returns validated assessment data', async () => {
    const response = GET(new Request('http://localhost/api/assessments', {
      headers: { cookie: 'session=valid' },
    }));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
  });

  it('creates an assessment from a valid request', async () => {
    const response = await POST(new Request('http://localhost/api/assessments', {
      method: 'POST',
      body: JSON.stringify({ name: 'Budi Santoso', category: 'Mahasiswa', target: 'Cyber Security' }),
      headers: { 'Content-Type': 'application/json', cookie: 'session=valid' },
    }));

    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.data.status).toBe('review');
  });

  it('rejects an invalid request', async () => {
    const response = await POST(new Request('http://localhost/api/assessments', {
      method: 'POST',
      body: JSON.stringify({ name: 'X' }),
      headers: { 'Content-Type': 'application/json', cookie: 'session=valid' },
    }));

    expect(response.status).toBe(400);
  });
});

describe('System Usability Scale (SUS) service & feedback stats', () => {
  it('calculates standard SUS score with odd and even rules correctly', async () => {
    const { susService } = await import('../app/services/sus-service');

    // All max positive: odd = 5 (contribution 4), even = 1 (contribution 4)
    // 10 * 4 * 2.5 = 100
    const perfectScores: Record<number, number> = {
      1: 5, 2: 1, 3: 5, 4: 1, 5: 5, 6: 1, 7: 5, 8: 1, 9: 5, 10: 1,
    };
    const perfectResult = susService.calculateScore(perfectScores);
    expect(perfectResult.score).toBe(100);
    expect(perfectResult.grade).toBe('Excellent (> 80.3)');

    // Realistic score: 10 * 3.5 * 2.5 = 87.5
    const realisticScores: Record<number, number> = {
      1: 5, 2: 2, 3: 5, 4: 1, 5: 5, 6: 1, 7: 5, 8: 1, 9: 4, 10: 2,
    };
    const realisticResult = susService.calculateScore(realisticScores);
    expect(realisticResult.score).toBe(92.5);
    expect(realisticResult.grade).toBe('Excellent (> 80.3)');

    // Lower score below 68 -> Marginal
    const lowScores: Record<number, number> = {
      1: 2, 2: 4, 3: 2, 4: 4, 5: 2, 6: 4, 7: 2, 8: 4, 9: 2, 10: 4,
    };
    const lowResult = susService.calculateScore(lowScores);
    expect(lowResult.score).toBeLessThan(68);
    expect(lowResult.grade).toBe('Marginal (< 68)');
  });

  it('aggregates validation service user feedback stats', async () => {
    const { validationService } = await import('../app/services/validation-service');
    const stats = validationService.getFeedbackStats();
    expect(stats.total).toBeGreaterThan(0);
    expect(stats.averageRating).toBeGreaterThanOrEqual(1);
    expect(stats.averageRating).toBeLessThanOrEqual(5);
    expect(stats.relevanceRate).toBeGreaterThanOrEqual(0);
    expect(stats.relevanceRate).toBeLessThanOrEqual(100);
  });
});

describe('Career Vacancies & Assessment Matching Service (jobService)', () => {
  it('retrieves all curated jobs in catalog', async () => {
    const { jobService } = await import('../app/services/job-service');
    const jobs = jobService.getAll();
    expect(jobs.length).toBeGreaterThanOrEqual(10);
    expect(jobs.some((j) => j.company.includes('Tokopedia'))).toBe(true);
    expect(jobs.some((j) => j.category === 'Data Science')).toBe(true);
  });

  it('matches jobs accurately against student assessment report', async () => {
    const { jobService } = await import('../app/services/job-service');
    const { defaultStudentReport } = await import('../app/services/assessment-service');

    const matchedJobs = jobService.getMatchedJobs(defaultStudentReport);
    expect(matchedJobs.length).toBeGreaterThan(0);

    // Top job for Data Science report should have high match
    const topJob = matchedJobs[0];
    expect(topJob).toBeDefined();
    if (topJob) {
      expect(topJob.matchPercentage).toBeGreaterThanOrEqual(80);
      expect(topJob.category).toBe('Data Science');
      expect(topJob.matchedSkills.length).toBeGreaterThan(0);
      expect(topJob.whyFit).toBeDefined();
      expect(topJob.roadmapAdvice).toBeDefined();
    }
  });

  it('handles job applications and records applicant details', async () => {
    const { jobService } = await import('../app/services/job-service');
    const app = jobService.applyJob({
      jobId: 'job-data-1',
      applicantName: 'Nadia Amalia',
      email: 'nadia@test.com',
      cvName: 'CV_Nadia.pdf',
      notes: 'Sangat antusias pada posisi ini.',
    });

    expect(app.id).toBeDefined();
    expect(app.applicantName).toBe('Nadia Amalia');
    expect(app.status).toBe('Lamaran Terkirim');
    expect(app.jobId).toBe('job-data-1');
  });
});

