import React, { useState } from 'react';
import { DAFTAR_ATURAN_GAJI, getAturanById, getGajiFromTable } from '../utils/aturanGaji';
import { formatRupiah, terbilang } from '../utils/formatters';

export default function DasarGajiView({
  activeAturanId,
  onSelectAturan,
  onNavigate
}) {
  // Aturan yang sedang diinspeksi tabelnya (default ke aturan aktif)
  const [inspectedAturanId, setInspectedAturanId] = useState(activeAturanId || 'pp-5-2024');

  // Filter golongan pada tabel eksplorer
  const [filterKategoriGolongan, setFilterKategoriGolongan] = useState('ALL'); // 'ALL' | 'I' | 'II' | 'III' | 'IV' | 'PPPK'
  const [searchMkg, setSearchMkg] = useState('');

  // Simulasi Cepat
  const [simulasiGolongan, setSimulasiGolongan] = useState('IV/b');
  const [simulasiMkg, setSimulasiMkg] = useState(24);

  const activeAturan = getAturanById(activeAturanId || 'pp-5-2024');
  const inspectedAturan = getAturanById(inspectedAturanId || 'pp-5-2024');

  // List Golongan & Pangkat untuk mapping tabel
  const golonganMetadata = [
    { key: 'I/A', kategori: 'I', label: 'Golongan I/a (Juru Muda)' },
    { key: 'I/B', kategori: 'I', label: 'Golongan I/b (Juru Muda Tingkat I)' },
    { key: 'I/C', kategori: 'I', label: 'Golongan I/c (Juru)' },
    { key: 'I/D', kategori: 'I', label: 'Golongan I/d (Juru Tingkat I)' },
    { key: 'II/A', kategori: 'II', label: 'Golongan II/a (Pengatur Muda)' },
    { key: 'II/B', kategori: 'II', label: 'Golongan II/b (Pengatur Muda Tingkat I)' },
    { key: 'II/C', kategori: 'II', label: 'Golongan II/c (Pengatur)' },
    { key: 'II/D', kategori: 'II', label: 'Golongan II/d (Pengatur Tingkat I)' },
    { key: 'III/A', kategori: 'III', label: 'Golongan III/a (Penata Muda)' },
    { key: 'III/B', kategori: 'III', label: 'Golongan III/b (Penata Muda Tingkat I)' },
    { key: 'III/C', kategori: 'III', label: 'Golongan III/c (Penata)' },
    { key: 'III/D', kategori: 'III', label: 'Golongan III/d (Penata Tingkat I)' },
    { key: 'IV/A', kategori: 'IV', label: 'Golongan IV/a (Pembina)' },
    { key: 'IV/B', kategori: 'IV', label: 'Golongan IV/b (Pembina Tingkat I)' },
    { key: 'IV/C', kategori: 'IV', label: 'Golongan IV/c (Pembina Utama Muda)' },
    { key: 'IV/D', kategori: 'IV', label: 'Golongan IV/d (Pembina Utama Madya)' },
    { key: 'IV/E', kategori: 'IV', label: 'Golongan IV/e (Pembina Utama)' },
    { key: 'V', kategori: 'PPPK', label: 'PPPK Golongan V (Terampil / Pelaksana)' },
    { key: 'VII', kategori: 'PPPK', label: 'PPPK Golongan VII (Ahli Pertama)' },
    { key: 'IX', kategori: 'PPPK', label: 'PPPK Golongan IX (Ahli Pertama)' },
    { key: 'X', kategori: 'PPPK', label: 'PPPK Golongan X (Ahli Muda)' }
  ];

  // Filter daftar tabel berdasarkan pilihan
  const filteredGolonganList = golonganMetadata.filter(g => {
    if (filterKategoriGolongan !== 'ALL' && g.kategori !== filterKategoriGolongan) {
      return false;
    }
    return true;
  });

  // Ekstrak baris tabel untuk ditampilkan
  const tableRows = [];
  filteredGolonganList.forEach(g => {
    const tableData = inspectedAturan.tabel[g.key] || {};
    const mkgKeys = Object.keys(tableData).map(Number).sort((a, b) => a - b);

    mkgKeys.forEach(mkg => {
      if (searchMkg !== '' && !String(mkg).includes(searchMkg) && !g.key.toLowerCase().includes(searchMkg.toLowerCase())) {
        return;
      }
      tableRows.push({
        golongan: g.key,
        label: g.label,
        kategori: g.kategori,
        mkg: mkg,
        gaji: tableData[mkg]
      });
    });
  });

  // Perhitungan Simulasi Cepat
  const gajiSimulasiLama = getGajiFromTable(inspectedAturan.tabel, simulasiGolongan, simulasiMkg);
  const gajiSimulasiBaru = getGajiFromTable(inspectedAturan.tabel, simulasiGolongan, simulasiMkg + 2);
  const kenaikanSimulasi = gajiSimulasiBaru - gajiSimulasiLama;

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-outline-variant/50">
        <div>
          <div className="flex items-center gap-2 text-xs text-outline mb-1">
            <span className="hover:text-primary cursor-pointer" onClick={() => onNavigate('dashboard')}>Beranda</span>
            <span>/</span>
            <span className="font-semibold text-primary">Dasar Gaji</span>
          </div>
          <h1 className="font-display font-extrabold text-2xl text-primary">
            Dasar Gaji & Aturan Penggajian ASN
          </h1>
          <p className="text-xs text-on-surface-variant font-medium mt-0.5">
            Kelola dan pilih acuan tabel gaji pokok resmi (PNS & PPPK). Aturan yang aktif otomatis terhubung dengan Layanan KGB.
          </p>
        </div>

        <button
          onClick={() => onNavigate('kgb')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-container transition-all shadow-sm self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[18px] text-amber-300">payments</span>
          <span>Buka Layanan KGB</span>
        </button>
      </div>

      {/* Banner Aturan Aktif Saat Ini */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-[#1B2A4A] via-[#1B2A4A] to-[#243761] text-white shadow-md border border-[#2d4270] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-black flex items-center justify-center font-bold flex-shrink-0 shadow-sm mt-0.5">
            <span className="material-symbols-outlined text-[26px]">gavel</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Aturan Gaji Aktif di KGB
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/10 text-amber-300">
                {activeAturan.persentaseKenaikan}
              </span>
            </div>
            <h2 className="font-display font-bold text-lg text-white mt-1">
              {activeAturan.nama}
            </h2>
            <p className="text-xs text-gray-300 mt-0.5 max-w-2xl leading-relaxed">
              {activeAturan.deskripsi}
            </p>
            <div className="flex items-center gap-3 text-[11px] text-gray-300 pt-2 flex-wrap">
              <span>Dasar Hukum SK: <strong className="text-white">{activeAturan.dasarHukumSk}</strong></span>
              <span>•</span>
              <span>Acuan PPPK: <strong className="text-white">{activeAturan.aturanPppk}</strong></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch md:self-center justify-end">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs font-bold">
            <span className="material-symbols-outlined text-[16px]">link</span>
            <span>Terhubung Real-Time</span>
          </span>
        </div>
      </div>

      {/* Bagian Pilihan Aturan Penggajian */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-extrabold text-base text-primary">
              Pilihan Peraturan Pemerintah & Aturan Gaji
            </h2>
            <p className="text-xs text-outline">
              Pilih salah satu aturan di bawah untuk diterapkan sebagai dasar acuan perhitungan gaji di seluruh sistem KlikApeg.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DAFTAR_ATURAN_GAJI.map((aturan) => {
            const isCurrentlyActive = activeAturanId === aturan.id;
            const isInspected = inspectedAturanId === aturan.id;

            return (
              <div
                key={aturan.id}
                className={`p-5 rounded-3xl border transition-all text-xs flex flex-col justify-between ${
                  isCurrentlyActive
                    ? 'border-emerald-500 bg-emerald-50/20 ring-2 ring-emerald-500/30 shadow-md'
                    : 'border-outline-variant/60 bg-surface-container-lowest hover:border-primary/40 shadow-xs'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                        isCurrentlyActive
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-primary/10 text-primary'
                      }`}>
                        <span className="material-symbols-outlined text-[20px]">
                          {isCurrentlyActive ? 'verified' : 'menu_book'}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                            isCurrentlyActive
                              ? 'bg-emerald-600 text-white'
                              : 'bg-surface-container text-outline'
                          }`}>
                            {aturan.tahun}
                          </span>
                          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                            {aturan.persentaseKenaikan}
                          </span>
                        </div>
                        <h3 className="font-display font-bold text-sm text-primary mt-1">
                          {aturan.namaSingkat}
                        </h3>
                      </div>
                    </div>

                    {isCurrentlyActive ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 flex-shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                        Aktif di KGB
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600 border border-gray-200 flex-shrink-0">
                        Arsip Pembanding
                      </span>
                    )}
                  </div>

                  <p className="text-on-surface-variant text-[11.5px] leading-relaxed">
                    {aturan.deskripsi}
                  </p>

                  <div className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/40 space-y-1.5 text-[11px]">
                    <div className="flex justify-between items-center">
                      <span className="text-outline">TMT Berlaku:</span>
                      <strong className="text-primary font-mono">{aturan.tmtBerlaku}</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-outline">Rujukan SK KGB PNS:</span>
                      <strong className="text-primary truncate max-w-[220px]" title={aturan.dasarHukumSk}>
                        {aturan.dasarHukumSk}
                      </strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-outline">Rujukan KGB PPPK:</span>
                      <strong className="text-primary truncate max-w-[220px]" title={aturan.aturanPppk}>
                        {aturan.aturanPppk}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-outline-variant/40 flex items-center justify-between gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setInspectedAturanId(aturan.id)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 ${
                      isInspected
                        ? 'bg-primary text-white shadow-xs'
                        : 'bg-surface-container-low text-primary hover:bg-surface-container'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                    <span>{isInspected ? 'Tabel Ditampilkan' : 'Lihat Tabel Gaji'}</span>
                  </button>

                  {isCurrentlyActive ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11.5px]">
                      <span className="material-symbols-outlined text-[18px]">check_circle</span>
                      <span>Sedang Aktif Digunakan</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectAturan(aturan.id);
                        setInspectedAturanId(aturan.id);
                      }}
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all shadow-sm flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">sync_alt</span>
                      <span>Pilih Sebagai Acuan KGB</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bagian Simulator Cepat Perhitungan Gaji */}
      <div className="p-5 rounded-3xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-outline-variant/40">
          <div>
            <h2 className="font-display font-extrabold text-base text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-500">calculate</span>
              <span>Kalkulator Simulasi KGB ({inspectedAturan.namaSingkat})</span>
            </h2>
            <p className="text-xs text-outline">
              Uji coba perhitungan otomatis gaji lama, gaji baru, dan kenaikan berdasarkan aturan yang sedang dilihat.
            </p>
          </div>
          <span className="text-[11px] font-bold text-primary bg-primary/10 px-3 py-1 rounded-xl self-start sm:self-center">
            Aturan: {inspectedAturan.namaSingkat}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1.5">
              Pilih Golongan Ruang
            </label>
            <select
              value={simulasiGolongan}
              onChange={(e) => setSimulasiGolongan(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-outline-variant bg-surface-container-low text-primary text-xs font-bold focus:ring-2 focus:ring-primary focus:outline-none"
            >
              {golonganMetadata.map(g => (
                <option key={g.key} value={g.key}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1.5">
              Masa Kerja Lama (Tahun)
            </label>
            <input
              type="number"
              min="0"
              max="34"
              value={simulasiMkg}
              onChange={(e) => setSimulasiMkg(Math.max(0, parseInt(e.target.value, 10) || 0))}
              className="w-full px-3.5 py-2 rounded-xl border border-outline-variant bg-surface-container-low text-primary text-xs font-bold font-mono focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/50">
            <p className="text-[10px] text-outline uppercase tracking-wider font-semibold">Gaji Pokok Lama ({simulasiMkg} Th)</p>
            <p className="font-bold text-primary font-mono text-sm mt-0.5">{formatRupiah(gajiSimulasiLama)}</p>
            <p className="text-[9.5px] text-outline truncate">{terbilang(gajiSimulasiLama)} rupiah</p>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-emerald-800 uppercase tracking-wider font-bold">Gaji Pokok Baru (+2 Th KGB)</p>
              <span className="text-[9.5px] font-bold text-emerald-700 bg-emerald-200/60 px-1.5 py-0.2 rounded">
                +{formatRupiah(kenaikanSimulasi)}
              </span>
            </div>
            <p className="font-extrabold text-emerald-900 font-mono text-sm mt-0.5">{formatRupiah(gajiSimulasiBaru)}</p>
            <p className="text-[9.5px] text-emerald-700 font-medium truncate">{terbilang(gajiSimulasiBaru)} rupiah</p>
          </div>
        </div>
      </div>

      {/* Bagian Eksplorer Tabel Gaji Lengkap */}
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/60 shadow-sm p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-outline-variant/40">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">table_view</span>
              <h2 className="font-display font-extrabold text-base text-primary">
                Tabel Rincian Gaji Pokok Resmi: {inspectedAturan.nama}
              </h2>
            </div>
            <p className="text-xs text-outline mt-0.5">
              Menampilkan {tableRows.length} entri besaran gaji pokok resmi berdasarkan golongan ruang dan masa kerja golongan.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {inspectedAturanId !== activeAturanId && (
              <button
                type="button"
                onClick={() => onSelectAturan(inspectedAturanId)}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all shadow-xs flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">check</span>
                <span>Terapkan Aturan Ini ke KGB</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills Kategori Golongan & Pencarian MKG */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              type="button"
              onClick={() => setFilterKategoriGolongan('ALL')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                filterKategoriGolongan === 'ALL'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-surface-container-low text-outline hover:text-primary'
              }`}
            >
              Semua Golongan
            </button>
            <button
              type="button"
              onClick={() => setFilterKategoriGolongan('IV')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                filterKategoriGolongan === 'IV'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-surface-container-low text-outline hover:text-primary'
              }`}
            >
              Golongan IV (Pembina)
            </button>
            <button
              type="button"
              onClick={() => setFilterKategoriGolongan('III')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                filterKategoriGolongan === 'III'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-surface-container-low text-outline hover:text-primary'
              }`}
            >
              Golongan III (Penata)
            </button>
            <button
              type="button"
              onClick={() => setFilterKategoriGolongan('II')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                filterKategoriGolongan === 'II'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-surface-container-low text-outline hover:text-primary'
              }`}
            >
              Golongan II (Pengatur)
            </button>
            <button
              type="button"
              onClick={() => setFilterKategoriGolongan('I')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                filterKategoriGolongan === 'I'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-surface-container-low text-outline hover:text-primary'
              }`}
            >
              Golongan I (Juru)
            </button>
            <button
              type="button"
              onClick={() => setFilterKategoriGolongan('PPPK')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                filterKategoriGolongan === 'PPPK'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-surface-container-low text-outline hover:text-primary'
              }`}
            >
              PPPK (Gol V & IX)
            </button>
          </div>

          <div className="relative w-full sm:w-56">
            <span className="material-symbols-outlined absolute left-3 top-2 text-outline text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Cari MKG atau Gol..."
              value={searchMkg}
              onChange={(e) => setSearchMkg(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 rounded-xl border border-outline-variant bg-surface-container-low text-xs text-primary focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Tabel Data Gaji Pokok */}
        <div className="overflow-x-auto border border-outline-variant/50 rounded-2xl max-h-[500px]">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-surface-container text-primary font-display font-bold uppercase tracking-wider text-[11px] border-b border-outline-variant/60 shadow-xs z-10">
              <tr>
                <th className="py-3 px-4">Golongan Ruang</th>
                <th className="py-3 px-4">Pangkat / Kualifikasi</th>
                <th className="py-3 px-4 text-center">Masa Kerja (MKG)</th>
                <th className="py-3 px-4">Gaji Pokok Resmi</th>
                <th className="py-3 px-4">Terbilang (Rupiah)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/40 bg-surface-container-lowest">
              {tableRows.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-outline">
                    Tidak ada data gaji yang sesuai dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                tableRows.map((row, idx) => (
                  <tr key={`${row.golongan}-${row.mkg}-${idx}`} className="hover:bg-surface-container-low transition-colors">
                    <td className="py-2.5 px-4 font-bold text-primary font-mono">
                      <span className="inline-block px-2.5 py-0.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
                        {row.golongan}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-medium text-on-surface-variant">
                      {row.label.split('(')[1]?.replace(')', '') || row.label}
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono font-bold text-primary">
                      {row.mkg} Tahun
                    </td>
                    <td className="py-2.5 px-4 font-bold font-mono text-emerald-800 text-sm">
                      {formatRupiah(row.gaji)}
                    </td>
                    <td className="py-2.5 px-4 text-outline text-[11px] font-medium">
                      {terbilang(row.gaji)} rupiah
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
