import React, { useState } from 'react';

export default function DataPegawaiView({
  pegawaiList,
  onSelectPegawaiForKgb,
  onNavigate,
  onSync,
  syncStatus
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGolongan, setSelectedGolongan] = useState('ALL');
  const [selectedUnit, setSelectedUnit] = useState('ALL');
  const [selectedPegawaiDetail, setSelectedPegawaiDetail] = useState(null);
  const [exportNotice, setExportNotice] = useState(false);

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const filteredPegawai = pegawaiList.filter((p) => {
    const matchSearch =
      p.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nip.includes(searchQuery) ||
      p.jabatan.toLowerCase().includes(searchQuery.toLowerCase());

    const matchGol =
      selectedGolongan === 'ALL'
        ? true
        : selectedGolongan === 'IV'
        ? p.golongan.startsWith('IV')
        : selectedGolongan === 'III'
        ? p.golongan.startsWith('III')
        : selectedGolongan === 'II'
        ? p.golongan.startsWith('II')
        : selectedGolongan === 'PPPK'
        ? p.statusKepegawaian === 'PPPK'
        : true;

    const matchUnit =
      selectedUnit === 'ALL' ? true : p.unitKerja.toLowerCase() === selectedUnit.toLowerCase();

    return matchSearch && matchGol && matchUnit;
  });

  const handleExport = () => {
    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-outline-variant/50">
        <div>
          <div className="flex items-center gap-2 text-xs text-outline mb-1">
            <span className="hover:text-primary cursor-pointer" onClick={() => onNavigate('dashboard')}>Beranda</span>
            <span>/</span>
            <span className="font-semibold text-primary">Data Pegawai</span>
          </div>
          <h1 className="font-display font-extrabold text-2xl text-primary">
            Data Induk Pegawai Terintegrasi
          </h1>
          <p className="text-xs text-on-surface-variant font-medium mt-0.5">
            Pangkalan data aparatur Pengadilan Agama Lumajang tersinkronisasi otomatis dari database KlikCuti.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onSync}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-surface-container-low text-primary border border-outline-variant hover:bg-surface-container transition-colors shadow-sm"
          >
            <span className={`material-symbols-outlined text-[18px] text-secondary ${syncStatus === 'syncing' ? 'animate-spin' : ''}`}>sync</span>
            <span>{syncStatus === 'syncing' ? 'Menyinkronkan...' : 'Sinkronkan Ulang'}</span>
          </button>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-primary text-on-primary hover:bg-primary-container transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px] text-secondary-container">download</span>
            <span>Ekspor Data</span>
          </button>
        </div>
      </div>

      {/* Sync Status Banner */}
      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-[20px]">cloud_done</span>
          </div>
          <div>
            <p className="font-bold text-emerald-950">
              Integrasi Database KlikCuti: Aktif & Tersinkronisasi Penuh
            </p>
            <p className="text-emerald-800 text-[11px]">
              Setiap pembaruan identitas, jabatan, atau pangkat di aplikasi KlikCuti otomatis terhubung tanpa input ulang.
            </p>
          </div>
        </div>
        <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full self-start sm:self-auto">
          Status: Real-Time Sync ({pegawaiList.length} Aparatur)
        </span>
      </div>

      {exportNotice && (
        <div className="p-3 rounded-xl bg-secondary-fixed/30 border border-secondary/40 text-secondary text-xs flex items-center gap-2 animate-fadeIn">
          <span className="material-symbols-outlined text-secondary">check_circle</span>
          <span>Data {pegawaiList.length} aparatur Pengadilan Agama Lumajang berhasil diekspor ke format spreadsheet/arsip!</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="sm:col-span-6 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan nama pegawai, NIP, atau jabatan..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-outline-variant text-xs font-medium bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          {/* Golongan Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedGolongan}
              onChange={(e) => setSelectedGolongan(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-outline-variant text-xs font-semibold bg-surface-container-lowest text-primary focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="ALL">Semua Golongan</option>
              <option value="IV">Golongan IV (Pembina)</option>
              <option value="III">Golongan III (Penata)</option>
              <option value="II">Golongan II (Pengatur)</option>
              <option value="PPPK">PPPK (Golongan IX)</option>
            </select>
          </div>

          {/* Unit Kerja Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-outline-variant text-xs font-semibold bg-surface-container-lowest text-primary focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="ALL">Semua Unit Kerja</option>
              <option value="Pimpinan">Pimpinan</option>
              <option value="Kepaniteraan">Kepaniteraan</option>
              <option value="Kesekretariatan">Kesekretariatan</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-container text-primary font-display font-bold uppercase tracking-wider text-[11px] border-b border-outline-variant/60">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">No</th>
                <th className="py-3.5 px-4">Pegawai</th>
                <th className="py-3.5 px-4">Pangkat / Gol</th>
                <th className="py-3.5 px-4">Jabatan & Unit</th>
                <th className="py-3.5 px-4">TMT KGB Terakhir</th>
                <th className="py-3.5 px-4">Gaji Pokok</th>
                <th className="py-3.5 px-4 text-center">Status KGB</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/40">
              {filteredPegawai.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-outline">
                    Tidak ditemukan data pegawai yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredPegawai.map((pegawai, index) => {
                  const isTempo = pegawai.statusKgb === 'Jatuh Tempo';
                  const isSegera = pegawai.statusKgb === 'Segera Diproses';

                  return (
                    <tr key={pegawai.id} className="hover:bg-surface-container-low/70 transition-colors">
                      <td className="py-3 px-4 text-center text-outline font-semibold">
                        {index + 1}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={pegawai.foto}
                            alt={pegawai.nama}
                            className="w-10 h-10 rounded-xl object-cover ring-1 ring-outline-variant flex-shrink-0"
                            onError={(e) => {
                              e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(pegawai.nama) + '&background=1B2A4A&color=fff';
                            }}
                          />
                          <div>
                            <p className="font-bold text-primary font-display text-[13px] leading-tight">
                              {pegawai.nama}
                            </p>
                            <p className="text-[11px] text-outline font-mono mt-0.5">
                              {pegawai.nip}
                            </p>
                            <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-surface-container text-outline">
                              {pegawai.statusKepegawaian}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-primary px-2 py-0.5 rounded bg-primary-fixed/30 text-xs">
                          {pegawai.golongan}
                        </span>
                        <p className="text-outline text-[11px] mt-1">{pegawai.pangkat}</p>
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-semibold text-primary leading-tight">{pegawai.jabatan}</p>
                        <p className="text-outline text-[11px] mt-0.5">{pegawai.unitKerja}</p>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-medium text-primary">{pegawai.tmtKgbTerakhir}</span>
                        <p className="text-[11px] text-outline">MKG: {pegawai.mkgTahun} Th 0 Bln</p>
                      </td>

                      <td className="py-3 px-4 font-semibold text-primary">
                        {formatRupiah(pegawai.gajiPokokLama)}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-block ${
                          isTempo
                            ? 'bg-error-container text-on-error-container border border-error/30'
                            : isSegera
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}>
                          {pegawai.statusKgb}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedPegawaiDetail(pegawai)}
                            title="Lihat Detail Profil"
                            className="p-1.5 rounded-lg text-primary hover:bg-surface-container transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </button>
                          <button
                            onClick={() => {
                              onSelectPegawaiForKgb(pegawai);
                              onNavigate('kgb');
                            }}
                            title="Proses Kenaikan Gaji Berkala"
                            className="p-1.5 rounded-lg text-secondary hover:bg-secondary-fixed/40 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">payments</span>
                          </button>
                          <button
                            onClick={() => onNavigate('surat-tugas')}
                            title="Buat Surat Tugas Pegawai"
                            className="p-1.5 rounded-lg text-primary hover:bg-primary-fixed/40 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">assignment</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="py-3 px-6 bg-surface-container-low border-t border-outline-variant/40 flex items-center justify-between text-xs text-outline">
          <span>Menampilkan {filteredPegawai.length} dari total {pegawaiList.length} aparatur PA Lumajang</span>
          <span>Sumber Data: Database KlikCuti PA Lumajang</span>
        </div>
      </div>

      {/* Modal Detail Pegawai */}
      {selectedPegawaiDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-surface-container-lowest rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-outline-variant relative">
            <button
              onClick={() => setSelectedPegawaiDetail(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-outline hover:text-primary hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            <div className="flex items-start gap-4 pb-4 border-b border-outline-variant/40">
              <img
                src={selectedPegawaiDetail.foto}
                alt={selectedPegawaiDetail.nama}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-primary/20 shadow-md flex-shrink-0"
                onError={(e) => {
                  e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(selectedPegawaiDetail.nama) + '&background=1B2A4A&color=fff';
                }}
              />
              <div>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary text-on-primary">
                  {selectedPegawaiDetail.statusKepegawaian}
                </span>
                <h3 className="font-display font-extrabold text-base text-primary mt-1">
                  {selectedPegawaiDetail.nama}
                </h3>
                <p className="text-xs text-outline font-mono">NIP. {selectedPegawaiDetail.nip}</p>
                <p className="text-xs font-semibold text-secondary mt-0.5">{selectedPegawaiDetail.jabatan}</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-surface-container-low">
                <span className="text-outline text-[11px] block">Pangkat / Golongan:</span>
                <span className="font-bold text-primary">{selectedPegawaiDetail.pangkat} ({selectedPegawaiDetail.golongan})</span>
              </div>
              <div className="p-3 rounded-xl bg-surface-container-low">
                <span className="text-outline text-[11px] block">Unit Organisasi:</span>
                <span className="font-bold text-primary">{selectedPegawaiDetail.unitKerja}</span>
              </div>
              <div className="p-3 rounded-xl bg-surface-container-low">
                <span className="text-outline text-[11px] block">TMT KGB Terakhir:</span>
                <span className="font-bold text-primary">{selectedPegawaiDetail.tmtKgbTerakhir}</span>
              </div>
              <div className="p-3 rounded-xl bg-surface-container-low">
                <span className="text-outline text-[11px] block">Jadwal KGB Berikutnya:</span>
                <span className="font-bold text-error">{selectedPegawaiDetail.tmtKgbBerikutnya}</span>
              </div>
              <div className="p-3 rounded-xl bg-surface-container-low">
                <span className="text-outline text-[11px] block">Gaji Pokok Terakhir:</span>
                <span className="font-bold text-primary">{formatRupiah(selectedPegawaiDetail.gajiPokokLama)}</span>
              </div>
              <div className="p-3 rounded-xl bg-surface-container-low">
                <span className="text-outline text-[11px] block">Estimasi Gaji Baru:</span>
                <span className="font-bold text-emerald-700">{formatRupiah(selectedPegawaiDetail.gajiPokokBaru)}</span>
              </div>
              <div className="col-span-2 p-3 rounded-xl bg-surface-container-low">
                <span className="text-outline text-[11px] block">Pendidikan Terakhir:</span>
                <span className="font-medium text-primary">{selectedPegawaiDetail.pendidikan}</span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2 pt-3 border-t border-outline-variant/40">
              <button
                onClick={() => setSelectedPegawaiDetail(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-outline hover:bg-surface-container transition-colors"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  onSelectPegawaiForKgb(selectedPegawaiDetail);
                  setSelectedPegawaiDetail(null);
                  onNavigate('kgb');
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-on-primary hover:bg-primary-container transition-colors shadow-sm flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px] text-secondary-container">payments</span>
                <span>Proses SK KGB</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

