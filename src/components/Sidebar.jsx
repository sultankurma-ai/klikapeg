import React from 'react';

export default function Sidebar({
  activePage,
  setActivePage,
  currentUser,
  syncStatus,
  onSync,
  isOpen,
  setIsOpen
}) {
  const navItems = [
    { id: 'dashboard', label: 'Beranda', icon: 'dashboard', desc: 'Ringkasan & Pengingat' },
    { id: 'pegawai', label: 'Data Pegawai', icon: 'group', desc: 'Pangkalan Data KlikCuti' },
    { id: 'kgb', label: 'Layanan KGB', icon: 'payments', desc: 'Jadwal & Cetak SK KGB' },
    { id: 'surat-tugas', label: 'Surat Tugas', icon: 'assignment', desc: 'Penugasan Kedinasan' },
    { id: 'spd', label: 'SPD', icon: 'flight_takeoff', desc: 'Surat Perjalanan Dinas' },
    { id: 'akun', label: 'Pengaturan Akun', icon: 'manage_accounts', desc: 'Kelola Pengelola & Akses' }
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container with Mustard Background */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#D4A017] border-r border-[#B8870A] shadow-xl lg:shadow-none flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo & Header Branding */}
        <div className="p-6 border-b border-[#B8870A]/50 bg-black/5">
          <div className="flex items-start justify-between">
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => { setActivePage('dashboard'); setIsOpen(false); }}
            >
              <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
                <img
                  src="/assets/logo-clean.png"
                  alt="KlikApeg"
                  className="w-full h-full object-contain drop-shadow-md"
                />
              </div>

              <div>
                <span className="font-display font-extrabold text-2xl text-primary tracking-tight block leading-tight">
                  KlikApeg
                </span>
                <p className="text-[11px] text-primary/80 font-semibold mt-0.5 line-clamp-2 leading-snug">
                  Kelola Layanan Informasi Kepegawaian & Administrasi
                </p>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-xl text-primary hover:bg-black/10 lg:hidden -mr-2"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 px-4 py-5 overflow-y-auto space-y-3">
          <p className="px-3 text-[10px] font-extrabold text-primary/70 uppercase tracking-wider mb-2">
            Menu Utama & Layanan
          </p>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActivePage(item.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all duration-150 text-left group ${
                    isActive
                      ? 'bg-primary text-on-primary shadow-lg ring-2 ring-primary/20'
                      : 'bg-white/95 hover:bg-white text-on-surface-variant hover:text-primary shadow-sm hover:shadow-md border border-black/5'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                        isActive
                          ? 'bg-secondary-container text-on-secondary-container shadow-sm'
                          : 'bg-surface-container text-primary group-hover:bg-primary-fixed/40'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {item.icon}
                      </span>
                    </div>

                    <div className="truncate">
                      <p
                        className={`font-display font-bold text-xs leading-tight truncate ${
                          isActive ? 'text-white' : 'text-primary'
                        }`}
                      >
                        {item.label}
                      </p>
                      <p
                        className={`text-[10px] truncate mt-0.5 ${
                          isActive ? 'text-primary-fixed-dim' : 'text-outline'
                        }`}
                      >
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`material-symbols-outlined text-[16px] transition-transform ${
                      isActive
                        ? 'text-secondary-container translate-x-0.5'
                        : 'text-outline/40 group-hover:text-primary group-hover:translate-x-1'
                    }`}
                  >
                    chevron_right
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Status Koneksi Database Eksternal (KlikSurat & KlikCuti) */}
          <div className="pt-4 mt-2 border-t border-[#B8870A]/50 space-y-2">
            <p className="px-3 text-[10px] font-extrabold text-[#041534]/70 uppercase tracking-wider mb-2">
              Koneksi Database Terintegrasi
            </p>

            {/* Tombol / Badge Database KlikSurat */}
            <div
              title="Database KlikSurat: Terhubung untuk Penomoran Otomatis & Registrasi Naskah Online"
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#041534] text-white shadow-md border border-sky-400/40 hover:border-sky-400/70 transition-all"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.9)] flex-shrink-0" />
                <div className="truncate text-left">
                  <p className="font-display font-bold text-xs text-white leading-tight truncate">
                    Database KlikSurat
                  </p>
                  <p className="text-[10px] text-sky-300 font-medium truncate mt-0.5">
                    Register Naskah Online
                  </p>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-sky-500/20 text-sky-200 border border-sky-400/40 flex-shrink-0">
                Aktif
              </span>
            </div>

            {/* Tombol Database KlikCuti (Klik untuk Sinkronisasi) */}
            <button
              onClick={onSync}
              title="Klik untuk menyinkronkan data aparatur dari Database KlikCuti"
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#041534] hover:bg-[#082252] text-white shadow-md border border-emerald-500/40 hover:border-emerald-400 transition-all active:scale-95 group text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                    syncStatus === 'syncing'
                      ? 'bg-amber-400 animate-ping'
                      : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]'
                  }`}
                />
                <div className="truncate text-left">
                  <p className="font-display font-bold text-xs text-white leading-tight truncate">
                    Database KlikCuti
                  </p>
                  <p className="text-[10px] text-emerald-300 font-medium truncate mt-0.5">
                    {syncStatus === 'syncing' ? 'Menyinkronkan...' : 'Terhubung Real-Time'}
                  </p>
                </div>
              </div>

              <div className="w-7 h-7 rounded-lg bg-white/10 group-hover:bg-white/20 flex items-center justify-center flex-shrink-0 transition-colors">
                <span
                  className={`material-symbols-outlined text-[17px] text-emerald-300 ${
                    syncStatus === 'syncing' ? 'animate-spin text-amber-300' : ''
                  }`}
                >
                  sync
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Hak Cipta di Bawah Sidebar Sesuai Referensi */}
        <div className="p-4 border-t border-[#B8870A]/50 bg-black/5 text-center">
          <p className="text-[10.5px] text-[#041534] font-semibold leading-relaxed">
            Hak Cipta &copy; bangQo-2026. Seluruh Hak Cipta Dilindungi Undang-Undang.
          </p>
        </div>
      </aside>
    </>
  );
}
