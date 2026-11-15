import React from 'react';

export default function OfficialKopSurat() {
  return (
    <div className="border-b-[3px] border-double border-black pb-2 mb-4">
      <div className="flex items-center justify-center gap-4">
        <img
          src="/assets/logo-instansi.png"
          alt="Logo Mahkamah Agung"
          className="w-20 h-20 object-contain flex-shrink-0"
        />
        <div className="text-center text-black leading-tight">
          <h4 className="text-[12px] font-serif font-bold tracking-wider">
            MAHKAMAH AGUNG REPUBLIK INDONESIA
          </h4>
          <h4 className="text-[11px] font-serif font-bold tracking-wider">
            DIREKTORAT JENDERAL BADAN PERADILAN AGAMA
          </h4>
          <h4 className="text-[11px] font-serif font-bold tracking-wider">
            PENGADILAN TINGGI AGAMA SURABAYA
          </h4>
          <h3 className="text-[15px] font-serif font-bold tracking-wide uppercase">
            PENGADILAN AGAMA LUMAJANG
          </h3>
          <p className="text-[10px] font-sans mt-0.5">
            Jalan Soekarno Hatta Nomor 11, Selokbesuki, Sukodono, Lumajang, Jawa Timur 67352
          </p>
          <p className="text-[9.5px] font-sans">
            www.pa-lumajang.go.id , pa.lumajang@gmail.com , Telepon. (0334) 8781874
          </p>
        </div>
      </div>
    </div>
  );
}

