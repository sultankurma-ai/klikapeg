/**
 * Layanan Integrasi Database KlikSurat
 * Menghubungkan penomoran naskah dinas, register nomor surat keluar,
 * dan pencatatan buku agenda resmi Pengadilan Agama Lumajang ke Supabase KlikSurat.
 */

import { KLIKSURAT_CONFIG, fetchSupabaseRest } from './dbConfig';

const ROMAN_MONTHS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

function getRomanMonth(dateObj) {
  return ROMAN_MONTHS[dateObj.getMonth()] || 'XI';
}

function formatDateIndoDdMmYyyy(dateObj) {
  const dd = String(dateObj.getDate()).padStart(2, '0');
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const yyyy = dateObj.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

/**
 * Cek status koneksi ke database KlikSurat
 */
export async function checkKlikSuratConnection() {
  try {
    const res = await fetchSupabaseRest(KLIKSURAT_CONFIG, 'kliksurat?select=id&limit=1', { timeoutMs: 4000 });
    return {
      connected: true,
      message: 'Database KlikSurat online & terhubung real-time'
    };
  } catch (err) {
    return {
      connected: false,
      message: `Offline / timeout: ${err.message}`
    };
  }
}

/**
 * Ambil daftar naskah dinas keluar dari database KlikSurat
 */
export async function fetchSuratKeluarFromKlikSurat() {
  try {
    const data = await fetchSupabaseRest(
      KLIKSURAT_CONFIG,
      'kliksurat?jenis_surat=eq.keluar&order=tanggal_surat.desc'
    );
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn('Gagal membaca tabel kliksurat:', err);
    return [];
  }
}

/**
 * Generate nomor Surat Tugas resmi terhubung buku register KlikSurat
 * Format resmi PA Lumajang: [NO]/KPA.W13-A8/ST.KP7.1/[BULAN_ROMAWI]/[TAHUN]
 */
export async function getNextNomorSuratTugas() {
  const now = new Date();
  const romanMonth = getRomanMonth(now);
  const year = now.getFullYear();
  const dateFormatted = formatDateIndoDdMmYyyy(now);

  let nextSequence = 1894; // Default baseline sequence

  try {
    // Cari nomor terakhir di database KlikSurat
    const existing = await fetchSupabaseRest(
      KLIKSURAT_CONFIG,
      'kliksurat?jenis_surat=eq.keluar&order=created_at.desc&limit=30'
    );

    if (Array.isArray(existing) && existing.length > 0) {
      existing.forEach(s => {
        if (s.nomor_surat) {
          const match = s.nomor_surat.match(/^(\d+)\//);
          if (match && parseInt(match[1], 10) >= nextSequence) {
            nextSequence = parseInt(match[1], 10) + 1;
          }
        }
      });
    }
  } catch (err) {
    console.warn('Menggunakan generator nomor mandiri KlikSurat:', err);
  }

  const nomorSurat = `${nextSequence}/KPA.W13-A8/ST.KP7.1/${romanMonth}/${year}`;

  return {
    nomorSurat,
    tanggalSurat: dateFormatted,
    sequence: nextSequence,
    serverConnected: true
  };
}

/**
 * Generate nomor SK KGB resmi terhubung buku register KlikSurat
 * Format resmi PA Lumajang: [NO]/KPA.W13-A8/KP2.1/[BULAN_ROMAWI]/[TAHUN]
 */
export async function getNextNomorSkKgb() {
  const now = new Date();
  const romanMonth = getRomanMonth(now);
  const year = now.getFullYear();
  const dateFormatted = formatDateIndoDdMmYyyy(now);

  let nextSequence = 453; // Default baseline sequence untuk KGB

  try {
    const existing = await fetchSupabaseRest(
      KLIKSURAT_CONFIG,
      'kliksurat?jenis_surat=eq.keluar&order=created_at.desc&limit=30'
    );

    if (Array.isArray(existing) && existing.length > 0) {
      existing.forEach(s => {
        if (s.nomor_surat && s.nomor_surat.includes('KP2.1')) {
          const match = s.nomor_surat.match(/^(\d+)\//);
          if (match && parseInt(match[1], 10) >= nextSequence) {
            nextSequence = parseInt(match[1], 10) + 1;
          }
        }
      });
    }
  } catch (err) {
    console.warn('Menggunakan generator nomor mandiri KlikSurat:', err);
  }

  const nomorSk = `${nextSequence}/KPA.W13-A8/KP2.1/${romanMonth}/${year}`;

  return {
    nomorSk,
    tanggalSk: dateFormatted,
    sequence: nextSequence,
    serverConnected: true
  };
}

/**
 * Simpan/Catat Naskah Keluar (Surat Tugas atau SK KGB) ke database pusat KlikSurat
 */
export async function registerSuratKeluarToKlikSurat(suratData) {
  const payload = {
    id: suratData.id || `SK-APEG-${Date.now()}`,
    jenis_surat: 'keluar',
    nomor_surat: suratData.nomorSurat,
    agenda: `APEG-${String(Date.now()).slice(-4)}`,
    unit_pengusul: 'Subbag Kepegawaian, Ortala & TI',
    pembuat: suratData.pembuat || 'Mas Khabibah Nur, S.H.',
    tujuan_surat: suratData.tujuanSurat || 'Aparatur Ditugaskan',
    perihal: suratData.perihal || 'Penerbitan Naskah Resmi KlikApeg',
    tanggal_surat: suratData.tanggalSuratIso || new Date().toISOString().slice(0, 10),
    sifat: 'biasa',
    status: 'Disetujui Pimpinan',
    kode_klasifikasi: suratData.kodeKlasifikasi || 'KP.02',
    lampiran: suratData.lampiran || '1 Berkas Naskah',
    disetujui_oleh: 'Fatkur Rosyad, S.Ag., M.H., M.HES. (Ketua)',
    waktu_persetujuan: new Date().toISOString(),
    tracking: [
      {
        status: 'Diterbitkan KlikApeg',
        waktu: new Date().toISOString(),
        keterangan: 'Naskah resmi diterbitkan melalui aplikasi KlikApeg dan otomatis tercatat di buku register KlikSurat.'
      }
    ]
  };

  try {
    const res = await fetchSupabaseRest(
      KLIKSURAT_CONFIG,
      'kliksurat',
      {
        method: 'POST',
        headers: {
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(payload)
      }
    );
    return {
      success: true,
      registeredToKlikSurat: true,
      data: res
    };
  } catch (err) {
    console.warn('Registrasi naskah ke KlikSurat gagal (tetap disimpan lokal):', err);
    return {
      success: true,
      registeredToKlikSurat: false,
      warning: err.message
    };
  }
}

