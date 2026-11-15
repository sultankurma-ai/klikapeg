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
  const [kgbFilter, setKgbFilter] = useState('all'); // all | tempo | segera

  // Filter KGB due this/next month
  const kgbReminderList = pegawaiList.filter(p => {
    if (kgbFilter === 'tempo') return p.statusKgb === 'Jatuh Tempo';
    if (kgbFilter === 'segera') return p.statusKgb === 'Segera Diproses';
    return p.statusKgb === 'Jatuh Tempo' || p.statusKgb === 'Segera Diproses';
  });

  const totalJatuhTempo = pegawaiList.filter(p => p.statusKgb === 'Jatuh Tempo').length;
  const totalSegera = pegawaiList.filter(p => p.statusKgb === 'Segera Diproses').length;

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Top Welcome Banner */}
      <div className="bg-[#B5CC39] rounded-3xl p-6 sm:p-8 text-[#041534] shadow-lg border border-[#9EB82A]/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-cover bg-center opacity-10 pointer-events-none" style={{ backgroundImage: 'url(/assets/illustration.png)' }}></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#041534]/10 text-[#041534] border border-[#041534]/20 text-xs font-bold mb-2">
              <span className="w-2 h-2 rounded-full bg-[#041534] animate-pulse"></span>
              Sistem Aktif • PA Lumajang
            </div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight text-[#041534]">
              Selamat Datang di Beranda KlikApeg
            </h1>
            <p className="mt-1 text-sm text-[#041534]/85 font-medium max-w-2xl">
              Pantau jadwal Kenaikan Gaji Berkala (KGB) aparatur secara otomatis, buat Surat Tugas resmi, dan terbitkan lembar SPD tersinkronisasi.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onSync}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#D4A017] text-[#041534] hover:bg-[#c49212] transition-all shadow-sm border border-[#b5870d]/30"
            >
              <span className={`material-symbols-outlined text-[18px] text-[#041534] ${syncStatus === 'syncing' ? 'animate-spin' : ''}`}>sync</span>
              <span>{syncStatus === 'syncing' ? 'Menyinkronkan...' : 'Sinkronkan KlikCuti'}</span>
            </button>
            <button
              onClick={() => onNavigate('surat-tugas')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#041534] text-white hover:bg-[#1B2A4A] transition-all shadow-md"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
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

        {/* Card 2: KGB Bulan Ini */}
        <div
          onClick={() => onNavigate('kgb')}
          className="p-5 rounded-2xl bg-surface-container-lowest border border-secondary-container/60 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-2 h-full bg-secondary-container"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-secondary uppercase tracking-wider">Jadwal KGB Bulan Ini</span>
            <div className="w-10 h-10 rounded-xl bg-secondary-fixed/50 text-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[22px]">payments</span>
            </div>
          </div>
          <div className="mt-3">
            <span className="font-display font-extrabold text-3xl text-primary">{totalJatuhTempo}</span>
            <span className="text-xs text-error font-bold ml-2">Jatuh Tempo</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs text-amber-700 font-medium">
            <span className="material-symbols-outlined text-[16px]">notification_important</span>
            <span>+{totalSegera} pegawai bulan depan</span>
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
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-error-container text-on-error-container">
                  {totalJatuhTempo} Perlu Tindakan
                </span>
              </div>
              <p className="text-xs text-outline mt-0.5">
                Daftar otomatis pegawai Pengadilan Agama Lumajang yang memasuki siklus 2 tahunan
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="inline-flex items-center p-1 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs font-semibold self-start sm:self-auto">
              <button
                onClick={() => setKgbFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${kgbFilter === 'all' ? 'bg-primary text-on-primary shadow-sm' : 'text-outline hover:text-primary'
                  }`}
              >
                Semua ({totalJatuhTempo + totalSegera})
              </button>
              <button
                onClick={() => setKgbFilter('tempo')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${kgbFilter === 'tempo' ? 'bg-primary text-on-primary shadow-sm' : 'text-outline hover:text-primary'
                  }`}
              >
                Jatuh Tempo ({totalJatuhTempo})
              </button>
              <button
                onClick={() => setKgbFilter('segera')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${kgbFilter === 'segera' ? 'bg-primary text-on-primary shadow-sm' : 'text-outline hover:text-primary'
                  }`}
              >
                Bulan Depan ({totalSegera})
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
                const isTempo = pegawai.statusKgb === 'Jatuh Tempo';
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
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${isTempo
                              ? 'bg-error-container text-on-error-container border border-error/30'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}>
                            {pegawai.statusKgb}
                          </span>
                        </div>
                        <p className="text-xs text-outline">
                          NIP. {pegawai.nip} • <span className="font-semibold text-primary">{pegawai.golongan}</span> ({pegawai.pangkat})
                        </p>
                        <p className="text-xs text-on-surface-variant font-medium mt-0.5">
                          {pegawai.jabatan}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6 pt-2 md:pt-0 border-t md:border-t-0 border-outline-variant/40">
                      <div className="text-left md:text-right">
                        <p className="text-[11px] text-outline font-medium">TMT KGB Baru</p>
                        <p className="text-xs font-bold text-primary">{pegawai.tmtKgbBerikutnya}</p>
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
                    <span className="text-outline">{st.pegawaiList.length} Aparatur Ditugaskan</span>
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
                    {spd.pelaksana.nama}
                  </p>
                  <p className="text-[11px] text-outline truncate">
                    Tujuan: {spd.tempatTujuan}
                  </p>
                </div>
              ))}
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
          <div className="p-5 rounded-3xl bg-primary-container text-on-primary border border-secondary-container/30 shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-secondary-container">verified_user</span>
              <span className="font-display font-bold text-sm">Ketentuan KGB Mandiri</span>
            </div>
            <p className="text-xs text-primary-fixed-dim leading-relaxed">
              Berdasarkan PP No. 5 Tahun 2024 dan SE Mahkamah Agung RI, penerbitan SK KGB dilakukan tiap 2 tahun bagi pegawai yang telah memenuhi syarat nilai SKP minimal baik.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

