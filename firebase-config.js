/* Firas AI — Firebase web config (enables "Continue with Google").
 *
 * These web values are NOT secrets — they only identify the project to the
 * browser. The frontend reads apiKey / authDomain / projectId; the rest are kept
 * for completeness (storage / analytics if added later).
 *
 * The server must run with FIREBASE_PROJECT_ID="firas-ai" to verify Google
 * tokens. See FIREBASE_SETUP.md.
 */
window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyDoRqmC70HTAgvZuFa1m9aOg9eBMyWSUeA",
  authDomain: "firas-ai.firebaseapp.com",
  projectId: "firas-ai",
  storageBucket: "firas-ai.firebasestorage.app",
  messagingSenderId: "237562309958",
  appId: "1:237562309958:web:f1840b63a8644088e3c947",
  measurementId: "G-H3LLJQFW01",
};
