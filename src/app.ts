import './styles.css';

type PageName =
  | 'home'
  | 'login'
  | 'register'
  | 'dashboard'
  | 'certificate-detail';

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

type Certificate = {
  id: string;
  name: string;
  level: string;
  issuer: string;
  category: string;
  duration: string;
  price: string;
  rating: number;
  description: string;
  skills: string[];
  modules: string[];
};

const STORAGE_KEYS = {
  users: 'skillgap_users',
  session: 'skillgap_session',
};

const certificates: Certificate[] = [
  {
    id: 'cert-data-science',
    name: 'Data Science for Career Growth',
    level: 'Professional',
    issuer: 'SkillGap Academy',
    category: 'AI & Analytics',
    duration: '6 minggu',
    price: 'Rp 1.200.000',
    rating: 4.9,
    description:
      'Program intensif untuk memahami analisis data, visualisasi insight, dan kemampuan pengambilan keputusan berbasis data untuk karier masa depan.',
    skills: ['Python', 'SQL', 'Data Storytelling', 'Machine Learning Basics'],
    modules: [
      'Fundamental Data Handling',
      'Analisis Prediktif',
      'Dashboard & Insight',
      'Case Study Industri',
    ],
  },
  {
    id: 'cert-uiux',
    name: 'UI/UX Research & Design',
    level: 'Advanced',
    issuer: 'SkillGap Studio',
    category: 'Product Design',
    duration: '4 minggu',
    price: 'Rp 950.000',
    rating: 4.8,
    description:
      'Membangun pemahaman end-to-end dari riset pengguna hingga prototyping dan usability testing agar desain lebih relevan dan user-centric.',
    skills: ['UX Research', 'Figma', 'Wireframing', 'Usability Testing'],
    modules: [
      'User Research',
      'Design Thinking',
      'Prototype & Testing',
      'Design System',
    ],
  },
  {
    id: 'cert-web-dev',
    name: 'Full-Stack Web Developer',
    level: 'Career Ready',
    issuer: 'SkillGap Tech',
    category: 'Development',
    duration: '8 minggu',
    price: 'Rp 1.500.000',
    rating: 5,
    description:
      'Program komprehensif untuk membangun aplikasi web modern, memahami API, deployment, dan produktivitas kerja sebagai developer.',
    skills: ['HTML/CSS', 'JavaScript', 'Node.js', 'Deployment'],
    modules: [
      'Frontend Architecture',
      'API Integration',
      'Backend Logic',
      'Production Deployment',
    ],
  },
];

const sleep = (ms: number) =>
  new Promise((resolve) => window.setTimeout(resolve, ms));

const readUsers = (): User[] => {
  const raw = window.localStorage.getItem(STORAGE_KEYS.users);
  if (!raw) return [];

  try {
    return JSON.parse(raw) as User[];
  } catch {
    return [];
  }
};

const writeUsers = (users: User[]): void => {
  window.localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
};

const getCurrentUser = (): User | null => {
  const raw = window.localStorage.getItem(STORAGE_KEYS.session);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
};

const setCurrentUser = (user: User | null): void => {
  if (!user) {
    window.localStorage.removeItem(STORAGE_KEYS.session);
    return;
  }

  window.localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(user));
};

const authApi = {
  async register(payload: {
    fullName: string;
    email: string;
    role: string;
    password: string;
  }): Promise<User> {
    await sleep(500);

    const users = readUsers();
    const normalizedEmail = payload.email.trim().toLowerCase();
    const exists = users.some(
      (user) => user.email.toLowerCase() === normalizedEmail,
    );

    if (exists) {
      throw new Error('Email sudah terdaftar. Silakan masuk dengan akun lain.');
    }

    const user: User = {
      id: `user_${Date.now()}`,
      name: payload.fullName.trim(),
      email: normalizedEmail,
      role: payload.role,
      createdAt: new Date().toISOString(),
    };

    users.push(user);
    writeUsers(users);
    return user;
  },

  async login(payload: { email: string; password: string }): Promise<User> {
    await sleep(500);

    const users = readUsers();
    const normalizedEmail = payload.email.trim().toLowerCase();
    const user = users.find(
      (item) => item.email.toLowerCase() === normalizedEmail,
    );

    if (!user) {
      throw new Error('Akun tidak ditemukan. Silakan daftar terlebih dahulu.');
    }

    if (payload.password.length < 8) {
      throw new Error('Password tidak valid.');
    }

    setCurrentUser(user);
    return user;
  },
};

