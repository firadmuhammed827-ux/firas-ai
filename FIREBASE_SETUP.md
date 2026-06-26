# Firebase "Continue with Google" — Setup

This adds a **Continue with Google** button to the Firas AI auth screen. It is
entirely optional: when no Firebase config is present, the button stays hidden
and email/password sign-in works exactly as before.

The flow is:

```
Google button  ->  signInWithPopup  ->  user.getIdToken()
              ->  POST /api/auth/firebase { idToken }  (same-origin)
              ->  session cookie + bootApp(user)
```

Follow the steps below once to enable it.

---

## 1. Create (or pick) a Firebase project

1. Go to <https://console.firebase.google.com/> and click **Add project**
   (or select an existing one).
2. Give it a name, finish the wizard. Google Analytics is optional.

## 2. Enable the Google sign-in provider

1. In the console: **Build -> Authentication -> Get started**.
2. Open the **Sign-in method** tab.
3. Click **Google -> Enable**, choose a support email, then **Save**.

## 3. Add a Web app and copy the config

1. In the console: **Project settings** (gear icon) -> **General**.
2. Under **Your apps**, click the **Web** icon (`</>`) to register a web app
   (skip Firebase Hosting). Give it a nickname.
3. Firebase shows a `firebaseConfig` object. You need at least these three keys:
   - `apiKey`
   - `authDomain`
   - `projectId`

## 4. Add your domains to Authorized domains

The popup only works on domains Firebase trusts.

1. Console: **Authentication -> Settings -> Authorized domains**.
2. Make sure these are listed (add any that are missing):
   - `localhost` (for local development)
   - your production domain, e.g. `firas.example.com`
   - (Firebase usually pre-adds `your-project-id.firebaseapp.com`)

## 5. Create `firebase-config.js`

1. In the project root (next to `index.html`), copy the template:

   ```bash
   cp firebase-config.example.js firebase-config.js
   ```

2. Open `firebase-config.js` and paste your real values:

   ```js
   window.FIREBASE_CONFIG = {
     apiKey: "AIza...your-key...",
     authDomain: "your-project-id.firebaseapp.com",
     projectId: "your-project-id",
   };
   ```

   Only `apiKey`, `authDomain` and `projectId` are read by the frontend. If any
   of the three is missing, the Google button stays hidden.

3. `firebase-config.js` is **git-ignored** — it is never committed. The
   committed `firebase-config.example.js` stays as the template for teammates.

> These web config values are not secrets (they only identify the project to
> the browser), but keeping the real file out of git keeps environments clean.

## 6. Configure the server

The backend verifies the Google ID token against your Firebase project. Set the
project id as an environment variable on the server **before starting it**:

```bash
# Linux / macOS
export FIREBASE_PROJECT_ID="your-project-id"

# Windows PowerShell
$env:FIREBASE_PROJECT_ID = "your-project-id"
```

Use the **same** `projectId` value you put in `firebase-config.js`.

- If `FIREBASE_PROJECT_ID` is **not** set, `POST /api/auth/firebase` returns
  **501** and the user sees a localized "Google sign-in is unavailable" message.
- An invalid / expired token returns **401**.

## 7. Verify

1. Start the server and open the app.
2. On the auth screen you should see **Continue with Google** above the
   email/password form, separated by an "or" divider.
3. Click it, complete the Google popup, and you should land in the app signed in.

### Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| Button never appears | `firebase-config.js` missing, or one of `apiKey`/`authDomain`/`projectId` is blank. |
| `auth/unauthorized-domain` in console | Current domain not in **Authorized domains** (step 4). |
| "Google sign-in is unavailable" | Server has no `FIREBASE_PROJECT_ID` (501), or the popup was blocked. |
| Sign-in fails after popup | `FIREBASE_PROJECT_ID` on the server doesn't match the config's `projectId`. |
| Popup opens then closes with no error | Normal — the user cancelled; no error is shown. |
