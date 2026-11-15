/**
 * Layanan Database Utama KlikApeg (Pengadilan Agama Lumajang)
 * Berkomunikasi langsung dengan tabel "klikapeg" di Supabase oxphycpabzqamsbueons.supabase.co
 * Menyimpan dan mengelola data riil:
 * 1. Layanan Kenaikan Gaji Berkala (KGB)
 * 2. Surat Tugas Aparatur PA Lumajang
 * 3. Surat Perjalanan Dinas (SPD)
 */

import { KLIKAPEG_CONFIG, fetchSupabaseRest } from './dbConfig';
import { initialRiwayatKgb, initialSuratTugas, initialSpd } from '../data/mockData';

const STORAGE_KEY_PREFIX = 'klikapeg_db_cache_';

export async function fetchKlikapegData() {
  try {
    const data = await fetchSupabaseRest(
      KLIKAPEG_CONFIG,
      'klikapeg?select=*&order=created_at.desc'
    );

    if (Array.isArray(data) && data.length > 0) {
      const kgb = [];
      const suratTugas = [];
      const spd = [];

      data.forEach(r => {
        if (r.jenis_layanan === 'kgb') {
          kgb.push({
            id: r.id,
            nomorSk: r.nomor_dokumen,
            pegawaiId: `PEG-${r.nip}`,
            nama: r.nama_pegawai,
            nip: r.nip,
            pangkatGolongan: r.pangkat_golongan,
            jabatan: r.jabatan,
            gajiLama: Number(r.gaji_pokok_lama || 0),
            gajiBaru: Number(r.gaji_pokok_baru || 0),
            tmtBaru: r.tmt_baru,
            tmtBerikutnya: r.tmt_berikutnya,
            mkgTahun: Number(r.masa_kerja_tahun || 0),
            mkgBulan: Number(r.masa_kerja_bulan || 0),
            tanggalSk: r.tanggal_dokumen,
            penandatangan: r.pejabat_penandatangan || 'Fatkur Rosyad, S.Ag., M.H., M.HES. (Ketua)',
            skLamaNomor: r.sk_lama_nomor,
            keterangan: r.keterangan || 'Kenaikan Gaji Berkala PA Lumajang'
          });
        } else if (r.jenis_layanan === 'surat_tugas') {
          suratTugas.push({
            id: r.id,
            nomorSurat: r.nomor_dokumen,
            tanggalSurat: r.tanggal_dokumen,
            pegawaiList: Array.isArray(r.daftar_aparatur) ? r.daftar_aparatur : [],
            maksudTugas: r.maksud_tugas_perjalanan,
            dasarHukum: r.dasar_hukum,
            tempatBerangkat: r.tempat_berangkat || 'Pengadilan Agama Lumajang',
            tempatTujuan: r.tempat_tujuan,
            tanggalMulai: r.tanggal_mulai,
            tanggalSelesai: r.tanggal_selesai,
            lamaHari: Number(r.lama_hari || 1),
            bebanAnggaran: r.beban_anggaran,
            mataAnggaran: r.mata_anggaran,
            pejabatPenandatangan: r.pejabat_penandatangan,
            status: r.status || 'Diterbitkan',
            createdAt: r.created_at
          });
        } else if (r.jenis_layanan === 'spd') {
          spd.push({
            id: r.id,
            nomorSpd: r.nomor_dokumen,
            suratTugasId: r.nomor_surat_tugas_ref,
            nomorSuratTugas: r.nomor_surat_tugas_ref,
            ppk: r.ppk_nama,
            pelaksana: typeof r.pelaksana === 'object' && r.pelaksana !== null ? r.pelaksana : {},
            tingkatBiaya: r.tingkat_biaya,
            maksudPerjalanan: r.maksud_tugas_perjalanan,
            alatAngkut: r.alat_angkutan,
            tempatBerangkat: r.tempat_berangkat || 'Pengadilan Agama Lumajang',
            tempatTujuan: r.tempat_tujuan,
            lamaHari: Number(r.lama_hari || 1),
            tanggalBerangkat: r.tanggal_mulai,
            tanggalKembali: r.tanggal_selesai,
            instansiPembeban: r.beban_anggaran || 'Pengadilan Agama Lumajang',
            akunAnggaran: r.mata_anggaran,
            keterangan: r.keterangan,
            statusSpd: r.status || 'Terverifikasi',
            createdAt: r.created_at
          });
        }
      });

      // Cache locally for offline resilience
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}kgb`, JSON.stringify(kgb));
        localStorage.setItem(`${STORAGE_KEY_PREFIX}st`, JSON.stringify(suratTugas));
        localStorage.setItem(`${STORAGE_KEY_PREFIX}spd`, JSON.stringify(spd));
      } catch (e) {
        // ignore
      }

      return {
        success: true,
        source: 'Supabase-KlikApeg',
        kgb: kgb.length > 0 ? kgb : initialRiwayatKgb,
        suratTugas: suratTugas,
        spd: spd
      };
    }
  } catch (err) {
    console.warn('Gagal memuat data dari Supabase KlikApeg, mencoba cache lokal:', err);
  }

  // Fallback to cache / initial genuine data
  try {
    const cachedKgb = localStorage.getItem(`${STORAGE_KEY_PREFIX}kgb`);
    const cachedSt = localStorage.getItem(`${STORAGE_KEY_PREFIX}st`);
    const cachedSpd = localStorage.getItem(`${STORAGE_KEY_PREFIX}spd`);

    // Pastikan tidak ada data contoh lama yang terbawa dari cache lokal
    let stData = [];
    if (cachedSt) {
      try {
        const parsed = JSON.parse(cachedSt);
        if (Array.isArray(parsed) && !JSON.stringify(parsed).includes('Siti Rahmawati') && !JSON.stringify(parsed).includes('ST/304')) {
          stData = parsed;
        }
      } catch (e) {}
    }

    let spdData = [];
    if (cachedSpd) {
      try {
        const parsed = JSON.parse(cachedSpd);
        if (Array.isArray(parsed) && !JSON.stringify(parsed).includes('Siti Rahmawati') && !JSON.stringify(parsed).includes('SPD/142')) {
          spdData = parsed;
        }
      } catch (e) {}
    }

    return {
      success: false,
      source: 'Local-Fallback',
      kgb: cachedKgb ? JSON.parse(cachedKgb) : initialRiwayatKgb,
      suratTugas: stData,
      spd: spdData
    };
  } catch (e) {
    return {
      success: false,
      source: 'Initial-Real-Data',
      kgb: initialRiwayatKgb,
      suratTugas: [],
      spd: []
    };
  }
}

/**
 * Simpan data riil KGB ke Supabase table "klikapeg"
 */
export async function saveKgbToSupabase(kgb) {
  const row = {
    id: kgb.id || `KGB-${kgb.nip}-${Date.now()}`,
    jenis_layanan: 'kgb',
    nomor_dokumen: kgb.nomorSk,
    tanggal_dokumen: kgb.tanggalSk ? kgb.tanggalSk.split('-').reverse().join('-') : new Date().toISOString().slice(0, 10),
    status: 'Diterbitkan',
    nip: kgb.nip,
    nama_pegawai: kgb.nama,
    pangkat_golongan: kgb.pangkatGolongan,
    jabatan: kgb.jabatan,
    unit_kerja: 'Pengadilan Agama Lumajang',
    gaji_pokok_lama: kgb.gajiLama,
    gaji_pokok_baru: kgb.gajiBaru,
    tmt_baru: kgb.tmtBaru,
    tmt_berikutnya: kgb.tmtBerikutnya,
    masa_kerja_tahun: kgb.mkgTahun || 0,
    masa_kerja_bulan: kgb.mkgBulan || 0,
    sk_lama_nomor: kgb.skLamaNomor,
    pejabat_penandatangan: kgb.penandatangan || 'Fatkur Rosyad, S.Ag., M.H., M.HES. (Ketua)',
    keterangan: kgb.keterangan || 'Kenaikan Gaji Berkala PA Lumajang',
    created_by: 'Mas Khabibah Nur, S.H. (Kasubbag Kepegawaian & Ortala)'
  };

  try {
    const res = await fetchSupabaseRest(KLIKAPEG_CONFIG, 'klikapeg', {
      method: 'POST',
      headers: { 'Prefer': 'return=representation' },
      body: JSON.stringify(row)
    });
    return { success: true, data: res };
  } catch (err) {
    console.warn('Gagal menyimpan KGB ke Supabase KlikApeg:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Simpan data riil Surat Tugas ke Supabase table "klikapeg"
 */
export async function saveSuratTugasToSupabase(st) {
  const row = {
    id: st.id || `ST-${Date.now()}`,
    jenis_layanan: 'surat_tugas',
    nomor_dokumen: st.nomorSurat,
    tanggal_dokumen: st.tanggalSurat ? st.tanggalSurat.split('-').reverse().join('-') : new Date().toISOString().slice(0, 10),
    status: st.status || 'Diterbitkan',
    maksud_tugas_perjalanan: st.maksudTugas,
    dasar_hukum: st.dasarHukum,
    tempat_berangkat: st.tempatBerangkat || 'Pengadilan Agama Lumajang',
    tempat_tujuan: st.tempatTujuan,
    tanggal_mulai: st.tanggalMulai,
    tanggal_selesai: st.tanggalSelesai,
    lama_hari: Number(st.lamaHari || 1),
    beban_anggaran: st.bebanAnggaran,
    mata_anggaran: st.mataAnggaran,
    pejabat_penandatangan: st.pejabatPenandatangan || 'Fatkur Rosyad, S.Ag., M.H., M.HES. (Ketua)',
    daftar_aparatur: st.pegawaiList || [],
    created_by: 'Mas Khabibah Nur, S.H.'
  };

  try {
    const res = await fetchSupabaseRest(KLIKAPEG_CONFIG, 'klikapeg', {
      method: 'POST',
      headers: { 'Prefer': 'return=representation' },
      body: JSON.stringify(row)
    });
    return { success: true, data: res };
  } catch (err) {
    console.warn('Gagal menyimpan Surat Tugas ke Supabase KlikApeg:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Simpan data riil SPD ke Supabase table "klikapeg"
 */
export async function saveSpdToSupabase(spd) {
  const row = {
    id: spd.id || `SPD-${Date.now()}`,
    jenis_layanan: 'spd',
    nomor_dokumen: spd.nomorSpd,
    tanggal_dokumen: spd.tanggalBerangkat ? spd.tanggalBerangkat.split('-').reverse().join('-') : new Date().toISOString().slice(0, 10),
    nomor_surat_tugas_ref: spd.nomorSuratTugas || spd.suratTugasId,
    ppk_nama: spd.ppk || 'Dr. Rozy Alifian Mukhtar, S.H., M.Kn. (PPK PA Lumajang)',
    pelaksana: spd.pelaksana || {},
    tingkat_biaya: spd.tingkatBiaya,
    maksud_tugas_perjalanan: spd.maksudPerjalanan,
    alat_angkutan: spd.alatAngkut,
    tempat_berangkat: spd.tempatBerangkat || 'Pengadilan Agama Lumajang',
    tempat_tujuan: spd.tempatTujuan,
    tanggal_mulai: spd.tanggalBerangkat,
    tanggal_selesai: spd.tanggalKembali,
    lama_hari: Number(spd.lamaHari || 1),
    beban_anggaran: spd.instansiPembeban || 'Pengadilan Agama Lumajang',
    mata_anggaran: spd.akunAnggaran,
    keterangan: spd.keterangan,
    status: spd.statusSpd || 'Terverifikasi',
    created_by: 'Dr. Rozy Alifian Mukhtar, S.H., M.Kn.'
  };

  try {
    const res = await fetchSupabaseRest(KLIKAPEG_CONFIG, 'klikapeg', {
      method: 'POST',
      headers: { 'Prefer': 'return=representation' },
      body: JSON.stringify(row)
    });
    return { success: true, data: res };
  } catch (err) {
    console.warn('Gagal menyimpan SPD ke Supabase KlikApeg:', err);
    return { success: false, error: err.message };
  }
}