let selectedCertificateId = certificates[0]?.id ?? 'cert-data-science';

const fallbackCertificate: Certificate = {
  id: 'cert-data-science',
  name: 'Data Science for Career Growth',
  level: 'Professional',
  issuer: 'SkillGap Academy',
  category: 'AI & Analytics',
  duration: '6 minggu',
  price: 'Rp 1.200.000',
  rating: 4.9,
  description:
    'Program intensif untuk memahami analisis data, visualisasi insight, dan kemampuan pengambilan keputusan berbasis data untuk karier masa depan.',
  skills: ['Python', 'SQL', 'Data Storytelling', 'Machine Learning Basics'],
  modules: [
    'Fundamental Data Handling',
    'Analisis Prediktif',
    'Dashboard & Insight',
    'Case Study Industri',
  ],
};

const getSelectedCertificate = (): Certificate => {
  return (
    certificates.find(
      (certificate) => certificate.id === selectedCertificateId,
    ) ?? fallbackCertificate
  );
};

const renderHomePage = (): string => {
  const currentUser = getCurrentUser();

  return `
    <header class="site-header">
      <div class="container navbar">
        <a href="#" class="brand" data-page="home">
          <span class="brand-mark">S</span>
          <span>SkillGap.AI</span>
        </a>

        <nav class="nav-links">
          <a href="#solusi" data-page="home">Solusi</a>
          <a href="#fitur" data-page="home">Fitur</a>
          <a href="#sertifikat" data-page="home">Sertifikat</a>
          <a href="#testimoni" data-page="home">Testimoni</a>
        </nav>

        <div class="nav-actions">
          ${currentUser ? `<button class="button button-secondary" data-page="dashboard">Dashboard</button>` : `<button class="button button-secondary" data-page="login">Masuk</button>`}
          ${currentUser ? `<button class="button button-primary" data-page="dashboard">Hi, ${currentUser.name.split(' ')[0]}</button>` : `<button class="button button-primary" data-page="register">Daftar</button>`}
        </div>
      </div>
    </header>

    <main>
      <section class="hero">
        <div class="container hero-grid">
          <div class="hero-copy">
            <span class="eyebrow">AI for personal growth</span>
            <h1>Kenali potensimu. Pilih jalur yang paling tepat.</h1>
            <p>SkillGap.AI membantu mahasiswa, siswa, dan stakeholder memahami posisi kemampuan, minat, serta kebutuhan pengembangan diri agar keputusan studi, karier, dan sertifikasi lebih tepat.</p>

            <div class="hero-actions">
              <button class="button button-primary" data-page="register">Mulai sekarang</button>
              <button class="button button-secondary" data-page="dashboard">Lihat dashboard</button>
            </div>

            <div class="metric-strip">
              <div class="metric-box">
                <span>NLP</span>
                <strong>AI</strong>
              </div>
              <div class="metric-box">
                <span>Roadmap</span>
                <strong>8 minggu</strong>
              </div>
              <div class="metric-box">
                <span>Match</span>
                <strong>87%</strong>
              </div>
            </div>
          </div>

          <div class="hero-panel hero-visual-wrap">
            <div class="hero-visual-card">
              <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80" alt="Mahasiswa dan tim bekerja bersama" />
              <div class="hero-visual-overlay">
                <span>Career Match Score</span>
                <strong>87%</strong>
              </div>
            </div>

            <div class="hero-float left">
              <small>Skill-Gap Map</small><br>
              <strong>+12 rekomendasi</strong>
            </div>

            <div class="hero-float right">
              <small>Validasi</small><br>
              <strong>Dosen / Guru BK</strong>
            </div>
          </div>
        </div>
      </section>

      <section id="solusi">
        <div class="container">
          <div class="section-header">
            <span class="eyebrow">Solusi</span>
            <h2>Dua jalur utama, satu arah yang jelas.</h2>
          </div>

          <div class="grid-2">
            <article class="feature-card">
              <div class="feature-icon">🎓</div>
              <h3>Mahasiswa</h3>
              <p>Mahasiswa dapat mengunggah CV atau portofolio untuk memahami kesiapan karier, minat kerja, dan skill yang perlu ditingkatkan.</p>
              <ul class="list-check">
                <li>Skill-Gap Map</li>
                <li>Learning Roadmap</li>
                <li>NLP-based analysis</li>
              </ul>
            </article>

            <article class="feature-card">
              <div class="feature-icon">🧑‍🎓</div>
              <h3>Pelajar SMA/SMK</h3>
              <p>Pelajar dapat mengevaluasi minat, bakat, dan nilai untuk memilih studi lanjut, karier, serta program sertifikasi yang paling relevan.</p>
              <ul class="list-check">
                <li>Peta minat dan bakat</li>
                <li>Rekomendasi studi lanjutan</li>
                <li>Jalur sertifikasi</li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section id="fitur">
        <div class="container">
          <div class="section-header">
            <span class="eyebrow">Fitur</span>
            <h2>Dari input data sampai rekomendasi yang personal.</h2>
          </div>

          <div class="grid-3">
            <article class="feature-card">
              <div class="feature-icon">📥</div>
              <h3>Input profil</h3>
              <p>CV, portofolio, minat, bakat, rapor, dan kuesioner diolah dalam satu flow yang sederhana.</p>
            </article>

            <article class="feature-card">
              <div class="feature-icon">🧠</div>
              <h3>NLP & matching</h3>
              <p>Sistem menganalisis profil dan menghubungkan kebutuhan industri dengan kemampuan pengguna.</p>
            </article>

            <article class="feature-card">
              <div class="feature-icon">🚀</div>
              <h3>Recommendation engine</h3>
              <p>Memberikan roadmap belajar dan rekomendasi studi lanjut, karier, serta sertifikasi yang tepat.</p>
            </article>
          </div>
        </div>
      </section>

      <section id="sertifikat">
        <div class="container">
          <div class="section-header">
            <span class="eyebrow">Lisensi & Sertifikat</span>
            <h2>Program yang siap mendukung next step karier Anda.</h2>
          </div>

          <div class="certificate-grid">
            ${certificates
              .map(
                (certificate) => `
                  <article class="certificate-card">
                    <div class="certificate-thumb" style="background-image:url('${certificate.id === 'cert-data-science' ? 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=900&q=80' : certificate.id === 'cert-uiux' ? 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80' : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80'}');"></div>
                    <div class="cert-card-head">
                      <span class="badge badge-indigo">${certificate.level}</span>
                      <span class="badge badge-sky">${certificate.category}</span>
                    </div>
                    <h3>${certificate.name}</h3>
                    <p>${certificate.description}</p>
                    <div class="meta-row">
                      <span>${certificate.issuer}</span>
                      <span>${certificate.duration}</span>
                    </div>
                    <div class="card-footer">
                      <div>
                        <small>Harga</small>
                        <strong>${certificate.price}</strong>
                      </div>
                      <button class="button button-primary" data-page="certificate-detail" data-certificate-id="${certificate.id}">Lihat detail</button>
                    </div>
                  </article>
                `,
              )
              .join('')}
          </div>
        </div>
      </section>

      <section id="testimoni">
        <div class="container">
          <div class="section-header">
            <span class="eyebrow">Testimoni</span>
            <h2>Apa kata pengguna kami?</h2>
          </div>

          <div class="testimonial-grid">
            <blockquote class="quote-card">
              <p>“SkillGap.AI membantu saya melihat gap antara kemampuan dan minat saya. Saya jadi lebih yakin memilih jalur studi yang tepat.”</p>
              <div class="client-name">Rina</div>
              <div class="client-role">Mahasiswa Teknik Informatika</div>
            </blockquote>

            <blockquote class="quote-card">
              <p>“Sistemnya sangat membantu karena hasil rekomendasinya terasa personal, bukan sekadar generik.”</p>
              <div class="client-name">Fajar</div>
              <div class="client-role">Siswa SMK RPL</div>
            </blockquote>

            <blockquote class="quote-card">
              <p>“Dengan roadmap yang diberikan, saya bisa fokus belajar pada area yang paling relevan dan paling potensial.”</p>
              <div class="client-name">Yuni</div>
              <div class="client-role">Siswi SMA IPA</div>
            </blockquote>
          </div>
        </div>
      </section>
    </main>

    <footer class="site-footer">
      <div class="container footer-wrap">
        <div>© 2026 SkillGap.AI</div>
        <div class="footer-links">
          <a href="#" data-page="home">Beranda</a>
          <a href="#" data-page="dashboard">Dashboard</a>
          <a href="#" data-page="login">Masuk</a>
        </div>
      </div>
    </footer>
  `;
};

