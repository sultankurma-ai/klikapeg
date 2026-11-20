/**
 * Modul Master Aturan Penggajian & Tabel Gaji Pokok Resmi ASN
 * Pengadilan Agama Lumajang Kelas 1A
 *
 * Mendukung multi-aturan gaji:
 * 1. Peraturan Pemerintah Nomor 5 Tahun 2024 (PP No. 5/2024 & Perpres No. 11/2024) [Default Aktif]
 * 2. Peraturan Pemerintah Nomor 15 Tahun 2019 (PP No. 15/2019 & Perpres No. 98/2020) [Historis]
 */

// ==========================================
// 1. TABEL GAJI PP NOMOR 5 TAHUN 2024
// ==========================================
export const TABEL_GAJI_PP5_2024 = {
  // GOLONGAN I (Juru)
  'I/A': {
    0: 1685700, 2: 1738800, 4: 1793500, 6: 1850000, 8: 1908300,
    10: 1968400, 12: 2030400, 14: 2094400, 16: 2160400, 18: 2228400,
    20: 2298500, 22: 2370800, 24: 2445300, 26: 2522200
  },
  'I/B': {
    3: 1840800, 4: 1898800, 6: 1958600, 8: 2020300, 10: 2083900,
    12: 2149600, 14: 2217500, 16: 2287400, 18: 2359500, 20: 2433800,
    22: 2510500, 24: 2589500, 26: 2670700
  },
  'I/C': {
    3: 1918700, 4: 1979100, 6: 2041500, 8: 2105800, 10: 2172100,
    12: 2240500, 14: 2311100, 16: 2384000, 18: 2459200, 20: 2536700,
    22: 2616600, 24: 2699000, 26: 2783700
  },
  'I/D': {
    3: 1999900, 4: 2062900, 6: 2127800, 8: 2194800, 10: 2264000,
    12: 2335300, 14: 2408800, 16: 2484700, 18: 2563100, 20: 2644000,
    22: 2727400, 24: 2813500, 26: 2901400
  },

  // GOLONGAN II (Pengatur)
  'II/A': {
    0: 2184000, 2: 2253200, 4: 2324200, 6: 2397400, 8: 2472900,
    10: 2550800, 12: 2631100, 14: 2714000, 16: 2799500, 18: 2887700,
    20: 2978600, 22: 3072400, 24: 3169200, 26: 3269000, 28: 3372000,
    30: 3478200, 32: 3587700, 33: 3643400
  },
  'II/B': {
    0: 2385000, 2: 2422600, 4: 2498800, 6: 2577500, 8: 2658700,
    10: 2742400, 12: 2828800, 14: 2917900, 16: 3009800, 18: 3104500,
    20: 3202000, 22: 3302500, 24: 3406100, 26: 3512900, 28: 3623100,
    30: 3736700, 32: 3797500
  },
  'II/C': {
    0: 2485900, 2: 2525100, 4: 2604500, 6: 2686500, 8: 2771000,
    10: 2858200, 12: 2948200, 14: 3041000, 16: 3136800, 18: 3235600,
    20: 3337500, 22: 3442400, 24: 3550600, 26: 3662000, 28: 3777100,
    30: 3895800, 32: 3958200
  },
  'II/D': {
    0: 2591100, 2: 2632100, 4: 2714800, 6: 2799400, 8: 2887400,
    10: 2978300, 12: 3072100, 14: 3168800, 16: 3268600, 18: 3371400,
    20: 3477500, 22: 3586800, 24: 3699400, 26: 3815500, 28: 3935400,
    30: 4059200, 32: 4125600
  },

  // GOLONGAN III (Penata)
  'III/A': {
    0: 2785700, 2: 2873500, 4: 2964000, 6: 3057300, 8: 3153500,
    10: 3252700, 12: 3355000, 14: 3460500, 16: 3569300, 18: 3681500,
    20: 3797200, 22: 3916600, 24: 4039700, 26: 4166700, 28: 4297700,
    30: 4432800, 32: 4575200
  },
  'III/B': {
    0: 2903600, 2: 2995000, 4: 3089300, 6: 3186600, 8: 3287000,
    10: 3390500, 12: 3497300, 14: 3607500, 16: 3721100, 18: 3838300,
    20: 3959200, 22: 4083900, 24: 4212500, 26: 4345100, 28: 4482000,
    30: 4623100, 32: 4768800
  },
  'III/C': {
    0: 3026400, 2: 3121700, 4: 3220100, 6: 3321600, 8: 3426300,
    10: 3533900, 12: 3645200, 14: 3760100, 16: 3878600, 18: 4000600,
    20: 4126600, 22: 4256600, 24: 4390700, 26: 4528900, 28: 4671600,
    30: 4818800, 32: 4970500
  },
  'III/D': {
    0: 3154400, 2: 3253700, 4: 3356200, 6: 3461900, 8: 3570900,
    10: 3683400, 12: 3799400, 14: 3919100, 16: 4042500, 18: 4169900,
    20: 4301200, 22: 4436700, 24: 4576400, 26: 4720600, 28: 4869300,
    30: 5022600, 32: 5180700
  },

  // GOLONGAN IV (Pembina)
  'IV/A': {
    0: 3287800, 2: 3391400, 4: 3498200, 6: 3608400, 8: 3722100,
    10: 3839300, 12: 3960100, 14: 4084800, 16: 4213300, 18: 4345800,
    20: 4482400, 22: 4623300, 24: 4768600, 26: 4918400, 28: 5072800,
    30: 5232000, 32: 5399900
  },
  'IV/B': {
    0: 3426900, 2: 3534800, 4: 3646200, 6: 3761100, 8: 3879600,
    10: 4001700, 12: 4127700, 14: 4257700, 16: 4391800, 18: 4530100,
    20: 4672800, 22: 4819900, 24: 4971700, 26: 5128300, 28: 5289800,
    30: 5456400, 32: 5628300
  },
  'IV/C': {
    0: 3571900, 2: 3684400, 4: 3800400, 6: 3920100, 8: 4043600,
    10: 4171200, 12: 4302700, 14: 4438300, 16: 4578100, 18: 4722300,
    20: 4871200, 22: 5024900, 24: 5183200, 26: 5346700, 28: 5515200,
    30: 5688900, 32: 5866400
  },
  'IV/D': {
    0: 3723000, 2: 3840200, 4: 3961200, 6: 4085900, 8: 4214500,
    10: 4347800, 12: 4485000, 14: 4626500, 16: 4772300, 18: 4922600,
    20: 5078100, 22: 5238200, 24: 5403700, 26: 5574600, 28: 5750800,
    30: 5932300, 32: 6114500
  },
  'IV/E': {
    0: 3880400, 2: 4002700, 4: 4128700, 6: 4258800, 8: 4392700,
    10: 4531500, 12: 4674800, 14: 4822400, 16: 4974500, 18: 5131300,
    20: 5293400, 22: 5460400, 24: 5633400, 26: 5811800, 28: 5995900,
    30: 6185800, 32: 6373200
  },

  // PPPK (Perpres No. 11 Tahun 2024)
  'V': {
    0: 2511500, 2: 2590600, 4: 2672200, 6: 2756400, 8: 2843200,
    10: 2932800, 12: 3025200, 14: 3120500, 16: 3218800, 18: 3320200,
    20: 3424700, 22: 3532600, 24: 3643900, 26: 3758700, 28: 3877100,
    30: 3999200, 32: 4189900
  },
  'VII': {
    0: 2647200, 2: 2730500, 4: 2816500, 6: 2905200, 8: 2996700,
    10: 3091100, 12: 3188500, 14: 3288900, 16: 3392500, 18: 3499400,
    20: 3609600, 22: 3723300, 24: 3840600, 26: 3961600, 28: 4086400,
    30: 4215100, 32: 4347900
  },
  'IX': {
    0: 3203600, 2: 3304500, 4: 3408600, 6: 3515900, 8: 3626700,
    10: 3740900, 12: 3858700, 14: 3980300, 16: 4105700, 18: 4235000,
    20: 4368400, 22: 4506000, 24: 4647900, 26: 4794300, 28: 4945300,
    30: 5101100, 32: 5261500
  },
  'X': {
    0: 3339100, 2: 3444200, 4: 3552700, 6: 3664600, 8: 3780000,
    10: 3899100, 12: 4021900, 14: 4148600, 16: 4279300, 18: 4414100,
    20: 4553200, 22: 4696600, 24: 4844500, 26: 4997100, 28: 5154500,
    30: 5316900, 32: 5484400
  }
};

