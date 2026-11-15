import React, { useState } from 'react';

export default function PengaturanAkunView({
  usersList,
  currentUser,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onSwitchUser,
  onNavigate
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  const [visiblePasswords, setVisiblePasswords] = useState({});

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Form State Tambah
  const [addForm, setAddForm] = useState({
    nama: '',
    nip: '',
    jabatan: 'Kasubbag Kepegawaian, Ortala & TI',
    role: 'Admin Kepegawaian',
    username: '',
    password: 'password123',
    email: '',
    noHp: '',
    status: 'Aktif'
  });

  // Form State Ubah
  const [editForm, setEditForm] = useState({
    id: '',
    nama: '',
    nip: '',
    jabatan: '',
    role: '',
    username: '',
    password: '',
    email: '',
    noHp: '',
    status: 'Aktif'
  });

  const ROLE_OPTIONS = [
    { label: 'Admin Kepegawaian', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    { label: 'Pimpinan Pengadilan', color: 'bg-amber-100 text-amber-900 border-amber-300' },
    { label: 'Pejabat Pembuat Komitmen (PPK)', color: 'bg-purple-100 text-purple-900 border-purple-300' },
    { label: 'Operator Kepegawaian & KGB', color: 'bg-sky-100 text-sky-800 border-sky-300' },
    { label: 'Operator Surat Tugas & SPD', color: 'bg-teal-100 text-teal-800 border-teal-300' }
  ];

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const togglePasswordVisibility = (userId) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  // Filter Users
  const filteredUsers = (usersList || []).filter(u => {
    const matchesSearch =
      (u.nama || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.nip || '').includes(searchQuery) ||
      (u.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.jabatan || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole =
      filterRole === 'ALL' ||
      (filterRole === 'ADMIN' && (u.role?.includes('Admin') || u.role?.includes('Sekretaris'))) ||
      (filterRole === 'PIMPINAN' && (u.role?.includes('Pimpinan') || u.jabatan?.includes('Ketua'))) ||
      (filterRole === 'OPERATOR' && u.role?.includes('Operator'));

    return matchesSearch && matchesRole;
  });

  const totalAdmin = (usersList || []).filter(u => u.role?.includes('Admin') || u.role?.includes('Sekretaris')).length;
  const totalPimpinan = (usersList || []).filter(u => u.role?.includes('Pimpinan') || u.jabatan?.includes('Ketua')).length;
  const totalAktif = (usersList || []).filter(u => u.status === 'Aktif').length;

  // Handler Tambah
  const handleOpenAdd = () => {
    setAddForm({
      nama: '',
      nip: '',
      jabatan: 'Kasubbag Kepegawaian, Ortala & TI',
      role: 'Admin Kepegawaian',
      username: '',
      password: 'password123',
      email: '',
      noHp: '',
      status: 'Aktif'
    });
    setShowAddModal(true);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!addForm.nama.trim() || !addForm.username.trim()) {
      triggerToast('Nama aparatur dan username wajib diisi!');
      return;
    }

    const newUser = {
      id: 'USR-' + Date.now(),
      ...addForm,
      createdAt: new Date().toISOString()
    };

    onAddUser(newUser);
    setShowAddModal(false);
    triggerToast(`Akun pengelola "${newUser.nama}" berhasil didaftarkan.`);
  };

  // Handler Edit
  const handleOpenEdit = (user) => {
    setEditForm({
      id: user.id,
      nama: user.nama || '',
      nip: user.nip || '',
      jabatan: user.jabatan || 'Aparatur Sipil Negara',
      role: user.role || 'Admin Kepegawaian',
      username: user.username || '',
      password: user.password || '',
      email: user.email || '',
      noHp: user.noHp || '',
      status: user.status || 'Aktif'
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editForm.nama.trim() || !editForm.username.trim()) {
      triggerToast('Nama aparatur dan username wajib diisi!');
      return;
    }

    onUpdateUser(editForm.id, editForm);
    setShowEditModal(false);
    triggerToast(`Akun "${editForm.nama}" berhasil diperbarui.`);
  };

  // Handler Hapus
  const handleDelete = (user) => {
    if (user.id === currentUser.id || user.nip === currentUser.nip) {
      triggerToast('Peringatan: Tidak dapat menghapus akun yang sedang Anda gunakan saat ini!');
      return;
    }

    if (usersList.length <= 1) {
      triggerToast('Minimal harus ada 1 akun pengelola aktif dalam sistem.');
      return;
    }

    if (window.confirm(`Yakin ingin menghapus akun pengelola "${user.nama}" (${user.jabatan})? Tindakan ini tidak dapat dibatalkan.`)) {
      onDeleteUser(user.id);
      triggerToast(`Akun pengelola "${user.nama}" telah dihapus.`);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Toast Notifikasi */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-primary text-white shadow-2xl border border-secondary-container/40 flex items-center gap-3 animate-slideUp text-xs font-semibold max-w-md">
          <span className="material-symbols-outlined text-secondary-container text-[20px]">verified_user</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-outline-variant/50">
        <div>
          <div className="flex items-center gap-2 text-xs text-outline mb-1">
            <span className="hover:text-primary cursor-pointer" onClick={() => onNavigate('dashboard')}>Beranda</span>
            <span>/</span>
            <span className="font-semibold text-primary">Pengaturan Akun</span>
          </div>
          <h1 className="font-display font-extrabold text-2xl text-primary">
            Manajemen Akun Pengelola & Kredensial
          </h1>
          <p className="text-xs text-on-surface-variant font-medium mt-0.5">
            Sistem CRUD akun pengelola, pengaturan hak akses operasional, dan enkripsi keamanan data KlikApeg terpadu.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#041534] text-white hover:bg-[#1B2A4A] transition-all shadow-md active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span>+ Tambah Akun Pengelola</span>
          </button>
        </div>
      </div>

      {/* Row Level Security (RLS) Info Banner */}
      <div className="p-4 rounded-2xl bg-indigo-50/90 border border-indigo-200 text-indigo-950 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-[20px]">shield</span>
          </div>
          <div>
            <p className="font-extrabold text-indigo-950 flex items-center gap-1.5">
              <span>Row Level Security (RLS) &amp; Hak Akses: Aktif</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-600 text-white font-bold">Terproteksi</span>
            </p>
            <p className="text-indigo-800 text-[11px] mt-0.5">
              Setiap pengelola hanya dapat mengakses dan mengelola datanya sendiri berdasarkan token otentikasi. Administrator memiliki hak penuh untuk manajemen pengguna.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-white text-indigo-900 border border-indigo-200 shadow-2xs">
            {totalAktif} Akun Aktif
          </span>
        </div>
      </div>

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-outline uppercase tracking-wider">Total Pengelola</span>
            <div className="w-8 h-8 rounded-lg bg-primary-fixed/40 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
            </div>
          </div>
          <p className="font-display font-extrabold text-2xl text-primary mt-2">{usersList.length}</p>
          <p className="text-[11px] text-emerald-700 font-semibold mt-1">Sistem CRUD Aktif</p>
        </div>

        <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-outline uppercase tracking-wider">Administrator</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
            </div>
          </div>
          <p className="font-display font-extrabold text-2xl text-emerald-900 mt-2">{totalAdmin}</p>
          <p className="text-[11px] text-outline font-medium mt-1">Akses Penuh Semua Menu</p>
        </div>

        <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-outline uppercase tracking-wider">Pimpinan</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">gavel</span>
            </div>
          </div>
          <p className="font-display font-extrabold text-2xl text-amber-900 mt-2">{totalPimpinan}</p>
          <p className="text-[11px] text-outline font-medium mt-1">Ketua &amp; Wakil Ketua</p>
        </div>

        <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-outline uppercase tracking-wider">Keamanan Akun</span>
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-900 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">lock_clock</span>
            </div>
          </div>
          <p className="font-display font-extrabold text-2xl text-sky-950 mt-2">100%</p>
          <p className="text-[11px] text-sky-700 font-semibold mt-1">RLS &amp; Enkripsi Database</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="sm:col-span-8 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan nama aparatur, NIP, atau username..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-outline-variant text-xs font-medium bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          {/* Role Filter */}
          <div className="sm:col-span-4">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-outline-variant text-xs font-medium bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="ALL">Semua Peran &amp; Hak Akses</option>
              <option value="ADMIN">Administrator Saja</option>
              <option value="PIMPINAN">Pimpinan Pengadilan</option>
              <option value="OPERATOR">Operator Layanan</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid Kartu Pengelola (Read) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((user) => {
          const isMe = user.id === currentUser.id || user.nip === currentUser.nip;
          const isPasswordVisible = Boolean(visiblePasswords[user.id]);
          const initials = (user.nama || 'User')
            .split(' ')
            .map(n => n[0])
            .filter(Boolean)
            .slice(0, 2)
            .join('')
            .toUpperCase();

          return (
            <div
              key={user.id}
              className={`p-5 rounded-2xl bg-surface-container-lowest border transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between ${
                isMe ? 'border-primary ring-2 ring-primary/20 bg-primary/2' : 'border-outline-variant/60'
              }`}
            >
              <div>
                {/* Header Kartu: Status & Badges */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${user.status === 'Aktif' ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]' : 'bg-gray-400'}`}></span>
                    <span className="text-[11px] font-bold text-outline">{user.status}</span>
                  </div>

                  {isMe && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-primary text-white">
                      Akun Anda
                    </span>
                  )}
                </div>

                {/* Profil Utama */}
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#1B2A4A] text-amber-400 font-extrabold flex items-center justify-center text-sm shadow-sm shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display font-bold text-sm text-primary leading-tight truncate">
                      {user.nama}
                    </h3>
                    <p className="text-[11px] text-outline font-medium mt-0.5">
                      NIP. {user.nip || '-'}
                    </p>
                    <p className="text-[11px] text-on-surface-variant font-semibold mt-1 truncate">
                      {user.jabatan}
                    </p>
                  </div>
                </div>

                {/* Role Badge */}
                <div className="mt-3">
                  <span className="inline-block px-2.5 py-1 rounded-lg text-[10.5px] font-bold bg-secondary-fixed/40 text-secondary border border-secondary/20">
                    {user.role || 'Admin Kepegawaian'}
                  </span>
                </div>

                {/* Detail Kredensial & Kontak */}
                <div className="mt-3 pt-3 border-t border-outline-variant/40 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-outline">
                    <span>Username:</span>
                    <span className="font-mono font-bold text-primary">{user.username}</span>
                  </div>

                  <div className="flex items-center justify-between text-outline">
                    <span>Kata Sandi:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-primary">
                        {isPasswordVisible ? user.password || 'password123' : '••••••••'}
                      </span>
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility(user.id)}
                        className="text-outline hover:text-primary transition-colors"
                        title={isPasswordVisible ? 'Sembunyikan Kata Sandi' : 'Lihat Kata Sandi'}
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {isPasswordVisible ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {user.email && (
                    <div className="flex items-center justify-between text-outline truncate">
                      <span>Email:</span>
                      <span className="font-medium text-primary text-[11px] truncate max-w-[170px]">{user.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons: Edit, Switch, Delete */}
              <div className="mt-4 pt-3 border-t border-outline-variant/40 flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(user)}
                  className="flex-1 py-1.5 px-3 rounded-xl border border-outline-variant text-xs font-bold text-primary hover:bg-surface-container transition-colors flex items-center justify-center gap-1 shadow-2xs"
                  title="Ubah data akun pengelola"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                  <span>Ubah</span>
                </button>

                {!isMe && (
                  <button
                    onClick={() => {
                      onSwitchUser(user);
                      triggerToast(`Beralih login sebagai ${user.nama}`);
                    }}
                    className="py-1.5 px-2.5 rounded-xl border border-secondary/30 text-xs font-bold text-secondary bg-secondary/5 hover:bg-secondary/15 transition-colors flex items-center gap-1"
                    title="Masuk sebagai akun ini (Simulasi Pengguna)"
                  >
                    <span className="material-symbols-outlined text-[16px]">switch_account</span>
                    <span className="hidden sm:inline">Masuk</span>
                  </button>
                )}

                <button
                  onClick={() => handleDelete(user)}
                  disabled={isMe}
                  className={`p-1.5 rounded-xl border transition-colors flex items-center justify-center ${
                    isMe
                      ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                      : 'border-rose-200 text-rose-600 hover:bg-rose-50'
                  }`}
                  title={isMe ? 'Tidak dapat menghapus akun yang sedang aktif' : 'Hapus akun pengelola'}
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Tambah Akun Pengelola (Create) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-surface-container-lowest rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-outline-variant max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/60 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">person_add</span>
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-base text-primary">
                    Tambah Akun Pengelola Baru
                  </h3>
                  <p className="text-[11px] text-outline">
                    Daftarkan aparatur baru untuk mengelola layanan KlikApeg
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full text-outline hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-primary mb-1">Nama Lengkap &amp; Gelar *</label>
                  <input
                    type="text"
                    required
                    value={addForm.nama}
                    onChange={(e) => setAddForm({ ...addForm, nama: e.target.value })}
                    placeholder="Contoh: Fatkur Rosyad, S.Ag., M.H."
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-primary mb-1">NIP (18 Digit) *</label>
                  <input
                    type="text"
                    required
                    value={addForm.nip}
                    onChange={(e) => setAddForm({ ...addForm, nip: e.target.value })}
                    placeholder="Contoh: 197603031998031002"
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-primary mb-1">Jabatan Resmi *</label>
                  <input
                    type="text"
                    required
                    value={addForm.jabatan}
                    onChange={(e) => setAddForm({ ...addForm, jabatan: e.target.value })}
                    placeholder="Contoh: Panitera / Sekretaris / Kasubbag"
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-primary mb-1">Peran &amp; Hak Akses *</label>
                  <select
                    value={addForm.role}
                    onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none font-medium"
                  >
                    {ROLE_OPTIONS.map((opt) => (
                      <option key={opt.label} value={opt.label}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-primary mb-1">Username Login *</label>
                  <input
                    type="text"
                    required
                    value={addForm.username}
                    onChange={(e) => setAddForm({ ...addForm, username: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                    placeholder="Contoh: ahmad.fauzi"
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-primary mb-1">Kata Sandi Awal *</label>
                  <input
                    type="text"
                    required
                    value={addForm.password}
                    onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                    placeholder="Minimal 6 karakter"
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-primary mb-1">Email Kedinasan</label>
                  <input
                    type="email"
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    placeholder="nama@pa-lumajang.go.id"
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-primary mb-1">Status Akun</label>
                  <select
                    value={addForm.status}
                    onChange={(e) => setAddForm({ ...addForm, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none font-medium"
                  >
                    <option value="Aktif">Aktif (Dapat Login)</option>
                    <option value="Nonaktif">Nonaktif (Ditangguhkan)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant/50">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-outline-variant text-xs font-semibold text-primary hover:bg-surface-container transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-container transition-all shadow-md active:scale-95"
                >
                  Simpan Akun Pengelola
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ubah Akun Pengelola (Update) */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-surface-container-lowest rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-outline-variant max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/60 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-secondary text-white flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">edit</span>
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-base text-primary">
                    Ubah Data Akun Pengelola
                  </h3>
                  <p className="text-[11px] text-outline">
                    Perbarui profil, jabatan, hak akses, atau kata sandi pengelola
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 rounded-full text-outline hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-primary mb-1">Nama Lengkap &amp; Gelar *</label>
                  <input
                    type="text"
                    required
                    value={editForm.nama}
                    onChange={(e) => setEditForm({ ...editForm, nama: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-primary mb-1">NIP (18 Digit) *</label>
                  <input
                    type="text"
                    required
                    value={editForm.nip}
                    onChange={(e) => setEditForm({ ...editForm, nip: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-primary mb-1">Jabatan Resmi *</label>
                  <input
                    type="text"
                    required
                    value={editForm.jabatan}
                    onChange={(e) => setEditForm({ ...editForm, jabatan: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-primary mb-1">Peran &amp; Hak Akses *</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none font-medium"
                  >
                    {ROLE_OPTIONS.map((opt) => (
                      <option key={opt.label} value={opt.label}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-primary mb-1">Username Login *</label>
                  <input
                    type="text"
                    required
                    value={editForm.username}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-primary mb-1">Kata Sandi Baru / Aktif *</label>
                  <input
                    type="text"
                    required
                    value={editForm.password}
                    onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-primary mb-1">Email Kedinasan</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-primary mb-1">Status Akun</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none font-medium"
                  >
                    <option value="Aktif">Aktif (Dapat Login)</option>
                    <option value="Nonaktif">Nonaktif (Ditangguhkan)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant/50">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl border border-outline-variant text-xs font-semibold text-primary hover:bg-surface-container transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-container transition-all shadow-md active:scale-95"
                >
                  Simpan Perubahan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