const renderLoginPage = (): string => `
  <div class="auth-page">
    <div class="auth-shell">
      <aside class="auth-side">
        <div class="brand">
          <span class="brand-mark">S</span>
          <span>SkillGap.AI</span>
        </div>

        <div>
          <p class="eyebrow" style="color:#fff;border-color:rgba(255,255,255,0.2);background:rgba(255,255,255,0.08);">Platform AI</p>
          <h1>Temukan arah belajar yang paling cocok untuk masa depanmu.</h1>
          <div class="mini-stat">
            <span>Assessment</span>
            <span>Skill Gap</span>
            <span>Roadmap</span>
          </div>
        </div>
      </aside>

      <div class="auth-form-panel">
        <div class="form-card">
          <div class="form-head">
            <span class="eyebrow">Masuk</span>
            <h2>Welcome back</h2>
            <p>Silakan masuk untuk melanjutkan pengalaman belajar dan karier Anda.</p>
          </div>

          <form class="auth-form" id="login-form">
            <div class="field">
              <label for="login-email">Email</label>
              <input id="login-email" name="email" type="email" placeholder="nama@email.com" required />
            </div>

            <div class="field">
              <label for="login-password">Password</label>
              <input id="login-password" name="password" type="password" placeholder="••••••••" required />
            </div>

            <div class="form-row">
              <label class="checkbox"><input type="checkbox" checked /> Ingat saya</label>
              <a href="#">Lupa password?</a>
            </div>

            <button type="submit" class="button button-primary">Masuk ke dashboard</button>
            <div class="auth-message" id="login-message"></div>
          </form>

          <div class="switch-link">Belum punya akun? <a href="#" data-page="register">Daftar sekarang</a></div>
        </div>
      </div>
    </div>
  </div>
`;

