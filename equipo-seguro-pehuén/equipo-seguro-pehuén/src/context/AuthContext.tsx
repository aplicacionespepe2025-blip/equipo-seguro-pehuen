import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  signInAnonymously,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  registerUser: (email: string, pass: string, name: string, role: UserRole) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  switchRoleQuick: (role: UserRole) => void;
  quickDemoLogin: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Sync auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fUser) => {
      setFirebaseUser(fUser);
      if (fUser) {
        try {
          const userDocRef = doc(db, 'users', fUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUser(userDoc.data() as UserProfile);
          } else {
            // Documento por defecto si fue login anónimo o nuevo
            const newProfile: UserProfile = {
              uid: fUser.uid,
              email: fUser.email || `${fUser.uid.substring(0, 6)}@pehuen.cl`,
              displayName: fUser.displayName || 'EVALUADOR EN TERRENO',
              role: 'SUPERVISOR',
              createdAt: new Date().toISOString()
            };
            await setDoc(userDocRef, newProfile);
            setUser(newProfile);
          }
        } catch (err) {
          console.warn('Error al cargar perfil de usuario en Firestore, usando perfil local:', err);
          setUser({
            uid: fUser.uid,
            email: fUser.email || 'usuario@pehuen.cl',
            displayName: fUser.displayName || 'OPERADOR PEHUÉN',
            role: 'SUPERVISOR'
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err: any) {
      console.error('Error al iniciar sesión:', err);
      if (err?.code === 'auth/operation-not-allowed') {
        throw new Error('El método de correo/contraseña no está activado en Firebase Console (Authentication > Método de acceso > Correo/contraseña). Por favor habilítalo o usa el Modo Demo.');
      } else if (err?.code === 'auth/invalid-credential' || err?.code === 'auth/user-not-found' || err?.code === 'auth/wrong-password') {
        throw new Error('Correo o contraseña incorrectos, o el usuario no existe en este nuevo proyecto de Firebase. Selecciona "¿No tienes cuenta? Registrate aquí" para crear tu usuario.');
      } else if (err?.code === 'auth/invalid-email') {
        throw new Error('El formato del correo electrónico no es válido.');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (email: string, pass: string, name: string, role: UserRole) => {
    setLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      const newProfile: UserProfile = {
        uid: res.user.uid,
        email: email,
        displayName: name.toUpperCase(),
        role: role,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'users', res.user.uid), newProfile);
      setUser(newProfile);
    } catch (err: any) {
      console.error('Error al registrar usuario:', err);
      if (err?.code === 'auth/operation-not-allowed') {
        throw new Error('El método de correo/contraseña no está activado en Firebase Console (Authentication > Método de acceso > Correo/contraseña). Habilítalo en tu consola de Firebase o usa el Modo Demo.');
      } else if (err?.code === 'auth/email-already-in-use') {
        throw new Error('Este correo ya está registrado en Firebase. Intenta Iniciar Sesión.');
      } else if (err?.code === 'auth/weak-password') {
        throw new Error('La contraseña debe tener al menos 6 caracteres.');
      } else if (err?.code === 'auth/invalid-credential') {
        throw new Error('Credenciales inválidas. Verifica el correo y la contraseña.');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      const gUser = res.user;

      const userDocRef = doc(db, 'users', gUser.uid);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        const newProfile: UserProfile = {
          uid: gUser.uid,
          email: gUser.email || `${gUser.uid.substring(0, 6)}@pehuen.cl`,
          displayName: (gUser.displayName || 'EVALUADOR PEHUÉN').toUpperCase(),
          role: 'SUPERVISOR',
          createdAt: new Date().toISOString()
        };
        await setDoc(userDocRef, newProfile);
        setUser(newProfile);
      } else {
        setUser(userDoc.data() as UserProfile);
      }
    } catch (err: any) {
      console.error('Error al iniciar sesión con Google:', err);
      if (err?.code === 'auth/popup-closed-by-user') {
        throw new Error('Se cerró la ventana emergente de inicio de sesión de Google.');
      } else if (err?.code === 'auth/operation-not-allowed') {
        throw new Error('El proveedor de inicio de sesión con Google no está activado en Firebase Console (Authentication > Método de acceso > Google).');
      } else if (err?.code === 'auth/unauthorized-domain') {
        throw new Error('El dominio actual no está en la lista de Dominios Autorizados en Firebase Console (Authentication > Configuración > Dominios autorizados).');
      } else if (err?.code === 'auth/popup-blocked') {
        throw new Error('El navegador bloqueó la ventana emergente. Por favor permite las ventanas emergentes en tu navegador.');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const switchRoleQuick = (role: UserRole) => {
    if (user) {
      const updated = { ...user, role };
      setUser(updated);
      if (firebaseUser?.uid) {
        setDoc(doc(db, 'users', firebaseUser.uid), { role }, { merge: true }).catch(() => {});
      }
    }
  };

  const quickDemoLogin = async (role: UserRole) => {
    setLoading(true);
    try {
      const email = `${role.toLowerCase()}@pehuen.cl`;
      const pass = 'Pehuen2026!';
      try {
        await signInWithEmailAndPassword(auth, email, pass);
      } catch {
        // Si no existe, intentar login anónimo o registrar
        try {
          const res = await createUserWithEmailAndPassword(auth, email, pass);
          const newProfile: UserProfile = {
            uid: res.user.uid,
            email,
            displayName: `${role} PEHUÉN`,
            role,
            createdAt: new Date().toISOString()
          };
          await setDoc(doc(db, 'users', res.user.uid), newProfile);
          setUser(newProfile);
        } catch {
          const resAnon = await signInAnonymously(auth);
          const anonProfile: UserProfile = {
            uid: resAnon.user.uid,
            email,
            displayName: `DEMO ${role}`,
            role,
            createdAt: new Date().toISOString()
          };
          await setDoc(doc(db, 'users', resAnon.user.uid), anonProfile);
          setUser(anonProfile);
        }
      }
    } catch (e) {
      console.error('Error en login demo:', e);
      // Fallback local instantáneo
      setUser({
        uid: `demo-${role.toLowerCase()}`,
        email: `${role.toLowerCase()}@pehuen.cl`,
        displayName: `${role} DEMO`,
        role
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, login, registerUser, loginWithGoogle, logout, switchRoleQuick, quickDemoLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe ser usado dentro de AuthProvider');
  return context;
};
