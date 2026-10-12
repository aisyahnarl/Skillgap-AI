import type { Metadata } from 'next';
import AssessmentForm from '../components/assessment-form';
import AiInfoBanner from '../components/ai-info-banner';

export const metadata: Metadata = {
  title: 'Assessment | SkillGap.AI',
  description: 'Form AI assessment untuk personalisasi rekomendasi skill gap',
};

export default function AssessmentPage() {
  return (
    <div>
      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 lg:px-8">
        <AiInfoBanner compact={true} />
      </div>
      <AssessmentForm />
    </div>
  );
}
