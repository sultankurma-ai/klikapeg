import React, { useState } from 'react';

export default function Navbar({ activePage, setActivePage, currentUser, onLogout, syncStatus, onSync }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Beranda', icon: 'dashboard' },
    { id: 'pegawai', label: 'Data Pegawai', icon: 'group' },
    { id: 'kgb', label: 'Layanan KGB', icon: 'payments' },
    { id: 'surat-tugas', label: 'Surat Tugas', icon: 'assignment' },
    { id: 'spd', label: 'SPD', icon: 'flight_takeoff' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-surface-container-lowest/95 backdrop-blur border-b border-outline-variant/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActivePage('dashboard')}>
            <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
              <img src="/assets/logo-clean.png" alt="KlikApeg" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-display font-extrabold text-lg text-primary tracking-tight block">KlikApeg</span>
              <p className="text-[11px] text-outline font-medium -mt-0.5 hidden sm:block">
                Kelola Layanan Informasi Kepegawaian & Administrasi
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'
                  }`}
                >
                  <span className={`material-symbols-outlined text-[18px] ${isActive ? 'text-secondary-container' : 'text-outline'}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Profile & Quick Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Sync Badge */}
            <button
              onClick={onSync}
              title="Klik untuk sinkronkan ulang database KlikCuti"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
            >
              <span className={`w-2 h-2 rounded-full ${syncStatus === 'syncing' ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`}></span>
              <span>{syncStatus === 'syncing' ? 'Menyinkronkan...' : 'KlikCuti Terhubung'}</span>
              <span className={`material-symbols-outlined text-[14px] ${syncStatus === 'syncing' ? 'animate-spin' : ''}`}>sync</span>
            </button>

            {/* Profile Dropdown / Card */}
            <div className="flex items-center gap-2 pl-2 border-l border-outline-variant">
              <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-xs ring-2 ring-secondary-container/40">
                MK
              </div>
              <div className="text-left text-xs">
                <p className="font-semibold text-primary leading-tight truncate max-w-[130px]">
                  {currentUser?.nama || 'Mas Khabibah Nur'}
                </p>
                <p className="text-[10px] text-outline truncate max-w-[130px]">
                  {currentUser?.jabatan || 'Kasubbag Kepegawaian'}
                </p>
              </div>

              {/* Logout Button */}
              <button
                onClick={onLogout}
                title="Keluar dari Aplikasi"
                className="p-1.5 rounded-lg text-outline hover:text-error hover:bg-error-container/30 transition-colors ml-1"
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={onSync}
              className="p-1.5 rounded-lg text-emerald-700 bg-emerald-50 border border-emerald-200"
              title="Sinkron KlikCuti"
            >
              <span className={`material-symbols-outlined text-[20px] ${syncStatus === 'syncing' ? 'animate-spin' : ''}`}>sync</span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-primary hover:bg-surface-container transition-colors"
              aria-label="Buka Menu"
            >
              <span className="material-symbols-outlined text-[24px]">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-outline-variant/60 bg-surface px-4 pt-3 pb-5 space-y-2 shadow-lg animate-fadeIn">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActivePage(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-primary text-on-primary'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <span className={`material-symbols-outlined text-[20px] ${isActive ? 'text-secondary-container' : 'text-outline'}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-3 mt-2 border-t border-outline-variant/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-xs">
                MK
              </div>
              <div className="text-left text-xs">
                <p className="font-semibold text-primary">{currentUser?.nama || 'Mas Khabibah Nur'}</p>
                <p className="text-[10px] text-outline">Kasubbag Kepegawaian & Ortala</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-error bg-error-container/30 hover:bg-error-container/50"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              <span>Keluar</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

