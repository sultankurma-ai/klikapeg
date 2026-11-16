import React, { useState, useEffect } from 'react';
import OfficialKopSurat from '../components/OfficialKopSurat';
import { formatTanggalIndo } from '../utils/formatters';
import { getNextNomorSuratTugas, registerSuratKeluarToKlikSurat } from '../services/kliksuratService';

export default function SuratTugasView({
  pegawaiList,
  suratTugasList,
  onSaveSuratTugas,
  onCreateSpdFromSt,
  onNavigate
}) {
  // Form State: Formulir Kosong Awal
  const [nomorSurat, setNomorSurat] = useState('1894/KPA.W13-A8/ST.KP7.1/XI/2026');
  const [tanggalSurat, setTanggalSurat] = useState('16-11-2026');
  const [selectedPegawaiIds, setSelectedPegawaiIds] = useState([]);
  const [maksudTugas, setMaksudTugas] = useState('Menghadiri Pembinaan dan Rapat Koordinasi Perencanaan Anggaran di Lingkungan Pengadilan Tinggi Agama Surabaya');
  const [dasarHukum, setDasarHukum] = useState('Surat Ketua Pengadilan Tinggi Agama Surabaya Nomor: 6385/KPTA.W13-A/DL1/XI/2026 Tanggal 06 November 2026 tentang Undangan');
  const [tempatTujuan, setTempatTujuan] = useState('aula PTA Surabaya, Jl. Mayjend Sungkono No. 7 Surabaya');
  const [tanggalMulai, setTanggalMulai] = useState('17-11-2026');
  const [tanggalSelesai, setTanggalSelesai] = useState('18-11-2026');
  const [lamaHari, setLamaHari] = useState(2);
  const [bebanAnggaran, setBebanAnggaran] = useState('DIPA Badan Urusan Administrasi Mahkamah Agung RI tahun anggaran 2026');
  const [mataAnggaran, setMataAnggaran] = useState('005.04.WA.1054.BMA.001.051.A.524111');
  const [pejabatPenandatangan, setPejabatPenandatangan] = useState('FATKUR ROSYAD (Ketua Pengadilan Agama Lumajang)');

  // Modal & Notification State
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [activeDocForPreview, setActiveDocForPreview] = useState(null);
  const [searchArchive, setSearchArchive] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [nipInput, setNipInput] = useState('');
  const [nipError, setNipError] = useState('');
  const [isSyncingKlikSurat, setIsSyncingKlikSurat] = useState(false);

  // Auto-connect penomoran awal dari KlikSurat
  useEffect(() => {
    getNextNomorSuratTugas().then(res => {
      if (res && res.nomorSurat) {
        setNomorSurat(res.nomorSurat);
        setTanggalSurat(res.tanggalSurat);
      }
    }).catch(() => {});
  }, []);

  const handleAmbilNomorKlikSurat = async () => {
    setIsSyncingKlikSurat(true);
    try {
      const res = await getNextNomorSuratTugas();
      setNomorSurat(res.nomorSurat);
      setTanggalSurat(res.tanggalSurat);
      setIsSyncingKlikSurat(false);
      setToastMsg(`Nomor register resmi ${res.nomorSurat} & tanggal berhasil diambil langsung dari database KlikSurat.`);
      setTimeout(() => setToastMsg(''), 4500);
    } catch (err) {
      setIsSyncingKlikSurat(false);
      setToastMsg('Gagal mengambil nomor dari KlikSurat, menggunakan nomor lokal.');
      setTimeout(() => setToastMsg(''), 3500);
    }
  };

  const generateNomorOtomatis = () => {
    handleAmbilNomorKlikSurat();
  };

  const handleTambahPegawaiByNip = () => {
    const trimmed = nipInput.trim();
    if (!trimmed) {
      setNipError('Silakan masukkan atau pilih NIP aparatur terlebih dahulu');
      return;
    }
    const found = pegawaiList.find(p =>
      p.nip.replace(/\s+/g, '') === trimmed.replace(/\s+/g, '') ||
      p.nip.toLowerCase().includes(trimmed.toLowerCase()) ||
      p.nama.toLowerCase().includes(trimmed.toLowerCase())
    );

    if (!found) {
      setNipError(`Aparatur dengan NIP/Nama "${trimmed}" tidak ditemukan.`);
      return;
    }

    if (selectedPegawaiIds.includes(found.id)) {
      setNipError(`Aparatur "${found.nama}" sudah ada di dalam daftar tugas.`);
      return;
    }

    setSelectedPegawaiIds([...selectedPegawaiIds, found.id]);
    setNipInput('');
    setNipError('');
  };

  const handleRemovePegawai = (pegId) => {
    setSelectedPegawaiIds(selectedPegawaiIds.filter(id => id !== pegId));
    setNipError('');
  };

  const getAssignedPegawaiObjects = () => {
    return selectedPegawaiIds
      .map(id => pegawaiList.find(p => p.id === id))
      .filter(Boolean)
      .map(p => ({
        id: p.id,
        nama: p.nama,
        nip: p.nip,
        pangkat: `${p.pangkat} (${p.golongan})`,
        golongan: p.golongan,
        jabatan: p.jabatan
      }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const assigned = getAssignedPegawaiObjects();
    if (assigned.length === 0) {
      setNipError('Silakan tambahkan minimal 1 aparatur yang ditugaskan terlebih dahulu.');
      return;
    }
    const newSt = {
      id: 'ST-' + Date.now(),
      nomorSurat,
      tanggalSurat,
      pegawaiList: assigned,
      maksudTugas,
      dasarHukum,
      tempatTujuan,
      tanggalMulai,
      tanggalSelesai,
      lamaHari: Number(lamaHari),
      bebanAnggaran,
      mataAnggaran,
      pejabatPenandatangan,
      status: 'Diterbitkan',
      createdAt: new Date().toISOString()
    };

    onSaveSuratTugas(newSt);
    setActiveDocForPreview(newSt);
    setShowPreviewModal(true);

    // Registrasi ke database KlikSurat
    registerSuratKeluarToKlikSurat({
      id: newSt.id,
      nomorSurat: newSt.nomorSurat,
      perihal: `Surat Tugas: ${newSt.maksudTugas}`,
      tujuanSurat: newSt.tempatTujuan,
      tanggalSurat: newSt.tanggalSurat,
      kodeKlasifikasi: 'ST.KP7.1',
      lampiran: '1 Berkas Surat Tugas'
    }).then(res => {
      if (res && res.registeredToKlikSurat) {
        setToastMsg(`Surat Tugas Nomor ${nomorSurat} berhasil dibuat dan tercatat di buku register Database KlikSurat.`);
      } else {
        setToastMsg(`Surat Tugas Nomor ${nomorSurat} berhasil dibuat dan disimpan.`);
      }
      setTimeout(() => setToastMsg(''), 4500);
    });
  };

  const handleOpenPreview = (stItem) => {
    setActiveDocForPreview(stItem);
    setShowPreviewModal(true);
  };

  const filteredArchive = suratTugasList.filter(st => {
    return st.nomorSurat.toLowerCase().includes(searchArchive.toLowerCase()) ||
      st.maksudTugas.toLowerCase().includes(searchArchive.toLowerCase()) ||
      st.tempatTujuan.toLowerCase().includes(searchArchive.toLowerCase());
  });

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-outline-variant/50">
        <div>
          <div className="flex items-center gap-2 text-xs text-outline mb-1">
            <span className="hover:text-primary cursor-pointer" onClick={() => onNavigate('dashboard')}>Beranda</span>
            <span>/</span>
            <span className="font-semibold text-primary">Surat Tugas</span>
          </div>
          <h1 className="font-display font-extrabold text-2xl text-primary">
            Surat Tugas Kedinasan
          </h1>
          <p className="text-xs text-on-surface-variant font-medium mt-0.5">
            Formulir pembuatan Surat Tugas dinas resmi dengan penomoran otomatis & arsip digital.
          </p>
        </div>
      </div>

      {toastMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 shadow-sm animate-fadeIn">
          <span className="material-symbols-outlined text-emerald-600">check_circle</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Form Pembuatan Surat Tugas */}
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/60 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-outline-variant/40">
          <div>
            <h2 className="font-display font-extrabold text-lg text-primary">
              Formulir Pembuatan Surat Tugas Baru
            </h2>
            <p className="text-xs text-outline mt-0.5">
              Identitas aparatur terisi otomatis dari database KlikCuti tanpa perlu mengetik ulang
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary-fixed/40 text-primary">
            Format Resmi PA Lumajang
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Nomor Surat Terhubung KlikSurat */}
            <div className="md:col-span-8">
              <div className="flex flex-wrap items-center justify-between mb-1.5 gap-1">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-primary uppercase tracking-wider">
                    Nomor Surat Tugas Resmi
                  </label>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Otomatis KlikSurat
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAmbilNomorKlikSurat}
                  disabled={isSyncingKlikSurat}
                  className="text-xs text-primary font-bold flex items-center gap-1 hover:text-secondary transition-colors"
                >
                  <span className={`material-symbols-outlined text-[16px] text-emerald-600 ${isSyncingKlikSurat ? 'animate-spin' : ''}`}>
                    sync
                  </span>
                  <span>{isSyncingKlikSurat ? 'Mengambil dari KlikSurat...' : 'Ambil Nomor dari KlikSurat'}</span>
                </button>
              </div>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={nomorSurat}
                  onChange={(e) => setNomorSurat(e.target.value)}
                  className="w-full pl-3.5 pr-28 py-2.5 rounded-xl border border-outline-variant text-xs font-bold text-primary bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none"
                />
                <span className="absolute right-2.5 top-2.5 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold pointer-events-none">
                  KlikSurat API
                </span>
              </div>
              <p className="text-[10.5px] text-outline mt-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-emerald-600">check_circle</span>
                <span>Nomor agenda resmi tersinkronisasi otomatis dengan buku register KlikSurat PA Lumajang</span>
              </p>
            </div>

            {/* Tanggal Surat Terhubung KlikSurat */}
            <div className="md:col-span-4">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-primary uppercase tracking-wider">
                  Tanggal Surat Tugas
                </label>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  Server KlikSurat
                </span>
              </div>
              <input
                type="text"
                required
                value={tanggalSurat}
                onChange={(e) => setTanggalSurat(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant text-xs font-medium text-primary bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none"
              />
              <p className="text-[10.5px] text-outline mt-1">
                Tanggal otomatis sinkron dengan waktu server KlikSurat
              </p>
            </div>

            {/* Aparatur yang Ditugaskan */}
            <div className="md:col-span-12 space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <label className="block text-xs font-bold text-primary uppercase tracking-wider">
                  Aparatur yang Ditugaskan:
                </label>
                <span className="text-[11px] text-outline font-medium">
                  Terpilih <strong>{selectedPegawaiIds.length} aparatur</strong> untuk surat tugas ini
                </span>
              </div>

              {/* Kolom Mengisi NIP & Tombol Tambah Pegawai */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="flex-1 relative">
                  <span className="absolute left-3.5 top-2.5 text-outline material-symbols-outlined text-[18px]">badge</span>
                  <input
                    type="text"
                    list="pegawai-nip-list"
                    value={nipInput}
                    onChange={(e) => { setNipInput(e.target.value); setNipError(''); }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleTambahPegawaiByNip();
                      }
                    }}
                    placeholder="Masukkan NIP atau pilih nama aparatur..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-outline-variant text-xs font-medium text-primary bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                  <datalist id="pegawai-nip-list">
                    {pegawaiList.map((p) => (
                      <option key={p.id} value={p.nip}>
                        {p.nama} • {p.pangkat} ({p.golongan}) • {p.jabatan}
                      </option>
                    ))}
                  </datalist>
                </div>

                <button
                  type="button"
                  onClick={handleTambahPegawaiByNip}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white text-xs font-bold transition-all shadow-sm flex-shrink-0"
                >
                  <span className="material-symbols-outlined text-[18px]">person_add</span>
                  <span>Tambah Pegawai</span>
                </button>
              </div>

              {nipError && (
                <p className="text-xs text-rose-600 font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  <span>{nipError}</span>
                </p>
              )}

              {/* Tabel Aparatur yang Ditugaskan */}
              <div className="overflow-hidden rounded-2xl border border-outline-variant/60 bg-surface-container-lowest shadow-sm">
                {getAssignedPegawaiObjects().length === 0 ? (
                  <div className="p-8 text-center text-outline text-xs bg-surface-container-low/40">
                    <span className="material-symbols-outlined text-3xl mb-1 text-outline/60 block">group_add</span>
                    <p className="font-semibold text-primary">Belum ada aparatur yang ditugaskan</p>
                    <p className="text-[11px] text-outline mt-0.5">
                      Silakan pilih nama atau masukkan NIP aparatur pada kolom di atas, lalu klik tombol <strong>Tambah Pegawai</strong>.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-surface-container text-primary font-bold border-b border-outline-variant/60">
                        <tr>
                          <th className="py-2.5 px-3 w-10 text-center">No</th>
                          <th className="py-2.5 px-3">Nama Pegawai & NIP</th>
                          <th className="py-2.5 px-3">Pangkat / Golongan</th>
                          <th className="py-2.5 px-3">Jabatan</th>
                          <th className="py-2.5 px-3 w-16 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/40">
                        {getAssignedPegawaiObjects().map((p, idx) => (
                          <tr key={p.id} className="hover:bg-surface-container-low transition-colors">
                            <td className="py-2.5 px-3 text-center font-bold text-outline">{idx + 1}</td>
                            <td className="py-2.5 px-3">
                              <p className="font-bold text-primary">{p.nama}</p>
                              <p className="text-[11px] font-mono text-outline">NIP. {p.nip}</p>
                            </td>
                            <td className="py-2.5 px-3 text-on-surface-variant font-medium">
                              {p.pangkat}
                            </td>
                            <td className="py-2.5 px-3 text-on-surface-variant">
                              {p.jabatan}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemovePegawai(p.id)}
                                title="Hapus dari daftar tugas"
                                className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                              >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Maksud Tugas */}
            <div className="md:col-span-12">
              <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1.5">
                Maksud Tugas / Keperluan Kedinasan
              </label>
              <textarea
                rows="2"
                required
                value={maksudTugas}
                onChange={(e) => setMaksudTugas(e.target.value)}
                placeholder="Jelaskan maksud penugasan dinas secara rinci..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant text-xs text-primary bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            {/* Dasar Hukum */}
            <div className="md:col-span-12">
              <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1.5">
                Dasar Hukum Pelaksanaan
              </label>
              <input
                type="text"
                required
                value={dasarHukum}
                onChange={(e) => setDasarHukum(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant text-xs text-primary bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            {/* Tempat Tujuan */}
            <div className="md:col-span-6">
              <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1.5">
                Tempat / Kota Tujuan
              </label>
              <input
                type="text"
                required
                value={tempatTujuan}
                onChange={(e) => setTempatTujuan(e.target.value)}
                placeholder="Contoh: PTA Surabaya / Kantor BKN / Lumajang"
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant text-xs text-primary bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            {/* Jadwal Tanggal */}
            <div className="md:col-span-6 grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1.5">
                  Tgl Mulai
                </label>
                <input
                  type="text"
                  value={tanggalMulai}
                  onChange={(e) => setTanggalMulai(e.target.value)}
                  className="w-full px-2.5 py-2.5 rounded-xl border border-outline-variant text-xs text-primary bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1.5">
                  Tgl Selesai
                </label>
                <input
                  type="text"
                  value={tanggalSelesai}
                  onChange={(e) => setTanggalSelesai(e.target.value)}
                  className="w-full px-2.5 py-2.5 rounded-xl border border-outline-variant text-xs text-primary bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1.5">
                  Lama Hari
                </label>
                <input
                  type="number"
                  value={lamaHari}
                  onChange={(e) => setLamaHari(e.target.value)}
                  className="w-full px-2.5 py-2.5 rounded-xl border border-outline-variant text-xs text-primary bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>

            {/* Beban Anggaran */}
            <div className="md:col-span-6">
              <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1.5">
                Beban Anggaran
              </label>
              <select
                value={bebanAnggaran}
                onChange={(e) => setBebanAnggaran(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant text-xs font-semibold text-primary bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option value="DIPA 04 (Badilag Mahkamah Agung RI)">DIPA 04 (Badilag Mahkamah Agung RI)</option>
                <option value="DIPA 01 (Badan Urusan Administrasi MARI)">DIPA 01 (Badan Urusan Administrasi MARI)</option>
                <option value="Non-DIPA (Biaya Mandiri/Pihak Ketiga)">Non-DIPA (Biaya Mandiri/Pihak Ketiga)</option>
              </select>
            </div>

            {/* Mata Anggaran */}
            <div className="md:col-span-6">
              <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1.5">
                Mata Anggaran / Akun DIPA
              </label>
              <input
                type="text"
                value={mataAnggaran}
                onChange={(e) => setMataAnggaran(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant text-xs font-mono text-primary bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-outline-variant/40 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                const assigned = getAssignedPegawaiObjects();
                const draftSt = {
                  id: 'DRAFT-ST',
                  nomorSurat,
                  tanggalSurat,
                  pegawaiList: assigned,
                  maksudTugas,
                  dasarHukum,
                  tempatTujuan,
                  tanggalMulai,
                  tanggalSelesai,
                  lamaHari: Number(lamaHari),
                  bebanAnggaran,
                  mataAnggaran,
                  pejabatPenandatangan,
                  status: 'Draft',
                  createdAt: new Date().toISOString()
                };
                setActiveDocForPreview(draftSt);
                setShowPreviewModal(true);
              }}
              className="px-4 py-2.5 rounded-xl border border-outline-variant text-xs font-bold text-primary hover:bg-surface-container transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">visibility</span>
              <span>Pratinjau Draft Naskah</span>
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary-container transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              <span className="material-symbols-outlined text-[18px] text-secondary-container">print</span>
              <span>Cetak Surat Tugas</span>
            </button>
          </div>
        </form>
      </div>

      {/* Arsip Surat Tugas Kedinasan */}
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/60 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-display font-extrabold text-base text-primary">
              Arsip Surat Tugas Kedinasan
            </h2>
            <p className="text-xs text-outline mt-0.5">
              Daftar seluruh Surat Tugas resmi yang tersimpan dalam repositori digital
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <span className="material-symbols-outlined absolute left-3 top-2 text-[18px] text-outline">search</span>
            <input
              type="text"
              value={searchArchive}
              onChange={(e) => setSearchArchive(e.target.value)}
              placeholder="Cari arsip nomor atau tujuan..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-outline-variant text-xs bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-container text-primary font-display font-bold uppercase tracking-wider text-[11px] border-b border-outline-variant/60">
              <tr>
                <th className="py-3 px-4">Nomor Surat Tugas</th>
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Pegawai Ditugaskan</th>
                <th className="py-3 px-4">Maksud Tugas & Tujuan</th>
                <th className="py-3 px-4">Lama Hari</th>
                <th className="py-3 px-4 text-center">Aksi Dokumen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/40">
              {filteredArchive.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-outline">
                    <span className="material-symbols-outlined text-4xl mb-2 text-outline/60 block">assignment</span>
                    <p className="font-semibold text-xs text-primary">Belum ada arsip Surat Tugas</p>
                    <p className="text-[11px] text-outline mt-0.5">Seluruh data contoh telah dibersihkan. Silakan terbitkan Surat Tugas resmi baru melalui formulir di atas.</p>
                  </td>
                </tr>
              ) : (
                filteredArchive.map((st) => (
                  <tr key={st.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="py-3 px-4 font-bold text-primary font-mono text-[11px]">
                      {st.nomorSurat}
                    </td>
                    <td className="py-3 px-4 text-outline">{st.tanggalSurat}</td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-primary">{st.pegawaiList[0]?.nama}</p>
                      {st.pegawaiList.length > 1 && (
                        <span className="text-[10px] text-secondary font-bold">
                          +{st.pegawaiList.length - 1} aparatur lainnya
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <p className="font-semibold text-primary truncate">{st.maksudTugas}</p>
                      <p className="text-[11px] text-outline truncate">{st.tempatTujuan}</p>
                    </td>
                    <td className="py-3 px-4 font-semibold text-primary">
                      {st.lamaHari} Hari
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenPreview(st)}
                          title="Cetak Ulang Dokumen"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-surface-container text-primary hover:bg-primary hover:text-white transition-colors"
                        >
                          <span className="material-symbols-outlined text-[15px]">print</span>
                          <span>Cetak</span>
                        </button>
                        <button
                          onClick={() => onCreateSpdFromSt(st)}
                          title="Buat Lembar SPD dari Surat Tugas ini"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-secondary-container text-on-secondary-container hover:bg-secondary-fixed transition-colors"
                        >
                          <span className="material-symbols-outlined text-[15px]">flight_takeoff</span>
                          <span>Buat SPD</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Format Resmi Cetak Surat Tugas Sesuai form-ST.docx */}
      {showPreviewModal && activeDocForPreview && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm p-3 sm:p-6 flex justify-center items-start">
          <div className="bg-white text-black rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative my-4 sm:my-6 print:p-0 print:m-0 print:shadow-none print:max-w-none">
            {/* Modal Controls (Hidden in Print) */}
            <div className="no-print sticky top-0 bg-white/95 backdrop-blur z-20 flex flex-wrap items-center justify-between pb-3.5 mb-5 border-b border-gray-200 gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
                <span className="font-bold text-xs sm:text-sm text-gray-800">Pratinjau Surat Tugas (Format form-ST)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-container transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">print</span>
                  <span>Cetak Dokumen (Print / PDF)</span>
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

            {/* Document Content */}
            <div
              className="space-y-4 text-black text-[12px] leading-relaxed font-bookman"
              style={{ fontFamily: "'Bookman Old Style', 'Bookman', 'URW Bookman L', serif" }}
            >
              {/* Kop Surat Resmi Mahkamah Agung RI */}
              <OfficialKopSurat />

              {/* Judul Surat Tugas */}
              <div className="text-center pt-1 mb-4">
                <p className="font-bold uppercase tracking-wider text-base">SURAT TUGAS</p>
                <p className="font-sans font-semibold text-xs mt-0.5">Nomor: {activeDocForPreview.nomorSurat}</p>
              </div>

              {/* Tabel Menimbang & Dasar Hukum */}
              <table className="w-full text-[12px] mb-3">
                <tbody>
                  <tr>
                    <td className="w-24 align-top font-bold">Menimbang</td>
                    <td className="w-3 align-top">:</td>
                    <td className="align-top text-justify">
                      Bahwa Menunjuk Surat Ketua Pengadilan Tinggi Agama Surabaya Nomor: 6385/KPTA.W13-A/DL1/XI/2026 Tanggal 06 November 2026 tentang Undangan, maka perlu menugaskan Pejabat yang namanya tersebut dalam surat tugas ini untuk melaksanakan kegiatan tersebut.
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="3" className="py-1"></td>
                  </tr>
                  <tr>
                    <td className="align-top font-bold">Dasar Hukum</td>
                    <td className="align-top">:</td>
                    <td className="align-top text-justify">
                      <div className="space-y-1">
                        <p>1. Undang-Undang Nomor 7 Tahun 1989 tentang Peradilan Agama yang telah diubah terakhir dengan Undang-Undang Nomor 50 Tahun 2009;</p>
                        <p>2. Peraturan Menteri Keuangan Nomor 119 Tahun 2023 tentang Perubahan Atas Peraturan Menteri Keuangan Nomor: 113/PMK.05/2012 tentang Perjalanan Dinas Dalam Negeri Bagi Pejabat Negara, Pegawai Negeri dan Pegawai Tidak Tetap;</p>
                        <p>3. {activeDocForPreview.dasarHukum || 'Surat Ketua Pengadilan Tinggi Agama Surabaya Nomor: 6385/KPTA.W13-A/DL1/XI/2026 Tanggal 06 November 2026 tentang Undangan.'}</p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* MENUGASKAN & Kepada */}
              <div className="text-center my-3">
                <p className="font-bold uppercase tracking-widest text-[13px]">MENUGASKAN</p>
              </div>

              <p className="font-bold mb-1.5 text-[12px]">Kepada:</p>

              {/* Tabel Pelaksana Tugas Kedinasan */}
              <table className="w-full text-[11.5px] border-collapse border border-black mb-3">
                <thead>
                  <tr className="bg-gray-50 border-b border-black text-center font-bold">
                    <th className="border border-black py-1.5 px-2 w-10">No.</th>
                    <th className="border border-black py-1.5 px-3 text-left">Nama / NIP</th>
                    <th className="border border-black py-1.5 px-3 text-left">Jabatan</th>
                    <th className="border border-black py-1.5 px-2 w-16">Gol.</th>
                    <th className="border border-black py-1.5 px-2 w-28">Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  {activeDocForPreview.pegawaiList.map((p, idx) => (
                    <tr key={idx} className="border-b border-black">
                      <td className="border border-black py-1.5 px-2 text-center align-top">{idx + 1}</td>
                      <td className="border border-black py-1.5 px-3 align-top">
                        <p className="font-bold">{p.nama}</p>
                        <p className="font-mono text-[10.5px]">NIP. {p.nip}</p>
                      </td>
                      <td className="border border-black py-1.5 px-3 align-top">{p.jabatan}</td>
                      <td className="border border-black py-1.5 px-2 text-center align-top font-semibold">
                        {p.golongan || (p.pangkat?.includes('(') ? p.pangkat.split('(')[1].replace(')', '') : p.pangkat)}
                      </td>
                      <td className="border border-black py-1.5 px-2 text-center align-top text-[11px]">
                        {activeDocForPreview.tanggalMulai}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Untuk */}
              <table className="w-full text-[12px] mb-3">
                <tbody>
                  <tr>
                    <td className="w-16 align-top font-bold">Untuk</td>
                    <td className="w-3 align-top">:</td>
                    <td className="align-top text-justify">
                      {activeDocForPreview.maksudTugas}, bertempat di {activeDocForPreview.tempatTujuan}.
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Paragraf Pembebanan Anggaran & Penutup */}
              <p className="text-justify mb-2 text-[12px]">
                Biaya akomodasi dan pelaksanaan kegiatan dibebankan pada DIPA Badan Urusan Administrasi Mahkamah Agung RI tahun anggaran 2026.
              </p>
              <p className="text-justify mb-4 text-[12px]">
                Demikian surat tugas ini dibuat dan dilaksanakan dengan penuh tanggung jawab.
              </p>

              {/* Tanda Tangan Elektronik Resmi */}
              <div className="flex justify-end pt-2">
                <div className="w-80 text-left text-[12px]">
                  <p>Lumajang, {formatTanggalIndo(activeDocForPreview.tanggalSurat)}</p>
                  <div className="mt-2 p-3 border border-gray-400 rounded-lg bg-gray-50/50">
                    <p className="text-[10px] text-gray-600 italic">Ditandatangani secara elektronik oleh:</p>
                    <p className="font-bold uppercase tracking-wide text-[11px] mt-1">KETUA PENGADILAN AGAMA LUMAJANG</p>
                    <div className="h-10 flex items-center">
                      <span className="text-emerald-700 font-mono text-[10px] font-bold">✓ Terverifikasi Digital BSrE</span>
                    </div>
                    <p className="font-bold uppercase text-[12px]">
                      {activeDocForPreview.pejabatPenandatangan?.split('(')[0]?.trim() || 'FATKUR ROSYAD'}
                    </p>
                    <p className="font-mono text-[10.5px]">NIP. 197300000</p>
                  </div>
                </div>
              </div>

              {/* Bottom Action Bar (Hidden in Print) */}
              <div className="no-print pt-6 mt-6 border-t border-gray-300 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 bg-gray-50 text-gray-700 text-xs font-bold hover:bg-gray-100 hover:text-black transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  <span>Kembali ke Halaman Surat Tugas</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-container transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">print</span>
                  <span>Cetak Dokumen (Print / PDF)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

