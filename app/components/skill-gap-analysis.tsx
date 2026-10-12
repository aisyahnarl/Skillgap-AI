'use client';

import { useMemo, useState } from 'react';

// ─── Data Kebutuhan Skill IT per Bidang (berbasis survei industri) ──────────

/**
 * Data skill requirements berdasarkan:
 * - Stack Overflow Developer Survey 2024
 * - LinkedIn Tech Skills Report 2024
 * - BNSP Skema Kompetensi IT Indonesia
 * - Glassdoor Job Requirements Analysis (2024)
 */
export const itIndustrySkills: Record<string, {
  label: string;
  icon: string;
  description: string;
  requiredSkills: { skill: string; level: 'Wajib' | 'Direkomendasikan' | 'Bonus'; category: string }[];
  salaryRange: string;
  jobGrowth: string;
  entryLevel: string;
}> = {
  webDev: {
    label: 'Web Development',
    icon: '🌐',
    description: 'Membangun aplikasi dan website yang berjalan di browser, dari UI hingga backend server.',
    requiredSkills: [
      { skill: 'HTML & CSS', level: 'Wajib', category: 'Frontend' },
      { skill: 'JavaScript', level: 'Wajib', category: 'Frontend' },
      { skill: 'React / Vue / Angular', level: 'Wajib', category: 'Frontend' },
      { skill: 'Node.js / Express', level: 'Wajib', category: 'Backend' },
      { skill: 'SQL (MySQL/PostgreSQL)', level: 'Wajib', category: 'Database' },
      { skill: 'REST API Design', level: 'Wajib', category: 'Backend' },
      { skill: 'Git & Version Control', level: 'Wajib', category: 'Tools' },
      { skill: 'Responsive Design', level: 'Wajib', category: 'Frontend' },
      { skill: 'TypeScript', level: 'Direkomendasikan', category: 'Frontend' },
      { skill: 'Docker & Containerization', level: 'Direkomendasikan', category: 'DevOps' },
      { skill: 'Testing (Jest/Cypress)', level: 'Direkomendasikan', category: 'QA' },
      { skill: 'Next.js / Nuxt.js', level: 'Direkomendasikan', category: 'Frontend' },
      { skill: 'GraphQL', level: 'Bonus', category: 'API' },
      { skill: 'WebSockets', level: 'Bonus', category: 'Real-time' },
    ],
    salaryRange: 'Rp 5.000.000 – Rp 25.000.000',
    jobGrowth: '+25% (2024-2029)',
    entryLevel: 'Junior Web Developer',
  },
  dataScience: {
    label: 'Data Science & Machine Learning',
    icon: '📊',
    description: 'Menganalisis data besar dan membangun model prediktif untuk mendukung keputusan bisnis.',
    requiredSkills: [
      { skill: 'Python Programming', level: 'Wajib', category: 'Programming' },
      { skill: 'SQL & Database Querying', level: 'Wajib', category: 'Database' },
      { skill: 'Pandas & NumPy', level: 'Wajib', category: 'Data Analysis' },
      { skill: 'Statistics & Probability', level: 'Wajib', category: 'Math' },
      { skill: 'Data Visualization (Tableau/Power BI)', level: 'Wajib', category: 'Visualization' },
      { skill: 'Machine Learning (Scikit-learn)', level: 'Wajib', category: 'ML' },
      { skill: 'Deep Learning (TensorFlow/PyTorch)', level: 'Direkomendasikan', category: 'ML' },
      { skill: 'Feature Engineering', level: 'Direkomendasikan', category: 'ML' },
      { skill: 'Big Data (Spark/Hadoop)', level: 'Direkomendasikan', category: 'Big Data' },
      { skill: 'Cloud ML (AWS SageMaker/GCP Vertex AI)', level: 'Direkomendasikan', category: 'Cloud' },
      { skill: 'NLP & LLM Integration', level: 'Bonus', category: 'AI' },
      { skill: 'MLOps', level: 'Bonus', category: 'Operations' },
    ],
    salaryRange: 'Rp 7.000.000 – Rp 30.000.000',
    jobGrowth: '+36% (2024-2029)',
    entryLevel: 'Junior Data Analyst',
  },
  cybersecurity: {
    label: 'Cybersecurity',
    icon: '🛡️',
    description: 'Melindungi sistem, jaringan, dan data dari serangan siber dan ancaman keamanan.',
    requiredSkills: [
      { skill: 'Networking Fundamentals (TCP/IP)', level: 'Wajib', category: 'Networking' },
      { skill: 'Linux & Command Line', level: 'Wajib', category: 'OS' },
      { skill: 'Security Protocols (SSL/TLS, SSH)', level: 'Wajib', category: 'Security' },
      { skill: 'Vulnerability Assessment', level: 'Wajib', category: 'Security' },
      { skill: 'SIEM Tools (Splunk/ELK)', level: 'Wajib', category: 'Monitoring' },
      { skill: 'Ethical Hacking Concepts', level: 'Wajib', category: 'Offensive' },
      { skill: 'Incident Response', level: 'Direkomendasikan', category: 'Defensive' },
      { skill: 'Penetration Testing Tools (Metasploit)', level: 'Direkomendasikan', category: 'Tools' },
      { skill: 'Cloud Security (AWS/Azure Security)', level: 'Direkomendasikan', category: 'Cloud' },
      { skill: 'Digital Forensics', level: 'Direkomendasikan', category: 'Forensics' },
      { skill: 'Malware Analysis', level: 'Bonus', category: 'Offensive' },
      { skill: 'Zero Trust Architecture', level: 'Bonus', category: 'Architecture' },
    ],
    salaryRange: 'Rp 8.000.000 – Rp 35.000.000',
    jobGrowth: '+32% (2024-2029)',
    entryLevel: 'SOC Analyst / Junior Security Analyst',
  },
  mobileDev: {
    label: 'Mobile Development',
    icon: '📱',
    description: 'Membuat aplikasi untuk smartphone iOS dan Android yang digunakan jutaan pengguna.',
    requiredSkills: [
      { skill: 'React Native / Flutter', level: 'Wajib', category: 'Cross-Platform' },
      { skill: 'UI Mobile Design Principles', level: 'Wajib', category: 'Design' },
      { skill: 'REST API Integration', level: 'Wajib', category: 'Backend' },
      { skill: 'State Management (Redux/MobX/Bloc)', level: 'Wajib', category: 'Architecture' },
      { skill: 'App Store & Play Store Deployment', level: 'Wajib', category: 'Publishing' },
      { skill: 'Push Notifications', level: 'Direkomendasikan', category: 'Features' },
      { skill: 'Kotlin / Swift (Native)', level: 'Direkomendasikan', category: 'Native' },
      { skill: 'Firebase / Supabase', level: 'Direkomendasikan', category: 'Backend-as-a-Service' },
      { skill: 'Performance Optimization', level: 'Direkomendasikan', category: 'Optimization' },
      { skill: 'AR/VR Mobile (ARKit/ARCore)', level: 'Bonus', category: 'Extended Reality' },
    ],
    salaryRange: 'Rp 6.000.000 – Rp 28.000.000',
    jobGrowth: '+22% (2024-2029)',
    entryLevel: 'Junior Mobile Developer',
  },
  uiux: {
    label: 'UI/UX Design',
    icon: '🎨',
    description: 'Merancang tampilan dan pengalaman pengguna yang intuitif dan menyenangkan untuk produk digital.',
    requiredSkills: [
      { skill: 'Figma / Adobe XD', level: 'Wajib', category: 'Design Tools' },
      { skill: 'User Research & Interviews', level: 'Wajib', category: 'Research' },
      { skill: 'Wireframing & Prototyping', level: 'Wajib', category: 'Process' },
      { skill: 'Design System & Component Library', level: 'Wajib', category: 'System' },
      { skill: 'Usability Testing', level: 'Wajib', category: 'Testing' },
      { skill: 'Accessibility (WCAG)', level: 'Direkomendasikan', category: 'Standards' },
      { skill: 'Information Architecture', level: 'Direkomendasikan', category: 'Structure' },
      { skill: 'User Journey Mapping', level: 'Direkomendasikan', category: 'Research' },
      { skill: 'Motion Design', level: 'Direkomendasikan', category: 'Animation' },
      { skill: 'HTML/CSS Basics (for Handoff)', level: 'Direkomendasikan', category: 'Dev' },
      { skill: 'A/B Testing & Analytics', level: 'Bonus', category: 'Data' },
      { skill: 'AI-assisted Design Tools', level: 'Bonus', category: 'AI Tools' },
    ],
    salaryRange: 'Rp 5.000.000 – Rp 22.000.000',
    jobGrowth: '+18% (2024-2029)',
    entryLevel: 'Junior UI Designer / UX Researcher',
  },
  cloudDevops: {
    label: 'Cloud & DevOps',
    icon: '☁️',
    description: 'Mengelola infrastruktur cloud, otomasi deployment, dan memastikan sistem berjalan reliabel.',
    requiredSkills: [
      { skill: 'Linux & Shell Scripting', level: 'Wajib', category: 'OS' },
      { skill: 'Docker & Containerization', level: 'Wajib', category: 'Containers' },
      { skill: 'CI/CD Pipeline (GitHub Actions/Jenkins)', level: 'Wajib', category: 'Automation' },
      { skill: 'Cloud Platform (AWS/GCP/Azure)', level: 'Wajib', category: 'Cloud' },
      { skill: 'Kubernetes', level: 'Direkomendasikan', category: 'Orchestration' },
      { skill: 'Infrastructure as Code (Terraform)', level: 'Direkomendasikan', category: 'IaC' },
      { skill: 'Monitoring (Prometheus/Grafana)', level: 'Direkomendasikan', category: 'Monitoring' },
      { skill: 'Networking & Load Balancing', level: 'Direkomendasikan', category: 'Networking' },
      { skill: 'Security in Cloud (IAM, Secrets)', level: 'Direkomendasikan', category: 'Security' },
      { skill: 'Site Reliability Engineering', level: 'Bonus', category: 'SRE' },
      { skill: 'GitOps', level: 'Bonus', category: 'Methodology' },
    ],
    salaryRange: 'Rp 8.000.000 – Rp 40.000.000',
    jobGrowth: '+28% (2024-2029)',
    entryLevel: 'Junior DevOps Engineer / Cloud Practitioner',
  },
  gameDev: {
    label: 'Game Development',
    icon: '🎮',
    description: 'Menciptakan game interaktif untuk berbagai platform: PC, console, mobile, dan web.',
    requiredSkills: [
      { skill: 'Unity atau Unreal Engine', level: 'Wajib', category: 'Game Engine' },
      { skill: 'C# (Unity) atau C++ (Unreal)', level: 'Wajib', category: 'Programming' },
      { skill: 'Game Physics & Collision', level: 'Wajib', category: 'Game Logic' },
      { skill: '2D/3D Asset Management', level: 'Wajib', category: 'Assets' },
      { skill: 'Game Design Principles', level: 'Wajib', category: 'Design' },
      { skill: 'Animation & Rigging Basics', level: 'Direkomendasikan', category: 'Animation' },
      { skill: 'Shader & Visual Effects', level: 'Direkomendasikan', category: 'Graphics' },
      { skill: 'Multiplayer & Networking', level: 'Direkomendasikan', category: 'Online' },
      { skill: 'AI Pathfinding (A*/NavMesh)', level: 'Direkomendasikan', category: 'Game AI' },
      { skill: 'AR/VR Development', level: 'Bonus', category: 'Extended Reality' },
    ],
    salaryRange: 'Rp 5.000.000 – Rp 25.000.000',
    jobGrowth: '+15% (2024-2029)',
    entryLevel: 'Junior Game Developer',
  },
  iot: {
    label: 'IoT & Embedded Systems',
    icon: '⚙️',
    description: 'Menghubungkan perangkat fisik ke internet dan memprogram mikrokontroler untuk otomasi.',
    requiredSkills: [
      { skill: 'C / C++ Programming', level: 'Wajib', category: 'Programming' },
      { skill: 'Microcontrollers (Arduino/ESP32)', level: 'Wajib', category: 'Hardware' },
      { skill: 'Raspberry Pi / Embedded Linux', level: 'Wajib', category: 'Hardware' },
      { skill: 'Sensors & Actuators', level: 'Wajib', category: 'Hardware' },
      { skill: 'Communication Protocols (MQTT, I2C, SPI)', level: 'Wajib', category: 'Protocols' },
      { skill: 'Basic Electronics & PCB Design', level: 'Direkomendasikan', category: 'Hardware' },
      { skill: 'Cloud IoT Platforms (AWS IoT/Azure IoT)', level: 'Direkomendasikan', category: 'Cloud' },
      { skill: 'Python for IoT', level: 'Direkomendasikan', category: 'Programming' },
      { skill: 'Real-Time Operating Systems (RTOS)', level: 'Direkomendasikan', category: 'OS' },
      { skill: 'Edge Computing', level: 'Bonus', category: 'Advanced' },
    ],
    salaryRange: 'Rp 6.000.000 – Rp 28.000.000',
    jobGrowth: '+20% (2024-2029)',
    entryLevel: 'Junior Embedded Engineer / IoT Developer',
  },
};

