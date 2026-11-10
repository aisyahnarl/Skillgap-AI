import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../data/models/assessment_model.dart';

class StatBadge extends StatelessWidget {
  final String label;
  final Color backgroundColor;
  final Color textColor;

  const StatBadge({
    super.key,
    required this.label,
    required this.backgroundColor,
    required this.textColor,
  });

  factory StatBadge.fromSkillStatus(SkillStatus status) {
    switch (status) {
      case SkillStatus.strong:
        return const StatBadge(
          label: 'Kuat / Siap',
          backgroundColor: AppColors.successLight,
          textColor: AppColors.success,
        );
      case SkillStatus.developing:
        return const StatBadge(
          label: 'Cukup / Berkembang',
          backgroundColor: AppColors.warningLight,
          textColor: AppColors.warning,
        );
      case SkillStatus.gap:
        return const StatBadge(
          label: 'Perlu Ditingkatkan',
          backgroundColor: AppColors.dangerLight,
          textColor: AppColors.danger,
        );
    }
  }

  factory StatBadge.pill({required String text, required Color color, required Color bg}) {
    return StatBadge(
      label: text,
      backgroundColor: bg,
      textColor: color,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(99),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: textColor,
          fontSize: 11,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}
