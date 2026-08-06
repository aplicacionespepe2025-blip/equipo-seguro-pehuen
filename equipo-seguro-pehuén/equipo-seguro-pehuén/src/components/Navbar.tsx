import React, { useState, useEffect } from 'react';
import { ShieldCheck, FileText, History, BarChart3, Users, LogOut, User, Lock, Sparkles, Download, Smartphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface NavbarProps {
  currentTab: 'nuevo' | 'historial' | 'dashboard' | 'usuarios';
  setCurrentTab: (tab: 'nuevo' | 'historial' | 'dashboard' | 'usuarios') => void;
  openAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, openAuthModal }) => {
  const { user, logout, switchRoleQuick, quickDemoLogin } = useAuth();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPwaModal, setShowPwaModal] = useState<boolean>(false);

  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('Usuario instaló la app');
        }
        setDeferredPrompt(null);
      });
    } else {
      setShowPwaModal(true);
    }
  };

  const getRoleBadgeColor = (role?: UserRole) => {
    switch (role) {
      case 'ADMINISTRADOR':
        return 'bg-[#BCB703] text-[#3E3933] border-[#8A8602] font-bold';
      case 'SUPERVISOR':
        return 'bg-[#676057] text-[#F2EDC9] border-[#3E3933] font-bold';
      case 'USUARIO':
        return 'bg-[#FAF8EA] text-[#3E3933] border-[#D1CB9E] font-bold';
      default:
        return 'bg-[#676057] text-[#F2EDC9]';
    }
  };

  return (
    <header className="bg-[#676057] text-[#F2EDC9] border-b border-[#3E3933] sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Company Name */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentTab('historial')}>
            <div className="w-10 h-10 rounded-xl bg-[#BCB703] text-[#3E3933] flex items-center justify-center font-bold shadow-md">
              <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-heading font-bold text-lg text-[#F2EDC9] tracking-tight">
                  EQUIPO SEGURO PEHUÉN
                </span>
                <span className="text-[10px] font-bold bg-[#BCB703] text-[#3E3933] px-1.5 py-0.5 rounded">
                  LTDA.
                </span>
              </div>
              <p className="text-xs text-[#D1CB9E] hidden sm:block">
                Gestión de Cultura y Seguridad en Terreno
              </p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden md:flex items-center space-x-2">
            <button
              onClick={() => setCurrentTab('nuevo')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentTab === 'nuevo'
                  ? 'bg-[#3E3933] text-[#BCB703] border border-[#80776D] shadow-inner'
                  : 'text-[#F2EDC9] hover:bg-[#3E3933]/60'
              }`}
            >
              <FileText className="w-4 h-4 text-[#BCB703]" />
              <span>Nuevo Reporte</span>
            </button>

            <button
              onClick={() => setCurrentTab('historial')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentTab === 'historial'
                  ? 'bg-[#3E3933] text-[#BCB703] border border-[#80776D] shadow-inner'
                  : 'text-[#F2EDC9] hover:bg-[#3E3933]/60'
              }`}
            >
              <History className="w-4 h-4 text-[#BCB703]" />
              <span>Todos los Reportes</span>
              <span className="bg-[#BCB703] text-[#3E3933] text-[10px] px-2 py-0.5 rounded-full font-bold">
                Histórico
              </span>
            </button>

            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentTab === 'dashboard'
                  ? 'bg-[#3E3933] text-[#BCB703] border border-[#80776D] shadow-inner'
                  : 'text-[#F2EDC9] hover:bg-[#3E3933]/60'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-[#BCB703]" />
              <span>Dashboard Cultura</span>
            </button>

            {user?.role === 'ADMINISTRADOR' && (
              <button
                onClick={() => setCurrentTab('usuarios')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currentTab === 'usuarios'
                    ? 'bg-[#3E3933] text-[#BCB703] border border-[#80776D] shadow-inner'
                    : 'text-[#F2EDC9] hover:bg-[#3E3933]/60'
                }`}
              >
                <Users className="w-4 h-4 text-[#BCB703]" />
                <span>Usuarios</span>
              </button>
            )}
          </nav>

          {/* User profile & quick actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Botón de Instalación PWA */}
            <button
              onClick={handleInstallClick}
              title="Instalar Aplicación en Teléfono o PC"
              className="flex items-center space-x-1.5 bg-[#3E3933] hover:bg-[#282420] text-[#BCB703] border border-[#BCB703]/40 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-[#BCB703]" />
              <span className="hidden sm:inline">Instalar App</span>
            </button>

            {user ? (
              <div className="flex items-center space-x-2 bg-[#3E3933] border border-[#80776D] p-1.5 rounded-xl">
                <div className="hidden lg:block text-right px-2">
                  <div className="text-xs font-bold text-[#F2EDC9] tracking-wide truncate max-w-[140px]">
                    {user.displayName}
                  </div>
                  <div className="text-[10px] text-[#D1CB9E]">{user.email}</div>
                </div>

                {/* Badge de Rol Interactivo / Selector de Prueba */}
                <div className="relative group">
                  <span className={`text-[11px] px-2.5 py-1 rounded-lg border ${getRoleBadgeColor(user.role)} flex items-center space-x-1 cursor-pointer`}>
                    <Lock className="w-3 h-3 text-[#3E3933]" />
                    <span>{user.role}</span>
                  </span>

                  {/* Dropdown flotante de cambio rápido de rol para testing */}
                  <div className="absolute right-0 top-full mt-2 w-48 bg-[#3E3933] border border-[#80776D] rounded-xl shadow-2xl p-2 hidden group-hover:block z-50">
                    <p className="text-[10px] font-bold text-[#D1CB9E] px-2 py-1 uppercase tracking-wider">
                      Cambiar Rol (Modo Demo)
                    </p>
                    <button
                      onClick={() => switchRoleQuick('ADMINISTRADOR')}
                      className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-bold ${
                        user.role === 'ADMINISTRADOR' ? 'bg-[#BCB703] text-[#3E3933]' : 'text-[#F2EDC9] hover:bg-[#676057]'
                      }`}
                    >
                      👑 ADMINISTRADOR
                    </button>
                    <button
                      onClick={() => switchRoleQuick('SUPERVISOR')}
                      className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-bold ${
                        user.role === 'SUPERVISOR' ? 'bg-[#BCB703] text-[#3E3933]' : 'text-[#F2EDC9] hover:bg-[#676057]'
                      }`}
                    >
                      🛡️ SUPERVISOR
                    </button>
                    <button
                      onClick={() => switchRoleQuick('USUARIO')}
                      className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-bold ${
                        user.role === 'USUARIO' ? 'bg-[#BCB703] text-[#3E3933]' : 'text-[#F2EDC9] hover:bg-[#676057]'
                      }`}
                    >
                      👷 USUARIO
                    </button>
                  </div>
                </div>

                <button
                  onClick={logout}
                  title="Cerrar Sesión"
                  className="p-1.5 text-[#F2EDC9] hover:text-[#D37608] hover:bg-[#676057] rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => quickDemoLogin('SUPERVISOR')}
                  className="flex items-center space-x-1.5 bg-[#BCB703] hover:bg-[#8A8602] text-[#3E3933] px-3.5 py-2 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Modo Demo</span>
                </button>
                <button
                  onClick={openAuthModal}
                  className="flex items-center space-x-1.5 bg-[#3E3933] hover:bg-[#282420] text-[#F2EDC9] border border-[#80776D] px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Ingresar</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-[#3E3933] text-xs font-bold">
          <button
            onClick={() => setCurrentTab('nuevo')}
            className={`flex flex-col items-center p-1 ${currentTab === 'nuevo' ? 'text-[#BCB703]' : 'text-[#F2EDC9]'}`}
          >
            <FileText className="w-4 h-4" />
            <span>Nuevo</span>
          </button>
          <button
            onClick={() => setCurrentTab('historial')}
            className={`flex flex-col items-center p-1 ${currentTab === 'historial' ? 'text-[#BCB703]' : 'text-[#F2EDC9]'}`}
          >
            <History className="w-4 h-4" />
            <span>Histórico</span>
          </button>
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`flex flex-col items-center p-1 ${currentTab === 'dashboard' ? 'text-[#BCB703]' : 'text-[#F2EDC9]'}`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
          {user?.role === 'ADMINISTRADOR' && (
            <button
              onClick={() => setCurrentTab('usuarios')}
              className={`flex flex-col items-center p-1 ${currentTab === 'usuarios' ? 'text-[#BCB703]' : 'text-[#F2EDC9]'}`}
            >
              <Users className="w-4 h-4" />
              <span>Usuarios</span>
            </button>
          )}
        </div>
      </div>

      {/* Modal Instrucciones de Instalación en Teléfono (PWA) */}
      {showPwaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="bg-[#FAF8EA] border border-[#D1CB9E] rounded-2xl max-w-md w-full p-6 text-[#3E3933] shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-[#D1CB9E] pb-3">
              <div className="flex items-center space-x-2">
                <Smartphone className="w-5 h-5 text-[#8A8602]" />
                <h3 className="font-heading font-bold text-base text-[#3E3933] uppercase">
                  Instalar en Celular
                </h3>
              </div>
              <button
                onClick={() => setShowPwaModal(false)}
                className="text-[#676057] hover:text-[#3E3933] font-bold text-lg px-2 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#676057]">
              Puedes guardar esta aplicación directamente en la pantalla de inicio de tu teléfono inteligente para acceder rápido como una App nativa sin usar tienda de aplicaciones:
            </p>

            <div className="space-y-3 text-xs">
              <div className="bg-[#EFEAD0] p-3 rounded-xl border border-[#D1CB9E]">
                <p className="font-bold text-[#3E3933] mb-1">📱 Android (Google Chrome):</p>
                <ol className="list-decimal list-inside text-[#676057] space-y-1">
                  <li>Toca los <strong>tres puntos (⋮)</strong> en la esquina superior derecha de Chrome.</li>
                  <li>Selecciona <strong>"Añadir a la pantalla de inicio"</strong> o <strong>"Instalar aplicación"</strong>.</li>
                </ol>
              </div>

              <div className="bg-[#EFEAD0] p-3 rounded-xl border border-[#D1CB9E]">
                <p className="font-bold text-[#3E3933] mb-1">🍎 iPhone / iPad (Safari):</p>
                <ol className="list-decimal list-inside text-[#676057] space-y-1">
                  <li>Toca el botón <strong>Compartir (cuadrado con flecha hacia arriba)</strong> en la parte inferior.</li>
                  <li>Desplázate hacia abajo y selecciona <strong>"Agregar a inicio"</strong>.</li>
                </ol>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowPwaModal(false)}
                className="bg-[#3E3933] hover:bg-[#282420] text-[#F2EDC9] px-5 py-2 rounded-xl text-xs font-bold cursor-pointer"
              >
                ENTENDIDO
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