type SkillGapAnalysisProps = {
  selectedField: string;
  onFieldChange?: (field: string) => void;
  readOnly?: boolean;
};

export default function SkillGapAnalysis({ selectedField, onFieldChange, readOnly = false }: SkillGapAnalysisProps) {
  const [ownedSkills, setOwnedSkills] = useState<Set<string>>(new Set());

  const fieldData = itIndustrySkills[selectedField];

  const toggleSkill = (skill: string) => {
    if (readOnly) return;
    setOwnedSkills(prev => {
      const next = new Set(prev);
      if (next.has(skill)) next.delete(skill);
      else next.add(skill);
      return next;
    });
  };

  const analysis = useMemo(() => {
    if (!fieldData) return null;
    const required = fieldData.requiredSkills.filter(s => s.level === 'Wajib');
    const ownedRequired = required.filter(s => ownedSkills.has(s.skill));
    const missingRequired = required.filter(s => !ownedSkills.has(s.skill));
    const readinessScore = required.length > 0 ? Math.round((ownedRequired.length / required.length) * 100) : 0;
    return { required, ownedRequired, missingRequired, readinessScore };
  }, [fieldData, ownedSkills]);

  if (!fieldData) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
        Pilih bidang IT di atas untuk melihat analisis skill gap
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Field Info */}
      <div className="rounded-[24px] border border-indigo-200 bg-indigo-50 p-5">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{fieldData.icon}</span>
          <div>
            <h3 className="font-black text-slate-900">{fieldData.label}</h3>
            <p className="text-xs text-slate-600 mt-0.5">{fieldData.description}</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-white p-3 text-center">
            <p className="text-xs font-bold text-slate-500">Entry Level</p>
            <p className="mt-1 text-xs font-bold text-indigo-700">{fieldData.entryLevel}</p>
          </div>
          <div className="rounded-xl bg-white p-3 text-center">
            <p className="text-xs font-bold text-slate-500">Gaji Awal</p>
            <p className="mt-1 text-xs font-bold text-emerald-700">{fieldData.salaryRange}</p>
          </div>
          <div className="rounded-xl bg-white p-3 text-center">
            <p className="text-xs font-bold text-slate-500">Pertumbuhan</p>
            <p className="mt-1 text-xs font-bold text-amber-700">{fieldData.jobGrowth}</p>
          </div>
        </div>
      </div>

      {/* Skill Readiness Score */}
      {analysis && (
        <div className="rounded-[24px] border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-600">Kesiapan Skill Kamu</p>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${
              analysis.readinessScore >= 70 ? 'bg-emerald-100 text-emerald-800' :
              analysis.readinessScore >= 40 ? 'bg-amber-100 text-amber-800' :
              'bg-red-100 text-red-800'
            }`}>
              {analysis.readinessScore}% Siap
            </span>
          </div>
          <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                analysis.readinessScore >= 70 ? 'bg-emerald-500' :
                analysis.readinessScore >= 40 ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${analysis.readinessScore}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Kamu memiliki {analysis.ownedRequired.length} dari {analysis.required.length} skill wajib
          </p>
        </div>
      )}

      {/* Skill Checklist */}
      <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-700">
          {readOnly ? 'Skill yang Dibutuhkan Industri' : 'Centang Skill yang Sudah Kamu Miliki'}
        </p>
        {!readOnly && (
          <p className="mt-1 text-xs text-slate-500">
            Centang skill yang sudah kamu kuasai untuk melihat analisis gap-mu
          </p>
        )}

        <div className="mt-4 space-y-2">
          {['Wajib', 'Direkomendasikan', 'Bonus'].map(level => {
            const skillsInLevel = fieldData.requiredSkills.filter(s => s.level === level);
            if (skillsInLevel.length === 0) return null;
            return (
              <div key={level}>
                <p className={`mb-2 text-[11px] font-bold uppercase tracking-wider ${
                  level === 'Wajib' ? 'text-red-600' :
                  level === 'Direkomendasikan' ? 'text-amber-600' : 'text-emerald-600'
                }`}>
                  {level === 'Wajib' ? '🔴' : level === 'Direkomendasikan' ? '🟡' : '🟢'} {level}
                </p>
                <div className="space-y-1.5">
                  {skillsInLevel.map(s => (
                    <label
                      key={s.skill}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition ${
                        readOnly
                          ? 'cursor-default border-slate-200 bg-white'
                          : ownedSkills.has(s.skill)
                            ? 'border-emerald-200 bg-emerald-50'
                            : 'border-slate-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/30'
                      }`}
                    >
                      {!readOnly && (
                        <input
                          type="checkbox"
                          checked={ownedSkills.has(s.skill)}
                          onChange={() => toggleSkill(s.skill)}
                          className="h-4 w-4 accent-emerald-600"
                        />
                      )}
                      <span className={`flex-1 text-xs font-semibold ${
                        ownedSkills.has(s.skill) ? 'text-emerald-800' : 'text-slate-700'
                      }`}>
                        {ownedSkills.has(s.skill) && !readOnly ? '✓ ' : ''}{s.skill}
                      </span>
                      <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                        {s.category}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gap Summary */}
      {analysis && analysis.missingRequired.length > 0 && (
        <div className="rounded-[24px] border border-amber-200 bg-amber-50 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">⚠ Skill yang Perlu Dipelajari</p>
          <p className="mt-1 text-xs text-amber-600">
            {analysis.missingRequired.length} skill wajib yang belum kamu miliki:
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {analysis.missingRequired.map(s => (
              <span key={s.skill} className="rounded-full border border-amber-200 bg-white px-2.5 py-1 text-xs font-semibold text-amber-800">
                {s.skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {analysis && analysis.ownedRequired.length > 0 && (
        <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">✓ Skill yang Sudah Kamu Miliki</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {analysis.ownedRequired.map(s => (
              <span key={s.skill} className="rounded-full border border-emerald-200 bg-white px-2.5 py-1 text-xs font-semibold text-emerald-800">
                {s.skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