// ==========================================
// 2. TABEL GAJI PP NOMOR 15 TAHUN 2019
// ==========================================
export const TABEL_GAJI_PP15_2019 = {
  // GOLONGAN I (Juru)
  'I/A': {
    0: 1560800, 2: 1610000, 4: 1660700, 6: 1713000, 8: 1766900,
    10: 1822600, 12: 1880000, 14: 1939200, 16: 2000300, 18: 2063300,
    20: 2128300, 22: 2195300, 24: 2264400, 26: 2335800
  },
  'I/B': {
    3: 1704500, 4: 1758200, 6: 1813500, 8: 1870600, 10: 1929500,
    12: 1990300, 14: 2053000, 16: 2117700, 18: 2184400, 20: 2253200,
    22: 2324200, 24: 2397400, 26: 2472900
  },
  'I/C': {
    3: 1776600, 4: 1832500, 6: 1890200, 8: 1949800, 10: 2011200,
    12: 2074500, 14: 2139900, 16: 2207300, 18: 2276800, 20: 2348500,
    22: 2422500, 24: 2498800, 26: 2577500
  },
  'I/D': {
    3: 1851800, 4: 1910100, 6: 1970200, 8: 2032300, 10: 2096300,
    12: 2162300, 14: 2230400, 16: 2300700, 18: 2373100, 20: 2447900,
    22: 2525000, 24: 2604500, 26: 2686500
  },

  // GOLONGAN II (Pengatur)
  'II/A': {
    0: 2022200, 2: 2086400, 4: 2152100, 6: 2219900, 8: 2289800,
    10: 2361900, 12: 2436300, 14: 2513000, 16: 2592200, 18: 2673800,
    20: 2758000, 22: 2844900, 24: 2934500, 26: 3026900, 28: 3122200,
    30: 3220500, 32: 3322000, 33: 3373600
  },
  'II/B': {
    0: 2208400, 2: 2243200, 4: 2313800, 6: 2386700, 8: 2461900,
    10: 2539400, 12: 2619400, 14: 2701900, 16: 2787000, 18: 2874800,
    20: 2965300, 22: 3058700, 24: 3155100, 26: 3254400, 28: 3356900,
    30: 3462600, 32: 3516300
  },
  'II/C': {
    0: 2301800, 2: 2338100, 4: 2411700, 6: 2487600, 8: 2566000,
    10: 2646800, 12: 2730200, 14: 2816200, 16: 2904900, 18: 2996400,
    20: 3090800, 22: 3188100, 24: 3288500, 26: 3392100, 28: 3498900,
    30: 3609100, 32: 3665000
  },
  'II/D': {
    0: 2399200, 2: 2437100, 4: 2513900, 6: 2593000, 8: 2674700,
    10: 2758900, 12: 2845800, 14: 2935500, 16: 3027900, 18: 3123300,
    20: 3221700, 22: 3323200, 24: 3427800, 26: 3535800, 28: 3647200,
    30: 3762100, 32: 3820000
  },

  // GOLONGAN III (Penata)
  'III/A': {
    0: 2579400, 2: 2660700, 4: 2744500, 6: 2830900, 8: 2920100,
    10: 3012000, 12: 3106900, 14: 3204800, 16: 3305800, 18: 3409900,
    20: 3517300, 22: 3628100, 24: 3742400, 26: 3860300, 28: 3981900,
    30: 4107300, 32: 4236400
  },
  'III/B': {
    0: 2688500, 2: 2773200, 4: 2860500, 6: 2950600, 8: 3043600,
    10: 3139400, 12: 3238300, 14: 3340300, 16: 3445500, 18: 3554100,
    20: 3666000, 22: 3781500, 24: 3900600, 26: 4023500, 28: 4150200,
    30: 4280900, 32: 4415600
  },
  'III/C': {
    0: 2802300, 2: 2890500, 4: 2981600, 6: 3075600, 8: 3172500,
    10: 3272400, 12: 3375500, 14: 3481800, 16: 3591400, 18: 3704600,
    20: 3821200, 22: 3941600, 24: 4065800, 26: 4193800, 28: 4325900,
    30: 4462100, 32: 4602400
  },
  'III/D': {
    0: 2920800, 2: 3012800, 4: 3107700, 6: 3205600, 8: 3306600,
    10: 3410700, 12: 3518200, 14: 3629000, 16: 3743300, 18: 3861200,
    20: 3982800, 22: 4108300, 24: 4237700, 26: 4371100, 28: 4508800,
    30: 4650800, 32: 4797000
  },

  // GOLONGAN IV (Pembina)
  'IV/A': {
    0: 3044300, 2: 3140200, 4: 3239100, 6: 3341100, 8: 3446400,
    10: 3555000, 12: 3666900, 14: 3782400, 16: 3901600, 18: 4024500,
    20: 4151200, 22: 4282000, 24: 4416900, 26: 4556000, 28: 4699500,
    30: 4847500, 32: 5000000
  },
  'IV/B': {
    0: 3173100, 2: 3273000, 4: 3376100, 6: 3482500, 8: 3592200,
    10: 3705300, 12: 3822100, 14: 3942500, 16: 4066600, 18: 4194700,
    20: 4326900, 22: 4463100, 24: 4603700, 26: 4748700, 28: 4898300,
    30: 5052500, 32: 5211500
  },
  'IV/C': {
    0: 3307300, 2: 3411500, 4: 3518900, 6: 3629800, 8: 3744100,
    10: 3862000, 12: 3983700, 14: 4109100, 16: 4238600, 18: 4372100,
    20: 4509800, 22: 4651800, 24: 4798300, 26: 4949500, 28: 5105300,
    30: 5266200, 32: 5431900
  },
  'IV/D': {
    0: 3447200, 2: 3555800, 4: 3667800, 6: 3783300, 8: 3902500,
    10: 4025400, 12: 4152200, 14: 4283000, 16: 4418000, 18: 4557100,
    20: 4700700, 22: 4848700, 24: 5001500, 26: 5159000, 28: 5321500,
    30: 5489100, 32: 5661700
  },
  'IV/E': {
    0: 3593100, 2: 3706300, 4: 3823000, 6: 3943400, 8: 4067600,
    10: 4195700, 12: 4327900, 14: 4464200, 16: 4604800, 18: 4749800,
    20: 4899500, 22: 5053700, 24: 5212900, 26: 5377200, 28: 5546500,
    30: 5721200, 32: 5901200
  },

  // PPPK (Perpres No. 98 Tahun 2020)
  'V': {
    0: 2325600, 2: 2398900, 4: 2474400, 6: 2552300, 8: 2632700,
    10: 2715600, 12: 2801100, 14: 2889300, 16: 2980300, 18: 3074200,
    20: 3171000, 22: 3270900, 24: 3373900, 26: 3480200, 28: 3589800,
    30: 3702800, 32: 3879700
  },
  'VII': {
    0: 2451100, 2: 2528300, 4: 2607900, 6: 2690000, 8: 2774700,
    10: 2862100, 12: 2952200, 14: 3045200, 16: 3141100, 18: 3240000,
    20: 3342000, 22: 3447200, 24: 3555800, 26: 3667800, 28: 3783300,
    30: 3902500, 32: 4025400
  },
  'IX': {
    0: 2966500, 2: 3059800, 4: 3156200, 6: 3255600, 8: 3358100,
    10: 3463900, 12: 3573000, 14: 3685500, 16: 3801600, 18: 3921300,
    20: 4044800, 22: 4172200, 24: 4303600, 26: 4439100, 28: 4578900,
    30: 4723100, 32: 4872000
  },
  'X': {
    0: 3091900, 2: 3189200, 4: 3289600, 6: 3393200, 8: 3500000,
    10: 3610200, 12: 3724000, 14: 3841300, 16: 3962300, 18: 4087100,
    20: 4215800, 22: 4348600, 24: 4485500, 26: 4626800, 28: 4772500,
    30: 4922800, 32: 5077900
  }
};

