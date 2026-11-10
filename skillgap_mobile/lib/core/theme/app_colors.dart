import 'package:flutter/material.dart';

class AppColors {
  // Brand Colors matching https://skillgap-ai-kappa.vercel.app/
  static const Color primary = Color(0xFF4F46E5); // Indigo 600
  static const Color primaryDark = Color(0xFF3730A3); // Indigo 800
  static const Color primaryLight = Color(0xFFEEF2FF); // Indigo 50
  static const Color secondary = Color(0xFF0EA5E9); // Sky 500
  static const Color secondaryLight = Color(0xFFF0F9FF); // Sky 50

  // Semantic
  static const Color success = Color(0xFF059669); // Emerald 600
  static const Color successLight = Color(0xFFECFDF5);
  static const Color warning = Color(0xFFD97706); // Amber 600
  static const Color warningLight = Color(0xFFFFFBEB);
  static const Color danger = Color(0xFFDC2626); // Red 600
  static const Color dangerLight = Color(0xFFFEF2F2);

  // Neutrals
  static const Color ink = Color(0xFF0F172A); // Slate 900
  static const Color inkSubtle = Color(0xFF334155); // Slate 700
  static const Color muted = Color(0xFF64748B); // Slate 500
  static const Color line = Color(0xFFE2E8F0); // Slate 200
  static const Color lineLight = Color(0xFFF1F5F9);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color canvas = Color(0xFFF8FAFC);

  // Gradients
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [primary, secondary],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient heroGradient = LinearGradient(
    colors: [Color(0xFF4338CA), Color(0xFF0284C7)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient backgroundGradient = LinearGradient(
    colors: [Color(0xFFF8FAFC), Color(0xFFEEF4FF), Color(0xFFF8FAFC)],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );
}
