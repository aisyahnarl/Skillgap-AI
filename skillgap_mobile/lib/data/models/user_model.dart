enum UserRole {
  mahasiswa,
  pelajar,
  dosen,
  guruBk,
}

enum EducationLevel {
  mahasiswa,
  pelajarSmaSmk,
  dosenPembimbing,
  guruBk,
}

class UserModel {
  final String id;
  final String name;
  final String email;
  final UserRole role;
  final EducationLevel jenjang;
  final String? school;
  final String? major;
  final DateTime? birthDate;
  final bool parentalConsent;

  UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    required this.jenjang,
    this.school,
    this.major,
    this.birthDate,
    this.parentalConsent = false,
  });

  bool get isMinor {
    if (birthDate == null) return false;
    final age = DateTime.now().difference(birthDate!).inDays ~/ 365;
    return age < 18;
  }

  String get roleDisplayName {
    switch (role) {
      case UserRole.mahasiswa:
        return 'Mahasiswa';
      case UserRole.pelajar:
        return 'Pelajar SMA/SMK';
      case UserRole.dosen:
        return 'Dosen';
      case UserRole.guruBk:
        return 'Guru BK';
    }
  }

  String get jenjangDisplayName {
    switch (jenjang) {
      case EducationLevel.mahasiswa:
        return 'Perguruan Tinggi (Mahasiswa)';
      case EducationLevel.pelajarSmaSmk:
        return 'Pelajar SMA-SMK Sederajat';
      case EducationLevel.dosenPembimbing:
        return 'Dosen Pembimbing';
      case EducationLevel.guruBk:
        return 'Guru BK';
    }
  }
}
