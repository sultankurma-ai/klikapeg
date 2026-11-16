import React, { useState, useEffect } from 'react';
import OfficialKopSurat from '../components/OfficialKopSurat';
import { formatTanggalIndo } from '../utils/formatters';

export default function SpdView({
  pegawaiList,
  suratTugasList,
  spdList,
  selectedStForSpd,
  onSaveSpd,
  onNavigate
}) {
  // Form State
  const [selectedStId, setSelectedStId] = useState(selectedStForSpd ? selectedStForSpd.id : '');
  const [nomorSpd, setNomorSpd] = useState('SPD/143/PA.Lmj/XI/2026');
  const [ppk, setPpk] = useState('Dr. Rozy Alifian Mukhtar S.H., M.Kn. (Pejabat Pembuat Komitmen PA Lumajang)');
  const [selectedPegawaiId, setSelectedPegawaiId] = useState('');
  const [tingkatBiaya, setTingkatBiaya] = useState('Tingkat C');
  const [maksudPerjalanan, setMaksudPerjalanan] = useState('Melaksanakan tugas kedinasan sesuai Surat Tugas pada Lingkungan Pengadilan Tinggi Agama Surabaya');
  const [alatAngkut, setAlatAngkut] = useState('Angkutan Darat');
  const [tempatBerangkat, setTempatBerangkat] = useState('Lumajang');
  const [tempatTujuan, setTempatTujuan] = useState('Surabaya');
  const [tanggalBerangkat, setTanggalBerangkat] = useState('17-11-2026');
  const [tanggalKembali, setTanggalKembali] = useState('18-11-2026');
  const [lamaHari, setLamaHari] = useState(2);
  const [instansiPembeban, setInstansiPembeban] = useState('Pengadilan Agama Lumajang');
  const [akunAnggaran, setAkunAnggaran] = useState('524111');
  const [keterangan, setKeterangan] = useState('Surat Tugas Nomor 1893/KPA.W13-A8/ST.KP7.1/IX/2026');

  // Preview & Modal State
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [activeDocForPreview, setActiveDocForPreview] = useState(null);
  const [activeSpdTab, setActiveSpdTab] = useState('ALL'); // 'ALL' | 'L1' | 'L2'
  const [toastMsg, setToastMsg] = useState('');
  const [searchArchive, setSearchArchive] = useState('');

  useEffect(() => {
    if (selectedStForSpd) {
      applySuratTugasData(selectedStForSpd);
    }
  }, [selectedStForSpd]);

  const applySuratTugasData = (st) => {
    setSelectedStId(st.id);
    setMaksudPerjalanan(st.maksudTugas);
    setTempatTujuan(st.tempatTujuan);
    setTanggalBerangkat(st.tanggalMulai);
    setTanggalKembali(st.tanggalSelesai);
    setLamaHari(st.lamaHari);
    setKeterangan(`Sesuai Surat Tugas Nomor ${st.nomorSurat}`);
    if (st.pegawaiList && st.pegawaiList.length > 0) {
      setSelectedPegawaiId(st.pegawaiList[0].id);
    }
    const randNo = Math.floor(144 + Math.random() * 20);
    setNomorSpd(`SPD/${randNo}/PA.Lmj/XI/2026`);
  };

  const handleSelectStDropdown = (e) => {
    const stId = e.target.value;
    setSelectedStId(stId);
    if (!stId) return;
    const st = suratTugasList.find(s => s.id === stId);
    if (st) {
      applySuratTugasData(st);
    }
  };

  const generateNomorOtomatis = () => {
    const randNo = Math.floor(150 + Math.random() * 30);
    setNomorSpd(`SPD/${randNo}/PA.Lmj/XI/2026`);
  };

  const currentPegawaiObj = pegawaiList.find(p => p.id === selectedPegawaiId) || pegawaiList[0] || {};

  const handleSubmit = (e) => {
    e.preventDefault();
    const st = suratTugasList.find(s => s.id === selectedStId);
    const newSpd = {
      id: 'SPD-' + Date.now(),
      nomorSpd,
      suratTugasId: selectedStId || 'MANUAL',
      nomorSuratTugas: st ? st.nomorSurat : 'Dibuat Mandiri',
      ppk,
      pelaksana: {
        nama: currentPegawaiObj.nama || 'Aparatur Sipil Negara',
        nip: currentPegawaiObj.nip || '-',
        pangkat: currentPegawaiObj.pangkat ? `${currentPegawaiObj.pangkat} (${currentPegawaiObj.golongan})` : 'Penata',
        jabatan: currentPegawaiObj.jabatan || 'Aparatur'
      },
      tingkatBiaya,
      maksudPerjalanan,
      alatAngkut,
      tempatBerangkat,
      tempatTujuan,
      lamaHari: Number(lamaHari),
      tanggalBerangkat,
      tanggalKembali,
      instansiPembeban,
      akunAnggaran,
      keterangan,
      statusSpd: 'Terverifikasi',
      createdAt: new Date().toISOString()
    };

    onSaveSpd(newSpd);
    setActiveDocForPreview(newSpd);
    setShowPreviewModal(true);
    setToastMsg(`Lembar SPD Nomor ${nomorSpd} berhasil diterbitkan dan disimpan.`);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleOpenPreview = (spdItem) => {
    setActiveDocForPreview(spdItem);
    setShowPreviewModal(true);
  };

  const filteredArchive = spdList.filter(spd => {
    return spd.nomorSpd.toLowerCase().includes(searchArchive.toLowerCase()) ||
      spd.pelaksana.nama.toLowerCase().includes(searchArchive.toLowerCase()) ||
      spd.tempatTujuan.toLowerCase().includes(searchArchive.toLowerCase());
  });

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-outline-variant/50">
        <div>
          <div className="flex items-center gap-2 text-xs text-outline mb-1">
            <span className="hover:text-primary cursor-pointer" onClick={() => onNavigate('dashboard')}>Beranda</span>
            <span>/</span>
            <span className="font-semibold text-primary">Surat Perjalanan Dinas</span>
          </div>
          <h1 className="font-display font-extrabold text-2xl text-primary">
            Surat Perjalanan Dinas (SPD)
          </h1>
          <p className="text-xs text-on-surface-variant font-medium mt-0.5">
            Formulir penerbitan Lembar SPD resmi standar Kementerian Keuangan & Mahkamah Agung terhubung otomatis dengan Surat Tugas.
          </p>
        </div>
      </div>

      {toastMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 shadow-sm animate-fadeIn">
          <span className="material-symbols-outlined text-emerald-600">check_circle</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Form Pembuatan Lembar SPD Baru */}
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/60 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Fast Bridge: Tarik Data dari Surat Tugas */}
        <div className="p-4 rounded-2xl bg-secondary-fixed/20 border border-secondary/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary text-white flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[22px]">link</span>
            </div>
            <div>
              <p className="font-bold text-xs text-primary">
                Tarik Data dari Surat Tugas Terbit
              </p>
              <p className="text-[11px] text-outline">
                Pilih surat tugas yang sudah ada agar maksud tugas, tujuan, jadwal, dan pelaksana otomatis terisi.
              </p>
            </div>
          </div>

          <div className="w-full sm:w-72">
            <select
              value={selectedStId}
              onChange={handleSelectStDropdown}
              className="w-full px-3 py-2 rounded-xl border border-secondary/40 text-xs font-semibold bg-surface-container-lowest text-primary focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="">-- Pilih Surat Tugas Terbit --</option>
              {suratTugasList.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.nomorSurat} ({st.tempatTujuan.slice(0, 20)}...)
                </option>
              ))}
            </select>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Nomor SPD */}
            <div className="md:col-span-6">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-primary uppercase tracking-wider">
                  Nomor Lembar SPD Resmi
                </label>
                <button
                  type="button"
                  onClick={generateNomorOtomatis}
                  className="text-xs text-secondary font-bold flex items-center gap-1 hover:underline"
                >
                  <span className="material-symbols-outlined text-[16px]">autorenew</span>
                  <span>Nomor Otomatis</span>
                </button>
              </div>
              <input
                type="text"
                required
                value={nomorSpd}
                onChange={(e) => setNomorSpd(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant text-xs font-bold text-primary bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            {/* PPK */}
            <div className="md:col-span-6">
              <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1.5">
                Pejabat Pembuat Komitmen (PPK)
              </label>
              <input
                type="text"
                required
                value={ppk}
                onChange={(e) => setPpk(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant text-xs text-primary bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            {/* Pegawai yang Diperintahkan */}
            <div className="md:col-span-6">
              <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1.5">
                Aparatur yang Diperintahkan Bepergian
              </label>
              <select
                required
                value={selectedPegawaiId}
                onChange={(e) => setSelectedPegawaiId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant text-xs font-semibold text-primary bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option value="">-- Pilih Aparatur yang Ditugaskan --</option>
                {pegawaiList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nama} ({p.golongan} - {p.jabatan})
                  </option>
                ))}
              </select>
            </div>

            {/* Tingkat Biaya */}
            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1.5">
                Tingkat Biaya Perjalanan
              </label>
              <select
                value={tingkatBiaya}
                onChange={(e) => setTingkatBiaya(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant text-xs font-semibold text-primary bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option value="Tingkat A">Tingkat A (Ketua / Eselon I-II)</option>
                <option value="Tingkat B">Tingkat B (Wakil / Hakim / Eselon III)</option>
                <option value="Tingkat C">Tingkat C (Pejabat Fungsional / Pelaksana)</option>
              </select>
            </div>

            {/* Alat Angkutan */}
            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1.5">
                Alat Angkutan
              </label>
              <input
                type="text"
                value={alatAngkut}
                onChange={(e) => setAlatAngkut(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant text-xs text-primary bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            {/* Maksud Perjalanan Dinas */}
            <div className="md:col-span-12">
              <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1.5">
                Maksud Perjalanan Dinas
              </label>
              <textarea
                rows="2"
                required
                value={maksudPerjalanan}
                onChange={(e) => setMaksudPerjalanan(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant text-xs text-primary bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            {/* Tempat Berangkat & Tujuan */}
            <div className="md:col-span-6">
              <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1.5">
                Tempat Berangkat
              </label>
              <input
                type="text"
                value={tempatBerangkat}
                onChange={(e) => setTempatBerangkat(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant text-xs text-primary bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div className="md:col-span-6">
              <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1.5">
                Tempat Tujuan
              </label>
              <input
                type="text"
                required
                value={tempatTujuan}
                onChange={(e) => setTempatTujuan(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant text-xs text-primary bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            {/* Tanggal & Lama Hari */}
            <div className="md:col-span-4">
              <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1.5">
                Tanggal Berangkat
              </label>
              <input
                type="text"
                value={tanggalBerangkat}
                onChange={(e) => setTanggalBerangkat(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant text-xs text-primary bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div className="md:col-span-4">
              <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1.5">
                Tanggal Harus Kembali
              </label>
              <input
                type="text"
                value={tanggalKembali}
                onChange={(e) => setTanggalKembali(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant text-xs text-primary bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div className="md:col-span-4">
              <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1.5">
                Lamanya Perjalanan
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={lamaHari}
                  onChange={(e) => setLamaHari(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant text-xs font-bold text-primary bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none"
                />
                <span className="text-xs text-outline font-semibold">Hari</span>
              </div>
            </div>

            {/* Akun Anggaran */}
            <div className="md:col-span-6">
              <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1.5">
                Mata Anggaran / Akun DIPA
              </label>
              <input
                type="text"
                value={akunAnggaran}
                onChange={(e) => setAkunAnggaran(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant text-xs font-mono text-primary bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            {/* Keterangan */}
            <div className="md:col-span-6">
              <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1.5">
                Keterangan Lain-lain
              </label>
              <input
                type="text"
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant text-xs text-primary bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-outline-variant/40 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                const st = suratTugasList.find(s => s.id === selectedStId);
                const draftSpd = {
                  id: 'DRAFT-SPD',
                  nomorSpd,
                  suratTugasId: selectedStId || 'MANUAL',
                  nomorSuratTugas: st ? st.nomorSurat : 'Dibuat Mandiri',
                  ppk,
                  pelaksana: {
                    nama: currentPegawaiObj.nama,
                    nip: currentPegawaiObj.nip,
                    pangkat: `${currentPegawaiObj.pangkat} (${currentPegawaiObj.golongan})`,
                    jabatan: currentPegawaiObj.jabatan
                  },
                  tingkatBiaya,
                  maksudPerjalanan,
                  alatAngkut,
                  tempatBerangkat,
                  tempatTujuan,
                  lamaHari: Number(lamaHari),
                  tanggalBerangkat,
                  tanggalKembali,
                  instansiPembeban,
                  akunAnggaran,
                  keterangan,
                  statusSpd: 'Draft',
                  createdAt: new Date().toISOString()
                };
                setActiveDocForPreview(draftSpd);
                setShowPreviewModal(true);
              }}
              className="px-4 py-2.5 rounded-xl border border-outline-variant text-xs font-bold text-primary hover:bg-surface-container transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">visibility</span>
              <span>Pratinjau Lembar SPD</span>
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary-container transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              <span className="material-symbols-outlined text-[18px] text-secondary-container">print</span>
              <span>Cetak Lembar SPD</span>
            </button>
          </div>
        </form>
      </div>

      {/* Arsip Lembar SPD */}
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/60 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-display font-extrabold text-base text-primary">
              Arsip Surat Perjalanan Dinas (SPD)
            </h2>
            <p className="text-xs text-outline mt-0.5">
              Daftar seluruh lembar SPD resmi yang tersimpan dalam arsip digital
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <span className="material-symbols-outlined absolute left-3 top-2 text-[18px] text-outline">search</span>
            <input
              type="text"
              value={searchArchive}
              onChange={(e) => setSearchArchive(e.target.value)}
              placeholder="Cari nomor SPD atau pelaksana..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-outline-variant text-xs bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-container text-primary font-display font-bold uppercase tracking-wider text-[11px] border-b border-outline-variant/60">
              <tr>
                <th className="py-3 px-4">Nomor Lembar SPD</th>
                <th className="py-3 px-4">Ref. Surat Tugas</th>
                <th className="py-3 px-4">Pelaksana Dinas</th>
                <th className="py-3 px-4">Tujuan & Maksud</th>
                <th className="py-3 px-4">Tanggal / Lama</th>
                <th className="py-3 px-4">Status LPJ</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/40">
              {filteredArchive.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-outline">
                    <span className="material-symbols-outlined text-4xl mb-2 text-outline/60 block">flight_takeoff</span>
                    <p className="font-semibold text-xs text-primary">Belum ada arsip Surat Perjalanan Dinas (SPD)</p>
                    <p className="text-[11px] text-outline mt-0.5">Seluruh data contoh telah dibersihkan. Silakan terbitkan lembar SPD resmi baru melalui formulir di atas.</p>
                  </td>
                </tr>
              ) : (
                filteredArchive.map((spd) => (
                  <tr key={spd.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="py-3 px-4 font-bold text-primary font-mono text-[11px]">
                      {spd.nomorSpd}
                    </td>
                    <td className="py-3 px-4 font-mono text-outline text-[10px]">
                      {spd.nomorSuratTugas}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-primary">{spd.pelaksana?.nama || '-'}</p>
                      <p className="text-[10px] text-outline">{spd.pelaksana?.jabatan || '-'}</p>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <p className="font-semibold text-primary truncate">{spd.tempatTujuan}</p>
                      <p className="text-[11px] text-outline truncate">{spd.maksudPerjalanan}</p>
                    </td>
                    <td className="py-3 px-4 font-semibold text-primary">
                      {spd.tanggalBerangkat} ({spd.lamaHari} hari)
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {spd.statusSpd}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleOpenPreview(spd)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-surface-container text-primary hover:bg-primary hover:text-white transition-colors"
                      >
                        <span className="material-symbols-outlined text-[15px]">print</span>
                        <span>Cetak Ulang</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Format Resmi Lembar SPD Sesuai form-SPD.docx */}
      {showPreviewModal && activeDocForPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white text-black rounded-2xl max-w-4xl w-full p-8 shadow-2xl relative my-8 print:p-0 print:m-0 print:shadow-none print:max-w-none">
            {/* Modal Controls (Hidden in Print) */}
            <div className="no-print sticky top-0 bg-white/95 backdrop-blur z-20 flex flex-col md:flex-row md:items-center justify-between pb-4 mb-6 border-b border-gray-200 gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-colors shadow-sm"
                  title="Kembali ke Halaman SPD"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  <span>Kembali</span>
                </button>
                <div className="flex items-center gap-2 ml-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
                  <span className="font-bold text-xs sm:text-sm text-gray-800">Pratinjau SPD (Format form-SPD)</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {/* Tab Switcher Lembar 1 & Lembar 2 */}
                <div className="inline-flex rounded-xl bg-gray-100 p-1 text-xs font-bold text-gray-700">
                  <button
                    type="button"
                    onClick={() => setActiveSpdTab('ALL')}
                    className={`px-3 py-1 rounded-lg transition-colors ${activeSpdTab === 'ALL' ? 'bg-white shadow text-primary' : 'hover:text-black'}`}
                  >
                    Semua Lembar (1 & 2)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSpdTab('L1')}
                    className={`px-3 py-1 rounded-lg transition-colors ${activeSpdTab === 'L1' ? 'bg-white shadow text-primary' : 'hover:text-black'}`}
                  >
                    Lembar 1 (Depan)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSpdTab('L2')}
                    className={`px-3 py-1 rounded-lg transition-colors ${activeSpdTab === 'L2' ? 'bg-white shadow text-primary' : 'hover:text-black'}`}
                  >
                    Lembar 2 (Belakang)
                  </button>
                </div>

                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-container transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">print</span>
                  <span>Cetak (Print / PDF)</span>
                </button>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="p-2 rounded-xl text-gray-500 hover:text-black hover:bg-gray-100 transition-colors"
                  title="Tutup Pratinjau"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            </div>

            {/* Document Body */}
            <div className="text-black text-[12px] leading-relaxed font-serif">
              {/* ================= LEMBAR 1 ================= */}
              {(activeSpdTab === 'ALL' || activeSpdTab === 'L1') && (
                <div className="space-y-3">
                  {/* Kop Surat Resmi Mahkamah Agung RI */}
                  <OfficialKopSurat />

                  {/* Header Rujukan PMK Lembar 1 (Kanan Atas) */}
                  <div className="flex justify-end text-[11px] mb-1">
                    <div className="w-56 leading-tight">
                      <table className="w-full">
                        <tbody>
                          <tr>
                            <td className="w-20">Nomor</td>
                            <td className="w-2">:</td>
                            <td>113/PMK.05/2012</td>
                          </tr>
                          <tr>
                            <td>Tanggal</td>
                            <td>:</td>
                            <td>3 Juli 2012</td>
                          </tr>
                          <tr>
                            <td>Lembar Ke</td>
                            <td>:</td>
                            <td>1</td>
                          </tr>
                          <tr>
                            <td>Kode No.</td>
                            <td>:</td>
                            <td>005.04.WA</td>
                          </tr>
                          <tr>
                            <td>Nomor</td>
                            <td>:</td>
                            <td className="font-semibold">{activeDocForPreview.nomorSpd}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Judul Dokumen */}
                  <div className="text-center mb-3">
                    <p className="font-bold uppercase tracking-wider text-sm underline">SURAT PERJALANAN DINAS (SPD)</p>
                  </div>

                  {/* Tabel PMK 10 Butir Lembar 1 */}
                  <table className="w-full border-collapse border border-black text-[11.5px] mb-3">
                    <tbody>
                      <tr className="border-b border-black">
                        <td className="border border-black py-1 px-2 text-center w-8 align-top">1.</td>
                        <td className="border border-black py-1 px-2.5 w-64 align-top">Pejabat Pembuat Komitmen</td>
                        <td className="border border-black py-1 px-2.5 align-top uppercase font-semibold">
                          {activeDocForPreview.instansiPembeban || 'PENGADILAN AGAMA LUMAJANG'}
                        </td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="border border-black py-1 px-2 text-center align-top">2.</td>
                        <td className="border border-black py-1 px-2.5 align-top">
                          Nama/NIP Pegawai yang melaksanakan perjalanan dinas
                        </td>
                        <td className="border border-black py-1 px-2.5 align-top">
                          <p className="font-bold">{activeDocForPreview.pelaksana?.nama}</p>
                          <p className="font-mono text-[10.5px]">NIP. {activeDocForPreview.pelaksana?.nip}</p>
                        </td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="border border-black py-1 px-2 text-center align-top">3.</td>
                        <td className="border border-black py-1 px-2.5 align-top">
                          a. Pangkat dan golongan<br />
                          b. Jabatan / Instansi<br />
                          c. Tingkat menurut peraturan perjalanan dinas
                        </td>
                        <td className="border border-black py-1 px-2.5 align-top leading-relaxed">
                          a. {activeDocForPreview.pelaksana?.pangkat || '-'}<br />
                          b. {activeDocForPreview.pelaksana?.jabatan || '-'} Pengadilan Agama Lumajang<br />
                          c. {activeDocForPreview.tingkatBiaya || 'Tingkat C'}
                        </td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="border border-black py-1 px-2 text-center align-top">4.</td>
                        <td className="border border-black py-1 px-2.5 align-top">Maksud perjalanan dinas</td>
                        <td className="border border-black py-1 px-2.5 align-top text-justify">
                          {activeDocForPreview.maksudPerjalanan}
                        </td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="border border-black py-1 px-2 text-center align-top">5.</td>
                        <td className="border border-black py-1 px-2.5 align-top">Alat angkutan yang dipergunakan</td>
                        <td className="border border-black py-1 px-2.5 align-top">
                          {activeDocForPreview.alatAngkut || 'Angkutan Darat'}
                        </td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="border border-black py-1 px-2 text-center align-top">6.</td>
                        <td className="border border-black py-1 px-2.5 align-top">
                          a. Tempat berangkat<br />
                          b. Tempat tujuan
                        </td>
                        <td className="border border-black py-1 px-2.5 align-top">
                          a. {activeDocForPreview.tempatBerangkat || 'Lumajang'}<br />
                          b. {activeDocForPreview.tempatTujuan}
                        </td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="border border-black py-1 px-2 text-center align-top">7.</td>
                        <td className="border border-black py-1 px-2.5 align-top">
                          a. Lamanya perjalanan dinas<br />
                          b. Tanggal berangkat<br />
                          c. Tanggal harus kembali/tiba di tempat baru
                        </td>
                        <td className="border border-black py-1 px-2.5 align-top">
                          a. {activeDocForPreview.lamaHari} Hari<br />
                          b. {formatTanggalIndo(activeDocForPreview.tanggalBerangkat)}<br />
                          c. {formatTanggalIndo(activeDocForPreview.tanggalKembali)}
                        </td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="border border-black py-1 px-2 text-center align-top">8.</td>
                        <td className="border border-black py-1 px-2.5 align-top">Pengikut</td>
                        <td className="border border-black py-1 px-2.5 align-top">
                          <table className="w-full border-collapse border border-black text-[10.5px]">
                            <thead>
                              <tr className="bg-gray-50 border-b border-black font-semibold text-center">
                                <th className="border border-black py-0.5 px-1 w-8">No.</th>
                                <th className="border border-black py-0.5 px-2 text-left">Nama</th>
                                <th className="border border-black py-0.5 px-1 w-14">Umur</th>
                                <th className="border border-black py-0.5 px-2 text-left">Hub. Keluarga</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="border border-black py-0.5 px-1 text-center">-</td>
                                <td className="border border-black py-0.5 px-2">-</td>
                                <td className="border border-black py-0.5 px-1 text-center">-</td>
                                <td className="border border-black py-0.5 px-2">-</td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="border border-black py-1 px-2 text-center align-top">9.</td>
                        <td className="border border-black py-1 px-2.5 align-top">
                          Pembebanan Anggaran<br />
                          a. Instansi<br />
                          b. Akun
                        </td>
                        <td className="border border-black py-1 px-2.5 align-top">
                          <br />
                          a. {activeDocForPreview.instansiPembeban || 'Pengadilan Agama Lumajang'}<br />
                          b. {activeDocForPreview.akunAnggaran || '524111'}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-black py-1 px-2 text-center align-top">10.</td>
                        <td className="border border-black py-1 px-2.5 align-top">Keterangan lain-lain</td>
                        <td className="border border-black py-1 px-2.5 align-top">
                          {activeDocForPreview.keterangan || '-'}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Tanda Tangan PPK Lembar 1 */}
                  <div className="flex justify-end pt-2 mb-4">
                    <div className="w-72 text-left text-[11.5px]">
                      <p>Dikeluarkan: di Lumajang</p>
                      <p>Pada tanggal: {formatTanggalIndo(activeDocForPreview.tanggalBerangkat)}</p>
                      <p className="mt-1 font-bold">Pejabat Pembuat Komitmen,</p>
                      <div className="h-14 flex items-center">
                        <span className="text-gray-400 italic text-[11px] no-print">[Tanda Tangan & Cap Dinas]</span>
                      </div>
                      <p className="font-bold uppercase underline">
                        {activeDocForPreview.ppk?.split('(')[0]?.trim() || 'ROZY ALIFIAN MUKHTAR'}
                      </p>
                      <p className="font-mono text-[10.5px]">NIP. 198807132015031001</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= LEMBAR 2 (HALAMAN BELAKANG) ================= */}
              {(activeSpdTab === 'ALL' || activeSpdTab === 'L2') && (
                <div className={`${activeSpdTab === 'ALL' ? 'page-break my-6 border-t-2 border-dashed border-gray-400 pt-6 print:border-none print:m-0 print:pt-0' : ''}`}>
                  <div className="text-center font-bold text-sm mb-3">– 2 –</div>

                  {/* Tabel Lembar Belakang SPD Checkpoints */}
                  <table className="w-full border-collapse border border-black text-[11px]">
                    <tbody>
                      {/* Section I */}
                      <tr className="border-b border-black">
                        <td className="border-r border-black p-2.5 w-1/2 align-top"></td>
                        <td className="p-2.5 w-1/2 align-top leading-relaxed">
                          <p className="font-bold mb-1">I.</p>
                          <div className="space-y-0.5">
                            <p><span className="inline-block w-28">Berangkat dari</span>: {activeDocForPreview.tempatBerangkat || 'Lumajang'}</p>
                            <p className="pl-32 text-[10px] text-gray-700 italic">(Tempat Kedudukan)</p>
                            <p><span className="inline-block w-28">Ke</span>: {activeDocForPreview.tempatTujuan}</p>
                            <p><span className="inline-block w-28">Pada Tanggal</span>: {formatTanggalIndo(activeDocForPreview.tanggalBerangkat)}</p>
                            <div className="pt-2">
                              <p className="font-bold">Kuasa Pengguna Anggaran</p>
                              <div className="h-12 flex items-center">
                                <span className="text-gray-400 italic text-[10px] no-print">[Tanda Tangan & Cap Dinas]</span>
                              </div>
                              <p className="font-bold uppercase underline">ABDUL KODIR, S.Ag., M.M.</p>
                              <p className="font-mono text-[10px]">NIP. 197303221998031004</p>
                            </div>
                          </div>
                        </td>
                      </tr>

                      {/* Section II */}
                      <tr className="border-b border-black">
                        <td className="border-r border-black p-2.5 w-1/2 align-top leading-relaxed">
                          <p className="font-bold mb-1">II.</p>
                          <div className="space-y-0.5">
                            <p><span className="inline-block w-24">Tiba di</span>: {activeDocForPreview.tempatTujuan}</p>
                            <p><span className="inline-block w-24">Pada tanggal</span>: {formatTanggalIndo(activeDocForPreview.tanggalBerangkat)}</p>
                            <div className="pt-1">
                              <p className="font-bold">Kepala:</p>
                              <div className="h-12 flex items-center">
                                <span className="text-gray-400 italic text-[10px] no-print">[Tanda Tangan & Cap]</span>
                              </div>
                              <p className="font-bold">( ............................................ )</p>
                              <p className="font-mono text-[10px]">NIP.</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-2.5 w-1/2 align-top leading-relaxed">
                          <div className="space-y-0.5 pt-4">
                            <p><span className="inline-block w-24">Berangkat dari</span>: {activeDocForPreview.tempatTujuan}</p>
                            <p><span className="inline-block w-24">ke</span>: Lumajang</p>
                            <p><span className="inline-block w-24">Pada tanggal</span>: {formatTanggalIndo(activeDocForPreview.tanggalKembali)}</p>
                            <div className="pt-1">
                              <p className="font-bold">Kepala:</p>
                              <div className="h-12 flex items-center">
                                <span className="text-gray-400 italic text-[10px] no-print">[Tanda Tangan & Cap]</span>
                              </div>
                              <p className="font-bold">( ............................................ )</p>
                              <p className="font-mono text-[10px]">NIP.</p>
                            </div>
                          </div>
                        </td>
                      </tr>

                      {/* Section III */}
                      <tr className="border-b border-black">
                        <td className="border-r border-black p-2.5 w-1/2 align-top leading-relaxed">
                          <p className="font-bold mb-1">III.</p>
                          <div className="space-y-0.5">
                            <p><span className="inline-block w-24">Tiba di</span>: </p>
                            <p><span className="inline-block w-24">Pada tanggal</span>: </p>
                            <div className="pt-1">
                              <p className="font-bold">Kepala:</p>
                              <div className="h-8"></div>
                              <p className="font-bold">( ............................................ )</p>
                              <p className="font-mono text-[10px]">NIP.</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-2.5 w-1/2 align-top leading-relaxed">
                          <div className="space-y-0.5 pt-4">
                            <p><span className="inline-block w-24">Berangkat dari</span>: </p>
                            <p><span className="inline-block w-24">ke</span>: </p>
                            <p><span className="inline-block w-24">Pada tanggal</span>: </p>
                            <div className="pt-1">
                              <p className="font-bold">Kepala:</p>
                              <div className="h-8"></div>
                              <p className="font-bold">( ............................................ )</p>
                              <p className="font-mono text-[10px]">NIP.</p>
                            </div>
                          </div>
                        </td>
                      </tr>

                      {/* Section IV */}
                      <tr className="border-b border-black">
                        <td className="border-r border-black p-2.5 w-1/2 align-top leading-relaxed">
                          <p className="font-bold mb-1">IV.</p>
                          <div className="space-y-0.5">
                            <p><span className="inline-block w-24">Tiba di</span>: </p>
                            <p><span className="inline-block w-24">Pada tanggal</span>: </p>
                            <div className="pt-1">
                              <p className="font-bold">Kepala:</p>
                              <div className="h-8"></div>
                              <p className="font-bold">( ............................................ )</p>
                              <p className="font-mono text-[10px]">NIP.</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-2.5 w-1/2 align-top leading-relaxed">
                          <div className="space-y-0.5 pt-4">
                            <p><span className="inline-block w-24">Berangkat dari</span>: </p>
                            <p><span className="inline-block w-24">ke</span>: </p>
                            <p><span className="inline-block w-24">Pada tanggal</span>: </p>
                            <div className="pt-1">
                              <p className="font-bold">Kepala:</p>
                              <div className="h-8"></div>
                              <p className="font-bold">( ............................................ )</p>
                              <p className="font-mono text-[10px]">NIP.</p>
                            </div>
                          </div>
                        </td>
                      </tr>

                      {/* Section V */}
                      <tr className="border-b border-black">
                        <td className="border-r border-black p-2.5 w-1/2 align-top leading-relaxed">
                          <p className="font-bold mb-1">V.</p>
                          <div className="space-y-0.5">
                            <p><span className="inline-block w-24">Tiba di</span>: </p>
                            <p><span className="inline-block w-24">Pada tanggal</span>: </p>
                            <div className="pt-1">
                              <p className="font-bold">Kepala:</p>
                              <div className="h-8"></div>
                              <p className="font-bold">( ............................................ )</p>
                              <p className="font-mono text-[10px]">NIP.</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-2.5 w-1/2 align-top leading-relaxed">
                          <div className="space-y-0.5 pt-4">
                            <p><span className="inline-block w-24">Berangkat dari</span>: </p>
                            <p><span className="inline-block w-24">ke</span>: </p>
                            <p><span className="inline-block w-24">Pada tanggal</span>: </p>
                            <div className="pt-1">
                              <p className="font-bold">Kepala:</p>
                              <div className="h-8"></div>
                              <p className="font-bold">( ............................................ )</p>
                              <p className="font-mono text-[10px]">NIP.</p>
                            </div>
                          </div>
                        </td>
                      </tr>

                      {/* Section VI */}
                      <tr className="border-b border-black">
                        <td className="border-r border-black p-2.5 w-1/2 align-top leading-relaxed">
                          <p className="font-bold mb-1">VI.</p>
                          <div className="space-y-0.5">
                            <p><span className="inline-block w-32">Telah kembali di</span>: Lumajang</p>
                            <p className="pl-36 text-[10px] text-gray-700 italic">(tempat kedudukan)</p>
                            <p><span className="inline-block w-32">Pada Tanggal</span>: {formatTanggalIndo(activeDocForPreview.tanggalKembali)}</p>
                            <div className="pt-2">
                              <p className="font-bold">Pejabat Pembuat Komitmen,</p>
                              <div className="h-12 flex items-center">
                                <span className="text-gray-400 italic text-[10px] no-print">[Tanda Tangan & Cap Dinas]</span>
                              </div>
                              <p className="font-bold uppercase underline">
                                {activeDocForPreview.ppk?.split('(')[0]?.trim() || 'ROZY ALIFIAN MUKHTAR'}
                              </p>
                              <p className="font-mono text-[10px]">NIP. 198807132015031001</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-2.5 w-1/2 align-top leading-relaxed">
                          <p className="text-justify text-[10.5px]">
                            Telah diperiksa dengan keterangan bahwa perjalanan tersebut di atas perintahnya dan semata-mata untuk kepentingan jabatan dalam waktu yang sesingkat-singkatnya.
                          </p>
                          <div className="pt-2">
                            <p className="font-bold">Pejabat Pembuat Komitmen,</p>
                            <div className="h-12 flex items-center">
                              <span className="text-gray-400 italic text-[10px] no-print">[Tanda Tangan & Cap Dinas]</span>
                            </div>
                            <p className="font-bold uppercase underline">
                              {activeDocForPreview.ppk?.split('(')[0]?.trim() || 'ROZY ALIFIAN MUKHTAR'}
                            </p>
                            <p className="font-mono text-[10px]">NIP. 198807132015031001</p>
                          </div>
                        </td>
                      </tr>

                      {/* Section VII */}
                      <tr className="border-b border-black">
                        <td colSpan="2" className="p-2.5 align-top">
                          <p className="font-bold">VII. Catatan lain – lain</p>
                        </td>
                      </tr>

                      {/* Section VIII */}
                      <tr>
                        <td colSpan="2" className="p-2.5 align-top leading-relaxed">
                          <p className="font-bold mb-1">VIII. PERHATIAN</p>
                          <p className="text-justify text-[10.5px]">
                            Pejabat yang berwenang menerbitkan SP2D, Pegawai yang melakukan perjalanan Dinas, Para pejabat yang mengesahkan tanggal berangkat/tiba serta bendaharawan bertanggung jawab berdasarkan peraturan-peraturan Keuangan Negara apabila Negara menderita rugi akibat kesalahan-kelalaian dan kealpaannya.
                          </p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* Bottom Action Bar (Hidden in Print) */}
              <div className="no-print pt-6 mt-6 border-t border-gray-300 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 bg-gray-50 text-gray-700 text-xs font-bold hover:bg-gray-100 hover:text-black transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  <span>Kembali ke Halaman SPD</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-container transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">print</span>
                  <span>Cetak Lembar SPD (Print / PDF)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

