import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/custom_text_field.dart';

class AssessmentScreen extends StatefulWidget {
  const AssessmentScreen({super.key});

  @override
  State<AssessmentScreen> createState() => _AssessmentScreenState();
}

class _AssessmentScreenState extends State<AssessmentScreen> {
  int _currentStep = 1;
  final int _totalSteps = 7;

  // Step 1: Profile
  final _nameController = TextEditingController(text: 'Nadia A.');
  final _notesController = TextEditingController(
    text: 'Tertarik dengan analisis data, eksplorasi dataset bisnis, dan otomatisasi analisis dengan Python.',
  );
  String _role = 'Mahasiswa';
  String _jenjang = 'Mahasiswa';
  final _targetController = TextEditingController(text: 'Data Science');

  // Step 2: CV
  String? _uploadedFileName = 'Curriculum_Vitae_Nadia.pdf';

  // Step 3: Questionnaire ratings (1 to 5)
  final Map<int, int> _questionnaireAnswers = {
    0: 5, // Analisis & data
    1: 3, // Kreatif & visual
    2: 4, // Logika masalah teknis
    3: 4, // Sosial & komunikasi
  };

  final List<String> _questions = [
    'Saya nyaman dalam proyek yang menuntut analisis dan data.',
    'Saya lebih tertarik pada aktivitas kreatif dan visual.',
    'Saya suka memecahkan masalah teknis dengan logika.',
    'Saya bersemangat dalam kegiatan sosial dan komunikasi.',
  ];

  // Step 5: Skills & Self Assessment
  final List<String> _availableSkills = [
    'Data Science',
    'UI/UX',
    'Web Development',
    'Marketing',
    'Product',
    'Cyber Security',
  ];
  final Set<String> _selectedSkills = {'Data Science', 'Web Development'};
  final Map<String, String> _skillLevels = {
    'Data Science': 'Intermediate',
    'Web Development': 'Basic',
  };

  void _nextStep() {
    if (_currentStep < _totalSteps) {
      setState(() {
        _currentStep++;
      });
      if (_currentStep == 7) {
        _startAnalysisSimulation();
      }
    }
  }

  void _previousStep() {
    if (_currentStep > 1) {
      setState(() {
        _currentStep--;
      });
    }
  }

  void _startAnalysisSimulation() async {
    await Future.delayed(const Duration(milliseconds: 1800));

    if (mounted) {

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Analisis AI Selesai! Peta kesenjangan dan roadmap telah diperbarui.'),
          backgroundColor: AppColors.success,
        ),
      );

