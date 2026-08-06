import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ReportForm } from './components/ReportForm';
import { ReportHistory } from './components/ReportHistory';
import { DashboardView } from './components/DashboardView';
import { UserManagement } from './components/UserManagement';
import { AuthModal } from './components/AuthModal';
import { ShieldCheck, Database, CheckCircle2 } from 'lucide-react';

function AppContent() {
  const [currentTab, setCurrentTab] = useState<'nuevo' | 'historial' | 'dashboard' | 'usuarios'>('nuevo');
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-[#F2EDC9] text-[#3E3933] flex flex-col font-sans selection:bg-[#BCB703] selection:text-[#3E3933]">
      
      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}

      {/* Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        openAuthModal={() => setShowAuthModal(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === 'nuevo' && (
          <ReportForm onSuccessSave={() => setCurrentTab('historial')} />
        )}

        {currentTab === 'historial' && (
          <ReportHistory />
        )}

        {currentTab === 'dashboard' && (
          <DashboardView />
        )}

        {currentTab === 'usuarios' && (
          <UserManagement />
        )}
      </main>

      {/* Corporate Footer */}
      <footer className="bg-[#676057] text-[#F2EDC9] border-t border-[#3E3933] py-8 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-[#BCB703] text-[#3E3933] flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <p className="font-heading font-bold text-[#F2EDC9]">
                EQUIPO SEGURO PEHUÉN LTDA.
              </p>
              <p className="text-[11px] text-[#D1CB9E]">
                Plataforma de Gestión de Cultura y Seguridad en Terreno
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[#D1CB9E] text-[11px]">
            <span className="flex items-center space-x-1 text-[#BCB703] font-bold">
              <Database className="w-3 h-3" />
              <span>Firebase Firestore Sync</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3 text-[#BCB703]" />
              <span>PDF & CSV Engine</span>
            </span>
            <span>•</span>
            <span>v2.5.0 (Pehuén Release)</span>
          </div>

          <div className="text-right text-[11px] text-[#D1CB9E]">
            © {new Date().getFullYear()} Equipo Seguro Pehuén Ltda. Todos los derechos reservados.
          </div>

        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
