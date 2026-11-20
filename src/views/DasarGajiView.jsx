import React, { useState } from 'react';
import {
  DAFTAR_ATURAN_GAJI,
  getAllAturanGaji,
  saveCustomAturan,
  deleteCustomAturan,
  generateTableByPercentage,
  getAturanById,
  getGajiFromTable,
  TABEL_GAJI_PP5_2024
} from '../utils/aturanGaji';
import { formatRupiah, terbilang } from '../utils/formatters';

export default function DasarGajiView({
  activeAturanId,
  onSelectAturan,
  onNavigate
}) {
  // State daftar seluruh aturan (termasuk kustom)
  const [daftarAturan, setDaftarAturan] = useState(() => getAllAturanGaji());

  // Aturan yang sedang diinspeksi tabelnya (default ke aturan aktif)
  const [inspectedAturanId, setInspectedAturanId] = useState(activeAturanId || 'pp-5-2024');

  // Filter golongan pada tabel eksplorer
  const [filterKategoriGolongan, setFilterKategoriGolongan] = useState('ALL'); // 'ALL' | 'I' | 'II' | 'III' | 'IV' | 'PPPK'
  const [searchMkg, setSearchMkg] = useState('');

  // Simulasi Cepat
  const [simulasiGolongan, setSimulasiGolongan] = useState('IV/b');
  const [simulasiMkg, setSimulasiMkg] = useState(24);

  // Modal Tambah Aturan Baru
  const [showAddModal, setShowAddModal] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Modal Panduan Teknis Koding
  const [showGuideModal, setShowGuideModal] = useState(false);

  // Form State Aturan Baru
  const [formData, setFormData] = useState({
    nama: 'Peraturan Pemerintah Nomor 10 Tahun 2026',
    namaSingkat: 'PP No. 10 Tahun 2026',
    tahun: 2026,
    tmtBerlaku: '1 Januari 2026',
    persentaseKenaikan: 8,
    deskripsi: 'Penyesuaian gaji pokok PNS terbaru berdasarkan kebijakan pemerintah tahun 2026.',
    dasarHukumSk: 'Peraturan Pemerintah RI Nomor 10 Tahun 2026',
    aturanPppk: 'Peraturan Presiden RI Nomor 15 Tahun 2026',
    basisAturan: 'pp-5-2024'
  });

  const activeAturan = getAturanById(activeAturanId || 'pp-5-2024');
  const inspectedAturan = getAturanById(inspectedAturanId || 'pp-5-2024');

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

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
    const tableData = inspectedAturan.tabel?.[g.key] || {};
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

  // Handler Submit Aturan Baru
  const handleSaveNewAturan = (e) => {
    e.preventDefault();
    const baseAturanObj = getAturanById(formData.basisAturan);
    const calculatedTable = generateTableByPercentage(
      baseAturanObj.tabel || TABEL_GAJI_PP5_2024,
      formData.persentaseKenaikan
    );

    const newId = 'custom-' + Date.now();
    const newAturanObj = {
      id: newId,
      nama: formData.nama,
      namaSingkat: formData.namaSingkat,
      nomorPp: formData.namaSingkat,
      tahun: Number(formData.tahun) || new Date().getFullYear(),
      tmtBerlaku: formData.tmtBerlaku,
      status: `Aturan Kustom Satker (${formData.persentaseKenaikan >= 0 ? '+' : ''}${formData.persentaseKenaikan}%)`,
      isAktifDefault: false,
      isCustom: true,
      persentaseKenaikan: `${formData.persentaseKenaikan >= 0 ? '+' : ''}${formData.persentaseKenaikan}% Penyesuaian`,
      deskripsi: formData.deskripsi,
      dasarHukumSk: formData.dasarHukumSk,
      aturanPppk: formData.aturanPppk,
      tabel: calculatedTable,
      badgeColor: 'sky'
    };

    saveCustomAturan(newAturanObj);
    const updatedAll = getAllAturanGaji();
    setDaftarAturan(updatedAll);
    setInspectedAturanId(newId);
    setShowAddModal(false);
    triggerToast(`Aturan baru "${newAturanObj.namaSingkat}" berhasil ditambahkan dan tabel gajinya selesai dihitung otomatis!`);
  };

  // Handler Hapus Aturan Kustom
  const handleDeleteAturan = (id, namaSingkat) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus aturan penggajian "${namaSingkat}"?`)) {
      deleteCustomAturan(id);
      const updatedAll = getAllAturanGaji();
      setDaftarAturan(updatedAll);
      if (activeAturanId === id) {
        onSelectAturan('pp-5-2024');
      }
      if (inspectedAturanId === id) {
        setInspectedAturanId('pp-5-2024');
      }
      triggerToast(`Aturan "${namaSingkat}" berhasil dihapus.`);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 shadow-sm animate-fadeIn">
          <span className="material-symbols-outlined text-emerald-600">check_circle</span>
          <span>{toastMsg}</span>
        </div>
      )}

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

        <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setShowGuideModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-primary/30 text-primary hover:bg-primary/5 text-xs font-bold transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">help</span>
            <span>Panduan Teknis</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>+ Tambah Aturan Gaji Baru</span>
          </button>

          <button
            onClick={() => onNavigate('kgb')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-container transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px] text-amber-300">payments</span>
            <span>Buka Layanan KGB</span>
          </button>
        </div>
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
            <span>Terhubung Real-Time ke KGB</span>
          </span>
        </div>
      </div>

      {/* Bagian Pilihan Aturan Penggajian */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-display font-extrabold text-base text-primary">
              Pilihan Peraturan Pemerintah & Aturan Gaji ({daftarAturan.length})
            </h2>
            <p className="text-xs text-outline">
              Pilih salah satu aturan di bawah untuk diterapkan sebagai dasar acuan perhitungan gaji di seluruh sistem KlikApeg.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {daftarAturan.map((aturan) => {
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
                          : aturan.isCustom
                            ? 'bg-sky-600 text-white shadow-xs'
                            : 'bg-primary/10 text-primary'
                      }`}>
                        <span className="material-symbols-outlined text-[20px]">
                          {isCurrentlyActive ? 'verified' : aturan.isCustom ? 'edit_note' : 'menu_book'}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
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

                    <div className="flex flex-col items-end gap-1">
                      {isCurrentlyActive && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 flex-shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                          Aktif di KGB
                        </span>
                      )}
                      {aturan.isCustom && (
                        <span className="px-2 py-0.5 rounded-md text-[9.5px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                          Kustom Satker
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-on-surface-variant text-[11.5px] leading-relaxed line-clamp-2">
                    {aturan.deskripsi}
                  </p>

                  <div className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/40 space-y-1.5 text-[11px]">
                    <div className="flex justify-between items-center">
                      <span className="text-outline">TMT Berlaku:</span>
                      <strong className="text-primary font-mono">{aturan.tmtBerlaku}</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-outline">Rujukan SK:</span>
                      <strong className="text-primary truncate max-w-[150px]" title={aturan.dasarHukumSk}>
                        {aturan.dasarHukumSk}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="pt-3.5 mt-3 border-t border-outline-variant/40 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setInspectedAturanId(aturan.id)}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-all text-xs flex items-center gap-1 ${
                        isInspected
                          ? 'bg-primary text-white shadow-xs'
                          : 'bg-surface-container-low text-primary hover:bg-surface-container'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px]">visibility</span>
                      <span>{isInspected ? 'Tabel Terpilih' : 'Lihat'}</span>
                    </button>

                    {aturan.isCustom && !isCurrentlyActive && (
                      <button
                        type="button"
                        onClick={() => handleDeleteAturan(aturan.id, aturan.namaSingkat)}
                        className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
                        title="Hapus aturan kustom ini"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    )}
                  </div>

                  {isCurrentlyActive ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      <span>Sedang Digunakan</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectAturan(aturan.id);
                        setInspectedAturanId(aturan.id);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all shadow-xs flex items-center gap-1 text-xs"
                    >
                      <span className="material-symbols-outlined text-[15px]">sync_alt</span>
                      <span>Pilih Acuan</span>
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

      {/* ========================================================================= */}
      {/* MODAL FORMULIR TAMBAH ATURAN GAJI BARU                                    */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-surface-container-lowest rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-outline-variant/60 animate-scaleUp max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-outline-variant/40">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-[26px]">add_circle</span>
                <div>
                  <h3 className="font-display font-extrabold text-base text-primary">
                    Tambah Aturan Penggajian Baru
                  </h3>
                  <p className="text-[11px] text-outline">
                    Masukkan regulasi penggajian baru dan sistem akan mengalkulasi tabel gajinya secara otomatis.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-outline transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveNewAturan} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1">
                  Nama Lengkap Peraturan Pemerintah / Regulasi
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Peraturan Pemerintah Nomor 10 Tahun 2026"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-xs font-bold text-primary focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1">
                    Nama Singkat
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: PP No. 10 Tahun 2026"
                    value={formData.namaSingkat}
                    onChange={(e) => setFormData({ ...formData, namaSingkat: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest text-xs font-bold text-primary focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1">
                    Tahun Regulasi
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.tahun}
                    onChange={(e) => setFormData({ ...formData, tahun: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest text-xs font-mono font-bold text-primary focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1">
                    Terhitung Mulai Tanggal (TMT Berlaku)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 1 Januari 2026"
                    value={formData.tmtBerlaku}
                    onChange={(e) => setFormData({ ...formData, tmtBerlaku: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest text-xs font-medium text-primary focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1">
                    Persentase Penyesuaian (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.5"
                      required
                      value={formData.persentaseKenaikan}
                      onChange={(e) => setFormData({ ...formData, persentaseKenaikan: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest text-xs font-mono font-bold text-primary focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                    <span className="absolute right-3 top-2 text-outline font-bold">%</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1">
                  Dasar Hukum untuk Klausul SK KGB Resmi PA Lumajang
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Peraturan Pemerintah RI Nomor 10 Tahun 2026"
                  value={formData.dasarHukumSk}
                  onChange={(e) => setFormData({ ...formData, dasarHukumSk: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest text-xs text-primary focus:ring-2 focus:ring-primary focus:outline-none"
                />
                <p className="text-[10px] text-outline mt-1">
                  Teks ini otomatis dicantumkan di paragraf penutup petikan SK KGB resmi.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1">
                  Regulasi Pendamping untuk Aparatur PPPK
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Peraturan Presiden RI Nomor 15 Tahun 2026"
                  value={formData.aturanPppk}
                  onChange={(e) => setFormData({ ...formData, aturanPppk: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest text-xs text-primary focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1">
                  Keterangan Singkat / Catatan Regulasi
                </label>
                <textarea
                  rows="2"
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest text-xs text-primary focus:ring-2 focus:ring-primary focus:outline-none"
                ></textarea>
              </div>

              {/* Preview Kalkulasi Otomatis */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-[11px] space-y-1.5">
                <p className="font-bold text-emerald-900 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                  <span>Pratinjau Otomasi Tabel Gaji Baru (+{formData.persentaseKenaikan}%):</span>
                </p>
                <div className="grid grid-cols-2 gap-2 text-emerald-950 pt-1">
                  <div>
                    <span className="text-outline">Gol III/a (MKG 0): </span>
                    <strong className="font-mono">
                      {formatRupiah(Math.round((2785700 * (1 + formData.persentaseKenaikan / 100)) / 100) * 100)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-outline">Gol IV/b (MKG 24): </span>
                    <strong className="font-mono">
                      {formatRupiah(Math.round((4971700 * (1 + formData.persentaseKenaikan / 100)) / 100) * 100)}
                    </strong>
                  </div>
                </div>
                <p className="text-[10px] text-emerald-800 pt-0.5">
                  Seluruh baris matriks Golongan I s/d IV dan PPPK dihitung otomatis dan dibulatkan ke ratusan terdekat.
                </p>
              </div>

              <div className="pt-3 border-t border-outline-variant/40 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-outline-variant text-xs font-semibold text-outline hover:bg-surface-container transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all shadow-md flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  <span>Simpan Aturan & Hitung Tabel Gaji</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL PANDUAN TEKNIS KODING (DEVELOPER GUIDE)                             */}
      {/* ========================================================================= */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-surface-container-lowest rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-outline-variant/60 animate-scaleUp max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-outline-variant/40">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[26px]">code</span>
                <div>
                  <h3 className="font-display font-extrabold text-base text-primary">
                    Panduan Memasukkan Aturan Gaji Baru
                  </h3>
                  <p className="text-[11px] text-outline">
                    Dua cara mudah: Melalui Formulir UI Aplikasi atau File Kode Sumber.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-outline transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-4 text-xs leading-relaxed text-on-surface">
              {/* Cara 1 */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                <div className="flex items-center gap-2 text-emerald-900 font-bold">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px]">1</span>
                  <span>Cara Langsung Melalui Aplikasi (Tanpa Koding)</span>
                </div>
                <p className="text-emerald-950 text-[11.5px]">
                  Klik tombol <strong>"+ Tambah Aturan Gaji Baru"</strong> di sudut kanan atas halaman ini. Masukkan nama peraturan baru (contoh: <em>PP No. 10 Tahun 2026</em>), tahun, dan persentase penyesuaian gaji (misal 5% atau 8%). Sistem akan secara otomatis menghitung seluruh nominal gaji pokok untuk seluruh golongan ruang, menyimpannya di sistem, dan langsung bisa diaktifkan sebagai acuan KGB!
                </p>
              </div>

              {/* Cara 2 */}
              <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/60 space-y-2.5">
                <div className="flex items-center gap-2 text-primary font-bold">
                  <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[11px]">2</span>
                  <span>Cara Teknis Melalui Kode Sumber (File Modul)</span>
                </div>
                <p className="text-outline text-[11.5px]">
                  Jika Tim TI Pengadilan Agama Lumajang ingin mendaftarkan peraturan resmi baru secara permanen di basis kode proyek:
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-on-surface-variant font-mono text-[11px]">
                  <li>
                    Buka file: <code className="bg-surface-container px-1.5 py-0.5 rounded font-bold text-primary">src/utils/aturanGaji.js</code>
                  </li>
                  <li>
                    Tambahkan objek tabel gaji baru, misalnya:
                    <pre className="p-2.5 mt-1 rounded-xl bg-black text-emerald-400 font-mono text-[10.5px] overflow-x-auto">
{`export const TABEL_GAJI_PP_BARU = {
  'I/A': { 0: 1750000, 2: 1800000, ... },
  'III/A': { 0: 2900000, 2: 3000000, ... },
  'IV/B': { 24: 5200000, 26: 5350000, ... }
};`}
                    </pre>
                  </li>
                  <li>
                    Daftarkan ke array <code className="bg-surface-container px-1 py-0.5 rounded font-bold text-primary">DAFTAR_ATURAN_GAJI</code>:
                    <pre className="p-2.5 mt-1 rounded-xl bg-black text-amber-300 font-mono text-[10.5px] overflow-x-auto">
{`{
  id: 'pp-10-2026',
  nama: 'Peraturan Pemerintah Nomor 10 Tahun 2026',
  namaSingkat: 'PP No. 10 Tahun 2026',
  tahun: 2026,
  tmtBerlaku: '1 Januari 2026',
  dasarHukumSk: 'Peraturan Pemerintah RI Nomor 10 Tahun 2026',
  aturanPppk: 'Peraturan Presiden RI Nomor 15 Tahun 2026',
  tabel: TABEL_GAJI_PP_BARU
}`}
                    </pre>
                  </li>
                  <li>
                    Simpan file. Menu <strong>Dasar Gaji</strong> dan <strong>Layanan KGB</strong> akan langsung mengenali dan menerapkan aturan tersebut!
                  </li>
                </ol>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowGuideModal(false)}
                  className="px-5 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-container transition-colors shadow-sm"
                >
                  Tutup Panduan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