// ==========================================
// 3. METADATA ATURAN PENGGAJIAN RESMI
// ==========================================
export const DAFTAR_ATURAN_GAJI = [
  {
    id: 'pp-5-2024',
    nama: 'Peraturan Pemerintah Nomor 5 Tahun 2024',
    namaSingkat: 'PP No. 5 Tahun 2024',
    nomorPp: 'Nomor 5 Tahun 2024',
    tahun: 2024,
    tmtBerlaku: '1 Januari 2024',
    status: 'Aktif (Standar Resmi Berlaku)',
    isAktifDefault: true,
    persentaseKenaikan: '+8% Penyesuaian',
    deskripsi: 'Perubahan Kesembilan Belas atas Peraturan Pemerintah Nomor 7 Tahun 1977 tentang Peraturan Gaji Pegawai Negeri Sipil. Kenaikan gaji pokok PNS rata-rata 8% terhitung mulai 1 Januari 2024.',
    dasarHukumSk: 'Peraturan Pemerintah RI Nomor 5 Tahun 2024',
    aturanPppk: 'Peraturan Presiden RI Nomor 11 Tahun 2024',
    tabel: TABEL_GAJI_PP5_2024,
    badgeColor: 'emerald'
  },
  {
    id: 'pp-15-2019',
    nama: 'Peraturan Pemerintah Nomor 15 Tahun 2019',
    namaSingkat: 'PP No. 15 Tahun 2019',
    nomorPp: 'Nomor 15 Tahun 2019',
    tahun: 2019,
    tmtBerlaku: '1 Januari 2019 s.d. 31 Desember 2023',
    status: 'Historis (Arsip Acuan)',
    isAktifDefault: false,
    persentaseKenaikan: 'Standar 2019',
    deskripsi: 'Perubahan Kedelapan Belas atas Peraturan Pemerintah Nomor 7 Tahun 1977 tentang Peraturan Gaji Pegawai Negeri Sipil. Acuan besaran gaji pokok PNS periode 2019 hingga 2023.',
    dasarHukumSk: 'Peraturan Pemerintah RI Nomor 15 Tahun 2019',
    aturanPppk: 'Peraturan Presiden RI Nomor 98 Tahun 2020',
    tabel: TABEL_GAJI_PP15_2019,
    badgeColor: 'amber'
  }
];

