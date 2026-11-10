import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import 'assessment/assessment_screen.dart';
import 'home/dashboard_screen.dart';
import 'notification/notification_screen.dart';
import 'roadmap/roadmap_screen.dart';
import 'skill_gap/skill_gap_screen.dart';

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    final List<Widget> pages = [
      DashboardScreen(
        onNavigateToAssessment: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const AssessmentScreen()),
          );
        },
        onNavigateToSkillGap: () {
          setState(() {
            _currentIndex = 1;
          });
        },
        onNavigateToRoadmap: () {
          setState(() {
            _currentIndex = 2;
          });
        },
      ),
      const SkillGapScreen(),
      const RoadmapScreen(),
      const NotificationScreen(),
    ];

    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: pages,
      ),
      floatingActionButton: FloatingActionButton(
        elevation: 4,
        backgroundColor: AppColors.primary,
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const AssessmentScreen()),
          );
        },
        child: Container(
          width: 56,
          height: 56,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: AppColors.primaryGradient,
            boxShadow: [
              BoxShadow(
                color: AppColors.primary.withOpacity(0.4),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: const Icon(Icons.add_task_rounded, color: Colors.white, size: 26),
        ),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
      bottomNavigationBar: BottomAppBar(
        shape: const CircularNotchedRectangle(),
        notchMargin: 8,
        color: Colors.white,
        elevation: 10,
        child: SizedBox(
          height: 60,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildNavItem(index: 0, icon: Icons.home_rounded, label: 'Beranda'),
              _buildNavItem(index: 1, icon: Icons.insights_rounded, label: 'Skill Gap'),
              const SizedBox(width: 48), // gap for floating action button
              _buildNavItem(index: 2, icon: Icons.map_outlined, label: 'Roadmap'),
              _buildNavItem(index: 3, icon: Icons.notifications_outlined, label: 'Notifikasi'),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem({
    required int index,
    required IconData icon,
    required String label,
  }) {
    final isSelected = _currentIndex == index;
    return GestureDetector(
      onTap: () {
        setState(() {
          _currentIndex = index;
        });
      },
      behavior: HitTestBehavior.opaque,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            icon,
            size: 22,
            color: isSelected ? AppColors.primary : AppColors.muted,
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: TextStyle(
              fontSize: 10,
              fontWeight: isSelected ? FontWeight.w800 : FontWeight.w500,
              color: isSelected ? AppColors.primary : AppColors.muted,
            ),
          ),
        ],
      ),
    );
  }
}
