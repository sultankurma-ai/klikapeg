import React from 'react';

export default function Header({
  activePage,
  onOpenSidebar,
  currentUser,
  syncStatus,
  onSync,
  onLogout,
  onNavigate
}) {
  const pageTitles = {
    'dashboard': { title: 'Beranda Kepegawaian', subtitle: 'Otomatisasi Administrasi Pegawai' },
    'pegawai': { title: 'Data Pegawai', subtitle: 'Pangkalan Data Aparatur Terintegrasi KlikCuti' },
    'kgb': { title: 'Layanan Kenaikan Gaji Berkala (KGB)', subtitle: 'Kontrol Jadwal & Penerbitan SK KGB Resmi' },
    'surat-tugas': { title: 'Surat Tugas Kedinasan', subtitle: 'Formulir Penugasan & Penomoran Resmi PA Lumajang' },
    'spd': { title: 'Surat Perjalanan Dinas (SPD)', subtitle: 'Penerbitan Lembar SPD Terhubung Surat Tugas' },
    'akun': { title: 'Pengaturan Akun Pengelola', subtitle: 'Manajemen Hak Akses, Kredensial & Sistem CRUD Aparatur' }
  };

  const currentInfo = pageTitles[activePage] || { title: 'KlikApeg', subtitle: 'Pengadilan Agama Lumajang' };

  return (
    <header className="sticky top-0 z-30 bg-[#1B2A4A] border-b border-[#243761] shadow-md no-print text-white">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Page Title */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Hamburger toggle button (mobile) */}
          <button
            onClick={onOpenSidebar}
            className="p-2 rounded-xl text-white hover:bg-white/10 transition-colors lg:hidden -ml-1 flex-shrink-0"
            aria-label="Buka Menu Sidebar"
          >
            <span className="material-symbols-outlined text-[24px]">menu</span>
          </button>

          <div className="truncate">
            <h1 className="font-display font-extrabold text-base sm:text-lg text-white truncate leading-tight">
              {currentInfo.title}
            </h1>
            <p className="text-[11px] text-gray-300 truncate hidden sm:block">
              {currentInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Date, User Avatar, & Tombol Exit */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
          {/* Today's Date Badge */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 text-gray-200 text-xs font-semibold border border-white/15">
            <span className="material-symbols-outlined text-[16px] text-amber-300">calendar_today</span>
            <span>Sabtu, 14 November 2026</span>
          </div>

          {/* Quick User Avatar Badge */}
          <div
            onClick={() => onNavigate && onNavigate('akun')}
            title="Klik untuk membuka Pengaturan Akun"
            className="flex items-center gap-2 pl-2 border-l border-white/20 cursor-pointer hover:opacity-85 transition-opacity"
          >
            <div className="w-8 h-8 rounded-full bg-amber-400 text-black font-extrabold flex items-center justify-center text-xs shadow-sm">
              {currentUser?.nama?.substring(0, 2)?.toUpperCase() || 'SR'}
            </div>
            <div className="hidden sm:block text-left text-xs">
              <p className="font-bold text-white leading-tight truncate max-w-[140px]">
                {currentUser?.nama?.split(',')[0] || 'Siti Rahmawati'}
              </p>
              <p className="text-[10px] text-gray-300 truncate max-w-[140px]">
                {currentUser?.role || 'Kasubbag Kepegawaian'}
              </p>
            </div>
          </div>

          {/* Tombol Exit (Logout) di Pojok Kanan Atas Banner */}
          <button
            onClick={onLogout}
            title="Keluar dari Aplikasi (Exit)"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-rose-600/80 border border-rose-400/40 hover:bg-rose-600 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </div>
    </header>
  );
}
