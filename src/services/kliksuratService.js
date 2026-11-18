/**
 * Layanan Integrasi Database KlikSurat (DINONAKTIFKAN)
 * Koneksi ke database KlikSurat telah dihentikan sesuai instruksi.
 * Seluruh penomoran dan tanggal surat kini diisi secara manual oleh pengguna.
 */

export async function checkKlikSuratConnection() {
  return { connected: false, message: 'Koneksi KlikSurat dinonaktifkan' };
}

export async function fetchSuratKeluarFromKlikSurat() {
  return [];
}

export async function getNextNomorSuratTugas() {
  return { nomorSurat: '', tanggalSurat: '', sequence: 0, serverConnected: false };
}

export async function getNextNomorSkKgb() {
  return { nomorSk: '', tanggalSk: '', sequence: 0, serverConnected: false };
}

export async function registerSuratKeluarToKlikSurat() {
  return { registeredToKlikSurat: false };
}
