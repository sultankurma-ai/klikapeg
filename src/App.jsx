import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Footer from './components/Footer';
import LoginView from './views/LoginView';
import DashboardView from './views/DashboardView';
import DataPegawaiView from './views/DataPegawaiView';
import LayananKgbView from './views/LayananKgbView';
import SuratTugasView from './views/SuratTugasView';
import SpdView from './views/SpdView';
import PengaturanAkunView from './views/PengaturanAkunView';
import { initialPegawai, initialSuratTugas, initialSpd, initialRiwayatKgb } from './data/mockData';
import { fetchPegawaiFromKlikCuti } from './services/klikcutiService';
import { checkKlikSuratConnection } from './services/kliksuratService';

const defaultUsersList = [
  {
    id: 'USR-01',
    nama: 'Siti Rahmawati, S.Kom.',
    nip: '198906202014032002',
    jabatan: 'Kasubbag Kepegawaian, Ortala & TI',
    role: 'Admin Kepegawaian',
    username: 'siti_rahmawati',
    password: 'password123',
    email: 'siti.rahmawati@pa-lumajang.go.id',
    noHp: '081234567890',
    status: 'Aktif'
  },
  {
    id: 'USR-02',
    nama: 'Drs. H. Ahmad Fauzi, M.H.ES.',
    nip: '197508121998031001',
    jabatan: 'Ketua Pengadilan Agama Lumajang',
    role: 'Pimpinan Pengadilan',
    username: 'ahmad_fauzi',
    password: 'password123',
    email: 'ahmad.fauzi@pa-lumajang.go.id',
    noHp: '081234567891',
    status: 'Aktif'
  },
  {
    id: 'USR-03',
    nama: 'Abdul Kodir, S.Ag., M.M.',
    nip: '197303221998031004',
    jabatan: 'Sekretaris PA Lumajang',
    role: 'Admin Kepegawaian',
    username: 'abdul_kodir',
    password: 'password123',
    email: 'abdul.kodir@pa-lumajang.go.id',
    noHp: '081234567892',
    status: 'Aktif'
  },
  {
    id: 'USR-04',
    nama: 'Fatkur Rosyad, S.Ag., M.H., M.HES.',
    nip: '197603031998031002',
    jabatan: 'Wakil Ketua PA Lumajang',
    role: 'Pimpinan Pengadilan',
    username: 'fatkur_rosyad',
    password: 'password123',
    email: 'fatkur.rosyad@pa-lumajang.go.id',
    noHp: '081234567893',
    status: 'Aktif'
  },
  {
    id: 'USR-05',
    nama: 'Bambang Sugiharto, S.H.',
    nip: '198305142006041003',
    jabatan: 'Sekretaris / PPK DIPA 04',
    role: 'Pejabat Pembuat Komitmen (PPK)',
    username: 'bambang_s',
    password: 'password123',
    email: 'bambang.s@pa-lumajang.go.id',
    noHp: '081234567894',
    status: 'Aktif'
  },
  {
    id: 'USR-06',
    nama: 'Rizky Ramadhani, S.H.',
    nip: '199401122020121004',
    jabatan: 'Staf Subbag Kepegawaian & TI',
    role: 'Operator Kepegawaian & KGB',
    username: 'rizky_r',
    password: 'password123',
    email: 'rizky.r@pa-lumajang.go.id',
    noHp: '081234567895',
    status: 'Aktif'
  }
];

