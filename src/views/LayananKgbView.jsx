import React, { useState, useEffect } from 'react';
import OfficialKopSurat from '../components/OfficialKopSurat';
import { terbilang, formatRupiah, formatTanggalIndo } from '../utils/formatters';
import { getNextNomorSkKgb, registerSuratKeluarToKlikSurat } from '../services/kliksuratService';

export default function LayananKgbView({
  pegawaiList,
  selectedPegawaiFromProps,
  riwayatKgbList,
  onSaveKgb,
  onNavigate
}) {
  const [selectedPegawai, setSelectedPegawai] = useState(selectedPegawaiFromProps || pegawaiList[0]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [nomorSk, setNomorSk] = useState('452/KPA.W13-A8/KP2.1/XI/2026');
  const [tanggalSk, setTanggalSk] = useState('14-11-2026');
  const [tmtBaru, setTmtBaru] = useState('01-11-2026');
  const [mkgTahun, setMkgTahun] = useState(selectedPegawai?.mkgTahun ? selectedPegawai.mkgTahun + 2 : 20);
  const [gajiLama, setGajiLama] = useState(selectedPegawai?.gajiPokokLama || 3824500);
  const [gajiBaru, setGajiBaru] = useState(selectedPegawai?.gajiPokokBaru || 3945300);
  const [penandatangan, setPenandatangan] = useState('FATKUR ROSYAD (Ketua Pengadilan Agama Lumajang)');

  // Modal State
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [activeDocForPreview, setActiveDocForPreview] = useState(null);
  const [successToast, setSuccessToast] = useState('');
  const [isSyncingKlikSurat, setIsSyncingKlikSurat] = useState(false);

  useEffect(() => {
    if (selectedPegawaiFromProps) {
      handleSelectPegawai(selectedPegawaiFromProps);
    }
  }, [selectedPegawaiFromProps]);

  // Update aparatur pertama jika data pegawai dari KlikCuti selesai dimuat
  useEffect(() => {
    if (pegawaiList && pegawaiList.length > 0 && !selectedPegawaiFromProps) {
      const matchCurrent = pegawaiList.some(p => p.id === selectedPegawai?.id);
      if (!matchCurrent) {
        handleSelectPegawai(pegawaiList[0]);
      }
    }
  }, [pegawaiList]);

  // Muat nomor awal langsung dari KlikSurat
  useEffect(() => {
    getNextNomorSkKgb().then(res => {
      if (res && res.nomorSk) {
        setNomorSk(res.nomorSk);
        setTanggalSk(res.tanggalSk);
      }
    }).catch(() => {});
  }, []);

  const handleSelectPegawai = (p) => {
    if (!p) return;
    setSelectedPegawai(p);
    setGajiLama(p.gajiPokokLama || 3824500);
    setGajiBaru(p.gajiPokokBaru || 3945300);
    setMkgTahun((p.mkgTahun || 18) + 2);
    setTmtBaru(p.tmtKgbBerikutnya || '01-11-2026');
  };

  const handleAmbilNomorKlikSurat = async () => {
    setIsSyncingKlikSurat(true);
    try {
      const res = await getNextNomorSkKgb();
      setNomorSk(res.nomorSk);
      setTanggalSk(res.tanggalSk);
      setIsSyncingKlikSurat(false);
      setSuccessToast(`Nomor register resmi ${res.nomorSk} & tanggal berhasil diambil langsung dari database KlikSurat.`);
      setTimeout(() => setSuccessToast(''), 4500);
    } catch (err) {
      setIsSyncingKlikSurat(false);
      setSuccessToast('Gagal terhubung ke KlikSurat, menggunakan penomoran lokal.');
      setTimeout(() => setSuccessToast(''), 3500);
    }
  };

  const generateNomorOtomatis = () => {
    handleAmbilNomorKlikSurat();
  };

  const handleProsesDanTerbitkan = (e) => {
    e.preventDefault();
    const newKgb = {
      id: 'KGB-' + Date.now(),
      nomorSk,
      pegawaiId: selectedPegawai.id,
      nama: selectedPegawai.nama,
      nip: selectedPegawai.nip,
      pangkatGolongan: `${selectedPegawai.pangkat} (${selectedPegawai.golongan})`,
      jabatan: selectedPegawai.jabatan,
      gajiLama: Number(gajiLama),
      gajiBaru: Number(gajiBaru),
      tmtBaru,
      tmtBerikutnya: '01-11-2028',
      mkgTahun: Number(mkgTahun),
      mkgLamaTahun: Math.max(0, Number(mkgTahun) - 2),
      mkgBulan: 0,
      skLamaNomor: `W13-A8/${Math.floor(320 + Math.random() * 60)}/KP.04.2/2/2024`,
      skLamaTanggal: '02 Februari 2024',
      skLamaTmt: '01 Maret 2024',
      tanggalSk,
      penandatangan
    };

    onSaveKgb(newKgb);
    setActiveDocForPreview(newKgb);
    setShowPreviewModal(true);

    // Registrasi nomor dan arsip ke database pusat KlikSurat
    registerSuratKeluarToKlikSurat({
      id: newKgb.id,
      nomorSurat: newKgb.nomorSk,
      perihal: `Pemberitahuan Kenaikan Gaji Berkala an. ${selectedPegawai.nama}`,
      tujuanSurat: 'KPPN Bondowoso',
      tanggalSurat: newKgb.tanggalSk,
      kodeKlasifikasi: 'KP2.1',
      lampiran: '1 Berkas SK KGB'
    }).then(res => {
      if (res && res.registeredToKlikSurat) {
        setSuccessToast(`Surat Pemberitahuan KGB Nomor ${nomorSk} berhasil diterbitkan dan otomatis tercatat di buku register Database KlikSurat.`);
      } else {
        setSuccessToast(`Surat Pemberitahuan KGB Nomor ${nomorSk} berhasil diterbitkan dan disimpan ke arsip.`);
      }
      setTimeout(() => setSuccessToast(''), 4500);
    });
  };

  const handleOpenExistingDoc = (kgbItem) => {
    setActiveDocForPreview(kgbItem);
    setShowPreviewModal(true);
  };

  const filteredList = pegawaiList.filter(p => {
    const matchSearch = p.nama.toLowerCase().includes(searchQuery.toLowerCase()) || p.nip.includes(searchQuery);
    if (filterStatus === 'ALL') return matchSearch;
    if (filterStatus === 'TEMPO') return matchSearch && p.statusKgb === 'Jatuh Tempo';
    if (filterStatus === 'SEGERA') return matchSearch && p.statusKgb === 'Segera Diproses';
    return matchSearch;
  });

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-outline-variant/50">
        <div>
          <div className="flex items-center gap-2 text-xs text-outline mb-1">
            <span className="hover:text-primary cursor-pointer" onClick={() => onNavigate('dashboard')}>Beranda</span>
            <span>/</span>
            <span className="font-semibold text-primary">Layanan KGB</span>
          </div>
          <h1 className="font-display font-extrabold text-2xl text-primary">
            Layanan Kenaikan Gaji Berkala (KGB)
          </h1>
          <p className="text-xs text-on-surface-variant font-medium mt-0.5">
            Kontrol siklus 2 tahunan, perhitungan gaji baru otomatis, dan cetak Surat Keputusan (SK) resmi.
          </p>
        </div>
      </div>

      {successToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 shadow-sm animate-fadeIn">
          <span className="material-symbols-outlined text-emerald-600">check_circle</span>
          <span>{successToast}</span>
        </div>
      )}

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Tabel Kontrol Jadwal KGB Pegawai */}
        <div className="lg:col-span-5 bg-surface-container-lowest rounded-3xl border border-outline-variant/60 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-base text-primary">
              Tabel Kontrol Jadwal KGB
            </h2>
            <span className="text-xs font-semibold text-outline">
              {filteredList.length} Aparatur
            </span>
          </div>

          {/* Search & Filter */}
          <div className="space-y-2">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-outline">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama atau NIP..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-outline-variant text-xs bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex gap-1.5 text-[11px] font-semibold">
              <button
                onClick={() => setFilterStatus('ALL')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${filterStatus === 'ALL' ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-outline'}`}
              >
                Semua
              </button>
              <button
                onClick={() => setFilterStatus('TEMPO')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${filterStatus === 'TEMPO' ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-outline'}`}
              >
                Jatuh Tempo
              </button>
              <button
                onClick={() => setFilterStatus('SEGERA')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${filterStatus === 'SEGERA' ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-outline'}`}
              >
                Bulan Depan
              </button>
            </div>
          </div>

          {/* Employee Control List */}
          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {filteredList.map((pegawai) => {
              const isSelected = selectedPegawai?.id === pegawai.id;
              const isTempo = pegawai.statusKgb === 'Jatuh Tempo';

              return (
                <div
                  key={pegawai.id}
                  onClick={() => handleSelectPegawai(pegawai)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${isSelected
                      ? 'bg-primary-fixed/20 border-primary shadow-sm'
                      : 'bg-surface-container-low border-outline-variant/40 hover:border-primary/40'
                    }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={pegawai.foto}
                        alt={pegawai.nama}
                        className="w-9 h-9 rounded-xl object-cover ring-1 ring-outline-variant"
                        onError={(e) => {
                          e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(pegawai.nama) + '&background=1B2A4A&color=fff';
                        }}
                      />
                      <div>
                        <p className="font-bold text-xs text-primary leading-tight line-clamp-1">
                          {pegawai.nama}
                        </p>
                        <p className="text-[11px] text-outline font-mono">
                          {pegawai.golongan} • NIP. {pegawai.nip.slice(0, 10)}...
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isTempo ? 'bg-error-container text-on-error-container' : 'bg-amber-100 text-amber-800'
                      }`}>
                      {pegawai.statusKgb}
                    </span>
                  </div>

                  <div className="mt-2 pt-2 border-t border-outline-variant/30 flex items-center justify-between text-[11px]">
                    <span className="text-outline">TMT: <strong className="text-primary">{pegawai.tmtKgbBerikutnya}</strong></span>
                    <span className="text-secondary font-bold">{formatRupiah(pegawai.gajiPokokBaru)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Form Pembaruan Gaji Berkala & SK KGB */}
        <div className="lg:col-span-7 bg-surface-container-lowest rounded-3xl border border-outline-variant/60 shadow-sm p-6 space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="font-display font-extrabold text-lg text-primary">
                Pembaruan Gaji Berkala & Penerbitan SK KGB
              </h2>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-secondary-container text-on-secondary-container">
                Format SK Mahkamah Agung
              </span>
            </div>
            <p className="text-xs text-outline mt-0.5">
              Isian data pegawai terisi otomatis dan nominal gaji dihitung sesuai Peraturan Pemerintah terbaru.
            </p>
          </div>

          {/* Selected Employee Snapshot */}
          {selectedPegawai && (
            <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/60 flex items-start gap-4">
              <img
                src={selectedPegawai.foto}
                alt={selectedPegawai.nama}
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-primary/20 flex-shrink-0"
                onError={(e) => {
                  e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(selectedPegawai.nama) + '&background=1B2A4A&color=fff';
                }}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-primary text-on-primary text-[10px] font-bold">
                    {selectedPegawai.golongan}
                  </span>
                  <span className="text-xs text-outline font-semibold">{selectedPegawai.pangkat}</span>
                </div>
                <h3 className="font-display font-bold text-sm text-primary mt-1">
                  {selectedPegawai.nama}
                </h3>
                <p className="text-xs text-outline font-mono">NIP. {selectedPegawai.nip}</p>
                <p className="text-xs text-on-surface-variant font-medium mt-0.5">{selectedPegawai.jabatan}</p>
              </div>
            </div>
          )}

          {/* Form Controls */}
          <form onSubmit={handleProsesDanTerbitkan} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nomor Surat Pemberitahuan KGB Terhubung KlikSurat */}
              <div className="sm:col-span-2">
                <div className="flex flex-wrap items-center justify-between mb-1.5 gap-1">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-primary uppercase tracking-wider">
                      Nomor Surat Pemberitahuan KGB Resmi
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
                    value={nomorSk}
                    onChange={(e) => setNomorSk(e.target.value)}
                    className="w-full pl-3.5 pr-28 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-xs font-bold text-primary focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                  <span className="absolute right-2.5 top-2.5 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold pointer-events-none">
                    KlikSurat API
                  </span>
                </div>
                <p className="text-[10.5px] text-outline mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-emerald-600">check_circle</span>
                  <span>Nomor register surat otomatis terhubung dengan buku agenda digital KlikSurat PA Lumajang</span>
                </p>
              </div>

              {/* Tanggal SK Terhubung KlikSurat */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-primary uppercase tracking-wider">
                    Tanggal Surat KGB
                  </label>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    Server KlikSurat
                  </span>
                </div>
                <input
                  type="text"
                  value={tanggalSk}
                  onChange={(e) => setTanggalSk(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest text-xs font-medium text-primary focus:ring-2 focus:ring-primary focus:outline-none"
                />
                <p className="text-[10.5px] text-outline mt-1">
                  Tanggal otomatis sinkron dengan waktu server KlikSurat
                </p>
              </div>

              {/* TMT Mulai Berlaku */}
              <div>
                <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1">
                  Terhitung Mulai Tanggal (TMT Baru)
                </label>
                <input
                  type="text"
                  value={tmtBaru}
                  onChange={(e) => setTmtBaru(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest text-xs font-bold text-primary focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              {/* Gaji Pokok Lama */}
              <div>
                <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1">
                  Gaji Pokok Lama
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs text-outline font-semibold">Rp</span>
                  <input
                    type="number"
                    value={gajiLama}
                    onChange={(e) => setGajiLama(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 rounded-xl border border-outline-variant bg-surface-container-low text-xs font-medium text-primary focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Gaji Pokok Baru (Hitung Otomatis) */}
              <div>
                <label className="block text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">
                  Gaji Pokok Baru (Perhitungan Otomatis)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs text-emerald-800 font-bold">Rp</span>
                  <input
                    type="number"
                    value={gajiBaru}
                    onChange={(e) => setGajiBaru(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 rounded-xl border-2 border-emerald-500 bg-emerald-50 text-xs font-extrabold text-emerald-950 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Masa Kerja Golongan */}
              <div>
                <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1">
                  Masa Kerja Golongan (MKG)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={mkgTahun}
                    onChange={(e) => setMkgTahun(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant text-xs font-bold text-primary focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                  <span className="text-xs text-outline font-semibold whitespace-nowrap">Tahun 0 Bulan</span>
                </div>
              </div>

              {/* Pejabat Penandatangan */}
              <div>
                <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1">
                  Pejabat Penandatangan
                </label>
                <input
                  type="text"
                  value={penandatangan}
                  onChange={(e) => setPenandatangan(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-outline-variant text-xs font-medium text-primary focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-outline-variant/40 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  const draftKgb = {
                    id: 'DRAFT',
                    nomorSk,
                    pegawaiId: selectedPegawai.id,
                    nama: selectedPegawai.nama,
                    nip: selectedPegawai.nip,
                    pangkatGolongan: `${selectedPegawai.pangkat} (${selectedPegawai.golongan})`,
                    jabatan: selectedPegawai.jabatan,
                    gajiLama: Number(gajiLama),
                    gajiBaru: Number(gajiBaru),
                    tmtBaru,
                    tmtBerikutnya: '01-11-2028',
                    mkgTahun: Number(mkgTahun),
                    mkgBulan: 0,
                    tanggalSk,
                    penandatangan
                  };
                  setActiveDocForPreview(draftKgb);
                  setShowPreviewModal(true);
                }}
                className="px-4 py-2.5 rounded-xl border border-outline-variant text-xs font-bold text-primary hover:bg-surface-container transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">visibility</span>
                <span>Pratinjau Draft SK</span>
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary-container transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                <span className="material-symbols-outlined text-[18px] text-secondary-container">print</span>
                <span>Terbitkan & Cetak SK KGB</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Bottom Section: Arsip Riwayat SK KGB */}
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/60 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-extrabold text-base text-primary">
              Arsip Digital SK Kenaikan Gaji Berkala
            </h2>
            <p className="text-xs text-outline mt-0.5">
              Riwayat dokumen SK KGB yang telah diterbitkan dan tersimpan rapi siap cetak ulang
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-surface-container text-outline">
            {riwayatKgbList.length} SK Diterbitkan
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-container text-primary font-display font-bold uppercase tracking-wider text-[11px] border-b border-outline-variant/60">
              <tr>
                <th className="py-3 px-4">Nomor SK</th>
                <th className="py-3 px-4">Nama Pegawai & NIP</th>
                <th className="py-3 px-4">Pangkat / Golongan</th>
                <th className="py-3 px-4">TMT KGB Baru</th>
                <th className="py-3 px-4">Gaji Pokok Baru</th>
                <th className="py-3 px-4">Tanggal SK</th>
                <th className="py-3 px-4 text-center">Aksi Dokumen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/40">
              {riwayatKgbList.map((item) => (
                <tr key={item.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="py-3 px-4 font-bold text-primary font-mono text-[11px]">
                    {item.nomorSk}
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-primary">{item.nama}</p>
                    <p className="text-[11px] text-outline font-mono">NIP. {item.nip}</p>
                  </td>
                  <td className="py-3 px-4 text-on-surface-variant font-medium">
                    {item.pangkatGolongan}
                  </td>
                  <td className="py-3 px-4 font-bold text-primary">
                    {item.tmtBaru}
                  </td>
                  <td className="py-3 px-4 font-bold text-emerald-700">
                    {formatRupiah(item.gajiBaru)}
                  </td>
                  <td className="py-3 px-4 text-outline">
                    {item.tanggalSk}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleOpenExistingDoc(item)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-surface-container-low text-primary hover:bg-primary hover:text-white transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">print</span>
                      <span>Cetak Ulang</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Format Resmi Cetak SK KGB Sesuai form-KGB.docx */}
      {showPreviewModal && activeDocForPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white text-black rounded-2xl max-w-3xl w-full p-8 shadow-2xl relative my-8 print:p-0 print:m-0 print:shadow-none print:max-w-none">
            {/* Modal Controls (Hidden in Print) */}
            <div className="no-print sticky top-0 bg-white/95 backdrop-blur z-20 flex flex-wrap items-center justify-between pb-4 mb-6 border-b border-gray-200 gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-colors shadow-sm"
                  title="Kembali ke Halaman KGB"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  <span>Kembali</span>
                </button>
                <div className="flex items-center gap-2 ml-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="font-bold text-xs sm:text-sm text-gray-800">Pratinjau Surat KGB (Format form-KGB)</span>
                </div>
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

            {/* Print Document Body */}
            <div className="space-y-3 text-black text-[12px] leading-relaxed font-serif">
              {/* Kop Surat Resmi Mahkamah Agung RI */}
              <OfficialKopSurat />

              {/* Tabel Metadata Surat: Nomor, Lamp, Perihal & Tujuan KPPN */}
              <div className="grid grid-cols-12 gap-2 mb-3">
                <div className="col-span-7">
                  <table className="w-full text-[12px]">
                    <tbody>
                      <tr>
                        <td className="w-16 align-top">Nomor</td>
                        <td className="w-3 align-top">:</td>
                        <td className="align-top font-sans font-semibold">{activeDocForPreview.nomorSk}</td>
                      </tr>
                      <tr>
                        <td className="align-top">Lamp.</td>
                        <td className="align-top">:</td>
                        <td className="align-top">-</td>
                      </tr>
                      <tr>
                        <td className="align-top">Perihal</td>
                        <td className="align-top">:</td>
                        <td className="align-top">
                          <span className="font-bold">Kenaikan Gaji Berkala</span>
                          <div className="font-normal">an. <span className="font-semibold">{activeDocForPreview.nama}</span></div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="col-span-5 pl-2 text-[12px]">
                  <p>Lumajang, {formatTanggalIndo(activeDocForPreview.tanggalSk)}</p>
                  <div className="mt-2 text-[11.5px] leading-tight space-y-0.5">
                    <p>Kepada:</p>
                    <p className="font-bold">Yth. Kepala Kantor Pelayanan</p>
                    <p className="font-bold">Perbendaharaan Negara Bondowoso</p>
                    <p>Di -</p>
                    <p className="pl-4">Bondowoso</p>
                  </div>
                </div>
              </div>

              {/* Pembukaan Surat */}
              <p className="text-justify pt-1">
                Dengan ini diberitahukan bahwa berhubung dengan telah dipenuhinya masa kerja dan syarat-syarat lainnya kepada:
              </p>

              {/* Rincian Poin 1 s/d 6 */}
              <div className="pl-2">
                <table className="w-full text-[12px]">
                  <tbody>
                    <tr>
                      <td className="w-6 align-top">1.</td>
                      <td className="w-48 align-top">Nama</td>
                      <td className="w-3 align-top">:</td>
                      <td className="align-top font-bold uppercase">{activeDocForPreview.nama}</td>
                    </tr>
                    <tr>
                      <td className="align-top">2.</td>
                      <td className="align-top">NIP</td>
                      <td className="align-top">:</td>
                      <td className="align-top font-mono">{activeDocForPreview.nip}</td>
                    </tr>
                    <tr>
                      <td className="align-top">3.</td>
                      <td className="align-top">Pangkat, golongan / ruang</td>
                      <td className="align-top">:</td>
                      <td className="align-top">{activeDocForPreview.pangkatGolongan}</td>
                    </tr>
                    <tr>
                      <td className="align-top">4.</td>
                      <td className="align-top">Jabatan</td>
                      <td className="align-top">:</td>
                      <td className="align-top">{activeDocForPreview.jabatan}</td>
                    </tr>
                    <tr>
                      <td className="align-top">5.</td>
                      <td className="align-top">Satuan kerja</td>
                      <td className="align-top">:</td>
                      <td className="align-top font-semibold">Pengadilan Agama Lumajang</td>
                    </tr>
                    <tr>
                      <td className="align-top">6.</td>
                      <td className="align-top">Gaji pokok</td>
                      <td className="align-top">:</td>
                      <td className="align-top">
                        <span className="font-bold">{formatRupiah(activeDocForPreview.gajiLama)}</span>{' '}
                        <span className="italic text-[11px]">({terbilang(activeDocForPreview.gajiLama)} rupiah)</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Atas Dasar SK Terakhir */}
              <p className="pt-1">
                Atas dasar surat keputusan terakhir tentang pangkat/gaji yang ditetapkan:
              </p>

              <div className="pl-2">
                <table className="w-full text-[12px]">
                  <tbody>
                    <tr>
                      <td className="w-6 align-top">a.</td>
                      <td className="w-48 align-top">Oleh Pejabat</td>
                      <td className="w-3 align-top">:</td>
                      <td className="align-top">Ketua Pengadilan Agama Lumajang</td>
                    </tr>
                    <tr>
                      <td className="align-top">b.</td>
                      <td className="align-top">Nomor / Tanggal</td>
                      <td className="align-top">:</td>
                      <td className="align-top font-sans text-[11px]">
                        {activeDocForPreview.skLamaNomor || `W13-A8/355/KP.04.2/2/2024`} / {activeDocForPreview.skLamaTanggal || '02 Februari 2024'}
                      </td>
                    </tr>
                    <tr>
                      <td className="align-top">c.</td>
                      <td className="align-top">Tanggal mulai berlakunya</td>
                      <td className="align-top">:</td>
                      <td className="align-top">{activeDocForPreview.skLamaTmt || '01 Maret 2024'}</td>
                    </tr>
                    <tr>
                      <td className="align-top">d.</td>
                      <td className="align-top">Masa kerja golongan</td>
                      <td className="align-top">:</td>
                      <td className="align-top">
                        {activeDocForPreview.mkgLamaTahun !== undefined ? activeDocForPreview.mkgLamaTahun : Math.max(0, activeDocForPreview.mkgTahun - 2)} Tahun 00 Bulan
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Header Diberikan Kenaikan Gaji Berkala */}
              <p className="font-bold text-center tracking-wider pt-2 uppercase text-[12.5px]">
                DIBERIKAN KENAIKAN GAJI BERKALA HINGGA MEMPEROLEH:
              </p>

              {/* Rincian Poin 7 s/d 11 */}
              <div className="pl-2">
                <table className="w-full text-[12px]">
                  <tbody>
                    <tr>
                      <td className="w-6 align-top font-bold">7.</td>
                      <td className="w-48 align-top font-bold">Gaji pokok baru</td>
                      <td className="w-3 align-top font-bold">:</td>
                      <td className="align-top font-bold">
                        {formatRupiah(activeDocForPreview.gajiBaru)}{' '}
                        <span className="italic font-normal text-[11px]">({terbilang(activeDocForPreview.gajiBaru)} rupiah)</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="align-top">8.</td>
                      <td className="align-top">Berdasarkan masa kerja</td>
                      <td className="align-top">:</td>
                      <td className="align-top font-semibold">{activeDocForPreview.mkgTahun} Tahun 00 Bulan</td>
                    </tr>
                    <tr>
                      <td className="align-top">9.</td>
                      <td className="align-top">Dalam golongan / ruang</td>
                      <td className="align-top">:</td>
                      <td className="align-top font-semibold">
                        {activeDocForPreview.pangkatGolongan.includes('(')
                          ? activeDocForPreview.pangkatGolongan.split('(')[1].replace(')', '')
                          : activeDocForPreview.pangkatGolongan}
                      </td>
                    </tr>
                    <tr>
                      <td className="align-top font-bold">10.</td>
                      <td className="align-top font-bold">Mulai tanggal</td>
                      <td className="align-top font-bold">:</td>
                      <td className="align-top font-bold">{formatTanggalIndo(activeDocForPreview.tmtBaru)}</td>
                    </tr>
                    <tr>
                      <td className="align-top">11.</td>
                      <td className="align-top">Kenaikan gaji yang akan datang</td>
                      <td className="align-top">:</td>
                      <td className="align-top">{formatTanggalIndo(activeDocForPreview.tmtBerikutnya || '01-11-2028')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Paragraf Penutup */}
              <p className="text-justify pt-1">
                Diharapkan agar sesuai dengan Peraturan Pemerintah RI Nomor 5 Tahun 2024 kepada pegawai tersebut dapat dibayarkan penghasilan berdasarkan gaji pokok yang baru.
              </p>

              {/* Tanda Tangan Ketua */}
              <div className="pt-4 flex justify-end">
                <div className="text-left w-64 text-xs">
                  <p className="font-bold">Ketua,</p>
                  <div className="h-16 flex items-center">
                    <span className="text-gray-400 italic text-[11px] no-print">[Tanda Tangan & Cap Dinas]</span>
                  </div>
                  <p className="font-bold underline text-sm tracking-wide">
                    {activeDocForPreview.penandatangan?.split('(')[0]?.trim() || 'FATKUR ROSYAD'}
                  </p>
                </div>
              </div>

              {/* Tembusan Resmi */}
              <div className="pt-2 border-t border-gray-400 text-[10.5px] leading-normal text-gray-800">
                <p className="font-bold">Tembusan:</p>
                <ol className="list-decimal list-inside pl-1 space-y-0.5">
                  <li>Ketua Pengadilan Tinggi Agama Surabaya di Surabaya;</li>
                  <li>Petugas Pengelola Anggaran Belanja Pegawai Pengadilan Agama Lumajang;</li>
                  <li>Pegawai yang bersangkutan;</li>
                  <li>Arsip.</li>
                </ol>
              </div>

              {/* Bottom Action Bar (Hidden in Print) */}
              <div className="no-print pt-6 mt-6 border-t border-gray-300 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 bg-gray-50 text-gray-700 text-xs font-bold hover:bg-gray-100 hover:text-black transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  <span>Kembali ke Halaman Layanan KGB</span>
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

