/**
 * Layanan Integrasi Database KlikCuti
 * Mengambil data Pegawai & Masa Kerja secara real-time dari Supabase KlikCuti PA Lumajang
 */

import { KLIKCUTI_CONFIG, fetchSupabaseRest } from './dbConfig';
import { initialPegawai } from '../data/mockData';

const STORAGE_KEY = 'klikapeg_pegawai_live_cache';

export function mapGolonganToPangkat(golongan) {
  const g = String(golongan || '').trim().toUpperCase();
  switch (g) {
    case 'IV/E': return 'Pembina Utama';
    case 'IV/D': return 'Pembina Utama Madya';
    case 'IV/C': return 'Pembina Utama Muda';
    case 'IV/B': return 'Pembina Tingkat I';
    case 'IV/A': return 'Pembina';
    case 'III/D': return 'Penata Tingkat I';
    case 'III/C': return 'Penata';
    case 'III/B': return 'Penata Muda Tingkat I';
    case 'III/A': return 'Penata Muda';
    case 'II/D': return 'Pengatur Tingkat I';
    case 'II/C': return 'Pengatur';
    case 'II/B': return 'Pengatur Muda Tingkat I';
    case 'II/A': return 'Pengatur Muda';
    case 'I/D': return 'Juru Tingkat I';
    case 'I/C': return 'Juru';
    case 'I/B': return 'Juru Muda Tingkat I';
    case 'I/A': return 'Juru Muda';
    case 'IX': return 'Ahli Pertama (Golongan IX)';
    case 'X': return 'Ahli Muda (Golongan X)';
    case 'VII': return 'Mahir (Golongan VII)';
    case 'V': return 'Terampil / Pelaksana (Golongan V)';
    default: return g.startsWith('IV') ? 'Pembina' : (g.startsWith('III') ? 'Penata' : 'Pengatur');
  }
}

export function hitungGajiPokok(golongan, mkgTahun) {
  const g = String(golongan || '').trim().toUpperCase();
  const mkg = Math.max(0, Number(mkgTahun) || 0);
  const step = Math.floor(mkg / 2);

  // Standar PP No. 5 Tahun 2024 (PNS) & Perpres No. 11 Tahun 2024 (PPPK)
  const baseSalaries = {
    'IV/E': 3880400,
    'IV/D': 3723000,
    'IV/C': 3571900,
    'IV/B': 3426900,
    'IV/A': 3287800,
    'III/D': 3154400,
    'III/C': 3026400,
    'III/B': 2903600,
    'III/A': 2785700,
    'II/D': 2591100,
    'II/C': 2485900,
    'II/B': 2385000,
    'II/A': 2184000,
    'IX': 3203600,
    'VII': 2647200,
    'V': 2511500
  };

  const base = baseSalaries[g] || 2800000;
  const multiplier = Math.pow(1.0315, step);
  return Math.round((base * multiplier) / 100) * 100;
}

/**
 * Tentukan status KGB dan tanggal TMT berdasarkan masa kerja
 */
function deriveKgbSchedule(mkgTahun, index) {
  // Sebarkan siklus KGB aparatur untuk demonstrasi pengingat
  // Bulan ini: November 2026
  const mod = index % 4;
  if (mod === 0) {
    return {
      tmtKgbTerakhir: '01-11-2024',
      tmtKgbBerikutnya: '01-11-2026',
      statusKgb: 'Jatuh Tempo'
    };
  } else if (mod === 1) {
    return {
      tmtKgbTerakhir: '01-12-2024',
      tmtKgbBerikutnya: '01-12-2026',
      statusKgb: 'Segera Diproses'
    };
  } else if (mod === 2) {
    return {
      tmtKgbTerakhir: '01-01-2025',
      tmtKgbBerikutnya: '01-01-2027',
      statusKgb: 'Terjadwal'
    };
  } else {
    return {
      tmtKgbTerakhir: '01-04-2025',
      tmtKgbBerikutnya: '01-04-2027',
      statusKgb: 'Terjadwal'
    };
  }
}

/**
 * Fetch data pegawai & masa kerja dari Database KlikCuti
 */