const renderRegisterPage = (): string => `
  <div class="auth-page">
    <div class="auth-shell">
      <aside class="auth-side">
        <div class="brand">
          <span class="brand-mark">S</span>
          <span>SkillGap.AI</span>
        </div>

        <div>
          <p class="eyebrow" style="color:#fff;border-color:rgba(255,255,255,0.2);background:rgba(255,255,255,0.08);">Mulai dari sini</p>
          <h1>Buat akunmu dan mulai perjalanan personal growth.</h1>
          <div class="mini-stat">
            <span>Profil</span>
            <span>AI Matching</span>
            <span>Roadmap</span>
          </div>
        </div>
      </aside>

      <div class="auth-form-panel">
        <div class="form-card">
          <div class="form-head">
            <span class="eyebrow">Daftar</span>
            <h2>Buat akun</h2>
            <p>Isi data berikut untuk mengakses dashboard dan assessment Anda.</p>
          </div>

          <form class="auth-form" id="register-form">
            <div class="field">
              <label for="register-name">Nama lengkap</label>
              <input id="register-name" name="fullName" type="text" placeholder="Nama lengkap" required />
            </div>

            <div class="field">
              <label for="register-role">Peran</label>
              <select id="register-role" name="role">
                <option value="Mahasiswa">Mahasiswa</option>
                <option value="Siswa">Siswa</option>
                <option value="Dosen">Dosen</option>
              </select>
            </div>

            <div class="field">
              <label for="register-email">Email</label>
              <input id="register-email" name="email" type="email" placeholder="nama@email.com" required />
            </div>

            <div class="field">
              <label for="register-password">Password</label>
              <input id="register-password" name="password" type="password" placeholder="Minimal 8 karakter" required />
            </div>

            <button type="submit" class="button button-primary">Daftar sekarang</button>
            <div class="auth-message" id="register-message"></div>
          </form>

          <div class="switch-link">Sudah punya akun? <a href="#" data-page="login">Masuk</a></div>
        </div>
      </div>
    </div>
  </div>
`;

