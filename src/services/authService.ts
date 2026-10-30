export interface User {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'doctor' | 'staff';
}

// Set kredensial resmi akun klinik di sini
const OFFICIAL_CREDENTIALS = [
  {
    username: 'adminpacce',
    password: 'pacce2026Password!', // Ganti dengan password yang kamu inginkan
    user: {
      id: '1',
      username: 'adminpacce',
      name: 'Petugas IT / Admin MCU',
      role: 'admin' as const,
    },
  },
  {
    username: 'dokter',
    password: 'dokterPassword123!', // Kredensial untuk dokter
    user: {
      id: '2',
      username: 'dokter',
      name: 'Dokter Pemeriksa MCU',
      role: 'doctor' as const,
    },
  },
];

export const authService = {
  // Fungsi login dengan validasi kredensial
  async login(usernameInput: string, passwordInput: string): Promise<User | null> {
    // Cari akun yang sesuai
    const account = OFFICIAL_CREDENTIALS.find(
      (cred) =>
        cred.username.toLowerCase() === usernameInput.trim().toLowerCase() &&
        cred.password === passwordInput
    );

    if (!account) {
      // Jika username atau password salah, kembalikan null (gagal login)
      return null;
    }

    // Simpan sesi login ke localStorage jika berhasil
    localStorage.setItem('mcu_user_session', JSON.stringify(account.user));
    return account.user;
  },

  // Logout
  logout(): void {
    localStorage.removeItem('mcu_user_session');
  },

  // Cek user yang sedang login saat halaman di-refresh
  getCurrentUser(): User | null {
    const session = localStorage.getItem('mcu_user_session');
    if (!session) return null;
    try {
      return JSON.parse(session) as User;
    } catch {
      return null;
    }
  },
};