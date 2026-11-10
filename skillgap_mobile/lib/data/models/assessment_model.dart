enum SkillStatus { strong, developing, gap }

class SkillMetric {
  final String name;
  final String category;
  final int current;
  final int required;
  final int gap;
  final SkillStatus status;

  SkillMetric({
    required this.name,
    required this.category,
    required this.current,
    required this.required,
    required this.gap,
    required this.status,
  });
}

class RoadmapTask {
  final String title;
  bool isCompleted;

  RoadmapTask({required this.title, this.isCompleted = false});
}

class RoadmapPhase {
  final String phase;
  final String title;
  final String goal;
  final String duration;
  final List<RoadmapTask> tasks;
  final String status; // 'Completed', 'In Progress', 'Not Started'

  RoadmapPhase({
    required this.phase,
    required this.title,
    required this.goal,
    required this.duration,
    required this.tasks,
    required this.status,
  });

  double get progress {
    if (tasks.isEmpty) return 0.0;
    final done = tasks.where((t) => t.isCompleted).length;
    return done / tasks.length;
  }
}

class CertificationRecommendation {
  final String title;
  final String provider;
  final String reason;
  final int matchPercentage;

  CertificationRecommendation({
    required this.title,
    required this.provider,
    required this.reason,
    required this.matchPercentage,
  });
}

class AssessmentReport {
  final String targetRole;
  final int matchScore;
  final int skillGap;
  final List<String> strengths;
  final List<String> gaps;
  final List<SkillMetric> skillMetrics;
  final List<RoadmapPhase> roadmap;
  final List<CertificationRecommendation> certifications;

  AssessmentReport({
    required this.targetRole,
    required this.matchScore,
    required this.skillGap,
    required this.strengths,
    required this.gaps,
    required this.skillMetrics,
    required this.roadmap,
    required this.certifications,
  });

  static AssessmentReport sampleData() {
    return AssessmentReport(
      targetRole: 'Data Science',
      matchScore: 87,
      skillGap: 18,
      strengths: [
        'Analisis data dan pengambilan insight',
        'Kecenderungan logis dan kuantitatif',
        'Kemampuan memahami pola dari dataset',
      ],
      gaps: [
        'Diperlukan penguatan SQL, statistik, dan visualisasi insight',
        'Perlu projek end-to-end dari dataset ke dashboard',
        'Harus meningkatkan kemampuan komunikasi hasil analisis',
      ],
      skillMetrics: [
        SkillMetric(
          name: 'Python & Pandas',
          category: 'Teknis',
          current: 78,
          required: 90,
          gap: 12,
          status: SkillStatus.developing,
        ),
        SkillMetric(
          name: 'SQL & Query Relasional',
          category: 'Teknis',
          current: 60,
          required: 85,
          gap: 25,
          status: SkillStatus.gap,
        ),
        SkillMetric(
          name: 'Data Visualization & BI',
          category: 'Teknis',
          current: 65,
          required: 80,
          gap: 15,
          status: SkillStatus.developing,
        ),
        SkillMetric(
          name: 'Pemecahan Masalah & Logika',
          category: 'Interpersonal',
          current: 88,
          required: 80,
          gap: 0,
          status: SkillStatus.strong,
        ),
        SkillMetric(
          name: 'Storytelling & Presentasi Insight',
          category: 'Interpersonal',
          current: 82,
          required: 80,
          gap: 0,
          status: SkillStatus.strong,
        ),
      ],
      roadmap: [
        RoadmapPhase(
          phase: 'Tahap 1',
          title: 'SQL & Data Cleaning',
          goal: 'Menguasai query agregat, CTE, window functions, dan handling missing values.',
          duration: '4 Minggu',
          status: 'In Progress',
          tasks: [
            RoadmapTask(title: 'Selesaikan kursus dasar SQL query & join', isCompleted: true),
            RoadmapTask(title: 'Praktik query window function di HackerRank / LeetCode', isCompleted: false),
            RoadmapTask(title: 'Pembersihan dataset real-world kotor di Python', isCompleted: false),
          ],
        ),
        RoadmapPhase(
          phase: 'Tahap 2',
          title: 'Python for Exploratory Data Analysis',
          goal: 'Mahir memanfaatkan pandas, numpy, seaborn, dan statistik deskriptif.',
          duration: '6 Minggu',
          status: 'Not Started',
          tasks: [
            RoadmapTask(title: 'Analisis korelasi dan distribusi dataset bisnis', isCompleted: false),
            RoadmapTask(title: 'Membuat modul python reusable untuk preprocessing', isCompleted: false),
          ],
        ),
        RoadmapPhase(
          phase: 'Tahap 3',
          title: 'Interactive Dashboard & BI',
          goal: 'Membangun dashboard business intelligence yang komunikatif untuk stakeholder.',
          duration: '5 Minggu',
          status: 'Not Started',
          tasks: [
            RoadmapTask(title: 'Buat dashboard interaktif dengan Power BI / Streamlit', isCompleted: false),
            RoadmapTask(title: 'Dokumentasikan insight dan rekomendasi bisnis', isCompleted: false),
          ],
        ),
        RoadmapPhase(
          phase: 'Tahap 4',
          title: 'Portofolio Akhir & Case Study',
          goal: 'Menyusun project portfolio end-to-end yang siap dipresentasikan ke HR.',
          duration: '6 Minggu',
          status: 'Not Started',
          tasks: [
            RoadmapTask(title: 'Upload kode ke GitHub dengan README komprehensif', isCompleted: false),
            RoadmapTask(title: 'Publikasi artikel ringkasan di Medium / LinkedIn', isCompleted: false),
          ],
        ),
      ],
      certifications: [
        CertificationRecommendation(
          title: 'Google Data Analytics Professional',
          provider: 'Coursera / Google',
          reason: 'Linear dengan pipeline analisis data dan dashboarding bisnis',
          matchPercentage: 92,
        ),
        CertificationRecommendation(
          title: 'Microsoft Certified: Power BI Data Analyst (PL-300)',
          provider: 'Microsoft',
          reason: 'Sangat diminati untuk visualisasi data dan business intelligence perusahaan',
          matchPercentage: 88,
        ),
        CertificationRecommendation(
          title: 'SQL for Data Science',
          provider: 'IBM',
          reason: 'Membantu menutup gap SQL dan manipulasi basis data relasional',
          matchPercentage: 85,
        ),
      ],
    );
  }
}
