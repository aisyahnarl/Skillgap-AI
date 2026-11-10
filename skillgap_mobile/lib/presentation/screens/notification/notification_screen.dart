import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../data/models/notification_model.dart';

class NotificationScreen extends StatefulWidget {
  const NotificationScreen({super.key});

  @override
  State<NotificationScreen> createState() => _NotificationScreenState();
}

class _NotificationScreenState extends State<NotificationScreen> {
  final List<AppNotification> _notifications = AppNotification.sampleNotifications();
  bool _onlyUnread = false;

  List<AppNotification> get _displayedNotifications {
    if (_onlyUnread) {
      return _notifications.where((n) => !n.isRead).toList();
    }
    return _notifications;
  }

  void _markAllAsRead() {
    setState(() {
      for (var n in _notifications) {
        n.isRead = true;
      }
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Semua notifikasi telah ditandai sebagai dibaca.'),
        backgroundColor: AppColors.primary,
      ),
    );
  }

  IconData _getIconForType(NotificationType type) {
    switch (type) {
      case NotificationType.assessmentReady:
        return Icons.auto_awesome;
      case NotificationType.roadmapReminder:
        return Icons.map_outlined;
      case NotificationType.jobOpportunity:
        return Icons.work_outline;
      case NotificationType.systemAlert:
        return Icons.verified_outlined;
    }
  }

  Color _getColorForType(NotificationType type) {
    switch (type) {
      case NotificationType.assessmentReady:
        return AppColors.primary;
      case NotificationType.roadmapReminder:
        return AppColors.warning;
      case NotificationType.jobOpportunity:
        return AppColors.success;
      case NotificationType.systemAlert:
        return AppColors.secondary;
    }
  }

  @override
  Widget build(BuildContext context) {
    final unreadCount = _notifications.where((n) => !n.isRead).length;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifikasi & Pengumuman'),
        actions: [
          if (unreadCount > 0)
            TextButton(
              onPressed: _markAllAsRead,
              child: const Text(
                'Tandai Dibaca',
                style: TextStyle(
                  color: AppColors.primary,
                  fontWeight: FontWeight.w700,
                  fontSize: 12,
                ),
              ),
            ),
        ],
      ),
      body: Container(
        decoration: const BoxDecoration(
          gradient: AppColors.backgroundGradient,
        ),
        child: SafeArea(
          child: Column(
            children: [
              // Filter bar
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Row(
                  children: [
                    FilterChip(
                      selected: !_onlyUnread,
                      label: Text('Semua (${_notifications.length})'),
                      selectedColor: AppColors.primary,
                      backgroundColor: Colors.white,
                      labelStyle: TextStyle(
                        color: !_onlyUnread ? Colors.white : AppColors.inkSubtle,
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                      ),
                      onSelected: (val) => setState(() => _onlyUnread = false),
                    ),
                    const SizedBox(width: 8),
                    FilterChip(
                      selected: _onlyUnread,
                      label: Text('Belum Dibaca ($unreadCount)'),
                      selectedColor: AppColors.primary,
                      backgroundColor: Colors.white,
                      labelStyle: TextStyle(
                        color: _onlyUnread ? Colors.white : AppColors.inkSubtle,
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                      ),
                      onSelected: (val) => setState(() => _onlyUnread = true),
                    ),
                  ],
                ),
              ),

              // Notifications List
              Expanded(
                child: _displayedNotifications.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Container(
                              padding: const EdgeInsets.all(20),
                              decoration: const BoxDecoration(
                                color: AppColors.primaryLight,
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(Icons.notifications_off_outlined, size: 48, color: AppColors.primary),
                            ),
                            const SizedBox(height: 16),
                            const Text(
                              'Tidak Ada Notifikasi',
                              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.ink),
                            ),
                            const SizedBox(height: 4),
                            const Text(
                              'Semua pemberitahuan telah diperiksa.',
                              style: TextStyle(fontSize: 12, color: AppColors.muted),
                            ),
                          ],
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        itemCount: _displayedNotifications.length,
                        itemBuilder: (context, index) {
                          final notif = _displayedNotifications[index];
                          final iconColor = _getColorForType(notif.type);

                          return Dismissible(
                            key: Key(notif.id),
                            direction: DismissDirection.endToStart,
                            background: Container(
                              alignment: Alignment.centerRight,
                              padding: const EdgeInsets.only(right: 20),
                              decoration: BoxDecoration(
                                color: AppColors.danger,
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: const Icon(Icons.delete_outline, color: Colors.white),
                            ),
                            onDismissed: (direction) {
                              setState(() {
                                _notifications.removeWhere((item) => item.id == notif.id);
                              });
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Notifikasi dihapus')),
                              );
                            },
                            child: GestureDetector(
                              onTap: () {
                                setState(() {
                                  notif.isRead = true;
                                });
                              },
                              child: Container(
                                margin: const EdgeInsets.only(bottom: 12),
                                padding: const EdgeInsets.all(16),
                                decoration: BoxDecoration(
                                  color: notif.isRead ? Colors.white : const Color(0xFFF5F7FF),
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(
                                    color: notif.isRead ? AppColors.line : const Color(0xFFC7D2FE),
                                    width: notif.isRead ? 1 : 1.5,
                                  ),
                                  boxShadow: [
                                    BoxShadow(
                                      color: AppColors.ink.withOpacity(0.02),
                                      blurRadius: 8,
                                      offset: const Offset(0, 2),
                                    ),
                                  ],
                                ),
                                child: Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Container(
                                      width: 44,
                                      height: 44,
                                      decoration: BoxDecoration(
                                        color: iconColor.withOpacity(0.12),
                                        borderRadius: BorderRadius.circular(14),
                                      ),
                                      child: Center(
                                        child: Icon(_getIconForType(notif.type), color: iconColor, size: 22),
                                      ),
                                    ),
                                    const SizedBox(width: 14),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Row(
                                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                            children: [
                                              Flexible(
                                                child: Text(
                                                  notif.title,
                                                  style: TextStyle(
                                                    fontSize: 13,
                                                    fontWeight: FontWeight.w900,
                                                    color: notif.isRead ? AppColors.ink : AppColors.primary,
                                                  ),
                                                ),
                                              ),
                                              if (!notif.isRead)
                                                Container(
                                                  width: 8,
                                                  height: 8,
                                                  decoration: const BoxDecoration(
                                                    color: AppColors.primary,
                                                    shape: BoxShape.circle,
                                                  ),
                                                ),
                                            ],
                                          ),
                                          const SizedBox(height: 4),
                                          Text(
                                            notif.message,
                                            style: const TextStyle(
                                              fontSize: 12,
                                              color: AppColors.inkSubtle,
                                              height: 1.4,
                                            ),
                                          ),
                                          const SizedBox(height: 8),
                                          const Text(
                                            'Baru saja',
                                            style: TextStyle(
                                              fontSize: 10,
                                              fontWeight: FontWeight.w600,
                                              color: AppColors.muted,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          );
                        },
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