const renderDashboardPage = (): string => {
  const currentUser = getCurrentUser();
  const userName = currentUser?.name ?? 'Mahasiswa';

  return `
    <div class="container user-dashboard-shell">
      <div class="topbar-dashboard">
        <div>
          <span class="eyebrow">Dashboard pengguna</span>
          <h1>Selamat datang, ${userName}</h1>
        </div>

        <div class="user-pill-wrap">
          <div class="user-pill">
            <span class="user-avatar">${userName.charAt(0).toUpperCase()}</span>
            ${userName}
          </div>
          <button class="button button-secondary" id="logout-button">Keluar</button>
        </div>
      </div>

      <section class="welcome-banner">
        <div>
          <p class="eyebrow">Progress kamu</p>
          <h2>Rekomendasi terbaik untuk masa depanmu sudah siap.</h2>
        </div>
        <div class="banner-visual">
          <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80" alt="Tim membahas roadmap karier" />
        </div>
        <button class="button button-primary" data-page="home">Mulai assessment baru</button>
      </section>

      <div class="dashboard-grid user-grid">
        <div class="stat-card accent-card">
          <div class="stat-kpi">
            <div>
              <div class="stat-label">Skill match</div>
              <span class="stat-number">87%</span>
            </div>
            <span class="delta positive">Naik 12%</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-kpi">
            <div>
              <div class="stat-label">Roadmap</div>
              <span class="stat-number">6/8</span>
            </div>
            <span class="delta positive">76%</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-kpi">
            <div>
              <div class="stat-label">Sertifikat</div>
              <span class="stat-number">3</span>
            </div>
            <span class="delta positive">Aktif</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-kpi">
            <div>
              <div class="stat-label">Target karier</div>
              <span class="stat-number">UI/UX</span>
            </div>
            <span class="delta positive">Ready</span>
          </div>
        </div>
      </div>

      <div class="dashboard-main-grid">
        <div class="panel-card large-panel">
          <div class="panel-header">
            <div>
              <span class="stat-label">Analisis kemampuan</span>
              <h3>Skill Gap kamu</h3>
            </div>
            <span class="badge badge-indigo">Updated today</span>
          </div>

          <div class="skill-overview">
            <div class="donut-wrap">
              <div class="donut-chart">
                <strong>81%</strong>
              </div>
            </div>

            <div class="skill-list">
              <div class="skill-row">
                <div>
                  <strong>Problem solving</strong>
                  <small>Strong</small>
                </div>
                <span>84%</span>
              </div>
              <div class="skill-row">
                <div>
                  <strong>Communication</strong>
                  <small>Growing</small>
                </div>
                <span>73%</span>
              </div>
              <div class="skill-row">
                <div>
                  <strong>Research</strong>
                  <small>Excellent</small>
                </div>
                <span>90%</span>
              </div>
            </div>
          </div>
        </div>

        <div class="panel-card">
          <div class="panel-header">
            <div>
              <span class="stat-label">Next milestone</span>
              <h3>Roadmap</h3>
            </div>
          </div>

          <div class="roadmap-list">
            <div class="roadmap-item done">
              <span class="roadmap-dot"></span>
              <div>
                <strong>Setup profil</strong>
                <small>Selesai</small>
              </div>
            </div>
            <div class="roadmap-item active">
              <span class="roadmap-dot"></span>
              <div>
                <strong>Belajar UX Research</strong>
                <small>2 dari 4 modul</small>
              </div>
            </div>
            <div class="roadmap-item">
              <span class="roadmap-dot"></span>
              <div>
                <strong>Portfolio mini project</strong>
                <small>Belum dimulai</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="lower-grid">
        <div class="panel-card">
          <div class="panel-header">
            <div>
              <span class="stat-label">Rekomendasi</span>
              <h3>Track yang disarankan</h3>
            </div>
          </div>

          <div class="recommendation-list">
            <div class="recommend-item">
              <div>
                <strong>UI/UX Research</strong>
                <small>Match 92%</small>
              </div>
              <button class="button button-secondary tiny" data-page="certificate-detail" data-certificate-id="cert-uiux">Lihat</button>
            </div>
            <div class="recommend-item">
              <div>
                <strong>Data Visualization</strong>
                <small>Match 84%</small>
              </div>
              <button class="button button-secondary tiny" data-page="certificate-detail" data-certificate-id="cert-data-science">Lihat</button>
            </div>
            <div class="recommend-item">
              <div>
                <strong>Web Developer</strong>
                <small>Match 80%</small>
              </div>
              <button class="button button-secondary tiny" data-page="certificate-detail" data-certificate-id="cert-web-dev">Lihat</button>
            </div>
          </div>
        </div>

        <div class="panel-card">
          <div class="panel-header">
            <div>
              <span class="stat-label">Progress</span>
              <h3>Certificate progress</h3>
            </div>
          </div>

          <div class="progress-stack">
            <div class="progress-item">
              <div class="progress-label-row">
                <strong>UI/UX Research</strong>
                <span>68%</span>
              </div>
              <div class="progress-bar small"><span style="width:68%"></span></div>
            </div>
            <div class="progress-item">
              <div class="progress-label-row">
                <strong>Data Science</strong>
                <span>54%</span>
              </div>
              <div class="progress-bar small"><span style="width:54%"></span></div>
            </div>
            <div class="progress-item">
              <div class="progress-label-row">
                <strong>Web Developer</strong>
                <span>42%</span>
              </div>
              <div class="progress-bar small"><span style="width:42%"></span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
};

const renderCertificateDetailPage = (): string => {
  const certificate = getSelectedCertificate();

  return `
    <div class="container detail-shell">
      <div class="detail-header">
        <button class="button button-secondary" data-page="home">← Kembali</button>
        <div class="detail-title-group">
          <span class="eyebrow">Detail sertifikat</span>
          <h1>${certificate.name}</h1>
        </div>
      </div>

      <div class="detail-layout">
        <div class="detail-main card-panel">
          <div class="detail-meta">
            <span class="badge badge-indigo">${certificate.level}</span>
            <span class="badge badge-sky">${certificate.category}</span>
          </div>

          <p class="detail-description">${certificate.description}</p>

          <div class="detail-stats">
            <div>
              <small>Penyelenggara</small>
              <strong>${certificate.issuer}</strong>
            </div>
            <div>
              <small>Durasi</small>
              <strong>${certificate.duration}</strong>
            </div>
            <div>
              <small>Rating</small>
              <strong>${certificate.rating.toFixed(1)} / 5</strong>
            </div>
          </div>

          <div class="detail-section">
            <h3>Skills yang akan didapat</h3>
            <div class="tag-list">
              ${certificate.skills.map((skill) => `<span>${skill}</span>`).join('')}
            </div>
          </div>

          <div class="detail-section">
            <h3>Modul pembelajaran</h3>
            <ul class="feature-list">
              ${certificate.modules.map((module) => `<li>${module}</li>`).join('')}
            </ul>
          </div>
        </div>

        <aside class="detail-sidebar card-panel">
          <div class="price-card">
            <span class="price-label">Harga program</span>
            <h2>${certificate.price}</h2>
          </div>

          <button class="button button-primary wide" data-page="login">Daftar sekarang</button>
          <button class="button button-secondary wide" data-page="dashboard">Lihat dashboard</button>
        </aside>
      </div>
    </div>
  `;
};

const root = document.querySelector('#app');
if (!root) throw new Error('Aplikasi root tidak ditemukan');

const renderPage = (page: PageName): void => {
  const content =
    page === 'home'
      ? renderHomePage()
      : page === 'login'
        ? renderLoginPage()
        : page === 'register'
          ? renderRegisterPage()
          : page === 'dashboard'
            ? renderDashboardPage()
            : renderCertificateDetailPage();

  root.innerHTML = content;
  bindNavigation();
  bindAuthForms();
  bindLogout();
};

const bindNavigation = (): void => {
  const triggers = document.querySelectorAll('[data-page]');

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      const button = event.currentTarget as HTMLElement;
      const target = button.dataset.page as PageName | undefined;
      const certificateId = button.dataset.certificateId;

      if (certificateId) {
        selectedCertificateId = certificateId;
      }

      if (target) {
        renderPage(target);
      }
    });
  });
};

const bindLogout = (): void => {
  const logoutButton =
    document.querySelector<HTMLButtonElement>('#logout-button');
  if (!logoutButton) return;

  logoutButton.addEventListener('click', () => {
    setCurrentUser(null);
    renderPage('home');
  });
};

const bindAuthForms = (): void => {
  const loginForm = document.querySelector<HTMLFormElement>('#login-form');
  const registerForm =
    document.querySelector<HTMLFormElement>('#register-form');

  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(loginForm);
      const email = String(formData.get('email') ?? '').trim();
      const password = String(formData.get('password') ?? '').trim();
      const message = document.querySelector<HTMLDivElement>('#login-message');

      try {
        if (!email || !password) {
          throw new Error('Email dan password wajib diisi.');
        }

        if (message) {
          message.textContent = 'Memeriksa akun...';
          message.className = 'auth-message';
        }

        const user = await authApi.login({ email, password });

        if (message) {
          message.textContent = `Login berhasil. Selamat datang, ${user.name}!`;
          message.className = 'auth-message success';
        }

        window.setTimeout(() => renderPage('dashboard'), 600);
      } catch (error) {
        if (message) {
          message.textContent =
            error instanceof Error ? error.message : 'Login gagal.';
          message.className = 'auth-message error';
        }
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(registerForm);
      const fullName = String(formData.get('fullName') ?? '').trim();
      const role = String(formData.get('role') ?? 'Mahasiswa');
      const email = String(formData.get('email') ?? '').trim();
      const password = String(formData.get('password') ?? '').trim();
      const message =
        document.querySelector<HTMLDivElement>('#register-message');

      try {
        if (fullName.length < 2) {
          throw new Error('Nama lengkap minimal 2 karakter.');
        }

        if (!email.includes('@')) {
          throw new Error('Format email tidak valid.');
        }

        if (password.length < 8) {
          throw new Error('Password minimal 8 karakter.');
        }

        if (message) {
          message.textContent = 'Mendaftarkan akun...';
          message.className = 'auth-message';
        }

        await authApi.register({ fullName, email, role, password });

        if (message) {
          message.textContent = 'Registrasi berhasil, silakan login.';
          message.className = 'auth-message success';
        }

        window.setTimeout(() => renderPage('login'), 900);
      } catch (error) {
        if (message) {
          message.textContent =
            error instanceof Error ? error.message : 'Pendaftaran gagal.';
          message.className = 'auth-message error';
        }
      }
    });
  }
};

renderPage('home');
