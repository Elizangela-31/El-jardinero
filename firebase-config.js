// ============================================================
// CONFIGURACIÓN DE FIREBASE - EL JARDINERO
// ============================================================
// Este es un proyecto de Firebase NUEVO y separado del de VIDA SPA.
// 1. Ve a https://console.firebase.google.com
// 2. Crea un proyecto nuevo (ej. "el-jardinero")
// 3. Agrega una app web (ícono </>) y copia aquí tu configuración
// 4. Activa Firestore Database (modo producción) y
//    Authentication > Método de acceso > Correo/contraseña
// Revisa el archivo README.md para la guía completa paso a paso.
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  projectId: "TU_PROYECTO",
  storageBucket: "TU_PROYECTO.firebasestorage.app",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};

const firebaseApp = initializeApp(firebaseConfig);

export const db = getFirestore(firebaseApp);
export const auth = getAuth(firebaseApp);
