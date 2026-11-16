import React from 'react';

export default function OfficialKopSurat() {
  return (
    <div
      className="relative border-b-[3px] border-double border-black pb-2.5 mb-3 text-black font-bookman"
      style={{ fontFamily: "'Bookman Old Style', 'Bookman', 'URW Bookman L', serif" }}
    >
      {/* Logo Instansi Rata Kiri */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center">
        <img
          src="/assets/logo-instansi.png"
          alt="Logo Pengadilan Agama Lumajang"
          className="w-[80px] h-[80px] object-contain flex-shrink-0"
        />
      </div>

      {/* Teks Lembaga & Alamat Rata Tengah */}
      <div className="text-center px-20 sm:px-24">
        <h4 className="font-bold tracking-normal uppercase" style={{ fontSize: '13pt', lineHeight: '1.25' }}>
          MAHKAMAH AGUNG REPUBLIK INDONESIA
        </h4>
        <h4 className="font-bold tracking-normal uppercase" style={{ fontSize: '13pt', lineHeight: '1.25' }}>
          DIREKTORAT JENDERAL BADAN PERADILAN AGAMA
        </h4>
        <h4 className="font-bold tracking-normal uppercase" style={{ fontSize: '13pt', lineHeight: '1.25' }}>
          PENGADILAN TINGGI AGAMA SURABAYA
        </h4>
        <h3 className="font-bold tracking-normal uppercase" style={{ fontSize: '13pt', lineHeight: '1.25' }}>
          PENGADILAN AGAMA LUMAJANG
        </h3>
        <p className="mt-1 font-normal tracking-normal" style={{ fontSize: '8pt', lineHeight: '1.3' }}>
          Jalan Soekarno Hatta Nomor 11, Selokbesuki, Sukodono, Lumajang, Jawa Timur 67352
        </p>
        <p className="font-normal tracking-normal" style={{ fontSize: '8pt', lineHeight: '1.3' }}>
          www.pa-lumajang.go.id, pa.lumajang@gmail.com, Telepon. (0334) 8781874
        </p>
      </div>
    </div>
  );
}


