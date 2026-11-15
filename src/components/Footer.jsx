import React from 'react';

export default function Footer() {
  return (
    <footer className="mt-auto bg-surface-container-low border-t border-outline-variant/60 shadow-none no-print">
      <div className="flex flex-col md:flex-row justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto gap-4 text-xs">
        <div className="flex items-center gap-2 text-on-surface-variant flex-wrap justify-center md:justify-start">
          <span className="font-display font-bold text-primary text-sm">KlikApeg PA Lumajang</span>
          <span className="text-outline">•</span>
          <span>© 2026 Pengadilan Agama Lumajang. Seluruh hak cipta dilindungi.</span>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-outline">
          <a href="#privacy" onClick={(e) => e.preventDefault()} className="hover:text-primary transition-colors">
            Kebijakan Privasi
          </a>
          <span>•</span>
          <a href="#terms" onClick={(e) => e.preventDefault()} className="hover:text-primary transition-colors">
            Syarat & Ketentuan
          </a>
          <span>•</span>
          <span className="flex items-center gap-1 text-secondary font-medium">
            <span className="material-symbols-outlined text-[14px]">lock</span>
            <span>Status Keamanan SSL 256-bit</span>
          </span>
          <span>•</span>
          <a href="#support" onClick={(e) => e.preventDefault()} className="hover:text-primary transition-colors">
            Kontak TI PA Lumajang
          </a>
        </div>
      </div>
    </footer>
  );
}