/**
 * Normalisasi format string golongan:
 * Contoh: "IV/b", "iv/b", "IV/B", "Pembina (IV/b)" -> "IV/B"
 */
export function normalizeGolonganKey(golonganStr) {
  if (!golonganStr) return 'III/A';
  const clean = String(golonganStr).trim().toUpperCase();

  // Cek golongan PPPK: IX, X, VII, V
  if (clean === 'IX' || clean.includes('(GOLONGAN IX)') || clean.includes('GOLONGAN IX')) return 'IX';
  if (clean === 'X' || clean.includes('(GOLONGAN X)') || clean.includes('GOLONGAN X')) return 'X';
  if (clean === 'VII' || clean.includes('(GOLONGAN VII)') || clean.includes('GOLONGAN VII')) return 'VII';
  if (clean === 'V' || clean.includes('(GOLONGAN V)') || clean.includes('GOLONGAN V')) return 'V';

  // Cek format PNS: I/A s/d IV/E
  const match = clean.match(/(IV|III|II|I)\s*\/\s*([A-E])/i);
  if (match) {
    return `${match[1].toUpperCase()}/${match[2].toUpperCase()}`;
  }

  return clean;
}

/**
 * Dapatkan daftar aturan kustom yang tersimpan di localStorage
 */
export function getStoredCustomAturan() {
  try {
    const raw = localStorage.getItem('klikapeg_custom_aturan_gaji');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) { }
  return [];
}

