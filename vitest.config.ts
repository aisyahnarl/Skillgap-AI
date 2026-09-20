import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: [
        'app/api/**/*.ts',
        'app/lib/auth.ts',
        'app/lib/competencies.ts',
        'app/lib/schemas.ts',
        'app/lib/study-paths.ts',
        'app/lib/task-scheduler.ts',
        'app/services/assessment-service.ts',
        'app/services/auth-service.ts',
        'app/services/certification-service.ts',
        'app/services/competency-service.ts',
        'app/services/job-service.ts',
        'app/services/recommendation-service.ts',
        'app/services/roadmap-service.ts',
        'app/services/study-path-service.ts',
        'app/services/sus-service.ts',
        'app/services/validation-service.ts',
        'app/stores/**/*.ts',
        'src/schemas.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        statements: 80,
        branches: 80,
      },
    },
  },
});
