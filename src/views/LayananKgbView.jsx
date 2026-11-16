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
  // 1. Aparatur PNS (23 orang resmi tercatat di tabel master_kgb Database KlikCuti)
  const pnsList = (pegawaiList || []).filter(p =>
    p.hasMasterKgb || p.statusKepegawaian === 'PNS' || (!p.nip?.includes('202521') && !p.nip?.includes('202421') && p.statusKepegawaian !== 'PPPK')
  );

  // 2. Aparatur PPPK (12 orang resmi PA Lumajang)
  const rawPppkList = (pegawaiList || []).filter(p =>
    p.statusKepegawaian === 'PPPK' || p.nip?.includes('202521') || p.nip?.includes('202421')
  );

  // Sub Menu State: 'PNS' | 'PPPK'
  const [subTab, setSubTab] = useState(() => {
    if (selectedPegawaiFromProps?.statusKepegawaian === 'PPPK' || selectedPegawaiFromProps?.nip?.includes('202521')) {
      return 'PPPK';
    }
    return 'PNS';
  });

  // ==========================================
  // STATE KHUSUS KGB PNS (Diterbitkan PA Lumajang)
  // ==========================================
  const [selectedPegawai, setSelectedPegawai] = useState(
    selectedPegawaiFromProps && (selectedPegawaiFromProps.hasMasterKgb || selectedPegawaiFromProps.statusKepegawaian === 'PNS')
      ? selectedPegawaiFromProps
      : pnsList[0] || null
  );
  const [filterYear, setFilterYear] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Form State PNS
  const [nomorSk, setNomorSk] = useState('452/KPA.W13-A8/KP2.1/XI/2026');
  const [tanggalSk, setTanggalSk] = useState('14-11-2026');
  const [tmtBaru, setTmtBaru] = useState('01-11-2026');
  const [mkgTahun, setMkgTahun] = useState(selectedPegawai?.mkgTahun ? selectedPegawai.mkgTahun + 2 : 20);
  const [gajiLama, setGajiLama] = useState(selectedPegawai?.gajiPokokLama || 3824500);
  const [gajiBaru, setGajiBaru] = useState(selectedPegawai?.gajiPokokBaru || 3945300);
  const [penandatangan, setPenandatangan] = useState('FATKUR ROSYAD (Ketua Pengadilan Agama Lumajang)');

  // Modal & Toast State PNS
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [activeDocForPreview, setActiveDocForPreview] = useState(null);
  const [successToast, setSuccessToast] = useState('');
  const [isSyncingKlikSurat, setIsSyncingKlikSurat] = useState(false);

  // ==========================================
  // STATE KHUSUS KGB PPPK (Kontrol Mahkamah Agung)
  // ==========================================
  const [pppkSkRecords, setPppkSkRecords] = useState(() => {
    try {
      const saved = localStorage.getItem('klikapeg_pppk_sk_records');
      if (saved) return JSON.parse(saved);
    } catch (e) { }
    return {};
  });

  const [searchPppkQuery, setSearchPppkQuery] = useState('');
  const [filterPppkGolongan, setFilterPppkGolongan] = useState('ALL'); // 'ALL' | 'V' | 'IX'
  const [filterPppkStatus, setFilterPppkStatus] = useState('ALL'); // 'ALL' | 'MENUNGGU' | 'SUDAH_SK'

  // Modal Catat SK Mahkamah Agung untuk PPPK
  const [showPppkModal, setShowPppkModal] = useState(false);
  const [selectedPppkForModal, setSelectedPppkForModal] = useState(null);
  const [pppkModalForm, setPppkModalForm] = useState({
    noSkMa: '',
    tanggalSkMa: '',
    tmtSkMa: '01-02-2027',
    tanggalDiterima: '',
    catatan: '',
    status: 'Menunggu Terbit MA RI'
  });

  // Mapped List PPPK dengan data kontrol
  const pppkList = rawPppkList.map(p => {
    const isGol9 = p.golongan === 'IX';
    // Standar Perpres No. 11/2024 (MK 0 Th -> MK 2 Th)
    const gajiLama = isGol9 ? 3203600 : 2511500;
    const gajiBaru = isGol9 ? 3304500 : 2590600;
    const tmtPengangkatan = '09-01-2025';
    const tmtKgbPertama = '01-02-2027';
    const skRecord = pppkSkRecords[p.nip];

    return {
      ...p,
      tmtPengangkatan,
      tmtKgbPertama,
      gajiPokokLama: gajiLama,
      gajiPokokBaru: gajiBaru,
      mkgTahun: 0,
      mkgBaru: 2,
      noSkMa: skRecord?.noSkMa || '',
      tanggalSkMa: skRecord?.tanggalSkMa || '',
      tmtSkMa: skRecord?.tmtSkMa || tmtKgbPertama,
      tanggalDiterima: skRecord?.tanggalDiterima || '',
      catatanMa: skRecord?.catatan || '',
      statusKontrol: skRecord?.noSkMa ? 'SK MA Diterima' : 'Menunggu Terbit MA RI'
    };
  });

  // Sinkronisasi pilihan pegawai dari props
  useEffect(() => {
    if (selectedPegawaiFromProps) {
      const isPppk = selectedPegawaiFromProps.statusKepegawaian === 'PPPK' || selectedPegawaiFromProps.nip?.includes('202521');
      if (isPppk) {
        setSubTab('PPPK');
      } else {
        setSubTab('PNS');
        handleSelectPegawai(selectedPegawaiFromProps);
      }
    }
  }, [selectedPegawaiFromProps]);

  // Update aparatur pertama jika data PNS KlikCuti selesai dimuat
  useEffect(() => {
    if (pnsList && pnsList.length > 0 && !selectedPegawaiFromProps) {
      const matchCurrent = pnsList.some(p => p.id === selectedPegawai?.id);
      if (!matchCurrent) {
        handleSelectPegawai(pnsList[0]);
      }
    }
  }, [pegawaiList]);

  // Muat nomor register awal langsung dari KlikSurat untuk PNS
  useEffect(() => {
    getNextNomorSkKgb().then(res => {
      if (res && res.nomorSk) {
        setNomorSk(res.nomorSk);
        setTanggalSk(res.tanggalSk);
      }
    }).catch(() => { });
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
      skLamaNomor: selectedPegawai.noSkTerakhir || `W13-A8/289/KP.04.1/X/2024`,
      skLamaTanggal: '25 Oktober 2024',
      skLamaTmt: selectedPegawai.tmtKgbTerakhir || '01 Maret 2025',
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
        setSuccessToast(`Surat Pemberitahuan KGB Nomor ${nomorSk} berhasil diterbitkan PA Lumajang dan otomatis tercatat di buku register Database KlikSurat.`);
      } else {
        setSuccessToast(`Surat Pemberitahuan KGB Nomor ${nomorSk} berhasil diterbitkan PA Lumajang dan disimpan ke arsip.`);
      }
      setTimeout(() => setSuccessToast(''), 4500);
    });
  };

  const handleOpenExistingDoc = (kgbItem) => {
    setActiveDocForPreview(kgbItem);
    setShowPreviewModal(true);
  };

  // Filter PNS
  const filteredPnsList = pnsList.filter(p => {
    const matchSearch =
      (p.nama || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.nip || '').includes(searchQuery);

    if (filterYear === 'ALL') return matchSearch;
    if (filterYear === '2027') return matchSearch && (p.tmtKgbBerikutnya || '').includes('2027');
    if (filterYear === '2028') return matchSearch && (p.tmtKgbBerikutnya || '').includes('2028');
    return matchSearch;
  });

  const total2027Pns = pnsList.filter(p => (p.tmtKgbBerikutnya || '').includes('2027')).length;
  const total2028Pns = pnsList.filter(p => (p.tmtKgbBerikutnya || '').includes('2028')).length;

  // Filter PPPK
  const filteredPppkList = pppkList.filter(p => {
    const matchSearch =
      (p.nama || '').toLowerCase().includes(searchPppkQuery.toLowerCase()) ||
      (p.nip || '').includes(searchPppkQuery) ||
      (p.jabatan || '').toLowerCase().includes(searchPppkQuery.toLowerCase());

    const matchGol = filterPppkGolongan === 'ALL' ? true : p.golongan === filterPppkGolongan;
    const matchStatus =
      filterPppkStatus === 'ALL'
        ? true
        : filterPppkStatus === 'SUDAH_SK'
          ? !!p.noSkMa
          : !p.noSkMa;

    return matchSearch && matchGol && matchStatus;
  });

  // PPPK Modal Handlers
  const handleOpenPppkModal = (pppkItem) => {
    setSelectedPppkForModal(pppkItem);
    const existing = pppkSkRecords[pppkItem.nip];
    setPppkModalForm({
      noSkMa: existing?.noSkMa || '',
      tanggalSkMa: existing?.tanggalSkMa || '',
      tmtSkMa: existing?.tmtSkMa || pppkItem.tmtKgbPertama || '01-02-2027',
      tanggalDiterima: existing?.tanggalDiterima || new Date().toISOString().slice(0, 10),
      catatan: existing?.catatan || '',
      status: existing?.noSkMa ? 'SK MA Diterima' : 'Menunggu Terbit MA RI'
    });
    setShowPppkModal(true);
  };

  const handleSavePppkSk = (e) => {
    e.preventDefault();
    if (!selectedPppkForModal) return;

    const updated = {
      ...pppkSkRecords,
      [selectedPppkForModal.nip]: {
        noSkMa: pppkModalForm.noSkMa,
        tanggalSkMa: pppkModalForm.tanggalSkMa,
        tmtSkMa: pppkModalForm.tmtSkMa,
        tanggalDiterima: pppkModalForm.tanggalDiterima,
        catatan: pppkModalForm.catatan,
        updatedAt: new Date().toISOString()
      }
    };

    setPppkSkRecords(updated);
    try {
      localStorage.setItem('klikapeg_pppk_sk_records', JSON.stringify(updated));
    } catch (err) { }

    setShowPppkModal(false);
    setSuccessToast(`Data kontrol nomor SK Mahkamah Agung untuk ${selectedPppkForModal.nama} berhasil disimpan.`);
    setTimeout(() => setSuccessToast(''), 4500);
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Page Header */}
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
            Sistem Administrasi KGB PA Lumajang: Penerbitan SK KGB PNS & Kontrol Siklus KGB PPPK Mahkamah Agung.
          </p>
        </div>
      </div>

      {successToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 shadow-sm animate-fadeIn">
          <span className="material-symbols-outlined text-emerald-600">check_circle</span>
          <span>{successToast}</span>
        </div>
      )}

      {/* Sub Menu Navigation: 1. KGB untuk PNS | 2. KGB untuk PPPK */}
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/60 p-2 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Sub Menu 1: KGB untuk PNS */}
          <button
            type="button"
            onClick={() => setSubTab('PNS')}
            className={`flex items-center gap-3.5 p-3.5 rounded-2xl text-left transition-all ${subTab === 'PNS'
              ? 'bg-[#1B2A4A] text-white shadow-md ring-2 ring-primary/20'
              : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-primary'
              }`}
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${subTab === 'PNS' ? 'bg-amber-400 text-black shadow-xs' : 'bg-primary/10 text-primary'
              }`}>
              <span className="material-symbols-outlined text-[24px]">badge</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <span className="font-display font-bold text-sm tracking-tight truncate">
                  1. KGB untuk PNS
                </span>
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${subTab === 'PNS' ? 'bg-amber-400 text-black' : 'bg-primary/10 text-primary'
                  }`}>
                  {pnsList.length} Aparatur
                </span>
              </div>
              <p className={`text-[11px] truncate mt-0.5 font-medium ${subTab === 'PNS' ? 'text-gray-200' : 'text-outline'
                }`}>
                Surat dibuat & diterbitkan oleh PA Lumajang
              </p>
            </div>
          </button>

          {/* Sub Menu 2: KGB untuk PPPK */}
          <button
            type="button"
            onClick={() => setSubTab('PPPK')}
            className={`flex items-center gap-3.5 p-3.5 rounded-2xl text-left transition-all ${subTab === 'PPPK'
              ? 'bg-[#1B2A4A] text-white shadow-md ring-2 ring-primary/20'
              : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-primary'
              }`}
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${subTab === 'PPPK' ? 'bg-amber-400 text-black shadow-xs' : 'bg-primary/10 text-primary'
              }`}>
              <span className="material-symbols-outlined text-[24px]">monitoring</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <span className="font-display font-bold text-sm tracking-tight truncate">
                  2. KGB untuk PPPK
                </span>
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${subTab === 'PPPK' ? 'bg-amber-400 text-black' : 'bg-primary/10 text-primary'
                  }`}>
                  {pppkList.length} Aparatur
                </span>
              </div>
              <p className={`text-[11px] truncate mt-0.5 font-medium ${subTab === 'PPPK' ? 'text-gray-200' : 'text-outline'
                }`}>
                Diterbitkan Mahkamah Agung • Khusus Kontrol
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. KONTEN SUB-MENU: KGB UNTUK PNS (Dibuat & Diterbitkan oleh PA Lumajang) */}
      {/* ========================================================================= */}
      {subTab === 'PNS' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Banner Kewenangan PNS */}
          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                <span className="material-symbols-outlined text-[22px]">assignment_turned_in</span>
              </div>
              <div>
                <p className="font-bold text-primary text-sm">
                  Kewenangan Satuan Kerja Pengadilan Agama Lumajang Kelas 1A
                </p>
                <p className="text-on-surface-variant text-[11.5px] mt-0.5 leading-relaxed">
                  Berdasarkan pendelegasian wewenang Mahkamah Agung RI, Surat Keputusan KGB bagi Pegawai Negeri Sipil (PNS) <strong>dibuat, diproses, dan diterbitkan resmi oleh Ketua Pengadilan Agama Lumajang</strong>.
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-[11px] font-bold self-start sm:self-center flex-shrink-0 border border-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span>Diterbitkan Satker PA Lumajang</span>
            </span>
          </div>

          {/* Main Split Layout: Kontrol Jadwal PNS (Kiri) & Form Cetak SK (Kanan) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Tabel Kontrol Jadwal KGB PNS */}
            <div className="lg:col-span-5 bg-surface-container-lowest rounded-3xl border border-outline-variant/60 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display font-bold text-base text-primary">
                    Tabel Kontrol Jadwal KGB PNS
                  </h2>
                  <p className="text-[11px] text-outline mt-0.5">Pilih pegawai untuk memproses SK KGB resmi</p>
                </div>
                <span className="text-[11px] font-bold text-sky-900 bg-sky-100 border border-sky-300 px-2.5 py-0.5 rounded-full shadow-2xs">
                  {filteredPnsList.length} PNS
                </span>
              </div>

              {/* Search & Filter PNS */}
              <div className="space-y-2">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-outline">search</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari nama aparatur PNS atau NIP..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-outline-variant text-xs bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex gap-1.5 text-[11px] font-semibold">
                  <button
                    onClick={() => setFilterYear('ALL')}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${filterYear === 'ALL' ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-outline'}`}
                  >
                    Semua ({pnsList.length})
                  </button>
                  <button
                    onClick={() => setFilterYear('2027')}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${filterYear === '2027' ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-outline'}`}
                  >
                    Tahun 2027 ({total2027Pns})
                  </button>
                  <button
                    onClick={() => setFilterYear('2028')}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${filterYear === '2028' ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-outline'}`}
                  >
                    Tahun 2028 ({total2028Pns})
                  </button>
                </div>
              </div>

              {/* PNS Employee Control List */}
              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                {filteredPnsList.map((pegawai) => {
                  const isSelected = selectedPegawai?.id === pegawai.id;

                  return (
                    <div
                      key={pegawai.id}
                      onClick={() => handleSelectPegawai(pegawai)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer ${isSelected
                        ? 'bg-primary-fixed/20 border-primary shadow-sm ring-1 ring-primary'
                        : 'bg-surface-container-low border-outline-variant/40 hover:border-primary/40'
                        }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={pegawai.foto}
                            alt={pegawai.nama}
                            className="w-10 h-10 rounded-xl object-cover ring-2 ring-outline-variant/60 flex-shrink-0"
                            onError={(e) => {
                              e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(pegawai.nama) + '&background=1B2A4A&color=fff';
                            }}
                          />
                          <div className="truncate">
                            <h3 className="font-display font-bold text-xs text-primary truncate">
                              {pegawai.nama}
                            </h3>
                            <p className="text-[11px] text-outline truncate">
                              {pegawai.golongan} • NIP. {pegawai.nip}
                            </p>
                            <p className="text-[10.5px] text-on-surface-variant truncate">
                              {pegawai.jabatan}
                            </p>
                          </div>
                        </div>

                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0 ${pegawai.tmtKgbBerikutnya?.includes('2027')
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-sky-100 text-sky-900 border border-sky-300'
                          }`}>
                          TMT: {pegawai.tmtKgbBerikutnya || '-'}
                        </span>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-outline-variant/40 flex items-center justify-between text-[11px]">
                        <div>
                          <span className="text-outline">SK Terakhir: </span>
                          <span className="font-mono text-gray-700 font-semibold">{pegawai.noSkTerakhir || '-'}</span>
                        </div>
                        <span className="font-bold text-emerald-700">
                          {formatRupiah(pegawai.gajiPokokBaru)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Formulir Pembuatan & Penerbitan SK KGB Resmi PA Lumajang */}
            <div className="lg:col-span-7 bg-surface-container-lowest rounded-3xl border border-outline-variant/60 shadow-sm p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant/50">
                <div>
                  <h2 className="font-display font-extrabold text-base text-primary">
                    Formulir Penerbitan SK KGB PNS
                  </h2>
                  <p className="text-xs text-outline mt-0.5">
                    Diterbitkan resmi oleh Pengadilan Agama Lumajang Kelas 1A ditujukan kepada KPPN Bondowoso
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-secondary bg-secondary-fixed/30 px-2.5 py-1 rounded-full">
                    Format Standar MA RI
                  </span>
                </div>
              </div>

              {selectedPegawai ? (
                <form onSubmit={handleProsesDanTerbitkan} className="space-y-4 text-xs">
                  {/* Info Pegawai Terpilih */}
                  <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        {selectedPegawai.nama.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-sm text-primary">{selectedPegawai.nama}</h4>
                        <p className="text-outline text-[11px]">NIP. {selectedPegawai.nip} • Golongan: {selectedPegawai.golongan} ({selectedPegawai.pangkat})</p>
                        <p className="text-[11px] text-on-surface-variant">{selectedPegawai.jabatan}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-lg">
                      PNS Terverifikasi
                    </span>
                  </div>

                  {/* Form Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Nomor SK Terintegrasi KlikSurat */}
                    <div className="md:col-span-2">
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-primary uppercase tracking-wider">
                          Nomor SK KGB Resmi (Terhubung KlikSurat)
                        </label>
                        <button
                          type="button"
                          onClick={handleAmbilNomorKlikSurat}
                          disabled={isSyncingKlikSurat}
                          className="text-[10.5px] font-bold text-primary hover:text-secondary flex items-center gap-1 cursor-pointer"
                        >
                          <span className={`material-symbols-outlined text-[14px] ${isSyncingKlikSurat ? 'animate-spin' : ''}`}>sync</span>
                          <span>{isSyncingKlikSurat ? 'Mengambil nomor...' : 'Sinkronkan Nomor KlikSurat'}</span>
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

                    {/* Tanggal SK */}
                    <div>
                      <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1">
                        Tanggal Surat KGB
                      </label>
                      <input
                        type="text"
                        value={tanggalSk}
                        onChange={(e) => setTanggalSk(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest text-xs font-medium text-primary focus:ring-2 focus:ring-primary focus:outline-none"
                      />
                    </div>

                    {/* TMT Baru */}
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
                        Gaji Pokok Lama (Rp)
                      </label>
                      <input
                        type="number"
                        value={gajiLama}
                        onChange={(e) => setGajiLama(Number(e.target.value))}
                        className="w-full px-3.5 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest text-xs font-medium text-primary focus:ring-2 focus:ring-primary focus:outline-none"
                      />
                      <p className="text-[10.5px] text-outline mt-0.5">{formatRupiah(gajiLama)}</p>
                    </div>

                    {/* Gaji Pokok Baru */}
                    <div>
                      <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1">
                        Gaji Pokok Baru (PP 5/2024)
                      </label>
                      <input
                        type="number"
                        value={gajiBaru}
                        onChange={(e) => setGajiBaru(Number(e.target.value))}
                        className="w-full px-3.5 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest text-xs font-bold text-emerald-700 focus:ring-2 focus:ring-primary focus:outline-none"
                      />
                      <p className="text-[10.5px] text-emerald-700 font-bold mt-0.5">{formatRupiah(gajiBaru)}</p>
                    </div>

                    {/* Masa Kerja Baru */}
                    <div>
                      <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1">
                        Masa Kerja Golongan (Tahun)
                      </label>
                      <input
                        type="number"
                        value={mkgTahun}
                        onChange={(e) => setMkgTahun(Number(e.target.value))}
                        className="w-full px-3.5 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest text-xs font-medium text-primary focus:ring-2 focus:ring-primary focus:outline-none"
                      />
                    </div>

                    {/* Tujuan SK */}
                    <div>
                      <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1">
                        Instansi Penerima Tembusan Gaji
                      </label>
                      <input
                        type="text"
                        readOnly
                        value="KPPN Bondowoso"
                        className="w-full px-3.5 py-2 rounded-xl border border-outline-variant bg-surface-container-low text-xs font-semibold text-primary cursor-not-allowed"
                      />
                    </div>

                    {/* Pejabat Penandatangan */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1">
                        Pejabat Penandatangan SK (PA Lumajang)
                      </label>
                      <input
                        type="text"
                        value={penandatangan}
                        onChange={(e) => setPenandatangan(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest text-xs font-bold text-primary focus:ring-2 focus:ring-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Submit Buttons PNS */}
                  <div className="pt-3 border-t border-outline-variant/40 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        const draftKgb = {
                          id: 'DRAFT-' + Date.now(),
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
                          skLamaNomor: selectedPegawai.noSkTerakhir || `W13-A8/289/KP.04.1/X/2024`,
                          skLamaTanggal: '25 Oktober 2024',
                          skLamaTmt: selectedPegawai.tmtKgbTerakhir || '01 Maret 2025',
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
              ) : (
                <div className="p-8 text-center text-outline">
                  Silakan pilih pegawai PNS pada daftar sebelah kiri untuk memproses SK KGB.
                </div>
              )}
            </div>
          </div>

          {/* Bottom Section: Arsip Riwayat SK KGB PNS yang Diterbitkan PA Lumajang */}
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/60 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display font-extrabold text-base text-primary">
                  Arsip Digital SK KGB PNS (Diterbitkan PA Lumajang)
                </h2>
                <p className="text-xs text-outline mt-0.5">
                  Riwayat dokumen SK KGB resmi yang telah diproses dan diterbitkan oleh Pengadilan Agama Lumajang Kelas 1A
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
                  {riwayatKgbList.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-outline">
                        Belum ada arsip SK KGB yang diterbitkan. Silakan terbitkan melalui formulir di atas.
                      </td>
                    </tr>
                  ) : (
                    riwayatKgbList.map((item) => (
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
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. KONTEN SUB-MENU: KGB UNTUK PPPK (Diterbitkan Mahkamah Agung • Khusus Kontrol) */}
      {/* ========================================================================= */}
      {subTab === 'PPPK' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Banner Kewenangan PPPK */}
          <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-500 text-black flex items-center justify-center flex-shrink-0 font-bold shadow-xs">
                <span className="material-symbols-outlined text-[24px]">policy</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-display font-bold text-sm text-primary">
                    Kewenangan Penerbitan Surat KGB PPPK Berada Pada Mahkamah Agung RI
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-200 text-amber-900 border border-amber-400">
                    Aplikasi Hanya Untuk Kontrol
                  </span>
                </div>
                <p className="text-on-surface-variant leading-relaxed text-[11.5px]">
                  Berdasarkan <strong>PermenPAN-RB No. 7 Tahun 2023</strong> dan Petunjuk Teknis Mahkamah Agung RI, Surat Keputusan Kenaikan Gaji Berkala (KGB) bagi Pegawai Pemerintah dengan Perjanjian Kerja (PPPK) dibuat dan diterbitkan langsung secara terpusat oleh <strong>Pejabat Pembina Kepegawaian (PPK) Mahkamah Agung RI</strong>.
                  <br />
                  <span className="text-primary font-semibold">
                    Pengadilan Agama Lumajang TIDAK menerbitkan surat KGB untuk PPPK.
                  </span>{' '}
                  Aplikasi KlikApeg menyediakan halaman ini khusus sebagai <strong>Sistem Kontrol & Monitoring Jadwal Berkala, Estimasi Hak Gaji Baru, serta Pencatatan Nomor SK MA</strong> yang diterima.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 self-start md:self-center">
              <span className="px-3.5 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-amber-300">verified_user</span>
                <span>Penerbit Resmi: MA RI</span>
              </span>
            </div>
          </div>

          {/* KPI Ringkasan Kontrol KGB PPPK */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold flex-shrink-0">
                <span className="material-symbols-outlined text-[22px]">group</span>
              </div>
              <div>
                <p className="text-[11px] text-outline font-medium">Total Aparatur PPPK</p>
                <p className="font-display font-extrabold text-lg text-primary">{pppkList.length} Orang</p>
                <p className="text-[10px] text-gray-500">PA Lumajang Kelas 1A</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold flex-shrink-0">
                <span className="material-symbols-outlined text-[22px]">work</span>
              </div>
              <div>
                <p className="text-[11px] text-outline font-medium">Distribusi Formasi</p>
                <p className="font-display font-extrabold text-xs text-primary leading-tight">
                  7 Gol. IX (Penata)
                  <br />
                  5 Gol. V (Operator)
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold flex-shrink-0">
                <span className="material-symbols-outlined text-[22px]">event_repeat</span>
              </div>
              <div>
                <p className="text-[11px] text-outline font-medium">Siklus Berkala Pertama</p>
                <p className="font-display font-extrabold text-sm text-primary">01 Februari 2027</p>
                <p className="text-[10px] text-amber-800 font-semibold">TMT Angkat: 09 Jan 2025</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold flex-shrink-0">
                <span className="material-symbols-outlined text-[22px]">account_balance</span>
              </div>
              <div>
                <p className="text-[11px] text-outline font-medium">Status Kewenangan</p>
                <p className="font-display font-extrabold text-xs text-emerald-800 leading-tight">
                  Mahkamah Agung RI
                </p>
                <p className="text-[10px] text-gray-500">Satker Hanya Memonitor</p>
              </div>
            </div>
          </div>

          {/* Tabel Kontrol Monitoring KGB PPPK */}
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/60 shadow-sm p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-display font-extrabold text-base text-primary flex items-center gap-2">
                  <span>Tabel Monitoring & Kontrol Jadwal KGB PPPK</span>
                  <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    Khusus Kontrol Satker
                  </span>
                </h2>
                <p className="text-xs text-outline mt-0.5">
                  Daftar seluruh aparatur PPPK PA Lumajang untuk pemantauan siklus KGB 2 tahunan dari Mahkamah Agung RI
                </p>
              </div>

              {/* Search & Filter PPPK */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-full sm:w-60">
                  <span className="material-symbols-outlined absolute left-3 top-2 text-[18px] text-outline">search</span>
                  <input
                    type="text"
                    value={searchPppkQuery}
                    onChange={(e) => setSearchPppkQuery(e.target.value)}
                    placeholder="Cari nama / NIP PPPK..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-outline-variant text-xs bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <select
                  value={filterPppkGolongan}
                  onChange={(e) => setFilterPppkGolongan(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-outline-variant text-xs font-semibold bg-surface-container-low text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="ALL">Semua Golongan</option>
                  <option value="IX">Golongan IX (Penata)</option>
                  <option value="V">Golongan V (Operator)</option>
                </select>

                <select
                  value={filterPppkStatus}
                  onChange={(e) => setFilterPppkStatus(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-outline-variant text-xs font-semibold bg-surface-container-low text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="ALL">Semua Status SK</option>
                  <option value="MENUNGGU">Menunggu Terbit MA</option>
                  <option value="SUDAH_SK">SK MA Diterima</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-container text-primary font-display font-bold uppercase tracking-wider text-[11px] border-b border-outline-variant/60">
                  <tr>
                    <th className="py-3 px-3 text-center w-10">No</th>
                    <th className="py-3 px-4">Nama PPPK & NIP</th>
                    <th className="py-3 px-4">Jabatan & Golongan</th>
                    <th className="py-3 px-4">TMT Pengangkatan</th>
                    <th className="py-3 px-4">TMT KGB Pertama</th>
                    <th className="py-3 px-4">Estimasi Gaji Baru</th>
                    <th className="py-3 px-4">Status SK Mahkamah Agung</th>
                    <th className="py-3 px-4 text-center">Aksi Kontrol</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/40">
                  {filteredPppkList.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-8 text-center text-outline">
                        Tidak ada data PPPK yang sesuai dengan filter pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredPppkList.map((pppk, idx) => {
                      const hasSk = !!pppk.noSkMa;

                      return (
                        <tr key={pppk.id} className="hover:bg-surface-container-low transition-colors">
                          <td className="py-3 px-3 text-center text-outline font-semibold">
                            {idx + 1}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={pppk.foto}
                                alt={pppk.nama}
                                className="w-8 h-8 rounded-lg object-cover ring-1 ring-outline-variant/60 flex-shrink-0"
                                onError={(e) => {
                                  e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(pppk.nama) + '&background=D4A017&color=000';
                                }}
                              />
                              <div>
                                <p className="font-bold text-primary">{pppk.nama}</p>
                                <p className="text-[10.5px] text-outline font-mono">NIP. {pppk.nip}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-semibold text-primary">{pppk.jabatan}</p>
                            <span className="inline-block mt-0.5 px-2 py-0.2 rounded-md text-[10px] font-bold bg-primary/10 text-primary">
                              Golongan {pppk.golongan} (PPPK)
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono font-medium text-gray-700">
                            {pppk.tmtPengangkatan}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-mono font-bold text-primary">{pppk.tmtKgbPertama}</span>
                            <p className="text-[10px] text-outline">Masa Kerja: 2 Th</p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-bold text-emerald-700">{formatRupiah(pppk.gajiPokokBaru)}</p>
                            <p className="text-[10px] text-gray-400 line-through">{formatRupiah(pppk.gajiPokokLama)}</p>
                          </td>
                          <td className="py-3 px-4 max-w-xs">
                            {hasSk ? (
                              <div className="space-y-0.5">
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                                  <span>SK MA Diterima</span>
                                </span>
                                <p className="font-mono text-[10.5px] text-primary truncate font-bold">{pppk.noSkMa}</p>
                                {pppk.tanggalSkMa && (
                                  <p className="text-[10px] text-outline">Tgl SK: {pppk.tanggalSkMa}</p>
                                )}
                              </div>
                            ) : (
                              <div className="space-y-0.5">
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                                  <span>Menunggu Terbit MA RI</span>
                                </span>
                                <p className="text-[10px] text-outline">Siklus 2027 • Diterbitkan Pusat</p>
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleOpenPppkModal(pppk)}
                              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${hasSk
                                ? 'bg-surface-container text-primary hover:bg-primary hover:text-white border border-outline-variant'
                                : 'bg-primary text-white hover:bg-primary-container shadow-xs'
                                }`}
                              title="Catat atau perbarui nomor SK dari Mahkamah Agung RI"
                            >
                              <span className="material-symbols-outlined text-[15px]">
                                {hasSk ? 'edit_note' : 'add_task'}
                              </span>
                              <span>{hasSk ? 'Edit SK MA' : 'Catat SK MA'}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Note Penegasan Kontrol di Footer Tabel */}
            <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/40 flex items-center gap-2.5 text-xs text-outline">
              <span className="material-symbols-outlined text-secondary text-[18px]">info</span>
              <span>
                <strong>Catatan Pengelola:</strong> Surat KGB PPPK diterbitkan secara resmi oleh Mahkamah Agung RI. Jika satker telah menerima salinan/petikan SK dari Biro Kepegawaian MA RI, gunakan tombol <em>"Catat SK MA"</em> untuk mencatat nomor SK tersebut sebagai arsip kontrol kepegawaian PA Lumajang.
              </span>
            </div>
          </div>

          {/* Modal Catat Nomor SK Mahkamah Agung RI untuk PPPK */}
          {showPppkModal && selectedPppkForModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
              <div className="bg-surface-container-lowest rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-outline-variant relative my-6">
                <button
                  type="button"
                  onClick={() => setShowPppkModal(false)}
                  className="absolute top-4 right-4 p-1.5 rounded-full text-outline hover:text-primary hover:bg-surface-container transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>

                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-outline-variant/50">
                  <div className="w-11 h-11 rounded-2xl bg-amber-500 text-black flex items-center justify-center flex-shrink-0 font-bold shadow-xs">
                    <span className="material-symbols-outlined text-[24px]">verified</span>
                  </div>
                  <div>
                    <h3 className="font-display font-extrabold text-base text-primary">
                      Pencatatan SK KGB PPPK (Mahkamah Agung)
                    </h3>
                    <p className="text-xs text-outline">
                      Pembaruan data kontrol satker atas SK yang diterbitkan oleh MA RI
                    </p>
                  </div>
                </div>

                {/* Info PPPK */}
                <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/50 mb-4 text-xs space-y-1">
                  <p className="font-display font-bold text-primary text-sm">{selectedPppkForModal.nama}</p>
                  <p className="text-outline text-[11px]">NIP. {selectedPppkForModal.nip} • Golongan {selectedPppkForModal.golongan}</p>
                  <p className="text-[11px] text-on-surface-variant">{selectedPppkForModal.jabatan}</p>
                  <div className="pt-2 mt-2 border-t border-outline-variant/30 flex justify-between items-center text-[11px]">
                    <span className="text-outline">TMT KGB: <strong>{selectedPppkForModal.tmtKgbPertama}</strong></span>
                    <span className="text-emerald-700 font-bold">Gaji Baru: {formatRupiah(selectedPppkForModal.gajiPokokBaru)}</span>
                  </div>
                </div>

                <form onSubmit={handleSavePppkSk} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1">
                      Nomor Surat Keputusan (SK) Mahkamah Agung RI
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: 142/SEK/SK.KP2.1/I/2027"
                      value={pppkModalForm.noSkMa}
                      onChange={(e) => setPppkModalForm({ ...pppkModalForm, noSkMa: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-xs font-bold text-primary focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                    <p className="text-[10.5px] text-outline mt-1">
                      Nomor petikan SK resmi yang diterbitkan oleh Mahkamah Agung RI
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1">
                        Tanggal SK MA
                      </label>
                      <input
                        type="text"
                        placeholder="DD-MM-YYYY"
                        value={pppkModalForm.tanggalSkMa}
                        onChange={(e) => setPppkModalForm({ ...pppkModalForm, tanggalSkMa: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest text-xs font-medium text-primary focus:ring-2 focus:ring-primary focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1">
                        TMT Berlaku Baru
                      </label>
                      <input
                        type="text"
                        placeholder="DD-MM-YYYY"
                        value={pppkModalForm.tmtSkMa}
                        onChange={(e) => setPppkModalForm({ ...pppkModalForm, tmtSkMa: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest text-xs font-bold text-primary focus:ring-2 focus:ring-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1">
                      Tanggal Surat Diterima di PA Lumajang
                    </label>
                    <input
                      type="date"
                      value={pppkModalForm.tanggalDiterima}
                      onChange={(e) => setPppkModalForm({ ...pppkModalForm, tanggalDiterima: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest text-xs font-medium text-primary focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1">
                      Catatan / Keterangan Kontrol
                    </label>
                    <textarea
                      rows="2"
                      placeholder="Catatan verifikasi atau nomor agenda surat masuk MA..."
                      value={pppkModalForm.catatan}
                      onChange={(e) => setPppkModalForm({ ...pppkModalForm, catatan: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest text-xs text-primary focus:ring-2 focus:ring-primary focus:outline-none"
                    ></textarea>
                  </div>

                  <div className="pt-3 border-t border-outline-variant/40 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setShowPppkModal(false)}
                      className="px-4 py-2 rounded-xl border border-outline-variant text-xs font-semibold text-outline hover:bg-surface-container transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-container transition-all shadow-md flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">save</span>
                      <span>Simpan Data Kontrol SK MA</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL PRATINJAU DOKUMEN RESMI KGB PNS SESUAI SURAT EDARAN MAHKAMAH AGUNG  */}
      {/* ========================================================================= */}
      {showPreviewModal && activeDocForPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white text-black rounded-2xl max-w-4xl w-full p-8 sm:p-10 shadow-2xl relative my-8 print:p-0 print:m-0 print:shadow-none print:max-w-none">
            {/* Modal Controls (Hidden in Print) */}
            <div className="no-print sticky top-0 bg-white/95 backdrop-blur z-20 flex flex-col md:flex-row md:items-center justify-between pb-4 mb-6 border-b border-gray-200 gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-colors shadow-sm"
                  title="Kembali ke Halaman Layanan KGB"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  <span>Kembali</span>
                </button>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">verified</span>
                  <span>Format Resmi Standar Mahkamah Agung RI</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-container transition-all shadow-md hover:shadow-lg"
                >
                  <span className="material-symbols-outlined text-[18px] text-amber-300">print</span>
                  <span>Cetak Dokumen Resmi</span>
                </button>
              </div>
            </div>

            {/* AREA DOKUMEN CETAK RESMI (STANDAR FORM-KGB.DOCX) */}
            <div id="printable-kgb-doc" className="font-serif text-[12.5px] leading-relaxed text-black max-w-3xl mx-auto space-y-3">
              {/* Kop Surat Resmi PA Lumajang */}
              <OfficialKopSurat />

              {/* Tanggal & Tempat Terbit Surat di Sebelah Kanan Atas */}
              <div className="flex justify-end pt-1">
                <p className="text-xs">
                  Lumajang, {activeDocForPreview.tanggalSk || '14 November 2026'}
                </p>
              </div>

              {/* Blok Alamat Surat & Tujuan KPPN */}
              <div className="grid grid-cols-12 gap-2 text-xs pt-1">
                <div className="col-span-7 space-y-0.5">
                  <div className="flex">
                    <span className="w-16">Nomor</span>
                    <span className="w-3">:</span>
                    <span className="font-bold font-sans text-xs">{activeDocForPreview.nomorSk}</span>
                  </div>
                  <div className="flex">
                    <span className="w-16">Lampiran</span>
                    <span className="w-3">:</span>
                    <span>1 (satu) Berkas</span>
                  </div>
                  <div className="flex">
                    <span className="w-16">Perihal</span>
                    <span className="w-3">:</span>
                    <span className="font-bold underline">Kenaikan Gaji Berkala</span>
                  </div>
                </div>

                <div className="col-span-5 text-left text-xs pl-4 space-y-0.5">
                  <p>Kepada Yth.</p>
                  <p className="font-bold">Kepala Kantor Pelayanan Perbendaharaan</p>
                  <p className="font-bold">Negara (KPPN) Bondowoso</p>
                  <p>di -</p>
                  <p className="pl-4 font-semibold">BONDOWOSO</p>
                </div>
              </div>

              {/* Paragraf Pembuka Surat */}
              <p className="text-justify pt-2">
                Dengan ini diberitahukan bahwa berhubung dengan telah dipenuhinya masa kerja dan syarat-syarat lainnya kepada:
              </p>

              {/* Data Pegawai Penerima KGB (Poin 1 s/d 6) */}
              <div className="pl-2">
                <table className="w-full text-[12px]">
                  <tbody>
                    <tr>
                      <td className="w-6 align-top">1.</td>
                      <td className="w-48 align-top">Nama</td>
                      <td className="w-3 align-top">:</td>
                      <td className="align-top font-bold text-sm tracking-wide">{activeDocForPreview.nama}</td>
                    </tr>
                    <tr>
                      <td className="align-top">2.</td>
                      <td className="align-top">N I P</td>
                      <td className="align-top">:</td>
                      <td className="align-top font-mono font-semibold">{activeDocForPreview.nip}</td>
                    </tr>
                    <tr>
                      <td className="align-top">3.</td>
                      <td className="align-top">Pangkat / Golongan ruang</td>
                      <td className="align-top">:</td>
                      <td className="align-top font-semibold">{activeDocForPreview.pangkatGolongan}</td>
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
                      <td className="align-top">Gaji pokok lama</td>
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
                        {activeDocForPreview.skLamaNomor || `W13-A8/289/KP.04.1/X/2024`} / {activeDocForPreview.skLamaTanggal || '25 Oktober 2024'}
                      </td>
                    </tr>
                    <tr>
                      <td className="align-top">c.</td>
                      <td className="align-top">Tanggal mulai berlakunya</td>
                      <td className="align-top">:</td>
                      <td className="align-top">{activeDocForPreview.skLamaTmt || '01 Maret 2025'}</td>
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

              {/* Tanda Tangan Ketua PA Lumajang */}
              <div className="pt-4 flex justify-end">
                <div className="text-left w-64 text-xs">
                  <p className="font-bold">Ketua Pengadilan Agama Lumajang,</p>
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
