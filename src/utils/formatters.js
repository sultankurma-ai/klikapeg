/**
 * Utility formatters for KlikApeg (Pengadilan Agama Lumajang)
 */

export function terbilang(angka) {
  const bilangan = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas'];
  angka = Math.floor(Math.abs(Number(angka) || 0));
  if (angka < 12) {
    return bilangan[angka];
  } else if (angka < 20) {
    return (terbilang(angka - 10) + ' belas').trim();
  } else if (angka < 100) {
    return (terbilang(Math.floor(angka / 10)) + ' puluh ' + terbilang(angka % 10)).replace(/\s+/g, ' ').trim();
  } else if (angka < 200) {
    return ('seratus ' + terbilang(angka - 100)).replace(/\s+/g, ' ').trim();
  } else if (angka < 1000) {
    return (terbilang(Math.floor(angka / 100)) + ' ratus ' + terbilang(angka % 100)).replace(/\s+/g, ' ').trim();
  } else if (angka < 2000) {
    return ('seribu ' + terbilang(angka - 1000)).replace(/\s+/g, ' ').trim();
  } else if (angka < 1000000) {
    return (terbilang(Math.floor(angka / 1000)) + ' ribu ' + terbilang(angka % 1000)).replace(/\s+/g, ' ').trim();
  } else if (angka < 1000000000) {
    return (terbilang(Math.floor(angka / 1000000)) + ' juta ' + terbilang(angka % 1000000)).replace(/\s+/g, ' ').trim();
  } else if (angka < 1000000000000) {
    return (terbilang(Math.floor(angka / 1000000000)) + ' milyar ' + terbilang(angka % 1000000000)).replace(/\s+/g, ' ').trim();
  }
  return '';
}

export function formatRupiah(val) {
  const num = Number(val) || 0;
  return 'Rp ' + num.toLocaleString('id-ID') + ',-';
}

export function formatTanggalIndo(dateStr) {
  if (!dateStr) return '';
  // Check if format is DD-MM-YYYY
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
    const parts = dateStr.split('-');
    const day = parseInt(parts[0], 10);
    const monthIdx = parseInt(parts[1], 10) - 1;
    const year = parts[2];
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${day} ${months[monthIdx] || parts[1]} ${year}`;
  }
  // Check if format is YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const parts = dateStr.split('-');
    const day = parseInt(parts[2], 10);
    const monthIdx = parseInt(parts[1], 10) - 1;
    const year = parts[0];
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${day} ${months[monthIdx] || parts[1]} ${year}`;
  }
  return dateStr;
}

