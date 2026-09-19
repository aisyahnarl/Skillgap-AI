import type { Metadata } from 'next';
import AssessmentForm from '../components/assessment-form';

export const metadata: Metadata = {
  title: 'Assessment | SkillGap.AI',
  description: 'Form AI assessment untuk personalisasi rekomendasi skill gap',
};

export default function AssessmentPage() {
  return <AssessmentForm />;
}