/**
 * Simpan atau perbarui aturan kustom ke localStorage
 */
export function saveCustomAturan(newAturan) {
  const current = getStoredCustomAturan();
  const existsIdx = current.findIndex(a => a.id === newAturan.id);
  let updated;
  if (existsIdx >= 0) {
    updated = current.map((a, i) => i === existsIdx ? newAturan : a);
  } else {
    updated = [...current, newAturan];
  }
  try {
    localStorage.setItem('klikapeg_custom_aturan_gaji', JSON.stringify(updated));
  } catch (e) { }
  return updated;
}

/**
 * Hapus aturan kustom dari localStorage
 */
export function deleteCustomAturan(aturanId) {
  const current = getStoredCustomAturan();
  const updated = current.filter(a => a.id !== aturanId);
  try {
    localStorage.setItem('klikapeg_custom_aturan_gaji', JSON.stringify(updated));
  } catch (e) { }
  return updated;
}

/**
 * Dapatkan seluruh aturan (bawaan + kustom)
 */
export function getAllAturanGaji() {
  return [...DAFTAR_ATURAN_GAJI, ...getStoredCustomAturan()];
}

/**
 * Generator tabel gaji baru dengan persentase penyesuaian dari tabel acuan
 * Contoh: Kenaikan 5% atau 8% dibulatkan ke ratusan terdekat
 */
