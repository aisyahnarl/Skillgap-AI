import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../data/models/assessment_model.dart';
import '../../widgets/stat_badge.dart';

class RoadmapScreen extends StatefulWidget {
  const RoadmapScreen({super.key});

  @override
  State<RoadmapScreen> createState() => _RoadmapScreenState();
}

class _RoadmapScreenState extends State<RoadmapScreen> {
  final AssessmentReport _report = AssessmentReport.sampleData();

  double get _overallProgress {
    int totalTasks = 0;
    int completedTasks = 0;
    for (var phase in _report.roadmap) {
      totalTasks += phase.tasks.length;
      completedTasks += phase.tasks.where((t) => t.isCompleted).length;
    }
    return totalTasks > 0 ? (completedTasks / totalTasks) : 0.25;
  }

  @override
  Widget build(BuildContext context) {
    final progressPercent = (_overallProgress * 100).toInt();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Roadmap Pembelajaran & Rekomendasi'),
      ),
      body: Container(
        decoration: const BoxDecoration(
          gradient: AppColors.backgroundGradient,
        ),
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Overall Progress Banner
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    gradient: AppColors.primaryGradient,
                    borderRadius: BorderRadius.circular(24),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.primary.withOpacity(0.3),
                        blurRadius: 16,
                        offset: const Offset(0, 6),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'PROGRES ROADMAP BELAJAR',
                            style: TextStyle(
                              color: Colors.white70,
                              fontSize: 10,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 1.2,
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(99),
                            ),
                            child: const Text(
                              'AI Personalized',
                              style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w800),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Text(
                        '$progressPercent% Selesai',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 28,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        'Target Jalur: ${_report.targetRole}',
                        style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w700),
                      ),
                      const SizedBox(height: 12),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(99),
                        child: LinearProgressIndicator(
                          value: _overallProgress,
                          minHeight: 8,
                          backgroundColor: Colors.white.withOpacity(0.3),
                          valueColor: const AlwaysStoppedAnimation<Color>(Colors.white),
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 20),

                // Roadmap 4 Phases List
                const Text(
                  'Tahapan Pembelajaran Bertahap',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w900,
                    color: AppColors.ink,
                  ),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Centang tugas yang telah kamu selesaikan untuk memperbarui progres.',
                  style: TextStyle(fontSize: 12, color: AppColors.muted),
                ),
                const SizedBox(height: 14),

                ..._report.roadmap.map((phase) {
                  final isDone = phase.status == 'Completed';
                  final isInProgress = phase.status == 'In Progress';

                  return Container(
                    margin: const EdgeInsets.only(bottom: 14),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: isInProgress ? AppColors.primary : AppColors.line,
                        width: isInProgress ? 1.5 : 1,
                      ),
                    ),
                    child: Theme(
                      data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
                      child: ExpansionTile(
                        initiallyExpanded: isInProgress,
                        tilePadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        leading: Container(
                          width: 40,
                          height: 40,
                          decoration: BoxDecoration(
                            color: isDone
                                ? AppColors.successLight
                                : isInProgress
                                    ? AppColors.primaryLight
                                    : AppColors.lineLight,
                            shape: BoxShape.circle,
                          ),
                          child: Center(
                            child: Icon(
                              isDone
                                  ? Icons.check
                                  : isInProgress
                                      ? Icons.play_arrow_rounded
                                      : Icons.lock_outline,
                              color: isDone
                                  ? AppColors.success
                                  : isInProgress
                                      ? AppColors.primary
                                      : AppColors.muted,
                              size: 20,
                            ),
                          ),
                        ),
                        title: Row(
                          children: [
                            Text(
                              phase.phase,
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w800,
                                color: isInProgress ? AppColors.primary : AppColors.muted,
                              ),
                            ),
                            const SizedBox(width: 8),
                            StatBadge.pill(
                              text: phase.duration,
                              color: AppColors.inkSubtle,
                              bg: AppColors.lineLight,
                            ),
                          ],
                        ),
                        subtitle: Padding(
                          padding: const EdgeInsets.only(top: 4),
                          child: Text(
                            phase.title,
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w900,
                              color: AppColors.ink,
                            ),
                          ),
                        ),
                        children: [
                          Padding(
                            padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFF8FAFC),
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(color: AppColors.line),
                                  ),
                                  child: Row(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      const Icon(Icons.flag_outlined, size: 16, color: AppColors.primary),
                                      const SizedBox(width: 8),
                                      Expanded(
                                        child: Text(
                                          'Goal: ${phase.goal}',
                                          style: const TextStyle(fontSize: 11, color: AppColors.inkSubtle, height: 1.4),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(height: 12),
                                const Text(
                                  'Daftar Tugas / Latihan:',
                                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppColors.ink),
                                ),
                                const SizedBox(height: 6),
                                ...phase.tasks.map((task) {
                                  return CheckboxListTile(
                                    contentPadding: EdgeInsets.zero,
                                    dense: true,
                                    activeColor: AppColors.primary,
                                    title: Text(
                                      task.title,
                                      style: TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w600,
                                        color: task.isCompleted ? AppColors.muted : AppColors.ink,
                                        decoration: task.isCompleted ? TextDecoration.lineThrough : null,
                                      ),
                                    ),
                                    value: task.isCompleted,
                                    onChanged: (val) {
                                      setState(() {
                                        task.isCompleted = val ?? false;
                                      });
                                    },
                                  );
                                }),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                }),

                const SizedBox(height: 16),

                // Rekomendasi Sertifikasi & Lisensi
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: AppColors.line),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Row(
                        children: [
                          Icon(Icons.workspace_premium_outlined, color: AppColors.primary, size: 20),
                          SizedBox(width: 8),
                          Text(
                            'Rekomendasi Sertifikasi Kunci',
                            style: TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: AppColors.ink),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        'Direkomendasikan untuk menunjang daya saing portofoliomu.',
                        style: TextStyle(fontSize: 11, color: AppColors.muted),
                      ),
                      const SizedBox(height: 14),

                      ..._report.certifications.map((cert) {
                        return Container(
                          margin: const EdgeInsets.only(bottom: 12),
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF8FAFC),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: AppColors.line),
                          ),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                width: 40,
                                height: 40,
                                decoration: BoxDecoration(
                                  color: AppColors.primaryLight,
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: const Center(
                                  child: Icon(Icons.school_outlined, color: AppColors.primary, size: 22),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Flexible(
                                          child: Text(
                                            cert.title,
                                            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: AppColors.ink),
                                          ),
                                        ),
                                        StatBadge.pill(
                                          text: '${cert.matchPercentage}% Cocok',
                                          color: AppColors.success,
                                          bg: AppColors.successLight,
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      cert.provider,
                                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.primary),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      cert.reason,
                                      style: const TextStyle(fontSize: 11, color: AppColors.muted),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        );
                      }),
                    ],
                  ),
                ),

                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
