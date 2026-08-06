import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ReportForm } from './components/ReportForm';
import { ReportHistory } from './components/ReportHistory';
import { DashboardView } from './components/DashboardView';
import { UserManagement } from './components/UserManagement';
import { AuthModal } from './components/AuthModal';
import { ShieldCheck, Database, CheckCircle2, Lock, Mail, User as UserIcon, ArrowRight, Loader2 } from 'lucide-react';
import { UserRole } from './types';

function LoginScreen() {
  const { login, registerUser, loginWithGoogle } = useAuth();
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [role, setRole] = useState<UserRole>('SUPERVISOR');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await registerUser(email, password, name.toUpperCase(), role);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Error durante la autenticación.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Error al conectar con Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 bg-[#FAF8EA] border border-[#D1CB9E] rounded-3xl shadow-xl overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="bg-[#676057] text-[#F2EDC9] p-6 border-b border-[#3E3933] flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-[#BCB703] text-[#3E3933] flex items-center justify-center font-bold">
          <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
        </div>
        <div>
          <h2 className="font-heading font-bold text-lg text-[#F2EDC9]">
            {isRegister ? 'Crear Cuenta Corporativa' : 'Acceso a Plataforma'}
          </h2>
          <p className="text-xs text-[#D1CB9E]">
            Equipo Seguro Pehuén Ltda.
          </p>
        </div>
      </div>

      {/* Form Body */}
      <div className="p-6 space-y-5">
        <p className="text-xs text-[#676057] text-center font-medium">
          Inicia sesión con tu cuenta corporativa para ingresar reportes y gestionar la seguridad en terreno.
        </p>

        {/* Google Auth Button */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={loading}
          className="w-full bg-white hover:bg-[#FAF8EA] text-[#3E3933] font-bold text-xs py-3 px-4 rounded-xl border border-[#D1CB9E] shadow-sm hover:shadow transition-all flex items-center justify-center space-x-3 cursor-pointer"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>Continuar con Google</span>
        </button>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-[#D1CB9E]"></div>
          <span className="flex-shrink mx-3 text-[10px] uppercase text-[#80776D] font-bold">o Correo / Contraseña</span>
          <div className="flex-grow border-t border-[#D1CB9E]"></div>
        </div>

        {error && (
          <div className="p-3 bg-[#D37608]/10 border border-[#D37608]/40 text-[#A85A02] text-xs font-bold rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#676057]">Nombre de Evaluador (MAYÚSCULAS)</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-[#80776D] absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value.toUpperCase())}
                  placeholder="EJ. CARLOS MORALES"
                  className="w-full bg-[#FAF8EA] border border-[#D1CB9E] rounded-xl pl-9 pr-3 py-2 text-xs text-[#3E3933] font-bold uppercase focus:ring-2 focus:ring-[#BCB703]"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#676057]">Correo Electrónico</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#80776D] absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@pehuen.cl"
                className="w-full bg-[#FAF8EA] border border-[#D1CB9E] rounded-xl pl-9 pr-3 py-2 text-xs text-[#3E3933] font-medium focus:ring-2 focus:ring-[#BCB703]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#676057]">Contraseña</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#80776D] absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#FAF8EA] border border-[#D1CB9E] rounded-xl pl-9 pr-3 py-2 text-xs text-[#3E3933] font-medium focus:ring-2 focus:ring-[#BCB703]"
              />
            </div>
          </div>

          {isRegister && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#676057]">Rol Inicial</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full bg-[#FAF8EA] border border-[#D1CB9E] text-xs text-[#3E3933] font-bold rounded-xl px-3 py-2"
              >
                <option value="SUPERVISOR">SUPERVISOR</option>
                <option value="USUARIO">USUARIO</option>
                <option value="ADMINISTRADOR">ADMINISTRADOR</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#676057] hover:bg-[#3E3933] text-[#F2EDC9] font-heading font-bold text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#BCB703]" />
            ) : (
              <>
                <span>{isRegister ? 'REGISTRAR CUENTA' : 'INGRESAR'}</span>
                <ArrowRight className="w-4 h-4 text-[#BCB703]" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs font-bold text-[#676057] hover:text-[#8A8602] transition-colors cursor-pointer"
          >
            {isRegister ? '¿Ya tienes cuenta? Inicia Sesión' : '¿No tienes cuenta? Regístrate aquí'}
          </button>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const { user, loading } = useAuth();
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
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#8A8602]" />
            <p className="text-xs font-bold text-[#676057]">Cargando sesión corporativa...</p>
          </div>
        ) : !user ? (
          <LoginScreen />
        ) : (
          <>
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
          </>
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

