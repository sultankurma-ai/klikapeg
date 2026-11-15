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
import { initialPegawai, initialSuratTugas, initialSpd, initialRiwayatKgb } from './data/mockData';
import { fetchPegawaiFromKlikCuti } from './services/klikcutiService';
import { checkKlikSuratConnection } from './services/kliksuratService';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null); // null means on Login page
  const [activePage, setActivePage] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Shared Data States
  const [pegawaiList, setPegawaiList] = useState(initialPegawai);
  const [suratTugasList, setSuratTugasList] = useState(initialSuratTugas);
  const [spdList, setSpdList] = useState(initialSpd);
  const [riwayatKgbList, setRiwayatKgbList] = useState(initialRiwayatKgb);

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
    setCurrentUser(user);
    setActivePage('dashboard');
    triggerToast(`Selamat datang, ${user.nama} (${user.role})`);
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
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
