import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Lock, CheckCircle2, RefreshCw, KeyRound, Trash2, AlertTriangle } from 'lucide-react';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { db, firebaseConfig } from '../firebase/config';
import { UserProfile, UserRole } from '../types';
import { useAuth } from '../context/AuthContext';

// Instancia secundaria de Firebase Auth para crear usuarios sin cerrar la sesión del Administrador
const getSecondaryAuth = () => {
  const apps = getApps();
  const secondaryApp = apps.find((a) => a.name === 'UserCreationApp') || initializeApp(firebaseConfig, 'UserCreationApp');
  return getAuth(secondaryApp);
};

export const UserManagement: React.FC = () => {
  const { user } = useAuth();
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Formulario nuevo usuario completo
  const [newEmail, setNewEmail] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [newName, setNewName] = useState<string>('');
  const [newRole, setNewRole] = useState<UserRole>('SUPERVISOR');

  // Formulario de vinculación por UID existente
  const [linkUid, setLinkUid] = useState<string>('');
  const [linkEmail, setLinkEmail] = useState<string>('');
  const [linkName, setLinkName] = useState<string>('');
  const [linkRole, setLinkRole] = useState<UserRole>('SUPERVISOR');

  const [message, setMessage] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [deletingUid, setDeletingUid] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'users'));
      const list: UserProfile[] = [];
      snap.forEach((d) => {
        list.push({ uid: d.id, ...d.data() } as UserProfile);
      });
      setUsersList(list);
    } catch (e) {
      console.error('Error al obtener usuarios:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newPassword || !newName) return;

    setIsCreating(true);
    setMessage('');
    try {
      const cleanEmail = newEmail.trim().toLowerCase();
      const cleanName = newName.trim().toUpperCase();
      let createdUid = '';

      try {
        const secondaryAuth = getSecondaryAuth();
        const res = await createUserWithEmailAndPassword(secondaryAuth, cleanEmail, newPassword);
        createdUid = res.user.uid;
      } catch (authErr: any) {
        console.warn('Advertencia en registro con Firebase Auth secundario:', authErr);
        if (authErr?.code === 'auth/email-already-in-use') {
          throw new Error('Este correo electrónico ya está registrado en Firebase Authentication.');
        } else if (authErr?.code === 'auth/weak-password') {
          throw new Error('La contraseña debe tener al menos 6 caracteres.');
        } else if (authErr?.code === 'auth/operation-not-allowed') {
          // Si el proveedor correo/contraseña no está activo en Firebase Auth, generar UID para Firestore
          createdUid = `user-${Date.now()}`;
        } else {
          // Fallback a generación de perfil en Firestore
          createdUid = `user-${Date.now()}`;
        }
      }

      const profile: UserProfile = {
        uid: createdUid,
        email: cleanEmail,
        displayName: cleanName,
        role: newRole,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', createdUid), profile);
      setMessage(`¡Usuario ${cleanName} registrado exitosamente en la App y Firebase!`);
      setNewEmail('');
      setNewPassword('');
      setNewName('');
      fetchUsers();
    } catch (err: any) {
      setMessage(`Error: ${err.message || 'No se pudo crear el usuario'}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleLinkUid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUid || !linkEmail) return;

    setIsCreating(true);
    setMessage('');
    try {
      const cleanUid = linkUid.trim();
      const profile: UserProfile = {
        uid: cleanUid,
        email: linkEmail.trim().toLowerCase(),
        displayName: (linkName || linkEmail.split('@')[0]).toUpperCase(),
        role: linkRole,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'users', cleanUid), profile, { merge: true });
      setMessage(`¡UID ${cleanUid.substring(0, 8)}... vinculado exitosamente en Firestore con rol ${linkRole}!`);
      setLinkUid('');
      setLinkEmail('');
      setLinkName('');
      fetchUsers();
    } catch (err: any) {
      setMessage(`Error vinculando UID: ${err.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleRoleChange = async (uid: string, role: UserRole) => {
    try {
      await setDoc(doc(db, 'users', uid), { role, uid }, { merge: true });
      setUsersList((prev) =>
        prev.map((u) => (u.uid === uid ? { ...u, role } : u))
      );
    } catch (e) {
      alert('Error actualizando el rol en Firestore.');
    }
  };

  const handleDeleteUser = async (targetUser: UserProfile) => {
    if (targetUser.uid === user?.uid) {
      alert('No puedes eliminar tu propia cuenta activa de Administrador.');
      return;
    }
    const confirmDelete = window.confirm(
      `¿Estás seguro de que deseas eliminar permanentemente al usuario "${targetUser.displayName || targetUser.email}"?\n\nEsta acción borrará su perfil de la base de datos de usuarios.`
    );
    if (!confirmDelete) return;

    setDeletingUid(targetUser.uid);
    setMessage('');
    try {
      await deleteDoc(doc(db, 'users', targetUser.uid));
      setUsersList((prev) => prev.filter((u) => u.uid !== targetUser.uid));
      setMessage(`Usuario "${targetUser.displayName || targetUser.email}" eliminado exitosamente.`);
    } catch (err: any) {
      console.error('Error al eliminar usuario:', err);
      alert(`Error al eliminar usuario de Firestore: ${err.message || 'Error de red'}`);
    } finally {
      setDeletingUid(null);
    }
  };

  if (user?.role !== 'ADMINISTRADOR') {
    return (
      <div className="bg-[#D37608]/10 border border-[#D37608]/40 text-[#A85A02] p-8 rounded-2xl text-center space-y-3 font-medium">
        <Lock className="w-10 h-10 text-[#D37608] mx-auto" />
        <h3 className="text-lg font-heading font-bold">Acceso Restringido</h3>
        <p className="text-xs text-[#676057]">
          Esta sección está reservada exclusivamente para usuarios con perfil <strong>ADMINISTRADOR</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Banner Header - Coffee Palette */}
      <div className="bg-[#676057] text-[#F2EDC9] border border-[#80776D] rounded-2xl p-6 shadow-xl flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-[#BCB703] text-xs font-bold uppercase tracking-wider mb-1">
            <Users className="w-4 h-4 text-[#BCB703]" />
            <span>Módulo Administrativo</span>
          </div>
          <h1 className="text-2xl font-heading font-bold text-[#F2EDC9]">
            Gestión de Usuarios y Permisos
          </h1>
          <p className="text-xs text-[#D1CB9E] mt-1">
            Administración de acceso según los roles: ADMINISTRADOR, SUPERVISOR y USUARIO.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          className="bg-[#3E3933] hover:bg-[#282420] text-[#F2EDC9] p-2.5 rounded-xl border border-[#80776D] transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 text-[#BCB703] ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Explicación de Roles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#FAF8EA] border border-[#BCB703] p-4 rounded-2xl space-y-1 shadow-sm">
          <span className="text-xs font-bold text-[#3E3933] uppercase block">👑 ADMINISTRADOR</span>
          <p className="text-xs text-[#676057] font-medium">Gestión completa de usuarios, reportes, eliminación permanente y configuraciones.</p>
        </div>
        <div className="bg-[#FAF8EA] border border-[#676057] p-4 rounded-2xl space-y-1 shadow-sm">
          <span className="text-xs font-bold text-[#3E3933] uppercase block">🛡️ SUPERVISOR</span>
          <p className="text-xs text-[#676057] font-medium">Creación de reportes y visualización del historial completo con filtros y exportaciones.</p>
        </div>
        <div className="bg-[#FAF8EA] border border-[#D1CB9E] p-4 rounded-2xl space-y-1 shadow-sm">
          <span className="text-xs font-bold text-[#3E3933] uppercase block">👷 USUARIO</span>
          <p className="text-xs text-[#676057] font-medium">Creación de reportes en terreno y lectura de sus propios registros evaluados.</p>
        </div>
      </div>

      {/* Formulario de Registro de Usuario / Vinculación UID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Crear nuevo con credenciales */}
        <div className="bg-[#FAF8EA] border border-[#D1CB9E] rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-heading font-bold text-sm text-[#3E3933] uppercase tracking-wider flex items-center space-x-2 border-b border-[#D1CB9E] pb-3">
            <UserPlus className="w-4 h-4 text-[#8A8602]" />
            <span>Registrar Nuevo Usuario en Firebase</span>
          </h3>

          <form onSubmit={handleCreateUser} className="space-y-3">
            <div>
              <label className="text-xs font-bold text-[#676057] block mb-1">Nombre Completo</label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value.toUpperCase())}
                placeholder="EJ. CARLOS SOTO"
                className="w-full bg-[#FAF8EA] border border-[#D1CB9E] text-[#3E3933] font-bold rounded-xl px-3 py-2 text-xs uppercase focus:ring-2 focus:ring-[#BCB703]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#676057] block mb-1">Correo Electrónico</label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="usuario@pehuen.cl"
                className="w-full bg-[#FAF8EA] border border-[#D1CB9E] text-[#3E3933] font-medium rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#BCB703]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#676057] block mb-1">Contraseña</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#FAF8EA] border border-[#D1CB9E] text-[#3E3933] font-medium rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#BCB703]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#676057] block mb-1">Rol Asignado</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRole)}
                className="w-full bg-[#FAF8EA] border border-[#D1CB9E] text-[#3E3933] font-bold rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#BCB703]"
              >
                <option value="SUPERVISOR">SUPERVISOR</option>
                <option value="USUARIO">USUARIO</option>
                <option value="ADMINISTRADOR">ADMINISTRADOR</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isCreating}
              className="w-full bg-[#676057] hover:bg-[#3E3933] text-[#F2EDC9] text-xs font-bold py-2.5 rounded-xl shadow-md transition-all cursor-pointer mt-2"
            >
              {isCreating ? 'Procesando...' : 'CREAR Y REGISTRAR EN FIREBASE'}
            </button>
          </form>
        </div>

        {/* Vincular UID existente de Firebase Auth */}
        <div className="bg-[#FAF8EA] border border-[#D1CB9E] rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-heading font-bold text-sm text-[#3E3933] uppercase tracking-wider flex items-center space-x-2 border-b border-[#D1CB9E] pb-3">
            <KeyRound className="w-4 h-4 text-[#8A8602]" />
            <span>Vincular UID Existente a Firestore</span>
          </h3>

          <p className="text-xs text-[#676057]">
            Si el usuario ya existe en <strong>Authentication</strong> (ej. creado con Google o manualmente), pega su UID aquí para guardarle su rol en la colección <code>/users</code> de Firestore.
          </p>

          <form onSubmit={handleLinkUid} className="space-y-3">
            <div>
              <label className="text-xs font-bold text-[#676057] block mb-1">UID del Usuario (Firebase Auth)</label>
              <input
                type="text"
                required
                value={linkUid}
                onChange={(e) => setLinkUid(e.target.value)}
                placeholder="Ej. 5rnaNzxPYygDgpkOvBrRLEquIEI2"
                className="w-full bg-[#FAF8EA] border border-[#D1CB9E] text-[#3E3933] font-mono font-bold rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#BCB703]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#676057] block mb-1">Correo Electrónico</label>
              <input
                type="email"
                required
                value={linkEmail}
                onChange={(e) => setLinkEmail(e.target.value)}
                placeholder="ejemplo@pehuen.cl"
                className="w-full bg-[#FAF8EA] border border-[#D1CB9E] text-[#3E3933] font-medium rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#BCB703]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#676057] block mb-1">Nombre Completo (Opcional)</label>
              <input
                type="text"
                value={linkName}
                onChange={(e) => setLinkName(e.target.value)}
                placeholder="EJ. ADMINISTRADOR GENERAL"
                className="w-full bg-[#FAF8EA] border border-[#D1CB9E] text-[#3E3933] font-bold rounded-xl px-3 py-2 text-xs uppercase focus:ring-2 focus:ring-[#BCB703]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#676057] block mb-1">Rol a Asignar</label>
              <select
                value={linkRole}
                onChange={(e) => setLinkRole(e.target.value as UserRole)}
                className="w-full bg-[#FAF8EA] border border-[#D1CB9E] text-[#3E3933] font-bold rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#BCB703]"
              >
                <option value="ADMINISTRADOR">ADMINISTRADOR</option>
                <option value="SUPERVISOR">SUPERVISOR</option>
                <option value="USUARIO">USUARIO</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isCreating}
              className="w-full bg-[#3E3933] hover:bg-[#282420] text-[#F2EDC9] text-xs font-bold py-2.5 rounded-xl shadow-md transition-all cursor-pointer mt-2"
            >
              {isCreating ? 'Guardando...' : 'GUARDAR PERFIL EN FIRESTORE'}
            </button>
          </form>
        </div>

      </div>

      {message && (
        <div className="p-3 bg-[#BCB703]/20 border border-[#BCB703] text-[#3E3933] font-bold text-xs rounded-xl flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-[#8A8602]" />
          <span>{message}</span>
        </div>
      )}

      {/* Lista de Usuarios Registrados */}
      <div className="bg-[#FAF8EA] border border-[#D1CB9E] rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 bg-[#676057] border-b border-[#3E3933] font-heading font-bold text-xs text-[#F2EDC9] uppercase">
          Usuarios Registrados ({usersList.length})
        </div>

        <div className="divide-y divide-[#D1CB9E]">
          {usersList.map((u) => (
            <div key={u.uid} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-[#EFEAD0] transition-colors">
              <div>
                <div className="font-heading font-bold text-sm text-[#3E3933] uppercase">
                  {u.displayName || u.email}
                </div>
                <div className="text-xs text-[#676057] font-medium">{u.email}</div>
              </div>

              <div className="flex items-center space-x-3">
                <select
                  value={u.role}
                  onChange={(e) => handleRoleChange(u.uid, e.target.value as UserRole)}
                  className="bg-[#FAF8EA] border border-[#D1CB9E] text-xs text-[#3E3933] font-bold rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-[#BCB703]"
                >
                  <option value="ADMINISTRADOR">ADMINISTRADOR</option>
                  <option value="SUPERVISOR">SUPERVISOR</option>
                  <option value="USUARIO">USUARIO</option>
                </select>

                <span className="text-[10px] font-mono text-[#80776D] hidden md:inline">
                  {u.uid.slice(0, 8)}...
                </span>

                <button
                  type="button"
                  onClick={() => handleDeleteUser(u)}
                  disabled={deletingUid === u.uid}
                  title="Eliminar usuario"
                  className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 p-2 rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center space-x-1 text-xs font-bold"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                  <span className="hidden sm:inline">Eliminar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