      Navigator.pop(context);
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _notesController.dispose();
    _targetController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Isi Profil & Asesmen AI'),
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
          child: Column(
            children: [
              // Step Indicators Bar
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                color: Colors.white,
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'LANGKAH $_currentStep DARI $_totalSteps',
                          style: const TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 1.2,
                            color: AppColors.primary,
                          ),
                        ),
                        Text(
                          '${((_currentStep / _totalSteps) * 100).toInt()}% Selesai',
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: AppColors.muted,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(99),
                      child: LinearProgressIndicator(
                        value: _currentStep / _totalSteps,
                        minHeight: 6,
                        backgroundColor: AppColors.line,
                        valueColor: const AlwaysStoppedAnimation<Color>(AppColors.primary),
                      ),
                    ),
                  ],
                ),
              ),

              // Step Content Area
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: _buildCurrentStepContent(),
                ),
              ),

              // Navigation Buttons Footer
              if (_currentStep < 7)
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    border: Border(top: BorderSide(color: AppColors.line)),
                  ),
                  child: Row(
                    children: [
                      if (_currentStep > 1) ...[
                        Expanded(
                          child: CustomButton(
                            text: 'Kembali',
                            isOutlined: true,
                            onPressed: _previousStep,
                          ),
                        ),
                        const SizedBox(width: 12),
                      ],
                      Expanded(
                        child: CustomButton(
                          text: _currentStep == 6 ? 'Mulai Analisis AI' : 'Lanjutkan',
                          onPressed: _nextStep,
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
  }

  Widget _buildCurrentStepContent() {
    switch (_currentStep) {
      case 1:
        return _buildStep1Profile();
      case 2:
        return _buildStep2Document();
      case 3:
        return _buildStep3Questionnaire();
      case 4:
        return _buildStep4Target();
      case 5:
        return _buildStep5Skills();
      case 6:
        return _buildStep6Review();
      case 7:
        return _buildStep7Analysis();
      default:
        return const SizedBox();
    }
  }

  // Step 1: Profil
  Widget _buildStep1Profile() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.line),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Langkah 1: Profil Pengguna',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: AppColors.ink),
          ),
          const SizedBox(height: 4),
          const Text(
            'Lengkapi data dasar untuk menyesuaikan algoritma pemetaan kompetensi.',
            style: TextStyle(fontSize: 12, color: AppColors.muted),
          ),
          const SizedBox(height: 16),
          CustomTextField(label: 'Nama Lengkap', controller: _nameController),
          const SizedBox(height: 16),
          const Text(
            'PERAN',
            style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.inkSubtle),
          ),
          const SizedBox(height: 6),
          DropdownButtonFormField<String>(
            value: _role,
            items: ['Mahasiswa', 'Pelajar', 'Dosen', 'Guru BK']
                .map((r) => DropdownMenuItem(value: r, child: Text(r)))
                .toList(),
            onChanged: (val) => setState(() => _role = val ?? _role),
          ),
          const SizedBox(height: 16),
          const Text(
            'JENJANG PENDIDIKAN',
            style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.inkSubtle),
          ),
          const SizedBox(height: 6),
          DropdownButtonFormField<String>(
            value: _jenjang,
            items: ['Mahasiswa', 'Pelajar SMA-SMK Sederajat', 'Dosen Pembimbing', 'Guru BK']
                .map((j) => DropdownMenuItem(value: j, child: Text(j)))
                .toList(),
            onChanged: (val) => setState(() => _jenjang = val ?? _jenjang),
          ),
          const SizedBox(height: 16),
          CustomTextField(
            label: 'Catatan / Kekuatan Utama',
            hint: 'Ceritakan pengalaman, minat, atau portofolio yang relevan...',
            controller: _notesController,
            maxLines: 3,
          ),
        ],
      ),
    );
  }

  // Step 2: Upload CV / Data Pendukung
  Widget _buildStep2Document() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.line),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Langkah 2: Unggah Dokumen CV / Portofolio',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: AppColors.ink),
          ),
          const SizedBox(height: 4),
          const Text(
            'Sistem AI (NLP) akan mengekstrak otomatis skill, pengalaman, dan riwayat belajar.',
            style: TextStyle(fontSize: 12, color: AppColors.muted),
          ),
          const SizedBox(height: 20),
          GestureDetector(
            onTap: () {
              setState(() {
                _uploadedFileName = 'CV_Terbaru_SkillGap.pdf';
              });
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('File CV_Terbaru_SkillGap.pdf dipilih!')),
              );
            },
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 36, horizontal: 20),
              decoration: BoxDecoration(
                color: AppColors.primaryLight,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFFC7D2FE), width: 1.5),
              ),
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.primary.withOpacity(0.15),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: const Icon(Icons.cloud_upload_outlined, size: 36, color: AppColors.primary),
                  ),
                  const SizedBox(height: 14),
                  const Text(
                    'Pilih atau Tarik File CV / Portofolio',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w800,
                      color: AppColors.primary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Format didukung: PDF, DOCX (Maksimal 10 MB)',
                    style: TextStyle(fontSize: 11, color: AppColors.muted),
                  ),
                ],
              ),
            ),
          ),
          if (_uploadedFileName != null) ...[
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFFF1F5F9),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.line),
              ),
              child: Row(
                children: [
                  const Icon(Icons.picture_as_pdf, color: AppColors.danger, size: 28),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _uploadedFileName!,
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                            color: AppColors.ink,
                          ),
                        ),
                        const Text(
                          '2.4 MB • Terunggah dan siap diekstraksi NLP',
                          style: TextStyle(fontSize: 10, color: AppColors.success, fontWeight: FontWeight.w600),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, size: 18, color: AppColors.muted),
                    onPressed: () => setState(() => _uploadedFileName = null),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  // Step 3: Questionnaire
  Widget _buildStep3Questionnaire() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.line),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Langkah 3: Kuesioner Minat & Karakter Belajar',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: AppColors.ink),
          ),
          const SizedBox(height: 4),
          const Text(
            'Beri nilai 1 (Sangat Tidak Setuju) hingga 5 (Sangat Setuju).',
            style: TextStyle(fontSize: 12, color: AppColors.muted),
          ),
          const SizedBox(height: 20),
          ..._questions.asMap().entries.map((entry) {
            final idx = entry.key;
            final question = entry.value;
            final selectedScore = _questionnaireAnswers[idx] ?? 3;

            return Container(
              margin: const EdgeInsets.only(bottom: 16),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.line),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '${idx + 1}. $question',
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.ink),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [1, 2, 3, 4, 5].map((val) {
                      final isSelected = selectedScore == val;
                      return GestureDetector(
                        onTap: () {
                          setState(() {
                            _questionnaireAnswers[idx] = val;
                          });
                        },
                        child: Container(
                          width: 44,
                          height: 38,
                          decoration: BoxDecoration(
                            color: isSelected ? AppColors.primary : Colors.white,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(
                              color: isSelected ? AppColors.primary : AppColors.line,
                            ),
                          ),
                          child: Center(
                            child: Text(
                              '$val',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w800,
                                color: isSelected ? Colors.white : AppColors.inkSubtle,
                              ),
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }

  // Step 4: Target Karier
  Widget _buildStep4Target() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.line),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Langkah 4: Target Karier / Bidang Impian',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: AppColors.ink),
          ),
          const SizedBox(height: 4),
          const Text(
            'Tentukan posisi pekerjaan atau jurusan studi lanjut yang menjadi tujuanmu.',
            style: TextStyle(fontSize: 12, color: AppColors.muted),
          ),
          const SizedBox(height: 20),
          CustomTextField(
            label: 'Target Bidang',
            hint: 'Contoh: Data Science / UI/UX / Web Development',
            controller: _targetController,
          ),
          const SizedBox(height: 16),
          const Text(
            'Pilihan Populer:',
            style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.muted),
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              'Data Science',
              'UI/UX Designer',
              'Frontend Engineer',
              'Cyber Security Analyst',
              'Product Manager',
            ].map((p) {
              return ActionChip(
                label: Text(p),
                backgroundColor: AppColors.lineLight,
                onPressed: () {
                  setState(() {
                    _targetController.text = p;
                  });
                },
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  // Step 5: Self-Assessment Skills
  Widget _buildStep5Skills() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.line),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Langkah 5: Penilaian Mandiri Keterampilan',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: AppColors.ink),
          ),
          const SizedBox(height: 4),
          const Text(
            'Pilih keahlian yang pernah kamu pelajari dan tentukan tingkat penguasaannya.',
            style: TextStyle(fontSize: 12, color: AppColors.muted),
          ),
          const SizedBox(height: 16),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _availableSkills.map((skill) {
              final isSelected = _selectedSkills.contains(skill);
              return FilterChip(
                selected: isSelected,
                label: Text(skill),
                selectedColor: AppColors.primaryLight,
                checkmarkColor: AppColors.primary,
                labelStyle: TextStyle(
                  color: isSelected ? AppColors.primary : AppColors.inkSubtle,
                  fontWeight: FontWeight.w700,
                  fontSize: 12,
                ),
                onSelected: (selected) {
                  setState(() {
                    if (selected) {
                      _selectedSkills.add(skill);
                      _skillLevels[skill] = 'Intermediate';
                    } else {
                      _selectedSkills.remove(skill);
                      _skillLevels.remove(skill);
                    }
                  });
                },
              );
            }).toList(),
          ),
          const SizedBox(height: 20),
          const Text(
            'Tingkat Penguasaan Tiap Skill:',
            style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppColors.ink),
          ),
          const SizedBox(height: 10),
          ..._selectedSkills.map((skill) {
            return Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      skill,
                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700),
                    ),
                  ),
                  SizedBox(
                    width: 140,
                    child: DropdownButtonFormField<String>(
                      value: _skillLevels[skill] ?? 'Intermediate',
                      decoration: const InputDecoration(
                        contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      ),
                      items: ['Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert']
                          .map((lvl) => DropdownMenuItem(value: lvl, child: Text(lvl, style: const TextStyle(fontSize: 12))))
                          .toList(),
                      onChanged: (val) {
                        setState(() {
                          _skillLevels[skill] = val ?? 'Intermediate';
                        });
                      },
                    ),
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }

  // Step 6: Review
  Widget _buildStep6Review() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.line),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Langkah 6: Tinjauan Data Asesmen',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: AppColors.ink),
          ),
          const SizedBox(height: 4),
          const Text(
            'Periksa kembali data sebelum diproses oleh Engine Rekomendasi AI.',
            style: TextStyle(fontSize: 12, color: AppColors.muted),
          ),
          const SizedBox(height: 16),
          _buildReviewRow('Nama', _nameController.text),
          _buildReviewRow('Peran & Jenjang', '$_role (${_jenjang})'),
          _buildReviewRow('Target Karier', _targetController.text),
          _buildReviewRow('Dokumen Terlampir', _uploadedFileName ?? 'Belum ada'),
          _buildReviewRow('Kompetensi Dipilih', '${_selectedSkills.length} Keahlian'),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppColors.successLight,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFA7F3D0)),
            ),
            child: const Row(
              children: [
                Icon(Icons.auto_awesome, color: AppColors.success, size: 22),
                SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'Prediksi Kecocokan Awal: 87%!\nSiap untuk diproses oleh LLM dan Similarity Matching.',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF065F46),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildReviewRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 12, color: AppColors.muted)),
          const SizedBox(width: 16),
          Flexible(
            child: Text(
              value,
              textAlign: TextAlign.end,
              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppColors.ink),
            ),
          ),
        ],
      ),
    );
  }

  // Step 7: AI Analysis Simulation
  Widget _buildStep7Analysis() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 40),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(28),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: AppColors.primaryGradient,
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primary.withOpacity(0.35),
                    blurRadius: 30,
                    offset: const Offset(0, 10),
                  ),
                ],
              ),
              child: const Icon(Icons.psychology, size: 64, color: Colors.white),
            ),
            const SizedBox(height: 24),
            const Text(
              'Menganalisis Kesenjangan Kompetensi...',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w900,
                color: AppColors.ink,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Menjalankan NLP extraction, cosine similarity matching,\ndan Large Language Model untuk menghasilkan learning roadmap.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 12, color: AppColors.muted, height: 1.5),
            ),
            const SizedBox(height: 28),
            const SizedBox(
              width: 36,
              height: 36,
              child: CircularProgressIndicator(
                strokeWidth: 3,
                valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
