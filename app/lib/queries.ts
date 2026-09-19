import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { assessmentResponseSchema, createAssessmentSchema, type AssessmentInput } from './schemas';

const fetchAssessments = async (): Promise<AssessmentInput[]> => {
  const response = await fetch('/api/assessments');
  if (!response.ok) throw new Error('Assessment tidak bisa dimuat.');

  const payload: unknown = await response.json();
  return assessmentResponseSchema.parse((payload as { data: unknown }).data);
};

export function useAssessmentQuery() {
  return useQuery({
    queryKey: ['assessments'],
    queryFn: fetchAssessments,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useCoursesQuery() {
  return useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return z.array(
        z.object({
          id: z.string(),
          title: z.string(),
          category: z.string(),
          level: z.string(),
        }),
      ).parse([
        { id: 'c1', title: 'Data Science Fundamentals', category: 'Data Science', level: 'Beginner' },
        { id: 'c2', title: 'Product Design Sprint', category: 'UI/UX', level: 'Advanced' },
      ]);
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useCreateAssessmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: z.infer<typeof createAssessmentSchema>) => {
      const response = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Assessment tidak bisa dibuat.');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments'] });
    },
  });
}
