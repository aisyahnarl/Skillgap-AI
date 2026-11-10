import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/custom_text_field.dart';
import '../main_screen.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _birthDateController = TextEditingController();

  String _selectedRole = 'Mahasiswa';
  String _selectedJenjang = 'Mahasiswa';
  bool _parentalConsent = false;
  bool _isLoading = false;
  String? _errorMessage;

  final List<String> _roles = ['Mahasiswa', 'Pelajar', 'Dosen', 'Guru BK'];
  final List<String> _jenjangList = [
    'Mahasiswa',
    'Pelajar SMA-SMK Sederajat',
    'Dosen Pembimbing',
    'Guru BK',
  ];

  bool get _isPelajar => _selectedRole == 'Pelajar' || _selectedJenjang.contains('Pelajar');

  void _handleRegister() async {
    final name = _nameController.text.trim();
    final email = _emailController.text.trim();
    final password = _passwordController.text.trim();

    if (name.isEmpty || email.isEmpty || password.isEmpty) {
      setState(() {
        _errorMessage = 'Semua field wajib diisi.';
      });
      return;
    }

    if (password.length < 8) {
      setState(() {
        _errorMessage = 'Kata sandi minimal 8 karakter.';
      });
      return;
    }

    if (_isPelajar && !_parentalConsent) {
      setState(() {
        _errorMessage = 'Persetujuan orang tua/wali wajib dicentang untuk pengguna pelajar (UU PDP No. 27/2022).';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    await Future.delayed(const Duration(milliseconds: 600));

    if (mounted) {
      setState(() {
        _isLoading = false;
      });

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Pendaftaran berhasil! Selamat datang di SkillGap.AI'),
          backgroundColor: AppColors.success,
        ),
      );

      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => const MainScreen()),
      );
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _birthDateController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Pendaftaran Akun'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, size: 18),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Container(
        decoration: const BoxDecoration(
          gradient: AppColors.backgroundGradient,
        ),
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Header badge
                Container(
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    gradient: AppColors.primaryGradient,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'PILIH JENJANG & PERAN',
                        style: TextStyle(
                          color: Color(0xFFE0E7FF),
                          fontSize: 10,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 1.2,
                        ),
                      ),
                      SizedBox(height: 6),
                      Text(
                        'Buat Akun SkillGap.AI',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 20,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                      SizedBox(height: 4),
                      Text(
                        'Sistem akan otomatis menyesuaikan alur kuesioner dan rekomendasi sesuai jenjang pilihanmu.',
                        style: TextStyle(
                          color: Colors.white70,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 20),

                // Form Container
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
                      if (_errorMessage != null) ...[
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: AppColors.dangerLight,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: const Color(0xFFFECACA)),
                          ),
                          child: Text(
                            _errorMessage!,
                            style: const TextStyle(
                              color: AppColors.danger,
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                        const SizedBox(height: 16),
                      ],

                      CustomTextField(
                        label: 'Nama Lengkap',
                        hint: 'Nama lengkap Anda',
                        controller: _nameController,
                      ),
                      const SizedBox(height: 16),

                      CustomTextField(
                        label: 'Email',
                        hint: 'nama@email.com',
                        controller: _emailController,
                        keyboardType: TextInputType.emailAddress,
                      ),
                      const SizedBox(height: 16),

                      CustomTextField(
                        label: 'Kata Sandi',
                        hint: 'Minimal 8 karakter',
                        controller: _passwordController,
                        obscureText: true,
                      ),
                      const SizedBox(height: 16),

                      // Role Dropdown
                      const Text(
                        'PERAN (ROLE)',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 0.8,
                          color: AppColors.inkSubtle,
                        ),
                      ),
                      const SizedBox(height: 6),
                      DropdownButtonFormField<String>(
                        value: _selectedRole,
                        decoration: const InputDecoration(),
                        items: _roles.map((r) => DropdownMenuItem(value: r, child: Text(r))).toList(),
                        onChanged: (val) {
                          if (val != null) {
                            setState(() {
                              _selectedRole = val;
                              if (val == 'Pelajar') {
                                _selectedJenjang = 'Pelajar SMA-SMK Sederajat';
                              } else if (val == 'Mahasiswa') {
                                _selectedJenjang = 'Mahasiswa';
                              }
                            });
                          }
                        },
                      ),
                      const SizedBox(height: 16),

                      // Jenjang Dropdown
                      const Text(
                        'JENJANG PENDIDIKAN',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 0.8,
                          color: AppColors.inkSubtle,
                        ),
                      ),
                      const SizedBox(height: 6),
                      DropdownButtonFormField<String>(
                        value: _selectedJenjang,
                        decoration: const InputDecoration(),
                        items: _jenjangList.map((j) => DropdownMenuItem(value: j, child: Text(j))).toList(),
                        onChanged: (val) {
                          if (val != null) {
                            setState(() {
                              _selectedJenjang = val;
                              if (val.contains('Pelajar')) {
                                _selectedRole = 'Pelajar';
                              }
                            });
                          }
                        },
                      ),

                      // Conditional Pelajar UI (Parental Consent & Birthdate)
                      if (_isPelajar) ...[
                        const SizedBox(height: 20),
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFFFBEB),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: const Color(0xFFFDE68A)),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Row(
                                children: [
                                  Text('🛡️ ', style: TextStyle(fontSize: 16)),
                                  Expanded(
                                    child: Text(
                                      'Verifikasi Pelajar & Persetujuan Wali',
                                      style: TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w800,
                                        color: Color(0xFF78350F),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 6),
                              const Text(
                                'Sesuai regulasi UU PDP No. 27/2022, data pelajar sekolah di bawah 18 tahun memerlukan persetujuan orang tua/wali.',
                                style: TextStyle(
                                  fontSize: 11,
                                  color: Color(0xFF92400E),
                                  height: 1.4,
                                ),
                              ),
                              const SizedBox(height: 12),
                              CustomTextField(
                                label: 'Tahun / Tanggal Lahir',
                                hint: 'Contoh: 15/08/2008',
                                controller: _birthDateController,
                              ),
                              const SizedBox(height: 10),
                              Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Checkbox(
                                    value: _parentalConsent,
                                    activeColor: AppColors.primary,
                                    onChanged: (val) {
                                      setState(() {
                                        _parentalConsent = val ?? false;
                                      });
                                    },
                                  ),
                                  const Expanded(
                                    child: Padding(
                                      padding: EdgeInsets.only(top: 10),
                                      child: Text(
                                        'Saya menyatakan telah memperoleh izin resmi dari orang tua/wali untuk mendaftar di SkillGap.AI.',
                                        style: TextStyle(
                                          fontSize: 11,
                                          fontWeight: FontWeight.w600,
                                          color: Color(0xFF78350F),
                                        ),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],

                      const SizedBox(height: 24),

                      CustomButton(
                        text: 'Daftar Sekarang',
                        onPressed: _handleRegister,
                        isLoading: _isLoading,
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 20),
                Center(
                  child: GestureDetector(
                    onTap: () => Navigator.pop(context),
                    child: const Text.rich(
                      TextSpan(
                        text: 'Sudah punya akun? ',
                        style: TextStyle(color: AppColors.muted, fontSize: 13),
                        children: [
                          TextSpan(
                            text: 'Masuk',
                            style: TextStyle(
                              color: AppColors.primary,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 20),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
