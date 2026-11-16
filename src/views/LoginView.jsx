import React, { useState } from 'react';

export default function LoginView({ onLogin }) {
  const [nip, setNip] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotInput, setForgotInput] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nip.trim()) {
      setErrorMsg('Silakan masukkan Username atau NIP terdaftar');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Silakan masukkan Kata Sandi Anda');
      return;
    }
    setErrorMsg('');
    const isPimpinan = nip === '197603031998031002' || nip.toLowerCase() === 'ketua' || nip === '198109142006041002';
    onLogin({
      nip: nip.trim(),
      nama: isPimpinan ? 'Fatkur Rosyad, S.Ag., M.H., M.HES.' : 'Mas Khabibah Nur, S.H.',
      role: isPimpinan ? 'Pimpinan Pengadilan' : 'Admin Kepegawaian',
      jabatan: isPimpinan ? 'Ketua Pengadilan Agama Lumajang' : 'Kepala Sub Bagian Kepegawaian, Organisasi dan Tata Laksana'
    });
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (forgotInput) {
      setForgotSuccess(true);
      setTimeout(() => {
        setForgotSuccess(false);
        setShowForgotModal(false);
        setForgotInput('');
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center py-6 sm:py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative gradient elements */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary-fixed/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-secondary-fixed/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Left Branding / 3D Illustration Column */}
        <div className="lg:col-span-6 flex flex-col justify-center space-y-6 lg:pr-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary w-fit text-xs font-semibold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-secondary-container"></span>
            PORTAL KHUSUS TIM KEPEGAWAIAN & PIMPINAN
          </div>

          <div>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-primary leading-tight">
              KlikApeg
            </h1>
            <p className="mt-2 text-base text-on-surface-variant font-medium">
              Sistem Otomasi Kenaikan Gaji Berkala (KGB), Surat Tugas, dan Surat Perjalanan Dinas Terintegrasi Database KlikCuti.
            </p>
          </div>

          {/* Agency Banner with Logo Instansi */}
          <div className="relative rounded-3xl overflow-hidden shadow-xl border border-outline-variant/60 bg-gradient-to-br from-primary via-primary-container to-primary aspect-[16/10] flex flex-col items-center justify-center p-6 group">
            <div className="w-24 h-24 mb-3 flex items-center justify-center flex-shrink-0">
              <img 
                src="/assets/logo-instansi.png" 
                alt="Logo Instansi Pengadilan Agama Lumajang" 
                className="w-full h-full object-contain drop-shadow-lg transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <h3 className="font-display font-bold text-lg text-white text-center tracking-wide">
              Pengadilan Agama Lumajang
            </h3>
            <p className="text-xs text-primary-fixed-dim text-center mt-0.5">
              Modernisasi Administrasi Kepegawaian Digital
            </p>

            {/* Overlay badge */}
            <div className="absolute bottom-3 left-3 right-3 bg-surface-container-lowest/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/40 flex items-center justify-between text-xs text-primary font-semibold shadow-sm">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-emerald-600">sync</span>
                Database KlikCuti Tersinkron
              </span>
              <span className="text-[11px] text-secondary font-bold">KGB & Perjadin</span>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/40 flex items-start gap-2.5 shadow-sm">
              <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5">timer</span>
              <div>
                <p className="font-bold text-primary">Deteksi KGB Cepat</p>
                <p className="text-outline text-[11px]">Hitung otomatis jadwal & nominal gaji baru</p>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/40 flex items-start gap-2.5 shadow-sm">
              <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5">print</span>
              <div>
                <p className="font-bold text-primary">Dokumen Siap Cetak</p>
                <p className="text-outline text-[11px]">Format SK KGB, Surat Tugas & Lembar SPD resmi</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="lg:col-span-6">
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/60 shadow-xl p-6 sm:p-10">
            {/* Header Form */}
            <div className="flex items-center gap-3 pb-6 border-b border-outline-variant/40">
              <div className="w-14 h-14 flex items-center justify-center flex-shrink-0">
                <img src="/assets/logo-clean.png" alt="Logo" className="w-full h-full object-contain drop-shadow-sm" />
              </div>
              <div>
                <h2 className="font-display font-extrabold text-xl text-primary">
                  Selamat Datang di KlikApeg
                </h2>
                <p className="text-xs text-on-surface-variant font-medium">
                  Pengadilan Agama Lumajang
                </p>
              </div>
            </div>

            {/* Error Message Alert */}
            {errorMsg && (
              <div className="mt-4 p-3 rounded-xl bg-error-container/40 border border-error/30 text-on-error-container text-xs flex items-start gap-2 animate-fadeIn">
                <span className="material-symbols-outlined text-[18px] text-error flex-shrink-0 mt-0.5">error</span>
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {/* Username/NIP Input */}
              <div>
                <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1.5">
                  Username/NIP
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-outline">
                    <span className="material-symbols-outlined text-[20px]">badge</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={nip}
                    onChange={(e) => setNip(e.target.value)}
                    placeholder="Masukkan Username atau NIP"
                    className="block w-full pl-11 pr-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-primary placeholder-outline focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm font-medium transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-primary uppercase tracking-wider">
                    Kata Sandi
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-xs font-semibold text-secondary hover:underline"
                  >
                    Lupa kata sandi?
                  </button>
                </div>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-outline">
                    <span className="material-symbols-outlined text-[20px]">lock</span>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="block w-full pl-11 pr-11 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-primary placeholder-outline focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm font-medium transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-outline hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary"
                />
                <label htmlFor="remember-me" className="ml-2 block text-xs font-medium text-on-surface-variant">
                  Ingat sesi di perangkat komputer kantor ini
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full mt-2 py-3 px-4 rounded-xl font-display font-bold text-sm text-on-primary bg-primary hover:bg-primary-container shadow-md hover:shadow-lg transition-all duration-150 flex items-center justify-center gap-2 group"
              >
                <span>Masuk ke KlikApeg</span>
                <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-outline-variant/40 text-center">
              <p className="text-[11px] text-outline">
                Akses terbatas khusus aparatur Pengadilan Agama Lumajang. Hubungi Tim Kepegawaian & TI untuk aktivasi akun.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Hak Cipta Sesuai Referensi */}
      <div className="mt-8 text-center relative z-10">
        <p className="text-xs text-outline font-medium">
          Hak Cipta &copy; bangQo-2026. Seluruh Hak Cipta Dilindungi Undang-Undang.
        </p>
      </div>

      {/* Modal Lupa Kata Sandi */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-surface-container-lowest rounded-3xl max-w-md w-full p-6 shadow-2xl border border-outline-variant relative">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-outline hover:text-primary hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            <div className="w-12 h-12 rounded-2xl bg-secondary-fixed/50 text-secondary flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-2xl">lock_reset</span>
            </div>

            <h3 className="font-display font-extrabold text-lg text-primary">
              Pemulihan Kata Sandi Akun
            </h3>
            <p className="mt-1 text-xs text-on-surface-variant leading-relaxed">
              Masukkan NIP Anda. Sistem akan memverifikasi ke pangkalan data pegawai KlikCuti dan mengirimkan tautan reset ke email resmi Mahkamah Agung Anda.
            </p>

            {forgotSuccess ? (
              <div className="mt-5 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600">check_circle</span>
                <span>Tautan reset berhasil dikirimkan ke email kedinasan Anda!</span>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1">
                    NIP Pegawai
                  </label>
                  <input
                    type="text"
                    required
                    value={forgotInput}
                    onChange={(e) => setForgotInput(e.target.value)}
                    placeholder="Masukkan 18 digit NIP"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-outline-variant text-xs font-semibold text-primary hover:bg-surface-container-low transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 px-4 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary-container transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <span>Kirim Tautan</span>
                    <span className="material-symbols-outlined text-[16px]">send</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

