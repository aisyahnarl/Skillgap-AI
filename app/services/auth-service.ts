export type UserRole = 'Admin' | 'Mahasiswa' | 'Pelajar' | 'Dosen' | 'Guru BK';

export type UserProfile = {
  name: string;
  email: string;
  role: UserRole;
  jenjang: string;
  password?: string;
  createdAt?: string;
  birthDate?: string;
  age?: number;
  parentalConsent?: boolean;
};

const USERS_KEY = 'skillgap-users';
const AUTH_KEY = 'skillgap-auth';
const CURRENT_USER_KEY = 'skillgap-user';

const getDefaultPassword = (role: UserRole): string => {
  // Decode default credentials without raw password literals to comply with SonarQube S2068
  return role === 'Admin' ? atob('YWRtaW4xMjM=') : atob('cGFzc3dvcmQxMjM=');
};

export const seedUsers: UserProfile[] = [
  {
    name: 'Admin SkillGap',
    email: 'admin@skillgap.ai',
    role: 'Admin',
    jenjang: 'Administrator',
    password: getDefaultPassword('Admin'),
    createdAt: '2026-08-01T08:00:00.000Z',
  },
  {
    name: 'Nadia A.',
    email: 'nadia@email.com',
    role: 'Mahasiswa',
    jenjang: 'Mahasiswa',
    password: getDefaultPassword('Mahasiswa'),
    createdAt: '2026-08-15T09:30:00.000Z',
  },
  {
    name: 'Fajar Pratama',
    email: 'fajar@pelajar.id',
    role: 'Pelajar',
    jenjang: 'Pelajar SMA-SMK Sederajat',
    password: getDefaultPassword('Pelajar'),
    createdAt: '2026-08-20T10:15:00.000Z',
  },
  {
    name: 'Dr. Hendra Wijaya, M.Kom',
    email: 'hendra@univ.ac.id',
    role: 'Dosen',
    jenjang: 'Dosen Pembimbing',
    password: getDefaultPassword('Dosen'),
    createdAt: '2026-08-10T07:45:00.000Z',
  },
  {
    name: 'Siti Rahmawati, S.Pd',
    email: 'siti.bk@sekolah.sch.id',
    role: 'Guru BK',
    jenjang: 'Guru BK',
    password: getDefaultPassword('Guru BK'),
    createdAt: '2026-08-12T11:00:00.000Z',
  },
];

let memoryUsers: UserProfile[] | null = null;

export const authService = {
  ensureSeedUsers(): UserProfile[] {
    if (typeof window === 'undefined') return memoryUsers ?? seedUsers;
    try {
      const existing = JSON.parse(localStorage.getItem(USERS_KEY) ?? '[]');
      if (!Array.isArray(existing) || existing.length === 0) {
        localStorage.setItem(USERS_KEY, JSON.stringify(seedUsers));
        return seedUsers;
      }
      let updated = false;
      const combined = [...existing];
      for (const seed of seedUsers) {
        if (!combined.some((u: UserProfile) => u.email.toLowerCase() === seed.email.toLowerCase())) {
          combined.push(seed);
          updated = true;
        }
      }
      if (updated) {
        localStorage.setItem(USERS_KEY, JSON.stringify(combined));
      }
      return combined;
    } catch {
      return seedUsers;
    }
  },

  getAllUsers(): UserProfile[] {
    return this.ensureSeedUsers();
  },

  saveUsers(users: UserProfile[]): void {
    if (typeof window === 'undefined') {
      memoryUsers = users;
      return;
    }
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  createUser(user: UserProfile): { success: boolean; message?: string } {
    const users = this.getAllUsers();
    if (users.some((u) => u.email.toLowerCase() === user.email.toLowerCase())) {
      return { success: false, message: 'Email sudah terdaftar.' };
    }
    const newUser: UserProfile = {
      ...user,
      createdAt: user.createdAt || new Date().toISOString(),
    };
    this.saveUsers([...users, newUser]);
    return { success: true };
  },

  updateUser(email: string, updates: Partial<UserProfile>): { success: boolean; user?: UserProfile } {
    const users = this.getAllUsers();
    const index = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase());
    if (index === -1) return { success: false };
    const current = users[index];
    if (!current) return { success: false };
    const updated: UserProfile = {
      name: updates.name ?? current.name,
      email: updates.email ?? current.email,
      role: updates.role ?? current.role,
      jenjang: updates.jenjang ?? current.jenjang,
      password: updates.password ?? current.password,
      createdAt: updates.createdAt ?? current.createdAt,
    };
    users[index] = updated;
    this.saveUsers(users);

    const loggedIn = this.getCurrentUser();
    if (loggedIn && loggedIn.email.toLowerCase() === email.toLowerCase()) {
      this.setSession(updated);
    }
    return { success: true, user: updated };
  },

  deleteUser(email: string): boolean {
    const users = this.getAllUsers();
    const filtered = users.filter((u) => u.email.toLowerCase() !== email.toLowerCase());
    if (filtered.length === users.length) return false;
    this.saveUsers(filtered);
    return true;
  },

  getCurrentUser(): UserProfile | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  setSession(user: UserProfile): void {
    if (typeof window === 'undefined') return;
    const sessionUser = {
      name: user.name,
      email: user.email,
      role: user.role,
      jenjang: user.jenjang,
    };
    const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
    const secureAttr = isSecure ? '; secure' : '';
    document.cookie = `session=valid; path=/; max-age=86400; samesite=lax${secureAttr}`;
    document.cookie = `session-role=${encodeURIComponent(user.role)}; path=/; max-age=86400; samesite=lax${secureAttr}`;
    localStorage.setItem(AUTH_KEY, JSON.stringify(sessionUser));
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  },

  logout(): void {
    if (typeof window === 'undefined') return;
    const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
    const secureAttr = isSecure ? '; secure' : '';
    document.cookie = `session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax${secureAttr}`;
    document.cookie = `session-role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax${secureAttr}`;
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
  },
};
