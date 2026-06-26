/* ============================================================================
   Firas AI — Firebase web config (EXAMPLE / template)
   ----------------------------------------------------------------------------
   To enable the "Continue with Google" button on the auth screen:

     1. Copy this file to  firebase-config.js  (same folder, next to index.html).
     2. Replace the placeholder values below with your real Firebase web config
        (Firebase console -> Project settings -> Your apps -> Web app -> SDK setup).
     3. Reload the app. The Google button appears automatically once the config
        is present and complete.

   Notes:
   - firebase-config.js is git-ignored (it holds your real project values).
     This .example file IS committed so teammates know the shape to fill in.
   - These web values are NOT secrets — they only identify your Firebase project
     to the browser. Security comes from Firebase Authorized domains + the
     server verifying the ID token. Still, keep the real file out of git.
   - The frontend reads ONLY apiKey, authDomain and projectId. If any of those
     three are missing, the Google button stays hidden and email/password auth
     continues to work normally.
   - Full setup walkthrough: see FIREBASE_SETUP.md.
   ========================================================================== */

window.FIREBASE_CONFIG = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  // Optional (present in the console snippet; not required by the frontend):
  // storageBucket: "your-project-id.appspot.com",
  // messagingSenderId: "000000000000",
  // appId: "1:000000000000:web:0000000000000000000000",
};
