import React, { useState } from 'react';

export default function DashboardView({
  pegawaiList,
  suratTugasList,
  spdList,
  onNavigate,
  onSelectPegawaiForKgb,
  onSync,
  syncStatus
}) {
  const [kgbFilter, setKgbFilter] = useState('all'); // all | 2027 | 2028

  // Hanya ambil aparatur yang resmi tercatat di tabel master_kgb Database KlikCuti (23 data resmi)
  const masterKgbList = (pegawaiList || []).filter(p => p.hasMasterKgb);
  const totalMasterKgb = masterKgbList.length;
  const count2027 = masterKgbList.filter(p => (p.tmtKgbBerikutnya || '').includes('2027')).length;
  const count2028 = masterKgbList.filter(p => (p.tmtKgbBerikutnya || '').includes('2028')).length;

  const kgbReminderList = masterKgbList.filter(p => {
    if (kgbFilter === '2027') return (p.tmtKgbBerikutnya || '').includes('2027');
    if (kgbFilter === '2028') return (p.tmtKgbBerikutnya || '').includes('2028');
    return true;
  });

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-[#1B2A4A] via-[#203359] to-[#283E6B] rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-[#283E6B]/60 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-cover bg-center opacity-10 pointer-events-none" style={{ backgroundImage: 'url(/assets/illustration.png)' }}></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 border border-white/15 text-xs font-bold mb-2 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              Sistem Aktif • PA Lumajang
            </div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight text-white">
              Selamat Datang di Beranda KlikApeg
            </h1>
            <p className="mt-1 text-sm text-gray-200 font-normal max-w-2xl leading-relaxed">
              Pantau jadwal Kenaikan Gaji Berkala (KGB) aparatur secara otomatis, buat Surat Tugas resmi, dan terbitkan lembar SPD tersinkronisasi.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={onSync}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold bg-[#E1AD01] text-[#1B2A4A] hover:bg-[#cf9e00] transition-all shadow-md active:scale-95 border border-[#caa00e]"
            >
              <span className={`material-symbols-outlined text-[18px] text-[#1B2A4A] ${syncStatus === 'syncing' ? 'animate-spin' : ''}`}>sync</span>
              <span>{syncStatus === 'syncing' ? 'Menyinkronkan...' : 'Sinkronkan KlikCuti'}</span>
            </button>
            <button
              onClick={() => onNavigate('surat-tugas')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-[#1B2A4A] hover:bg-gray-100 transition-all shadow-md active:scale-95 border border-white/60"
            >
              <span className="material-symbols-outlined text-[18px] text-[#1B2A4A]">add_circle</span>
              <span>Buat Surat Tugas</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Pegawai */}
        <div
          onClick={() => onNavigate('pegawai')}
          className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-outline uppercase tracking-wider">Total Pegawai</span>
            <div className="w-10 h-10 rounded-xl bg-primary-fixed/40 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[22px]">group</span>
            </div>
          </div>
          <div className="mt-3">
            <span className="font-display font-extrabold text-3xl text-primary">{pegawaiList.length}</span>
            <span className="text-xs text-outline ml-1 font-medium">Aparatur</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            <span>100% Data KlikCuti Valid</span>
          </div>
        </div>

        {/* Card 2: Master Data KGB KlikCuti */}
        <div
          onClick={() => onNavigate('kgb')}
          className="p-5 rounded-2xl bg-surface-container-lowest border border-secondary-container/60 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-2 h-full bg-[#E1AD01]"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-outline uppercase tracking-wider">Master Data KGB</span>
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[22px]">payments</span>
            </div>
          </div>
          <div className="mt-3">
            <span className="font-display font-extrabold text-3xl text-primary">{totalMasterKgb}</span>
            <span className="text-xs text-sky-800 font-bold ml-2">Aparatur Terdata</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs text-emerald-700 font-semibold">
            <span className="material-symbols-outlined text-[16px]">verified</span>
            <span>{count2027} Terjadwal 2027 • {count2028} Terjadwal 2028</span>
          </div>
        </div>

        {/* Card 3: Surat Tugas */}
        <div
          onClick={() => onNavigate('surat-tugas')}
          className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-outline uppercase tracking-wider">Surat Tugas Aktif</span>
            <div className="w-10 h-10 rounded-xl bg-surface-container-high text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[22px]">assignment</span>
            </div>
          </div>
          <div className="mt-3">
            <span className="font-display font-extrabold text-3xl text-primary">{suratTugasList.length}</span>
            <span className="text-xs text-outline ml-1 font-medium">Surat Diterbitkan</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-primary font-medium">
            <span className="material-symbols-outlined text-[16px] text-secondary">verified</span>
            <span>Format Resmi PA Lumajang</span>
          </div>
        </div>

        {/* Card 4: SPD */}
        <div
          onClick={() => onNavigate('spd')}
          className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-outline uppercase tracking-wider">Lembar SPD Terbit</span>
            <div className="w-10 h-10 rounded-xl bg-surface-container-high text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[22px]">flight_takeoff</span>
            </div>
          </div>
          <div className="mt-3">
            <span className="font-display font-extrabold text-3xl text-primary">{spdList.length}</span>
            <span className="text-xs text-outline ml-1 font-medium">Lembar Dinas</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
            <span className="material-symbols-outlined text-[16px]">receipt_long</span>
            <span>Terintegrasi Surat Tugas</span>
          </div>
        </div>
      </div>

      {/* Main Grid: KGB Reminders + Quick Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Section (8 cols): Pengingat KGB Interaktif */}
        <div className="lg:col-span-8 bg-surface-container-lowest rounded-3xl border border-outline-variant/60 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-outline-variant/40">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-extrabold text-lg text-primary">
                  Pengingat Kenaikan Gaji Berkala (KGB)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-900 border border-sky-300">
                  {totalMasterKgb} Master Data KGB
                </span>
              </div>
              <p className="text-xs text-outline mt-0.5">
                Data resmi aparatur PA Lumajang tersinkronisasi dari menu Master Data KGB KlikCuti
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="inline-flex items-center p-1 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs font-semibold self-start sm:self-auto">
              <button
                onClick={() => setKgbFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${kgbFilter === 'all' ? 'bg-primary text-on-primary shadow-sm' : 'text-outline hover:text-primary'
                  }`}
              >
                Semua ({totalMasterKgb})
              </button>
              <button
                onClick={() => setKgbFilter('2027')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${kgbFilter === '2027' ? 'bg-primary text-on-primary shadow-sm' : 'text-outline hover:text-primary'
                  }`}
              >
                Tahun 2027 ({count2027})
              </button>
              <button
                onClick={() => setKgbFilter('2028')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${kgbFilter === '2028' ? 'bg-primary text-on-primary shadow-sm' : 'text-outline hover:text-primary'
                  }`}
              >
                Tahun 2028 ({count2028})
              </button>
            </div>
          </div>

          {/* List of Reminders */}
          <div className="mt-4 space-y-3">
            {kgbReminderList.length === 0 ? (
              <div className="p-8 text-center text-outline text-xs">
                Tidak ada jadwal KGB untuk filter yang dipilih.
              </div>
            ) : (
              kgbReminderList.map((pegawai) => {
                return (
                  <div
                    key={pegawai.id}
                    className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/40 hover:border-primary/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={pegawai.foto}
                        alt={pegawai.nama}
                        className="w-12 h-12 rounded-xl object-cover ring-2 ring-outline-variant/60 flex-shrink-0"
                        onError={(e) => {
                          e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(pegawai.nama) + '&background=1B2A4A&color=fff';
                        }}
                      />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-display font-bold text-sm text-primary">
                            {pegawai.nama}
                          </h3>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-300">
                            Tahun {pegawai.tmtKgbBerikutnya?.split('-')[2] || 'KGB'}
                          </span>
                        </div>
                        <p className="text-xs text-outline">
                          NIP. {pegawai.nip} • <span className="font-semibold text-primary">{pegawai.golongan}</span> ({pegawai.pangkat})
                        </p>
                        <p className="text-xs text-on-surface-variant font-medium mt-0.5">
                          {pegawai.jabatan}
                        </p>
                        {pegawai.noSkTerakhir && (
                          <p className="text-[10.5px] text-gray-500 font-mono mt-0.5">
                            SK Terakhir: {pegawai.noSkTerakhir}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6 pt-2 md:pt-0 border-t md:border-t-0 border-outline-variant/40">
                      <div className="text-left md:text-right">
                        <p className="text-[11px] text-outline font-medium">TMT KGB Berikutnya</p>
                        <p className="text-xs font-bold text-primary font-mono">{pegawai.tmtKgbBerikutnya}</p>
                        <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                          {formatRupiah(pegawai.gajiPokokBaru)}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          onSelectPegawaiForKgb(pegawai);
                          onNavigate('kgb');
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-primary hover:bg-primary-container text-on-primary transition-all shadow-sm flex-shrink-0"
                      >
                        <span className="material-symbols-outlined text-[16px] text-secondary-container">edit_note</span>
                        <span>Proses SK</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-outline-variant/40 flex justify-between items-center text-xs">
            <span className="text-outline">
              Menampilkan {kgbReminderList.length} dari {pegawaiList.length} aparatur
            </span>
            <button
              onClick={() => onNavigate('kgb')}
              className="font-bold text-primary hover:text-secondary flex items-center gap-1 transition-colors"
            >
              <span>Buka Menu Layanan KGB Lengkap</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Right Section (4 cols): Aktivitas Surat & Jalan Pintas */}
        <div className="lg:col-span-4 space-y-5">
          {/* Card Aktivitas Surat */}
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/60 shadow-sm p-6">
            <h2 className="font-display font-extrabold text-base text-primary">
              Aktivitas Surat Kedinasan
            </h2>
            <p className="text-xs text-outline mt-0.5">
              Dokumen resmi yang baru diterbitkan bulan ini
            </p>

            {/* Quick Log Items */}
            <div className="mt-4 space-y-3">
              {suratTugasList.length === 0 && spdList.length === 0 ? (
                <div className="py-6 text-center text-outline">
                  <span className="material-symbols-outlined text-2xl text-outline/50 mb-1 block">description</span>
                  <p className="text-xs font-semibold text-primary">Belum ada aktivitas surat dinas</p>
                  <p className="text-[11px] text-outline mt-0.5">Surat Tugas dan SPD yang diterbitkan akan tampil di sini</p>
                </div>
              ) : (
                <>
                  {suratTugasList.slice(0, 2).map((st) => (
                    <div key={st.id} className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/40 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-primary truncate max-w-[170px]">{st.nomorSurat}</span>
                        <span className="text-outline">{st.tanggalSurat}</span>
                      </div>
                      <p className="text-xs text-on-surface-variant font-medium line-clamp-2">
                        {st.maksudTugas}
                      </p>
                      <div className="flex items-center justify-between pt-1 text-[11px]">
                        <span className="text-outline">{st.pegawaiList?.length || 0} Aparatur Ditugaskan</span>
                        <span className="text-emerald-700 font-bold">{st.status}</span>
                      </div>
                    </div>
                  ))}

                  {spdList.slice(0, 1).map((spd) => (
                    <div key={spd.id} className="p-3 rounded-2xl bg-secondary-fixed/20 border border-secondary/20 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-secondary truncate max-w-[170px]">{spd.nomorSpd}</span>
                        <span className="text-outline">{spd.lamaHari} Hari</span>
                      </div>
                      <p className="text-xs text-primary font-medium line-clamp-1">
                        {spd.pelaksana?.nama || '-'}
                      </p>
                      <p className="text-[11px] text-outline truncate">
                        Tujuan: {spd.tempatTujuan}
                      </p>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Quick Action Buttons */}
            <div className="mt-5 pt-4 border-t border-outline-variant/40 grid grid-cols-2 gap-2">
              <button
                onClick={() => onNavigate('surat-tugas')}
                className="py-2.5 px-3 rounded-xl text-xs font-bold bg-primary text-on-primary hover:bg-primary-container transition-colors flex items-center justify-center gap-1 shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px] text-secondary-container">add</span>
                <span>Surat Tugas</span>
              </button>
              <button
                onClick={() => onNavigate('spd')}
                className="py-2.5 px-3 rounded-xl text-xs font-bold bg-secondary-container text-on-secondary-container hover:bg-secondary-fixed transition-colors flex items-center justify-center gap-1 shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>Lembar SPD</span>
              </button>
            </div>
          </div>

          {/* Card Info Kepegawaian */}
          <div className="p-5 rounded-3xl bg-primary-container text-on-primary border border-secondary-container/30 shadow-md space-y-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary-container">verified_user</span>
              <span className="font-display font-bold text-sm">Kewenangan KGB PA Lumajang</span>
            </div>
            <div className="text-[11px] text-primary-fixed-dim leading-relaxed space-y-1.5">
              <p>
                • <strong>KGB PNS (23 Orang):</strong> Surat KGB dibuat dan diterbitkan langsung oleh Ketua Pengadilan Agama Lumajang Kelas 1A (PP No. 5/2024).
              </p>
              <p>
                • <strong>KGB PPPK (12 Orang):</strong> Surat KGB diterbitkan terpusat oleh Mahkamah Agung RI. Satker PA Lumajang hanya bertugas memonitor dan kontrol jadwal (PermenPAN-RB 7/2023).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