export function generateTableByPercentage(baseTable, percentage) {
  const multiplier = 1 + (Number(percentage) || 0) / 100;
  const newTable = {};
  for (const gol of Object.keys(baseTable)) {
    newTable[gol] = {};
    for (const mkg of Object.keys(baseTable[gol])) {
      const oldVal = baseTable[gol][mkg];
      // Bulatkan ke ratusan rupiah terdekat sesuai kaidah pemerintah
      newTable[gol][mkg] = Math.round((oldVal * multiplier) / 100) * 100;
    }
  }
  return newTable;
}

/**
 * Dapatkan objek aturan berdasarkan ID
 */
export function getAturanById(aturanId) {
  const all = getAllAturanGaji();
  return all.find(a => a.id === aturanId) || DAFTAR_ATURAN_GAJI[0];
}

/**
 * Lookup gaji pokok dari tabel tertentu
 */
export function getGajiFromTable(table, golongan, mkgTahun) {
  if (!table) return 3000000;
  const golKey = normalizeGolonganKey(golongan);
  const golTable = table[golKey];

  if (!golTable) {
    return 3000000;
  }

  const mkg = Math.max(0, parseInt(mkgTahun, 10) || 0);

  // Jika exact match ada di tabel
  if (golTable[mkg] !== undefined) {
    return golTable[mkg];
  }

  // Cari key MKG terdekat di bawah atau sama dengan mkg
  const keys = Object.keys(golTable).map(Number).sort((a, b) => a - b);
  const minKey = keys[0];
  const maxKey = keys[keys.length - 1];

  if (mkg <= minKey) {
    return golTable[minKey];
  }
  if (mkg >= maxKey) {
    return golTable[maxKey];
  }

  let matchedKey = minKey;
  for (const k of keys) {
    if (k <= mkg) {
      matchedKey = k;
    } else {
      break;
    }
  }

  return golTable[matchedKey] || golTable[minKey];
}

/**
 * Cari Gaji Pokok Berdasarkan Aturan Penggajian Tertentu
 *
 * @param {string} aturanId - ID aturan (misal: 'pp-5-2024' atau 'pp-15-2019')
 * @param {string} golongan - Golongan ruang (misal: "IV/b", "III/a", "IX", "V")
 * @param {number} mkgTahun - Masa kerja golongan dalam tahun
 * @returns {number} Nominal gaji pokok dalam Rupiah
 */
export function getGajiByAturan(aturanId, golongan, mkgTahun) {
  const aturan = getAturanById(aturanId);
  return getGajiFromTable(aturan.tabel, golongan, mkgTahun);
}

/**
 * Wrapper default untuk PP No. 5 Tahun 2024
 */
export function getGajiPp5_2024(golongan, mkgTahun) {
  return getGajiByAturan('pp-5-2024', golongan, mkgTahun);
}

/**
 * Otomasi perhitungan TMT KGB Berikutnya (+2 Tahun dari TMT saat ini)
 *
 * @param {string} tmtStr - Tanggal dalam format DD-MM-YYYY (Contoh: "01-03-2026")
 * @returns {string} Tanggal berikutnya +2 tahun (Contoh: "01-03-2028")
 */
export function hitungTmtBerikutnya(tmtStr) {
  if (!tmtStr || typeof tmtStr !== 'string') return '01-11-2028';
  const parts = tmtStr.trim().split('-');
  if (parts.length === 3) {
    const day = parts[0];
    const month = parts[1];
    const yr = parseInt(parts[2], 10);
    if (!isNaN(yr)) {
      return `${day}-${month}-${yr + 2}`;
    }
  }
  return tmtStr;
}
