enum NotificationType {
  assessmentReady,
  roadmapReminder,
  jobOpportunity,
  systemAlert,
}

class AppNotification {
  final String id;
  final String title;
  final String message;
  final DateTime timestamp;
  final NotificationType type;
  bool isRead;

  AppNotification({
    required this.id,
    required this.title,
    required this.message,
    required this.timestamp,
    required this.type,
    this.isRead = false,
  });

  static List<AppNotification> sampleNotifications() {
    return [
      AppNotification(
        id: '1',
        title: 'Hasil Analisis AI Selesai!',
        message: 'Pemetaan skill gap dan peta minat untuk target Data Science telah rampung dianalisis oleh AI Engine.',
        timestamp: DateTime.now().subtract(const Duration(minutes: 25)),
        type: NotificationType.assessmentReady,
      ),
      AppNotification(
        id: '2',
        title: 'Roadmap Belajar Minggu Ini',
        message: 'Tahap 1: Saatnya menyelesaikan modul "SQL & Data Cleaning". Yuk lanjutkan progres belajarmu!',
        timestamp: DateTime.now().subtract(const Duration(hours: 3)),
        type: NotificationType.roadmapReminder,
      ),
      AppNotification(
        id: '3',
        title: 'Rekomendasi Lowongan Baru 💼',
        message: 'Ditemukan 3 lowongan magang Data Analyst di Shopee & Tokopedia dengan tingkat kecocokan 92%.',
        timestamp: DateTime.now().subtract(const Duration(days: 1)),
        type: NotificationType.jobOpportunity,
      ),
      AppNotification(
        id: '4',
        title: 'Validasi Kurikulum Dosen',
        message: 'Dosen Pembimbing telah memvalidasi relevansi roadmap belajarmu dengan silabus perkuliahan.',
        timestamp: DateTime.now().subtract(const Duration(days: 2)),
        type: NotificationType.systemAlert,
        isRead: true,
      ),
    ];
  }
}
