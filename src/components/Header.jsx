import React from 'react';

export default function Header({
  activePage,
  onOpenSidebar,
  currentUser,
  syncStatus,
  onSync,
  onLogout
}) {
  const pageTitles = {
    'dashboard': { title: 'Beranda Kepegawaian', subtitle: 'Ringkasan & Pengingat KGB Aparatur' },
    'pegawai': { title: 'Data Pegawai', subtitle: 'Pangkalan Data Aparatur Terintegrasi KlikCuti' },
    'kgb': { title: 'Layanan Kenaikan Gaji Berkala (KGB)', subtitle: 'Kontrol Jadwal & Penerbitan SK KGB Resmi' },
    'surat-tugas': { title: 'Surat Tugas Kedinasan', subtitle: 'Formulir Penugasan & Penomoran Resmi PA Lumajang' },
    'spd': { title: 'Surat Perjalanan Dinas (SPD)', subtitle: 'Penerbitan Lembar SPD Terhubung Surat Tugas' }
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

        {/* Right: Date, Tombol Database KlikCuti, User Avatar, & Tombol Exit */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
          {/* Today's Date Badge */}
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 text-gray-200 text-xs font-semibold border border-white/15">
            <span className="material-symbols-outlined text-[16px] text-amber-300">calendar_today</span>
            <span>Sabtu, 14 November 2026</span>
          </div>

          {/* Badge Database KlikSurat */}
          <div
            title="Database KlikSurat: Terhubung untuk Penomoran Otomatis & Pengarsipan Naskah Keluar"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-sky-950/60 text-sky-200 border border-sky-400/30 shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.9)]" />
            <div className="text-left hidden lg:block">
              <span className="font-bold text-[11px] text-white block leading-tight">Database KlikSurat</span>
              <span className="text-[10px] text-sky-300 block leading-none">Register Naskah Online</span>
            </div>
            <span className="font-bold text-[11px] text-white lg:hidden">KlikSurat</span>
          </div>

          {/* Tombol Database KlikCuti pada Banner */}
          <button
            onClick={onSync}
            title="Klik untuk sinkronkan ulang database KlikCuti"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-950/60 text-emerald-100 border border-emerald-500/40 hover:bg-emerald-900/80 transition-colors shadow-sm"
          >
            <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${syncStatus === 'syncing' ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'}`} />
            <div className="text-left hidden md:block">
              <span className="font-bold text-[11px] text-white block leading-tight">Database KlikCuti</span>
              <span className="text-[10px] text-emerald-300 block leading-none">
                {syncStatus === 'syncing' ? 'Menyinkronkan...' : 'Terhubung Real-Time'}
              </span>
            </div>
            <span className={`material-symbols-outlined text-[16px] text-emerald-300 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`}>
              sync
            </span>
          </button>

          {/* Quick User Avatar Badge */}
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-white/20">
            <div className="w-8 h-8 rounded-full bg-amber-400 text-black font-extrabold flex items-center justify-center text-xs shadow-sm">
              SR
            </div>
            <div className="hidden lg:block text-left text-xs">
              <p className="font-bold text-white leading-tight truncate max-w-[120px]">
                {currentUser?.nama?.split(',')[0] || 'Siti Rahmawati'}
              </p>
              <p className="text-[10px] text-gray-300 truncate max-w-[120px]">
                Kasubbag Kepegawaian
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
