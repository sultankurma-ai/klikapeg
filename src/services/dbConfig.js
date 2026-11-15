/**
 * Konfigurasi Database Resmi Terpadu:
 * 1. Database KlikCuti: Master Data Pegawai & Masa Kerja Aparatur PA Lumajang
 * 2. Database KlikSurat: Registrasi Naskah Dinas, Nomor Agenda & Pengarsipan Surat Keluar
 * 3. Database Utama KlikApeg: Penyimpanan Tabel "klikapeg" (KGB, Surat Tugas, & SPD)
 */

const klikcutiUrl =
  import.meta.env.VITE_KLIKCUTI_SUPABASE_URL || 'https://aprnwkeamcgivihtkacv.supabase.co';
const klikcutiAnonKey =
  import.meta.env.VITE_KLIKCUTI_SUPABASE_ANON_KEY || 'sb_publishable_LBn8Do3F_Mwkrz3fgSEIOg_ftB4ZWLR';

const kliksuratUrl =
  import.meta.env.VITE_KLIKSURAT_SUPABASE_URL || 'https://ojtsvrsdqkuqdizmgtfz.supabase.co';
const kliksuratAnonKey =
  import.meta.env.VITE_KLIKSURAT_SUPABASE_ANON_KEY || 'sb_publishable_QEFYm2gJsVrp1FB6SRQlXQ_ahrQJ1Zz';

const klikapegUrl =
  import.meta.env.VITE_SUPABASE_URL || '';
const klikapegAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const KLIKCUTI_CONFIG = {
  name: 'Database KlikCuti',
  url: klikcutiUrl,
  anonKey: klikcutiAnonKey,
  restEndpoint: `${klikcutiUrl.replace(/\/+$/, '')}/rest/v1`
};

export const KLIKSURAT_CONFIG = {
  name: 'Database KlikSurat',
  url: kliksuratUrl,
  anonKey: kliksuratAnonKey,
  restEndpoint: `${kliksuratUrl.replace(/\/+$/, '')}/rest/v1`
};

export const KLIKAPEG_CONFIG = {
  name: 'Database Utama KlikApeg',
  url: klikapegUrl,
  anonKey: klikapegAnonKey,
  restEndpoint: klikapegUrl ? `${klikapegUrl.replace(/\/+$/, '')}/rest/v1` : ''
};

/**
 * Generic REST API caller with automatic timeout and error handling
 */
export async function fetchSupabaseRest(config, path, options = {}) {
  const url = `${config.restEndpoint}/${path}`;
  const headers = {
    'apikey': config.anonKey,
    'Authorization': `Bearer ${config.anonKey}`,
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs || 8000);

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status}: ${errText || res.statusText}`);
    }

    if (res.status === 204) {
      return null;
    }

    return await res.json();
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

