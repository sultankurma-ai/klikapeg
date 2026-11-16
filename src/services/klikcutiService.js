/**
 * Layanan Integrasi Database KlikCuti
 * Mengambil data Pegawai & Masa Kerja secara real-time dari Supabase KlikCuti PA Lumajang
 */

import { KLIKCUTI_CONFIG, fetchSupabaseRest } from './dbConfig';
import { initialPegawai } from '../data/mockData';

const STORAGE_KEY = 'klikapeg_master_kgb_v2';

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
 * Evaluasi status KGB berdasarkan tanggal target (DD-MM-YYYY)
 */
function evaluateKgbStatus(dateStr, fallbackIndex) {
  if (!dateStr) return 'Terjadwal';
  const parts = String(dateStr).trim().split('-');
  if (parts.length === 3) {
    const yr = parseInt(parts[2], 10);
    const mo = parseInt(parts[1], 10);
    // Acuan: November 2026
    if (yr < 2026 || (yr === 2026 && mo <= 11)) {
      return 'Jatuh Tempo';
    } else if (yr === 2026 && mo === 12) {
      return 'Segera Diproses';
    } else {
      return 'Terjadwal';
    }
  }
  return deriveKgbSchedule(4, fallbackIndex).statusKgb;
}

/**
 * Fetch data pegawai & Master Data KGB secara real-time dari Database KlikCuti
 */
export async function fetchPegawaiFromKlikCuti(forceFresh = false) {
  try {
    // Jika forceFresh aktif (misal saat tombol klikcuti di sidebar diklik), bersihkan cache lama
    if (forceFresh) {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) { }
    }

    // 1. Ambil data resmi dari Menu Master Data KGB KlikCuti (tabel master_kgb) sebagai sumber utama
    const rawMasterKgb = await fetchSupabaseRest(
      KLIKCUTI_CONFIG,
      'master_kgb?select=*&order=nama_pegawai.asc',
      { timeoutMs: 10000 }
    );

    if (!Array.isArray(rawMasterKgb) || rawMasterKgb.length === 0) {
      throw new Error('Data dari tabel master_kgb KlikCuti kosong');
    }

    // 2. Ambil data profil pegawai (tabel pegawai) untuk melengkapi no_wa & unit kerja
    let profileMap = {};
    try {
      const rawPegawai = await fetchSupabaseRest(
        KLIKCUTI_CONFIG,
        'pegawai?select=*',
        { timeoutMs: 8000 }
      );
      if (Array.isArray(rawPegawai)) {
        rawPegawai.forEach(p => {
          if (p.nip && p.nip !== 'admin') profileMap[p.nip] = p;
        });
      }
    } catch (e) {
      console.warn('Gagal memuat tabel pegawai KlikCuti:', e);
    }

    // 3. Ambil data masa kerja
    let masaKerjaMap = {};
    try {
      const rawMasaKerja = await fetchSupabaseRest(
        KLIKCUTI_CONFIG,
        'masa_kerja?select=*',
        { timeoutMs: 8000 }
      );
      if (Array.isArray(rawMasaKerja)) {
        rawMasaKerja.forEach(mk => {
          if (mk.nip) masaKerjaMap[mk.nip] = mk;
        });
      }
    } catch (e) {
      console.warn('Gagal memuat tabel masa_kerja KlikCuti:', e);
    }

    // 4. Map seluruh 35 data resmi master_kgb ke struktur pegawai KlikApeg
    const mappedList = rawMasterKgb.map((mk, idx) => {
      const prof = profileMap[mk.nip] || {};
      const mkData = masaKerjaMap[mk.nip];

      const isPppk =
        mk.nip.includes('202521') ||
        mk.nip.includes('202421') ||
        mk.golongan === 'V' ||
        mk.golongan === 'IX' ||
        prof.jenis_kepegawaian === 'PPPK';

      const mkgTahun =
        mkData?.masa_kerja_tahun ??
        (isPppk ? (mk.tgl_kgb_terakhir?.includes('2024') ? 2 : 0) : Math.max(4, 2026 - parseInt(mk.nip.substring(8, 12), 10)));
      const mkgBulan = mkData?.masa_kerja_bulan ?? 0;

      const gajiLama = isPppk
        ? (mk.golongan === 'IX' ? 3203600 : 2511500)
        : hitungGajiPokok(mk.golongan, mkgTahun);
      const gajiBaru = isPppk
        ? (mk.golongan === 'IX' ? 3304500 : 2590600)
        : hitungGajiPokok(mk.golongan, mkgTahun + 2);

      return {
        id: `PEG-${mk.nip}`,
        nip: mk.nip,
        nama: mk.nama_pegawai,
        pangkat: mapGolonganToPangkat(mk.golongan),
        golongan: mk.golongan,
        jabatan: mk.jabatan,
        unitKerja: prof.unit_kerja || 'Pengadilan Agama Lumajang',
        tmtKgbTerakhir: mk.tgl_kgb_terakhir || '-',
        tmtKgbBerikutnya: mk.tgl_kgb_berikutnya || '-',
        noSkTerakhir: mk.no_sk_terakhir || '-',
        keteranganKgb: mk.keterangan || (isPppk ? 'KGB PPPK 2 Tahun Sekali (PermenPAN-RB No. 7/2023)' : 'KGB PNS 2 Tahun Sekali'),
        hasMasterKgb: true,
        mkgTahun,
        mkgBulan,
        gajiPokokLama: gajiLama,
        gajiPokokBaru: gajiBaru,
        statusKgb: evaluateKgbStatus(mk.tgl_kgb_berikutnya, idx),
        pendidikan: isPppk ? 'Sarjana Terapan' : 'S1 Peradilan',
        statusKepegawaian: isPppk ? 'PPPK' : 'PNS',
        email: prof.email || `${mk.nip}@pa-lumajang.go.id`,
        noHp: prof.no_wa || '081234567890',
        foto: `https://ui-avatars.com/api/?name=${encodeURIComponent(mk.nama_pegawai)}&background=1B2A4A&color=fff&size=150`,
        source: 'KlikCuti-MasterDataKGB'
      };
    });

    // Simpan ke local cache untuk performa & offline support
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mappedList));

    return {
      success: true,
      data: mappedList,
      count: mappedList.length,
      masterKgbCount: rawMasterKgb.length,
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

/**
 * Ambil data tabel master_kgb langsung dari Database KlikCuti
 */
export async function fetchMasterKgbFromKlikCuti() {
  try {
    const rawMasterKgb = await fetchSupabaseRest(
      KLIKCUTI_CONFIG,
      'master_kgb?select=*&order=nama_pegawai.asc'
    );
    return Array.isArray(rawMasterKgb) ? rawMasterKgb : [];
  } catch (err) {
    console.error('Error fetching master_kgb:', err);
    return [];
  }
}