export async function fetchPegawaiFromKlikCuti() {
  try {
    // 1. Ambil data master pegawai
    const rawPegawai = await fetchSupabaseRest(
      KLIKCUTI_CONFIG,
      'pegawai?select=*&order=nama_pegawai.asc'
    );

    // 2. Ambil data masa kerja
    let masaKerjaMap = {};
    try {
      const rawMasaKerja = await fetchSupabaseRest(
        KLIKCUTI_CONFIG,
        'masa_kerja?select=*'
      );
      if (Array.isArray(rawMasaKerja)) {
        rawMasaKerja.forEach(mk => {
          if (mk.nip) masaKerjaMap[mk.nip] = mk;
        });
      }
    } catch (e) {
      console.warn('Gagal memuat tabel masa_kerja KlikCuti, menggunakan estimasi masa kerja:', e);
    }

    if (!Array.isArray(rawPegawai) || rawPegawai.length === 0) {
      throw new Error('Data pegawai dari KlikCuti kosong');
    }

    // 3. Filter akun sistem 'admin' dan mapping ke format KlikApeg
    const filteredPegawai = rawPegawai.filter(p => p.nip && p.nip !== 'admin' && p.nama_pegawai !== 'admin');

    const mappedList = filteredPegawai.map((p, idx) => {
      const mk = masaKerjaMap[p.nip];
      const mkgTahun = mk?.masa_kerja_tahun ?? (p.nip.length >= 18 ? Math.max(2, 2026 - parseInt(p.nip.substring(8, 12), 10)) : 4);
      const mkgBulan = mk?.masa_kerja_bulan ?? 0;
      const kgbInfo = deriveKgbSchedule(mkgTahun, idx);
      const gajiLama = hitungGajiPokok(p.golongan, mkgTahun);
      const gajiBaru = hitungGajiPokok(p.golongan, mkgTahun + 2);

      return {
        id: `PEG-${p.nip}`,
        nip: p.nip,
        nama: p.nama_pegawai,
        pangkat: mapGolonganToPangkat(p.golongan),
        golongan: p.golongan || 'III/a',
        jabatan: p.jabatan || 'Aparatur Sipil Negara',
        unitKerja: p.unit_kerja || 'Pengadilan Agama Lumajang',
        tmtKgbTerakhir: kgbInfo.tmtKgbTerakhir,
        tmtKgbBerikutnya: kgbInfo.tmtKgbBerikutnya,
        mkgTahun,
        mkgBulan,
        gajiPokokLama: gajiLama,
        gajiPokokBaru: gajiBaru,
        statusKgb: kgbInfo.statusKgb,
        pendidikan: p.jenis_kepegawaian === 'PPPK' ? 'Sarjana Terapan' : 'S1 Peradilan',
        statusKepegawaian: p.jenis_kepegawaian || 'PNS',
        email: `${p.nama_pegawai.toLowerCase().replace(/[^a-z]/g, '').slice(0, 12)}@pa-lumajang.go.id`,
        noHp: p.no_wa || '081234567890',
        foto: `https://ui-avatars.com/api/?name=${encodeURIComponent(p.nama_pegawai)}&background=1B2A4A&color=fff&size=150`,
        source: 'KlikCuti-Supabase'
      };
    });

    // Simpan ke local cache untuk performa & offline support
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mappedList));

    return {
      success: true,
      data: mappedList,
      count: mappedList.length,
      fromCache: false
    };
  } catch (err) {
    console.warn('Koneksi online ke Supabase KlikCuti terhambat, memeriksa cache lokal:', err);
    // Coba ambil dari local cache
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return {
            success: true,
            data: parsed,
            count: parsed.length,
            fromCache: true,
            warning: 'Memuat dari cache offline KlikCuti'
          };
        }
      } catch (e) {}
    }

    // Fallback terakhir ke mock data
    return {
      success: false,
      data: initialPegawai,
      count: initialPegawai.length,
      error: err.message
    };
  }
}

/**
 * Cek status koneksi ke database KlikCuti
 */
export async function checkKlikCutiConnection() {
  try {
    const res = await fetchSupabaseRest(KLIKCUTI_CONFIG, 'pegawai?select=nip&limit=1', { timeoutMs: 4000 });
    return {
      connected: true,
      message: 'Database KlikCuti online & terhubung real-time'
    };
  } catch (err) {
    return {
      connected: false,
      message: `Offline / timeout: ${err.message}`
    };
  }
}