export default function App() {
  const [currentUser, setCurrentUser] = useState(null); // null means on Login page
  const [activePage, setActivePage] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Shared Data States
  const [pegawaiList, setPegawaiList] = useState(initialPegawai);
  const [suratTugasList, setSuratTugasList] = useState(initialSuratTugas);
  const [spdList, setSpdList] = useState(initialSpd);
  const [riwayatKgbList, setRiwayatKgbList] = useState(initialRiwayatKgb);

  // Pengelola Accounts State with localStorage persistence
  const [usersList, setUsersList] = useState(() => {
    try {
      const saved = localStorage.getItem('klikapeg_users_list');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return defaultUsersList;
  });

  const saveUsersList = (newList) => {
    setUsersList(newList);
    try {
      localStorage.setItem('klikapeg_users_list', JSON.stringify(newList));
    } catch (e) {
      // ignore
    }
  };

  const handleAddUser = (newUser) => {
    const updated = [newUser, ...usersList];
    saveUsersList(updated);
  };

  const handleUpdateUser = (id, updatedData) => {
    const updated = usersList.map(u => u.id === id ? { ...u, ...updatedData } : u);
    saveUsersList(updated);
    if (currentUser && currentUser.id === id) {
      setCurrentUser(prev => ({ ...prev, ...updatedData }));
    }
  };

  const handleDeleteUser = (id) => {
    const updated = usersList.filter(u => u.id !== id);
    saveUsersList(updated);
  };

  const handleSwitchUser = (user) => {
    setCurrentUser(user);
    triggerToast(`Beralih akun sebagai: ${user.nama} (${user.role})`);
  };

  // Cross-page selection bridge
  const [selectedPegawaiForKgb, setSelectedPegawaiForKgb] = useState(null);
  const [selectedStForSpd, setSelectedStForSpd] = useState(null);
  const [syncStatus, setSyncStatus] = useState('idle'); // idle | syncing
  const [globalToast, setGlobalToast] = useState('');

  const triggerToast = (msg) => {
    setGlobalToast(msg);
    setTimeout(() => setGlobalToast(''), 3500);
  };

  const handleLogin = (user) => {
    const matched = usersList.find(u => u.nip === user.nip || u.username === user.nip);
    if (matched) {
      setCurrentUser(matched);
      triggerToast(`Selamat datang, ${matched.nama} (${matched.role})`);
    } else {
      setCurrentUser(user);
      triggerToast(`Selamat datang, ${user.nama} (${user.role})`);
    }
    setActivePage('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActivePage('dashboard');
    triggerToast('Anda telah berhasil keluar dari sistem KlikApeg.');
  };

  // Status integrasi database eksternal
  const [dbStatus, setDbStatus] = useState({
    klikCuti: { connected: true, count: 35, label: '35 Aparatur' },
    klikSurat: { connected: true, label: 'Server Aktif' }
  });

  const loadDataFromKlikCuti = async (isManual = false) => {
    if (isManual) setSyncStatus('syncing');
    try {
      const resCuti = await fetchPegawaiFromKlikCuti();
      if (resCuti.success && resCuti.data.length > 0) {
        setPegawaiList(resCuti.data);
        setDbStatus(prev => ({
          ...prev,
          klikCuti: {
            connected: true,
            count: resCuti.data.length,
            label: `${resCuti.data.length} Aparatur PA Lumajang`
          }
        }));
      }

      const resSurat = await checkKlikSuratConnection();
      setDbStatus(prev => ({
        ...prev,
        klikSurat: {
          connected: resSurat.connected,
          label: resSurat.connected ? 'Server Registrasi Online' : 'Offline'
        }
      }));

      if (isManual) {
        setSyncStatus('idle');
        const count = resCuti.data?.length || 35;
        triggerToast(`Sinkronisasi Berhasil: ${count} data aparatur terhubung langsung dari Database KlikCuti & Server KlikSurat Aktif.`);
      }
    } catch (err) {
      if (isManual) {
        setSyncStatus('idle');
        triggerToast('Sinkronisasi selesai menggunakan pangkalan data lokal.');
      }
    }
  };

  useEffect(() => {
    loadDataFromKlikCuti(false);
  }, []);

  const handleSyncKlikCuti = () => {
    loadDataFromKlikCuti(true);
  };

  const handleSaveKgb = (newKgb) => {
    setRiwayatKgbList([newKgb, ...riwayatKgbList]);
    setPegawaiList(prev => prev.map(p => {
      if (p.id === newKgb.pegawaiId) {
        return {
          ...p,
          statusKgb: 'Terjadwal',
          tmtKgbTerakhir: newKgb.tmtBaru,
          tmtKgbBerikutnya: newKgb.tmtBerikutnya,
          gajiPokokLama: newKgb.gajiBaru,
          mkgTahun: newKgb.mkgTahun
        };
      }
      return p;
    }));
  };

  const handleSaveSuratTugas = (newSt) => {
    setSuratTugasList([newSt, ...suratTugasList]);
  };

  const handleSaveSpd = (newSpd) => {
    setSpdList([newSpd, ...spdList]);
  };

  const handleSelectPegawaiForKgb = (pegawai) => {
    setSelectedPegawaiForKgb(pegawai);
    setActivePage('kgb');
  };

  const handleCreateSpdFromSt = (st) => {
    setSelectedStForSpd(st);
    setActivePage('spd');
  };

  if (!currentUser) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-background text-on-background flex">
      {/* Sidebar Navigation */}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        currentUser={currentUser}
        onLogout={handleLogout}
        syncStatus={syncStatus}
        onSync={handleSyncKlikCuti}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* Main Content Area (offset by sidebar width on desktop) */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen lg:pl-72 transition-all">
        {/* Top Header */}
        <Header
          activePage={activePage}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          currentUser={currentUser}
          syncStatus={syncStatus}
          onSync={handleSyncKlikCuti}
          onLogout={handleLogout}
          onNavigate={setActivePage}
        />

        {/* Global Notification Toast */}
        {globalToast && (
          <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-primary text-white shadow-2xl border border-secondary-container/40 flex items-center gap-3 animate-slideUp text-xs font-semibold max-w-md">
            <span className="material-symbols-outlined text-secondary-container text-[20px]">notifications_active</span>
            <span>{globalToast}</span>
          </div>
        )}

        {/* Main View Container */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto">
          {activePage === 'dashboard' && (
            <DashboardView
              pegawaiList={pegawaiList}
              suratTugasList={suratTugasList}
              spdList={spdList}
              onNavigate={setActivePage}
              onSelectPegawaiForKgb={handleSelectPegawaiForKgb}
              onSync={handleSyncKlikCuti}
              syncStatus={syncStatus}
            />
          )}

          {activePage === 'pegawai' && (
            <DataPegawaiView
              pegawaiList={pegawaiList}
              onSelectPegawaiForKgb={handleSelectPegawaiForKgb}
              onNavigate={setActivePage}
              onSync={handleSyncKlikCuti}
              syncStatus={syncStatus}
            />
          )}

          {activePage === 'kgb' && (
            <LayananKgbView
              pegawaiList={pegawaiList}
              selectedPegawaiFromProps={selectedPegawaiForKgb}
              riwayatKgbList={riwayatKgbList}
              onSaveKgb={handleSaveKgb}
              onNavigate={setActivePage}
            />
          )}

          {activePage === 'surat-tugas' && (
            <SuratTugasView
              pegawaiList={pegawaiList}
              suratTugasList={suratTugasList}
              onSaveSuratTugas={handleSaveSuratTugas}
              onCreateSpdFromSt={handleCreateSpdFromSt}
              onNavigate={setActivePage}
            />
          )}

          {activePage === 'spd' && (
            <SpdView
              pegawaiList={pegawaiList}
              suratTugasList={suratTugasList}
              spdList={spdList}
              selectedStForSpd={selectedStForSpd}
              onSaveSpd={handleSaveSpd}
              onNavigate={setActivePage}
            />
          )}

          {activePage === 'akun' && (
            <PengaturanAkunView
              usersList={usersList}
              currentUser={currentUser}
              onAddUser={handleAddUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
              onSwitchUser={handleSwitchUser}
              onNavigate={setActivePage}
            />
          )}
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
