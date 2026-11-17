import React, { useState, useEffect } from 'react';
import OfficialKopSurat from '../components/OfficialKopSurat';
import { terbilang, formatRupiah, formatTanggalIndo } from '../utils/formatters';
import { getNextNomorSkKgb, registerSuratKeluarToKlikSurat } from '../services/kliksuratService';

/**
 * Helper untuk menentukan apakah seorang pegawai adalah PPPK atau PNS
 */
export const isPppkPegawai = (p) => {
  if (!p) return false;
  return (
    p.statusKepegawaian === 'PPPK' ||
    p.golongan === 'V' ||
    p.golongan === 'IX' ||
    (typeof p.nip === 'string' && (p.nip.includes('202521') || p.nip.includes('202421')))
  );
};

export default function LayananKgbView({
  pegawaiList,
  selectedPegawaiFromProps,
  riwayatKgbList,
  onSaveKgb,
  onNavigate
}) {
  // 1. Aparatur PNS (23 orang resmi tercatat di tabel master_kgb Database KlikCuti)
  const pnsList = (pegawaiList || [])
    .filter(p => !isPppkPegawai(p))
    .map(p => ({ ...p, isPppk: false }));

  // 2. Aparatur PPPK (12 orang resmi PA Lumajang)
  const rawPppkList = (pegawaiList || []).filter(p => isPppkPegawai(p));

  // Local storage untuk pencatatan nomor SK Mahkamah Agung untuk PPPK
  const [pppkSkRecords, setPppkSkRecords] = useState(() => {
    try {
      const saved = localStorage.getItem('klikapeg_pppk_sk_records');
      if (saved) return JSON.parse(saved);
    } catch (e) { }
    return {};
  });

  // Mapped List PPPK dengan data kontrol berkala DARI DATABASE KLIKCUTI MASTER_KGB
  const pppkList = rawPppkList.map(p => {
    const isGol9 = p.golongan === 'IX';
    // Gunakan data riil langsung dari database master_kgb KlikCuti
    const tmtKgbTerakhir = p.tmtKgbTerakhir || (isGol9 ? '01-09-2025' : '01-09-2024');
    const tmtKgbBerikutnya = p.tmtKgbBerikutnya || (isGol9 ? '01-09-2027' : '01-09-2026');
    const noSkTerakhir = p.noSkTerakhir || 'SK-PPPK/W13-A8/VI/2025';
    const keteranganKgb = p.keteranganKgb || 'KGB PPPK 2 Tahun Sekali (PermenPAN-RB No. 7/2023)';
    const gajiLama = p.gajiPokokLama || (isGol9 ? 3203600 : 2511500);
    const gajiBaru = p.gajiPokokBaru || (isGol9 ? 3304500 : 2590600);
    const skRecord = pppkSkRecords[p.nip];

    return {
      ...p,
      isPppk: true,
      tmtKgbTerakhir,
      tmtKgbBerikutnya,
      noSkTerakhir,
      keteranganKgb,
      gajiPokokLama: gajiLama,
      gajiPokokBaru: gajiBaru,
      mkgTahun: p.mkgTahun ?? (tmtKgbTerakhir.includes('2024') ? 2 : 0),
      mkgBaru: (p.mkgTahun ?? (tmtKgbTerakhir.includes('2024') ? 2 : 0)) + 2,
      noSkMa: skRecord?.noSkMa || '',
      tanggalSkMa: skRecord?.tanggalSkMa || '',
      tmtSkMa: skRecord?.tmtSkMa || tmtKgbBerikutnya,
      tanggalDiterima: skRecord?.tanggalDiterima || '',
      catatanMa: skRecord?.catatan || '',
      statusKontrol: skRecord?.noSkMa ? 'SK MA Diterima' : 'Menunggu Terbit MA RI'
    };
  });

  // ==========================================
  // STATE DAFTAR & SELEKSI PEGAWAI
  // ==========================================
  // 'PNS' | 'PPPK' -> memisahkan daftar kontrol KGB
  const [activeDaftarTab, setActiveDaftarTab] = useState(() => {
    if (selectedPegawaiFromProps && isPppkPegawai(selectedPegawaiFromProps)) {
      return 'PPPK';
    }
    return 'PNS';
  });

  // Pegawai yang sedang aktif dipilih di kolom kiri
  const [selectedPegawai, setSelectedPegawai] = useState(() => {
    if (selectedPegawaiFromProps) {
      if (isPppkPegawai(selectedPegawaiFromProps)) {
        return pppkList.find(p => p.nip === selectedPegawaiFromProps.nip) || selectedPegawaiFromProps;
      }
      return pnsList.find(p => p.nip === selectedPegawaiFromProps.nip) || selectedPegawaiFromProps;
    }
    return pnsList[0] || null;
  });

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPnsYear, setFilterPnsYear] = useState('ALL'); // 'ALL' | '2027' | '2028' | 'JATUH_TEMPO'
  const [filterPppkGolongan, setFilterPppkGolongan] = useState('ALL'); // 'ALL' | 'IX' | 'V'
  const [filterPppkStatus, setFilterPppkStatus] = useState('ALL'); // 'ALL' | 'MENUNGGU' | 'SUDAH_SK'

  // Tab Arsip di bagian bawah
  const [arsipTab, setArsipTab] = useState('PNS'); // 'PNS' | 'PPPK'

  // ==========================================
  // FORM STATE KHUSUS PNS (Diterbitkan PA Lumajang)
  // ==========================================
  const [nomorSk, setNomorSk] = useState('453/KPA.W13-A8/KP2.1/XI/2026');
  const [tanggalSk, setTanggalSk] = useState('16-11-2026');
  const [tmtBaru, setTmtBaru] = useState('01-11-2026');
  const [mkgTahun, setMkgTahun] = useState(20);
  const [gajiLama, setGajiLama] = useState(3824500);
  const [gajiBaru, setGajiBaru] = useState(3945300);
  const [penandatangan, setPenandatangan] = useState('FATKUR ROSYAD (Ketua Pengadilan Agama Lumajang)');

  // Modal & Toast State
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [activeDocForPreview, setActiveDocForPreview] = useState(null);
  const [successToast, setSuccessToast] = useState('');
  const [isSyncingKlikSurat, setIsSyncingKlikSurat] = useState(false);

  // Modal Catat SK Mahkamah Agung untuk PPPK
  const [showPppkModal, setShowPppkModal] = useState(false);
  const [selectedPppkForModal, setSelectedPppkForModal] = useState(null);
  const [pppkModalForm, setPppkModalForm] = useState({
    noSkMa: '',
    tanggalSkMa: '',
    tmtSkMa: '01-02-2027',
    tanggalDiterima: '',
    catatan: ''
  });

  // Sinkronisasi pilihan pegawai dari props luar (misal dari Data Pegawai atau Dashboard)
  useEffect(() => {
    if (selectedPegawaiFromProps) {
      if (isPppkPegawai(selectedPegawaiFromProps)) {
        setActiveDaftarTab('PPPK');
        const found = pppkList.find(p => p.nip === selectedPegawaiFromProps.nip) || selectedPegawaiFromProps;
        setSelectedPegawai(found);
      } else {
        setActiveDaftarTab('PNS');
        const found = pnsList.find(p => p.nip === selectedPegawaiFromProps.nip) || selectedPegawaiFromProps;
        handleSelectPegawai(found);
      }
    }
  }, [selectedPegawaiFromProps]);

  // Sinkronisasi selectedPegawai saat pegawaiList diperbarui dari Database KlikCuti
  useEffect(() => {
    if (pegawaiList && pegawaiList.length > 0) {
      if (selectedPegawai) {
        const updated = pegawaiList.find(p => p.nip === selectedPegawai.nip);
        if (updated) {
          setSelectedPegawai(updated);
          if (!isPppkPegawai(updated)) {
            setGajiLama(updated.gajiPokokLama || 3824500);
            setGajiBaru(updated.gajiPokokBaru || 3945300);
            setMkgTahun((updated.mkgTahun || 18) + 2);
            setTmtBaru(updated.tmtKgbBerikutnya || '01-11-2026');
          }
        }
      } else {
        const firstPns = pnsList[0];
        if (firstPns) handleSelectPegawai(firstPns);
      }
    }
  }, [pegawaiList]);

  // Ambil nomor register surat KGB berikutnya dari KlikSurat
  useEffect(() => {
    getNextNomorSkKgb().then(res => {
      if (res && res.nomorSk) {
        setNomorSk(res.nomorSk);
        setTanggalSk(res.tanggalSk);
      }
    }).catch(() => { });
  }, []);

  // Handler saat memilih pegawai di daftar
  const handleSelectPegawai = (p) => {
    if (!p) return;
    setSelectedPegawai(p);

    // Jika pegawai yang diklik adalah PNS -> isi data form pembaharuan KGB
    if (!isPppkPegawai(p)) {
      setGajiLama(p.gajiPokokLama || 3824500);
      setGajiBaru(p.gajiPokokBaru || 3945300);
      setMkgTahun((p.mkgTahun || 18) + 2);
      setTmtBaru(p.tmtKgbBerikutnya || '01-11-2026');
    }
  };

  // Handler sinkronisasi nomor KlikSurat
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
      setSuccessToast('Gagal terhubung ke KlikSurat, menggunakan nomor lokal.');
      setTimeout(() => setSuccessToast(''), 3500);
    }
  };

  // Handler Terbitkan & Cetak SK KGB PNS oleh PA Lumajang
  const handleProsesDanTerbitkan = (e) => {
    e.preventDefault();
    if (!selectedPegawai || isPppkPegawai(selectedPegawai)) return;

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
      skLamaNomor: selectedPegawai.noSkTerakhir || 'W13-A8/289/KP.04.1/X/2024',
      skLamaTanggal: '25 Oktober 2024',
      skLamaTmt: selectedPegawai.tmtKgbTerakhir || '01 Maret 2025',
      tanggalSk,
      penandatangan
    };

    onSaveKgb(newKgb);
    setActiveDocForPreview(newKgb);
    setShowPreviewModal(true);

    registerSuratKeluarToKlikSurat({
      id: newKgb.id,
      nomorSurat: newKgb.nomorSk,
      perihal: `Pemberitahuan Kenaikan Gaji Berkala an. ${selectedPegawai.nama}`,
      tujuanSurat: 'KPPN Jember',
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

  // PPPK Modal Handlers
  const handleOpenPppkModal = (pppkItem) => {
    setSelectedPppkForModal(pppkItem);
    const existing = pppkSkRecords[pppkItem.nip];
    setPppkModalForm({
      noSkMa: existing?.noSkMa || '',
      tanggalSkMa: existing?.tanggalSkMa || '',
      tmtSkMa: existing?.tmtSkMa || pppkItem.tmtKgbPertama || '01-02-2027',
      tanggalDiterima: existing?.tanggalDiterima || new Date().toISOString().split('T')[0],
      catatan: existing?.catatan || ''
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

    // Update state selectedPegawai jika sama
    if (selectedPegawai?.nip === selectedPppkForModal.nip) {
      setSelectedPegawai({
        ...selectedPegawai,
        noSkMa: pppkModalForm.noSkMa,
        tanggalSkMa: pppkModalForm.tanggalSkMa,
        tmtSkMa: pppkModalForm.tmtSkMa,
        tanggalDiterima: pppkModalForm.tanggalDiterima,
        catatanMa: pppkModalForm.catatan,
        statusKontrol: pppkModalForm.noSkMa ? 'SK MA Diterima' : 'Menunggu Terbit MA RI'
      });
    }

    setShowPppkModal(false);
    setSuccessToast(`Data kontrol nomor SK Mahkamah Agung untuk ${selectedPppkForModal.nama} berhasil disimpan.`);
    setTimeout(() => setSuccessToast(''), 4500);
  };

  // ==========================================
  // FILTERING DAFTAR
  // ==========================================
  // Filter PNS List
  const filteredPnsList = pnsList.filter(p => {
    const matchSearch =
      (p.nama || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.nip || '').includes(searchQuery);

    if (filterPnsYear === 'ALL') return matchSearch;
    if (filterPnsYear === '2027') return matchSearch && (p.tmtKgbBerikutnya || '').includes('2027');
    if (filterPnsYear === '2028') return matchSearch && (p.tmtKgbBerikutnya || '').includes('2028');
    if (filterPnsYear === 'JATUH_TEMPO') return matchSearch && p.statusKgb === 'Jatuh Tempo';
    return matchSearch;
  });

  // Filter PPPK List
  const filteredPppkList = pppkList.filter(p => {
    const matchSearch =
      (p.nama || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.nip || '').includes(searchQuery) ||
      (p.jabatan || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchGol = filterPppkGolongan === 'ALL' ? true : p.golongan === filterPppkGolongan;
    const matchStatus =
      filterPppkStatus === 'ALL'
        ? true
        : filterPppkStatus === 'SUDAH_SK'
          ? !!p.noSkMa
          : !p.noSkMa;

    return matchSearch && matchGol && matchStatus;
  });

  // Identifikasi status aktif pegawai terpilih
  const isSelectedPppk = isPppkPegawai(selectedPegawai);

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
            Pemisahan kewenangan resmi: Penerbitan SK KGB PNS oleh PA Lumajang & Kontrol Monitoring KGB PPPK Mahkamah Agung RI.
          </p>
        </div>
      </div>

      {successToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 shadow-sm animate-fadeIn">
          <span className="material-symbols-outlined text-emerald-600">check_circle</span>
          <span>{successToast}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MAIN TWO-COLUMN WORKFLOW:                                                 */}
      {/* KOLOM KIRI : TABEL KONTROL JADWAL KGB (DIPISAHKAN PNS & PPPK)            */}
      {/* KOLOM KANAN: JIKA PNS -> DATA PEMBAHARUAN & SK KGB                       */}
      {/*              JIKA PPPK -> PENJELASAN KEWENANGAN MA & MONITORING          */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ======================================================================= */}
        {/* KOLOM KIRI (lg:col-span-5): DAFTAR KONTROL JADWAL KGB                   */}
        {/* ======================================================================= */}
        <div className="lg:col-span-5 bg-surface-container-lowest rounded-3xl border border-outline-variant/60 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-base text-primary">
                Tabel Kontrol Jadwal KGB
              </h2>
              <p className="text-[11px] text-outline mt-0.5">
                {activeDaftarTab === 'PNS'
                  ? 'Pilih pegawai PNS untuk menerbitkan SK KGB Satker'
                  : 'Pilih pegawai PPPK untuk monitoring jadwal MA'}
              </p>
            </div>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs ${activeDaftarTab === 'PNS'
              ? 'text-sky-900 bg-sky-100 border-sky-300'
              : 'text-amber-900 bg-amber-100 border-amber-300'
              }`}>
              {activeDaftarTab === 'PNS' ? `${pnsList.length} PNS` : `${pppkList.length} PPPK`}
            </span>
          </div>

          {/* TAB PEMISAH DAFTAR KGB: PNS vs PPPK */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-surface-container rounded-2xl border border-outline-variant/60">
            <button
              type="button"
              onClick={() => {
                setActiveDaftarTab('PNS');
                // Otomatis pilih PNS pertama jika sebelumnya memilih PPPK
                if (isSelectedPppk || !selectedPegawai) {
                  const firstPns = pnsList[0];
                  if (firstPns) handleSelectPegawai(firstPns);
                }
              }}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-bold text-xs transition-all ${activeDaftarTab === 'PNS'
                ? 'bg-[#1B2A4A] text-white shadow-md'
                : 'text-on-surface-variant hover:bg-surface-container-highest hover:text-primary'
                }`}
            >
              <span className="material-symbols-outlined text-[18px]">badge</span>
              <span>KGB PNS ({pnsList.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveDaftarTab('PPPK');
                // Otomatis pilih PPPK pertama jika sebelumnya memilih PNS
                if (!isSelectedPppk || !selectedPegawai) {
                  const firstPppk = pppkList[0];
                  if (firstPppk) handleSelectPegawai(firstPppk);
                }
              }}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-bold text-xs transition-all ${activeDaftarTab === 'PPPK'
                ? 'bg-[#1B2A4A] text-white shadow-md'
                : 'text-on-surface-variant hover:bg-surface-container-highest hover:text-primary'
                }`}
            >
              <span className="material-symbols-outlined text-[18px]">policy</span>
              <span>KGB PPPK ({pppkList.length})</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-outline">search</span>
            <input
              type="text"
              placeholder={activeDaftarTab === 'PNS' ? 'Cari nama atau NIP PNS...' : 'Cari nama atau NIP PPPK...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-outline-variant bg-surface-container-low text-xs text-primary focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          {/* Filter Pills Khusus PNS */}
          {activeDaftarTab === 'PNS' && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
              <button
                type="button"
                onClick={() => setFilterPnsYear('ALL')}
                className={`px-3 py-1 rounded-lg font-bold transition-colors whitespace-nowrap ${filterPnsYear === 'ALL'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-surface-container-low text-outline hover:text-primary'
                  }`}
              >
                Semua ({pnsList.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterPnsYear('2027')}
                className={`px-3 py-1 rounded-lg font-bold transition-colors whitespace-nowrap ${filterPnsYear === '2027'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-surface-container-low text-outline hover:text-primary'
                  }`}
              >
                Tahun 2027 ({pnsList.filter(p => (p.tmtKgbBerikutnya || '').includes('2027')).length})
              </button>
              <button
                type="button"
                onClick={() => setFilterPnsYear('2028')}
                className={`px-3 py-1 rounded-lg font-bold transition-colors whitespace-nowrap ${filterPnsYear === '2028'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-surface-container-low text-outline hover:text-primary'
                  }`}
              >
                Tahun 2028 ({pnsList.filter(p => (p.tmtKgbBerikutnya || '').includes('2028')).length})
              </button>
              <button
                type="button"
                onClick={() => setFilterPnsYear('JATUH_TEMPO')}
                className={`px-3 py-1 rounded-lg font-bold transition-colors whitespace-nowrap ${filterPnsYear === 'JATUH_TEMPO'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-surface-container-low text-red-700 hover:text-red-900'
                  }`}
              >
                Jatuh Tempo ({pnsList.filter(p => p.statusKgb === 'Jatuh Tempo').length})
              </button>
            </div>
          )}

          {/* Filter Pills Khusus PPPK */}
          {activeDaftarTab === 'PPPK' && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
              <button
                type="button"
                onClick={() => setFilterPppkGolongan('ALL')}
                className={`px-3 py-1 rounded-lg font-bold transition-colors whitespace-nowrap ${filterPppkGolongan === 'ALL'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-surface-container-low text-outline hover:text-primary'
                  }`}
              >
                Semua ({pppkList.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterPppkGolongan('IX')}
                className={`px-3 py-1 rounded-lg font-bold transition-colors whitespace-nowrap ${filterPppkGolongan === 'IX'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-surface-container-low text-outline hover:text-primary'
                  }`}
              >
                Golongan IX (7)
              </button>
              <button
                type="button"
                onClick={() => setFilterPppkGolongan('V')}
                className={`px-3 py-1 rounded-lg font-bold transition-colors whitespace-nowrap ${filterPppkGolongan === 'V'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-surface-container-low text-outline hover:text-primary'
                  }`}
              >
                Golongan V (5)
              </button>
            </div>
          )}

          {/* DAFTAR PEGAWAI SCROLLABLE */}
          <div className="max-h-[580px] overflow-y-auto space-y-2.5 pr-1">
            {/* 1. TAMPILKAN DAFTAR PNS */}
            {activeDaftarTab === 'PNS' && (
              filteredPnsList.length === 0 ? (
                <div className="py-8 text-center text-outline text-xs">
                  Tidak ada data pegawai PNS yang sesuai pencarian.
                </div>
              ) : (
                filteredPnsList.map((pegawai) => {
                  const isSelected = selectedPegawai?.nip === pegawai.nip;
                  return (
                    <div
                      key={pegawai.id || pegawai.nip}
                      onClick={() => handleSelectPegawai(pegawai)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-xs ${isSelected
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm'
                        : 'border-outline-variant/60 bg-surface-container-lowest hover:border-primary/50 hover:bg-surface-container-low'
                        }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${isSelected ? 'bg-primary text-white' : 'bg-primary/10 text-primary'
                            }`}>
                            {pegawai.nama.split(' ').map(n => n[0]).slice(0, 2).join('')}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-primary truncate leading-snug">{pegawai.nama}</p>
                            <p className="text-[10.5px] text-outline font-mono truncate">
                              {pegawai.golongan} • NIP. {pegawai.nip}
                            </p>
                          </div>
                        </div>

                        {pegawai.statusKgb === 'Jatuh Tempo' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-800 border border-red-300 flex-shrink-0">
                            Jatuh Tempo
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-surface-container text-outline flex-shrink-0">
                            {pegawai.tmtKgbBerikutnya ? `Tahun ${pegawai.tmtKgbBerikutnya.split('-')[2] || '2027'}` : 'PNS'}
                          </span>
                        )}
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-outline-variant/30 flex items-center justify-between text-[11px]">
                        <div>
                          <span className="text-outline">TMT Berikutnya: </span>
                          <span className="font-bold text-primary font-mono">{pegawai.tmtKgbBerikutnya || '-'}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-emerald-700">{formatRupiah(pegawai.gajiPokokBaru)}</span>
                        </div>
                      </div>

                      <div className="mt-1 flex items-center justify-between text-[10px] text-outline">
                        <span className="truncate">SK: {pegawai.noSkTerakhir || 'W13-A8/...'}</span>
                        <span className="text-sky-700 font-semibold flex-shrink-0">Diterbitkan PA Lmj</span>
                      </div>
                    </div>
                  );
                })
              )
            )}

            {/* 2. TAMPILKAN DAFTAR PPPK */}
            {activeDaftarTab === 'PPPK' && (
              filteredPppkList.length === 0 ? (
                <div className="py-8 text-center text-outline text-xs">
                  Tidak ada data aparatur PPPK yang sesuai pencarian.
                </div>
              ) : (
                filteredPppkList.map((pppk) => {
                  const isSelected = selectedPegawai?.nip === pppk.nip;
                  return (
                    <div
                      key={pppk.id || pppk.nip}
                      onClick={() => handleSelectPegawai(pppk)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-xs ${isSelected
                        ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/30 shadow-sm'
                        : 'border-outline-variant/60 bg-surface-container-lowest hover:border-amber-500/50 hover:bg-surface-container-low'
                        }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={pppk.foto}
                            alt={pppk.nama}
                            className="w-9 h-9 rounded-xl object-cover ring-1 ring-outline-variant/60 flex-shrink-0"
                            onError={(e) => {
                              e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(pppk.nama) + '&background=D4A017&color=000';
                            }}
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-primary truncate leading-snug">{pppk.nama}</p>
                            <p className="text-[10.5px] text-outline font-mono truncate">
                              Gol. {pppk.golongan} (PPPK) • NIP. {pppk.nip}
                            </p>
                          </div>
                        </div>

                        {pppk.noSkMa ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex-shrink-0">
                            SK MA Ada
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-surface-container text-primary flex-shrink-0">
                            {pppk.tmtKgbBerikutnya ? `Tahun ${pppk.tmtKgbBerikutnya.split('-')[2] || '2026'}` : 'PPPK'}
                          </span>
                        )}
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-outline-variant/30 flex items-center justify-between text-[11px]">
                        <div>
                          <span className="text-outline">TMT Berikutnya: </span>
                          <span className="font-bold text-primary font-mono">{pppk.tmtKgbBerikutnya}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-emerald-700">{formatRupiah(pppk.gajiPokokBaru)}</span>
                        </div>
                      </div>

                      <div className="mt-1 flex items-center justify-between text-[10px] text-outline">
                        <span className="truncate">SK: {pppk.noSkTerakhir}</span>
                        <span className="text-amber-800 font-semibold flex-shrink-0">Kewenangan MA RI</span>
                      </div>
                    </div>
                  );
                })
              )
            )}
          </div>
        </div>

        {/* ======================================================================= */}
        {/* KOLOM KANAN (lg:col-span-7): KOLOM SEBELAHNYA                           */}
        {/* JIKA PEGAWAI PNS  -> MUNCUL DATA PEMBAHARUAN KGB & PENERBITAN SK PA LMJ */}
        {/* JIKA PEGAWAI PPPK -> TIDAK MUNCULKAN FORM, KARENA KEWENANGAN MA         */}
        {/* ======================================================================= */}
        <div className="lg:col-span-7 space-y-6">
          {/* ===================================================================== */}
          {/* KONDISI 1: PEGAWAI YANG DIKLIK ADALAH PNS                             */}
          {/* MUNCUL DATA PEMBAHARUAN KGB & PENERBITAN SK SATKER PA LUMAJANG        */}
          {/* ===================================================================== */}
          {!isSelectedPppk && selectedPegawai && (
            <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/60 shadow-sm p-6 space-y-5 animate-fadeIn">
              {/* Header Box Kolom PNS */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-outline-variant/50">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display font-extrabold text-lg text-primary">
                      Pembaruan Gaji Berkala & Penerbitan SK KGB
                    </h2>
                  </div>
                  <p className="text-xs text-outline mt-0.5">
                    Isian data pegawai terisi otomatis dan nominal gaji dihitung sesuai Peraturan Pemerintah terbaru.
                  </p>
                </div>
                <span className="self-start sm:self-center px-3 py-1 rounded-xl text-[11px] font-bold bg-amber-400 text-black shadow-xs flex-shrink-0 border border-amber-500/30">
                  Format SK Mahkamah Agung
                </span>
              </div>

              {/* Card Profil Pegawai PNS Terpilih */}
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 flex items-start gap-4 text-xs">
                <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-xs">
                  {selectedPegawai.nama.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary text-white">
                      {selectedPegawai.golongan}
                    </span>
                    <span className="text-outline text-[11px] font-semibold">{selectedPegawai.pangkat}</span>
                    <span className="text-[10px] font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded-md border border-sky-300">
                      Master Data KGB
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-base text-primary truncate">
                    {selectedPegawai.nama}
                  </h3>
                  <p className="text-outline text-[11px] font-mono">
                    NIP. {selectedPegawai.nip}
                  </p>
                  <p className="text-on-surface-variant text-[11.5px] font-medium">
                    {selectedPegawai.jabatan}
                  </p>
                  <p className="text-[10.5px] text-outline pt-1">
                    SK Terakhir: <strong>{selectedPegawai.noSkTerakhir || 'W13-A8/289/KP.04.1/X/2024'}</strong> (TMT: {selectedPegawai.tmtKgbTerakhir || '01-11-2024'})
                  </p>
                </div>
              </div>

              {/* Formulir Pembaruan & Penerbitan SK KGB Resmi PA Lumajang */}
              <form onSubmit={handleProsesDanTerbitkan} className="space-y-4 text-xs">
                {/* Penomoran KlikSurat */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-primary uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <span>NOMOR SURAT PEMBERITAHUAN KGB RESMI</span>
                      <span className="px-2 py-0.5 rounded-full text-[9.5px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Otomatis KlikSurat
                      </span>
                    </label>
                    <button
                      type="button"
                      disabled={isSyncingKlikSurat}
                      onClick={handleAmbilNomorKlikSurat}
                      className="text-primary hover:underline text-[11px] font-semibold flex items-center gap-1 disabled:opacity-50"
                    >
                      <span className={`material-symbols-outlined text-[14px] ${isSyncingKlikSurat ? 'animate-spin' : ''}`}>sync</span>
                      <span>Ambil Nomor dari KlikSurat</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={nomorSk}
                      onChange={(e) => setNomorSk(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low font-mono font-bold text-primary text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                    <span className="absolute right-3 top-2.5 text-[10.5px] font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded-md border border-sky-300">
                      KlikSurat API
                    </span>
                  </div>
                  <p className="text-[10.5px] text-outline mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px] text-emerald-600">check_circle</span>
                    <span>Nomor register surat otomatis terhubung dengan buku agenda digital KlikSurat PA Lumajang</span>
                  </p>
                </div>

                {/* Tanggal SK & TMT Baru */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-primary uppercase tracking-wider text-[11px] mb-1.5">
                      TANGGAL SURAT KGB
                      <span className="ml-1 text-[9px] text-sky-800 font-normal">• Server KlikSurat</span>
                    </label>
                    <input
                      type="text"
                      value={tanggalSk}
                      onChange={(e) => setTanggalSk(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low font-mono text-primary text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                    <p className="text-[10px] text-outline mt-1">Tanggal otomatis sinkron dengan waktu server KlikSurat</p>
                  </div>

                  <div>
                    <label className="block font-bold text-primary uppercase tracking-wider text-[11px] mb-1.5">
                      TERHITUNG MULAI TANGGAL (TMT BARU)
                    </label>
                    <input
                      type="text"
                      value={tmtBaru}
                      onChange={(e) => setTmtBaru(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low font-mono font-bold text-primary text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                  </div>
                </div>

                {/* Gaji Pokok Lama & Baru */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-primary uppercase tracking-wider text-[11px] mb-1.5">
                      GAJI POKOK LAMA
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-outline font-bold">Rp</span>
                      <input
                        type="number"
                        value={gajiLama}
                        onChange={(e) => setGajiLama(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low font-mono font-bold text-primary text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-primary uppercase tracking-wider text-[11px] mb-1.5">
                      GAJI POKOK BARU (PERHITUNGAN OTOMATIS)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-emerald-800 font-bold">Rp</span>
                      <input
                        type="number"
                        value={gajiBaru}
                        onChange={(e) => setGajiBaru(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50/50 font-mono font-bold text-emerald-900 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <p className="text-[10px] text-emerald-700 mt-1 font-semibold">
                      Terbilang: {terbilang(Number(gajiBaru))} Rupiah
                    </p>
                  </div>
                </div>

                {/* Masa Kerja Golongan (MKG) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-primary uppercase tracking-wider text-[11px] mb-1.5">
                      MASA KERJA GOLONGAN (MKG BARU)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={mkgTahun}
                        onChange={(e) => setMkgTahun(e.target.value)}
                        className="w-24 px-3 py-2 rounded-xl border border-outline-variant bg-surface-container-low font-bold text-primary text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                      />
                      <span className="text-outline font-semibold">Tahun 0 Bulan</span>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-primary uppercase tracking-wider text-[11px] mb-1.5">
                      TMT KGB BERIKUTNYA (+2 TAHUN)
                    </label>
                    <div className="px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low font-mono font-bold text-primary text-xs">
                      01-11-2028
                    </div>
                  </div>
                </div>

                {/* Pejabat Penandatangan */}
                <div>
                  <label className="block font-bold text-primary uppercase tracking-wider text-[11px] mb-1.5">
                    PEJABAT PENANDATANGAN SURAT KGB (PA LUMAJANG)
                  </label>
                  <select
                    value={penandatangan}
                    onChange={(e) => setPenandatangan(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low text-primary text-xs font-semibold focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="FATKUR ROSYAD (Ketua Pengadilan Agama Lumajang)">
                      Fatkur Rosyad, S.Ag., M.H., M.HES. (Ketua Pengadilan Agama Lumajang)
                    </option>
                    <option value="SAMSUL BAHRI (Wakil Ketua Pengadilan Agama Lumajang)">
                      Samsul Bahri, S.H.I., M.H. (Wakil Ketua Pengadilan Agama Lumajang - Plh.)
                    </option>
                  </select>
                </div>

                {/* Tombol Aksi Penerbitan PNS */}
                <div className="pt-3 border-t border-outline-variant/40 flex flex-col sm:flex-row items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const tempKgb = {
                        id: 'PREVIEW-' + Date.now(),
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
                        skLamaNomor: selectedPegawai.noSkTerakhir || 'W13-A8/289/KP.04.1/X/2024',
                        skLamaTanggal: '25 Oktober 2024',
                        skLamaTmt: selectedPegawai.tmtKgbTerakhir || '01 Maret 2025',
                        tanggalSk,
                        penandatangan
                      };
                      setActiveDocForPreview(tempKgb);
                      setShowPreviewModal(true);
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-primary text-primary font-bold hover:bg-primary/5 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                    <span>Pratinjau Draft SK</span>
                  </button>

                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary-container transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px] text-amber-300">print</span>
                    <span>Terbitkan & Cetak SK KGB</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ===================================================================== */}
          {/* KONDISI 2: PEGAWAI YANG DIKLIK ADALAH PPPK                            */}
          {/* TIDAK MEMUNCULKAN DATA PEMBAHARUAN KGB KARENA KEWENANGAN MA           */}
          {/* ===================================================================== */}
          {isSelectedPppk && selectedPegawai && (
            <div className="bg-surface-container-lowest rounded-3xl border border-amber-500/40 shadow-sm p-6 space-y-6 animate-fadeIn">
              {/* Header Box Kolom PPPK */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-outline-variant/50">
                <div>
                  <h2 className="font-display font-extrabold text-lg text-primary flex items-center gap-2">
                    <span>Monitoring Kontrol KGB PPPK</span>
                  </h2>
                  <p className="text-xs text-outline mt-0.5">
                    Pengadilan Agama Lumajang TIDAK Menerbitkan Surat KGB untuk PPPK.
                  </p>
                </div>
                <span className="self-start sm:self-center px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#1B2A4A] text-white shadow-xs flex items-center gap-1.5 border border-amber-400/40">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                  <span>Kewenangan Mahkamah Agung RI</span>
                </span>
              </div>

              {/* BANNER TEGAS KEWENANGAN MAHKAMAH AGUNG (TIDAK MEMUNCULKAN PEMBAHARUAN) */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 text-xs space-y-2">
                <div className="flex items-center gap-2.5 text-amber-900 font-bold text-sm">
                  <span className="material-symbols-outlined text-amber-700 text-[24px]">gavel</span>
                  <span>Kewenangan Penerbitan Surat KGB Berada Pada Mahkamah Agung RI</span>
                </div>
                <div className="text-on-surface-variant leading-relaxed text-[11.5px] space-y-1.5">
                  <p>
                    Berdasarkan <strong>PermenPAN-RB No. 7 Tahun 2023</strong> dan Petunjuk Teknis Mahkamah Agung RI, Surat Keputusan Kenaikan Gaji Berkala (KGB) untuk Pegawai Pemerintah dengan Perjanjian Kerja (PPPK) dibuat dan diterbitkan langsung secara terpusat oleh <strong>Pejabat Pembina Kepegawaian (PPK) Mahkamah Agung RI</strong> di Jakarta.
                  </p>
                  <p className="font-semibold text-primary">
                    • Pengadilan Agama Lumajang TIDAK menerbitkan surat KGB untuk PPPK.<br />
                    • Kolom ini tidak memunculkan formulir pembaharuan gaji ataupun penomoran surat satker karena seluruh penetapan SK merupakan kewenangan mutlak Mahkamah Agung RI.<br />
                    • Satker PA Lumajang hanya bertindak untuk kontrol jadwal, pemantauan estimasi hak gaji baru, dan pencatatan nomor SK setelah surat resmi MA diterima.
                  </p>
                </div>
              </div>

              {/* Card Profil Aparatur PPPK Terpilih */}
              <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/60 flex items-start gap-4 text-xs">
                <img
                  src={selectedPegawai.foto}
                  alt={selectedPegawai.nama}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-amber-400/60 flex-shrink-0 shadow-xs"
                  onError={(e) => {
                    e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(selectedPegawai.nama) + '&background=D4A017&color=000';
                  }}
                />
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-md text-[10.5px] font-bold bg-[#1B2A4A] text-white">
                      Golongan {selectedPegawai.golongan} (PPPK)
                    </span>
                    <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300">
                      Aparatur PPPK PA Lumajang
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-base text-primary truncate">
                    {selectedPegawai.nama}
                  </h3>
                  <p className="text-outline text-[11px] font-mono">
                    NIP. {selectedPegawai.nip}
                  </p>
                  <p className="text-on-surface-variant text-[11.5px] font-medium">
                    {selectedPegawai.jabatan}
                  </p>
                  <div className="pt-2 mt-1 border-t border-outline-variant/30 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-outline">TMT KGB Terakhir: </span>
                      <strong className="text-primary font-mono">{selectedPegawai.tmtKgbTerakhir || '-'}</strong>
                    </div>
                    <div>
                      <span className="text-outline">TMT KGB Berikutnya: </span>
                      <strong className="text-amber-900 font-mono">{selectedPegawai.tmtKgbBerikutnya || '-'}</strong>
                    </div>
                  </div>
                  <div className="pt-1 text-[10.5px] text-outline">
                    <span>SK Terakhir: </span>
                    <strong className="font-mono text-primary">{selectedPegawai.noSkTerakhir || 'SK-PPPK/W13-A8/VI/2025'}</strong>
                    <span className="ml-2 font-medium text-amber-800">({selectedPegawai.keteranganKgb || 'KGB PPPK 2 Tahun Sekali'})</span>
                  </div>
                </div>
              </div>

              {/* Komparasi Estimasi Hak Gaji Baru Berdasarkan Perpres No. 11 Tahun 2024 */}
              <div className="space-y-2">
                <h4 className="font-display font-bold text-xs text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-amber-600">payments</span>
                  <span>Estimasi Hak Gaji Berkala (Perpres No. 11 Tahun 2024)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/50">
                    <p className="text-[10.5px] text-outline font-medium">Gaji Pokok Awal (MKG 0 Th)</p>
                    <p className="font-display font-extrabold text-sm text-gray-700 mt-1">
                      {formatRupiah(selectedPegawai.gajiPokokLama)}
                    </p>
                    <p className="text-[9.5px] text-outline mt-0.5">Sesuai SK Pengangkatan</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                    <p className="text-[10.5px] text-emerald-800 font-medium">Estimasi Gaji Baru (MKG 2 Th)</p>
                    <p className="font-display font-extrabold text-sm text-emerald-900 mt-1">
                      {formatRupiah(selectedPegawai.gajiPokokBaru)}
                    </p>
                    <p className="text-[9.5px] text-emerald-700 mt-0.5">Hak Siklus 01-02-2027</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200">
                    <p className="text-[10.5px] text-sky-800 font-medium">Estimasi Kenaikan Hak</p>
                    <p className="font-display font-extrabold text-sm text-sky-900 mt-1">
                      +{formatRupiah(selectedPegawai.gajiPokokBaru - selectedPegawai.gajiPokokLama)}
                    </p>
                    <p className="text-[9.5px] text-sky-700 mt-0.5">Sesuai Tabel Perpres 11/2024</p>
                  </div>
                </div>
                <p className="text-[10.5px] text-outline italic">
                  * Catatan: Penyesuaian hak gaji pada slip/payroll satker baru dapat diproses setelah SK asli atau petikan digital diterbitkan resmi oleh Mahkamah Agung RI.
                </p>
              </div>

              {/* Status Dokumen SK Mahkamah Agung */}
              <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/60 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-primary uppercase tracking-wider text-[11px]">
                    Status Dokumen SK Mahkamah Agung
                  </span>
                  {selectedPegawai.noSkMa ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      SK MA Diterima
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                      Menunggu Terbit MA RI
                    </span>
                  )}
                </div>

                {selectedPegawai.noSkMa ? (
                  <div className="space-y-1.5 p-3 rounded-xl bg-white border border-emerald-200">
                    <div className="flex justify-between">
                      <span className="text-outline">Nomor SK MA:</span>
                      <span className="font-mono font-bold text-primary">{selectedPegawai.noSkMa}</span>
                    </div>
                    {selectedPegawai.tanggalSkMa && (
                      <div className="flex justify-between">
                        <span className="text-outline">Tanggal SK MA:</span>
                        <span className="font-mono">{selectedPegawai.tanggalSkMa}</span>
                      </div>
                    )}
                    {selectedPegawai.tanggalDiterima && (
                      <div className="flex justify-between">
                        <span className="text-outline">Tanggal Diterima di PA Lmj:</span>
                        <span>{selectedPegawai.tanggalDiterima}</span>
                      </div>
                    )}
                    {selectedPegawai.catatanMa && (
                      <div className="pt-1 text-[11px] text-gray-600 border-t border-gray-100">
                        Catatan: {selectedPegawai.catatanMa}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/40 text-[11px] text-outline">
                    Belum ada nomor SK yang dicatat. SK KGB akan diterbitkan secara terpusat oleh Biro Kepegawaian Mahkamah Agung RI menjelang siklus berkala Februari 2027.
                  </div>
                )}

                {/* Tombol Catat Nomor SK MA untuk Arsip Satker */}
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => handleOpenPppkModal(selectedPegawai)}
                    className="px-4 py-2 rounded-xl bg-[#1B2A4A] text-white font-bold hover:bg-primary-container transition-all shadow-xs flex items-center gap-1.5 text-xs"
                  >
                    <span className="material-symbols-outlined text-[16px] text-amber-300">edit_document</span>
                    <span>{selectedPegawai.noSkMa ? 'Edit Catatan SK MA' : 'Catat Nomor SK Mahkamah Agung'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ARSIP DIGITAL SK KGB SATKER PA LUMAJANG & DAFTAR KONTROL PPPK            */}
      {/* ========================================================================= */}
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/60 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-display font-extrabold text-base text-primary">
              Arsip & Riwayat KGB Satuan Kerja PA Lumajang
            </h2>
            <p className="text-xs text-outline mt-0.5">
              Riwayat dokumen SK KGB PNS terbitan PA Lumajang dan monitoring kontrol KGB PPPK Mahkamah Agung
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-surface-container rounded-xl text-xs">
            <button
              type="button"
              onClick={() => setArsipTab('PNS')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${arsipTab === 'PNS' ? 'bg-[#1B2A4A] text-white shadow-xs' : 'text-outline hover:text-primary'
                }`}
            >
              Arsip SK KGB PNS ({riwayatKgbList.length})
            </button>
            <button
              type="button"
              onClick={() => setArsipTab('PPPK')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${arsipTab === 'PPPK' ? 'bg-[#1B2A4A] text-white shadow-xs' : 'text-outline hover:text-primary'
                }`}
            >
              Monitoring Kontrol PPPK ({pppkList.length})
            </button>
          </div>
        </div>

        {/* 1. ARSIP SK KGB PNS (TERBITAN PA LUMAJANG) */}
        {arsipTab === 'PNS' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-container text-primary font-display font-bold uppercase tracking-wider text-[11px] border-b border-outline-variant/60">
                <tr>
                  <th className="py-3 px-4">Nomor SK KGB</th>
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
                      Belum ada arsip SK KGB PNS yang diterbitkan. Silakan proses melalui formulir di atas.
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
        )}

        {/* 2. ARSIP MONITORING KONTROL PPPK (MAHKAMAH AGUNG RI) */}
        {arsipTab === 'PPPK' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-container text-primary font-display font-bold uppercase tracking-wider text-[11px] border-b border-outline-variant/60">
                <tr>
                  <th className="py-3 px-3 text-center">No</th>
                  <th className="py-3 px-4">Nama Pegawai & NIP</th>
                  <th className="py-3 px-4">Formasi & Golongan</th>
                  <th className="py-3 px-4">TMT Angkat</th>
                  <th className="py-3 px-4">TMT KGB I</th>
                  <th className="py-3 px-4">Estimasi Gaji Baru</th>
                  <th className="py-3 px-4">Status SK Mahkamah Agung</th>
                  <th className="py-3 px-4 text-center">Pencatatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40">
                {pppkList.map((pppk, idx) => (
                  <tr key={pppk.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="py-3 px-3 text-center text-outline font-semibold">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-primary">{pppk.nama}</p>
                      <p className="text-[10.5px] text-outline font-mono">NIP. {pppk.nip}</p>
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
                    <td className="py-3 px-4 font-mono font-bold text-primary">
                      {pppk.tmtKgbPertama}
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-700">
                      {formatRupiah(pppk.gajiPokokBaru)}
                    </td>
                    <td className="py-3 px-4">
                      {pppk.noSkMa ? (
                        <div>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                            <span>SK MA Ada</span>
                          </span>
                          <p className="font-mono text-[10.5px] text-primary truncate font-bold mt-0.5">{pppk.noSkMa}</p>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                          <span>Menunggu Terbit MA RI</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleOpenPppkModal(pppk)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-surface-container-low text-primary hover:bg-[#1B2A4A] hover:text-white transition-colors"
                      >
                        <span className="material-symbols-outlined text-[15px]">edit_note</span>
                        <span>Catat SK</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL CATAT NOMOR SK MAHKAMAH AGUNG UNTUK PPPK                           */}
      {/* ========================================================================= */}
      {showPppkModal && selectedPppkForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-surface-container-lowest rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-outline-variant/60 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-outline-variant/40">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500 text-[24px]">verified</span>
                <div>
                  <h3 className="font-display font-extrabold text-base text-primary">
                    Pencatatan SK Mahkamah Agung
                  </h3>
                  <p className="text-[11px] text-outline">
                    Kontrol nomor SK KGB PPPK yang diterbitkan Mahkamah Agung RI
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPppkModal(false)}
                className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-outline transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Info PPPK Terpilih */}
            <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/50 mb-4 text-xs space-y-1">
              <p className="font-display font-bold text-primary text-sm">{selectedPppkForModal.nama}</p>
              <p className="text-outline text-[11px]">NIP. {selectedPppkForModal.nip} • Golongan {selectedPppkForModal.golongan} (PPPK)</p>
              <p className="text-[11px] text-on-surface-variant">{selectedPppkForModal.jabatan}</p>
              <div className="pt-2 mt-2 border-t border-outline-variant/30 flex justify-between items-center text-[11px]">
                <span className="text-outline">TMT KGB I: <strong>{selectedPppkForModal.tmtKgbPertama}</strong></span>
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

      {/* ========================================================================= */}
      {/* MODAL PRATINJAU DOKUMEN RESMI KGB PNS SESUAI SURAT EDARAN MAHKAMAH AGUNG  */}
      {/* ========================================================================= */}
      {showPreviewModal && activeDocForPreview && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm p-3 sm:p-6 flex justify-center items-start animate-fadeIn">
          <div className="bg-white text-black rounded-2xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl relative my-4 sm:my-6 print:p-0 print:m-0 print:shadow-none print:max-w-none">
            {/* Modal Controls (Hidden in Print) */}
            <div className="no-print sticky top-0 bg-white/95 backdrop-blur z-20 flex flex-wrap items-center justify-between pb-3.5 mb-5 border-b border-gray-200 gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                <span className="font-bold text-xs sm:text-sm text-gray-800">Pratinjau SK KGB PNS (Format Standar Mahkamah Agung RI)</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-container transition-all shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px] text-amber-300">print</span>
                  <span>Cetak Dokumen Resmi</span>
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

            {/* AREA DOKUMEN CETAK RESMI (STANDAR FORM-KGB.DOCX) */}
            <div
              id="printable-kgb-doc"
              className="font-bookman text-[12.5px] leading-relaxed text-black max-w-3xl mx-auto space-y-3"
              style={{ fontFamily: "'Bookman Old Style', 'Bookman', 'URW Bookman L', serif" }}
            >
              {/* Kop Surat Resmi PA Lumajang */}
              <OfficialKopSurat />

              {/* Blok Rujukan Nomor, Tanggal, & Alamat Tujuan KPPN */}
              <div className="pt-1 text-[12px]">
                <table className="w-full border-collapse" style={{ fontFamily: "'Bookman Old Style', 'Bookman', 'URW Bookman L', serif" }}>
                  <tbody>
                    {/* Baris 1: Nomor Surat sejajar dengan Tempat & Tanggal Surat */}
                    <tr>
                      <td className="w-16 align-top">Nomor</td>
                      <td className="w-3 align-top">:</td>
                      <td className="align-top font-bold w-[46%] pr-2">
                        {activeDocForPreview.nomorSk}
                      </td>
                      <td className="align-top text-left pl-6">
                        Lumajang, {activeDocForPreview.tanggalSk || '16 November 2026'}
                      </td>
                    </tr>

                    {/* Baris 2: Lampiran */}
                    <tr>
                      <td className="align-top">Lampiran</td>
                      <td className="align-top">:</td>
                      <td className="align-top pr-2">
                        1 (satu) Berkas
                      </td>
                      <td className="align-top pl-6"></td>
                    </tr>

                    {/* Baris 3: Perihal sejajar dengan Kepada Yth. */}
                    <tr>
                      <td className="align-top">Perihal</td>
                      <td className="align-top">:</td>
                      <td className="align-top font-bold underline pr-2">
                        Kenaikan Gaji Berkala
                      </td>
                      <td className="align-top text-left pl-6 leading-snug">
                        <p>Kepada Yth.</p>
                        <p className="font-bold">Kepala Kantor Pelayanan Perbendaharaan</p>
                        <p className="font-bold">Negara (KPPN) Jember</p>
                        <p>di -</p>
                        <p className="pl-4 font-semibold">JEMBER</p>
                      </td>
                    </tr>
                  </tbody>
                </table>
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
                      <td className="align-top font-mono font-bold">
                        {formatRupiah(activeDocForPreview.gajiLama)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Paragraf Dasar SK Lama */}
              <div className="pl-6 text-[12px] space-y-0.5 pt-1 text-justify">
                <p>atas dasar Surat Keputusan Terakhir tentang gaji / pangkat yang ditetapkan:</p>
                <div className="pl-3">
                  <table className="w-full text-[11.5px]">
                    <tbody>
                      <tr>
                        <td className="w-52 whitespace-nowrap align-top">a. Oleh Pejabat</td>
                        <td className="w-3 align-top">:</td>
                        <td className="align-top">Ketua Pengadilan Agama Lumajang</td>
                      </tr>
                      <tr>
                        <td className="align-top whitespace-nowrap">b. Tanggal / Nomor</td>
                        <td className="align-top">:</td>
                        <td className="align-top font-mono">{activeDocForPreview.skLamaTanggal} / {activeDocForPreview.skLamaNomor}</td>
                      </tr>
                      <tr>
                        <td className="align-top whitespace-nowrap">c. Tgl. berlakunya gaji</td>
                        <td className="align-top">:</td>
                        <td className="align-top font-mono">{activeDocForPreview.skLamaTmt}</td>
                      </tr>
                      <tr>
                        <td className="align-top whitespace-nowrap">d. Masa kerja golongan</td>
                        <td className="align-top">:</td>
                        <td className="align-top">{activeDocForPreview.mkgLamaTahun || 18} Tahun 0 Bulan</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Paragraf Ketetapan Gaji Baru (DIBERIKAN KENAIKAN GAJI BERKALA) */}
              <div className="pt-2 text-[12px] space-y-1">
                <p className="font-semibold underline">DIBERIKAN KENAIKAN GAJI BERKALA HINGGA MEMPEROLEH:</p>
                <div className="pl-2">
                  <table className="w-full text-[12px]">
                    <tbody>
                      <tr>
                        <td className="w-6 align-top">7.</td>
                        <td className="w-48 align-top font-bold">Gaji pokok baru</td>
                        <td className="w-3 align-top">:</td>
                        <td className="align-top font-bold font-mono text-sm text-primary">
                          {formatRupiah(activeDocForPreview.gajiBaru)}
                        </td>
                      </tr>
                      <tr>
                        <td className="align-top">8.</td>
                        <td className="align-top">Berdasarkan masa kerja</td>
                        <td className="align-top">:</td>
                        <td className="align-top font-semibold">{activeDocForPreview.mkgTahun} Tahun 0 Bulan</td>
                      </tr>
                      <tr>
                        <td className="align-top">9.</td>
                        <td className="align-top">Dalam golongan ruang</td>
                        <td className="align-top">:</td>
                        <td className="align-top font-semibold">{activeDocForPreview.pangkatGolongan}</td>
                      </tr>
                      <tr>
                        <td className="align-top">10.</td>
                        <td className="align-top font-bold">Terhitung mulai tanggal</td>
                        <td className="align-top">:</td>
                        <td className="align-top font-bold font-mono">{activeDocForPreview.tmtBaru}</td>
                      </tr>
                      <tr>
                        <td className="align-top">11.</td>
                        <td className="align-top font-bold">Kenaikan gaji berikutnya</td>
                        <td className="align-top">:</td>
                        <td className="align-top font-bold font-mono">{activeDocForPreview.tmtBerikutnya || '01 November 2028'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Paragraf Penutup Surat */}
              <p className="text-justify pt-1">
                Diharapkan agar sesuai dengan Peraturan Pemerintah RI Nomor 5 Tahun 2024 kepada pegawai tersebut dapat dibayarkan penghasilan berdasarkan gaji pokok yang baru.
              </p>

              {/* Blok Tanda Tangan Ketua PA Lumajang */}
              <div className="pt-4 flex justify-end">
                <div className="w-80 text-center space-y-1">
                  <p className="font-bold text-xs">Ketua Pengadilan Agama Lumajang,</p>
                  <div className="h-16 flex items-center justify-center">
                    <span className="text-[10px] text-gray-400 italic">[ Tanda Tangan & Cap Dinas Resmi ]</span>
                  </div>
                  <p className="font-bold text-xs underline uppercase tracking-wide">
                    {activeDocForPreview.penandatangan?.split('(')[0]?.trim() || 'FATKUR ROSYAD, S.Ag., M.H., M.HES.'}
                  </p>
                  <p className="text-[11px] font-mono">NIP. 197603031998031002</p>
                </div>
              </div>

              {/* Blok Tembusan Surat */}
              <div className="pt-2 text-[10.5px] border-t border-gray-300">
                <p className="font-bold">Tembusan disampaikan Kepada Yth.:</p>
                <ol className="list-decimal list-inside space-y-0.5 text-gray-800 pl-1">
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
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-container transition-all shadow-md hover:shadow-lg"
                >
                  <span className="material-symbols-outlined text-[18px] text-amber-300">print</span>
                  <span>Cetak Dokumen Resmi (Print / PDF)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
