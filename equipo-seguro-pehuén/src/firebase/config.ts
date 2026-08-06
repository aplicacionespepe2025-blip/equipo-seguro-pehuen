import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Carga de archivo de configuración si existe
import configData from "../../firebase-applet-config.json";

const appletConfig: Record<string, string> = (configData || {}) as Record<string, string>;

export const firebaseConfig = {
  apiKey: appletConfig.apiKey || "AIzaSyAOMiYmuakuN70VJM1TEHXAb7tUzpQ1YHI",
  authDomain: appletConfig.authDomain || "equipo-seguro-pehuen-ltda.firebaseapp.com",
  projectId: appletConfig.projectId || "equipo-seguro-pehuen-ltda",
  storageBucket: appletConfig.storageBucket || "equipo-seguro-pehuen-ltda.firebasestorage.app",
  messagingSenderId: appletConfig.messagingSenderId || "323663124336",
  appId: appletConfig.appId || "1:323663124336:web:10d6b19e80192052b7a1b5"
};

// Inicialización de Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

// Inicialización de Firestore considerando databaseId personalizado si existe
const customDbId = appletConfig.firestoreDatabaseId;
export const db = (customDbId && customDbId !== "(default)")
  ? getFirestore(app, customDbId)
  : getFirestore(app);

export default app;

