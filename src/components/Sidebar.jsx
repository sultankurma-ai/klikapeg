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
    { id: 'dashboard', label: 'Beranda', icon: 'dashboard' },
    { id: 'pegawai', label: 'Data Pegawai', icon: 'group' },
    { id: 'kgb', label: 'Layanan KGB', icon: 'payments' },
    { id: 'dasar-gaji', label: 'Dasar Gaji', icon: 'account_balance_wallet' },
    { id: 'surat-tugas', label: 'Surat Tugas', icon: 'assignment' },
    { id: 'spd', label: 'SPD', icon: 'flight_takeoff' },
    { id: 'akun', label: 'Pengaturan Akun', icon: 'manage_accounts' }
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
        <div className="flex-1 px-3.5 py-4 overflow-y-auto space-y-2.5">
          <p className="px-2.5 text-[10px] font-extrabold text-primary/70 uppercase tracking-wider mb-1.5">
            Menu Utama & Layanan
          </p>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActivePage(item.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl transition-all duration-150 text-left group ${
                    isActive
                      ? 'bg-[#1B2A4A] text-white shadow-md ring-2 ring-[#1B2A4A]/20'
                      : 'bg-white/95 hover:bg-white text-[#041534] hover:text-[#1B2A4A] shadow-xs hover:shadow-sm border border-black/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                        isActive
                          ? 'bg-[#E1AD01] text-[#1B2A4A] shadow-xs'
                          : 'bg-black/5 text-[#041534] group-hover:bg-[#E1AD01]/30 group-hover:text-[#1B2A4A]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[17px]">
                        {item.icon}
                      </span>
                    </div>

                    <span
                      className={`font-display font-bold text-xs leading-tight truncate ${
                        isActive ? 'text-white' : 'text-[#041534]'
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>

                  <span
                    className={`material-symbols-outlined text-[15px] transition-transform ${
                      isActive
                        ? 'text-[#E1AD01] translate-x-0.5'
                        : 'text-black/30 group-hover:text-[#1B2A4A] group-hover:translate-x-1'
                    }`}
                  >
                    chevron_right
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Status Koneksi Database Eksternal (KlikCuti) */}
          <div className="pt-2.5 mt-1 border-t border-[#B8870A]/50 space-y-1.5">
            <p className="px-2.5 text-[10px] font-extrabold text-[#041534]/70 uppercase tracking-wider mb-1">
              Koneksi Database Terintegrasi
            </p>

            {/* Tombol Database KlikCuti (Klik untuk Sinkronisasi) */}
            <button
              onClick={onSync}
              title="Klik untuk menyinkronkan data aparatur dari Database KlikCuti"
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#041534] hover:bg-[#082252] text-white shadow-xs border border-emerald-500/40 hover:border-emerald-400 transition-all active:scale-95 group text-left cursor-pointer"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    syncStatus === 'syncing'
                      ? 'bg-amber-400 animate-ping'
                      : 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]'
                  }`}
                />
                <div className="truncate text-left">
                  <p className="font-display font-bold text-xs text-white leading-tight truncate">
                    Database KlikCuti
                  </p>
                  <p className="text-[9.5px] text-emerald-300 font-medium truncate">
                    {syncStatus === 'syncing' ? 'Menyinkronkan...' : 'Terhubung Real-Time'}
                  </p>
                </div>
              </div>

              <div className="w-6 h-6 rounded-md bg-white/10 group-hover:bg-white/20 flex items-center justify-center flex-shrink-0 transition-colors">
                <span
                  className={`material-symbols-outlined text-[15px] text-emerald-300 ${
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
