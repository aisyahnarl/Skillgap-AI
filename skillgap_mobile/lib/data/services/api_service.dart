import 'dart:convert';
import 'dart:io';

class ApiConfig {
  // Gunakan 10.0.2.2 untuk Android Emulator, atau localhost untuk Web / Desktop Windows
  static String get baseUrl {
    if (Platform.isAndroid) {
      return 'http://10.0.2.2:8000';
    }
    return 'http://127.0.0.1:8000';
  }
}

class ApiService {
  static final HttpClient _client = HttpClient()
    ..connectionTimeout = const Duration(seconds: 4);

  /// Cek status konektivitas ke server FastAPI backend
  static Future<bool> checkHealth() async {
    try {
      final uri = Uri.parse('${ApiConfig.baseUrl}/');
      final request = await _client.getUrl(uri);
      final response = await request.close();
      return response.statusCode == 200;
    } catch (_) {
      return false;
    }
  }

  /// Autentikasi Pengguna (Login)
  static Future<Map<String, dynamic>?> login(String email, String password) async {
    try {
      final uri = Uri.parse('${ApiConfig.baseUrl}/api/login');
      final request = await _client.postUrl(uri);
      request.headers.set('Content-Type', 'application/json');
      request.write(jsonEncode({'email': email, 'password': password}));
      
      final response = await request.close();
      if (response.statusCode == 200) {
        final responseBody = await response.transform(utf8.decoder).join();
        return jsonDecode(responseBody) as Map<String, dynamic>;
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  /// Pendaftaran Akun Pengguna Baru (Register)
  static Future<Map<String, dynamic>?> register({
    required String name,
    required String email,
    required String password,
    required String role,
    required String jenjang,
    String? birthDate,
    int? age,
    bool parentalConsent = false,
  }) async {
    try {
      final uri = Uri.parse('${ApiConfig.baseUrl}/api/register');
      final request = await _client.postUrl(uri);
      request.headers.set('Content-Type', 'application/json');
      request.write(jsonEncode({
        'name': name,
        'email': email,
        'password': password,
        'role': role,
        'jenjang': jenjang,
        'birthDate': birthDate,
        'age': age,
        'parentalConsent': parentalConsent,
      }));

      final response = await request.close();
      if (response.statusCode == 200) {
        final responseBody = await response.transform(utf8.decoder).join();
        return jsonDecode(responseBody) as Map<String, dynamic>;
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  /// Pengambilan Statistik Dashboard Real-time
  static Future<Map<String, dynamic>?> getDashboardStats() async {
    try {
      final uri = Uri.parse('${ApiConfig.baseUrl}/api/dashboard');
      final request = await _client.getUrl(uri);
      final response = await request.close();
      if (response.statusCode == 200) {
        final responseBody = await response.transform(utf8.decoder).join();
        return jsonDecode(responseBody) as Map<String, dynamic>;
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  /// Penyimpanan Progres Roadmap Belajar ke PostgreSQL
  static Future<bool> syncRoadmapProgress({
    required int userId,
    required int progressPercentage,
    String currentPhase = 'Phase 1',
    String status = 'In Progress',
  }) async {
    try {
      final uri = Uri.parse('${ApiConfig.baseUrl}/api/roadmaps/progress');
      final request = await _client.postUrl(uri);
      request.headers.set('Content-Type', 'application/json');
      request.write(jsonEncode({
        'user_id': userId,
        'progress_percentage': progressPercentage,
        'current_phase': currentPhase,
        'status': status,
      }));

      final response = await request.close();
      return response.statusCode == 200;
    } catch (_) {
      return false;
    }
  }
}
