# 👶 Baby Monitor Bridge

A **zero-cost, serverless, open-source** baby monitor audio bridge.  
Put one phone next to the crib — listen on any number of other phones.  
Everything travels **peer-to-peer, encrypted end-to-end**, through WebRTC.

🌐 **Live app:** [https://goozdev.github.io/baby-monitor-bridge/](https://goozdev.github.io/baby-monitor-bridge/)

---

## What it does

| Feature | Detail |
|---|---|
| **VOX (Voice Activated)** | Sender only streams when it detects noise above your threshold |
| **Multi-receiver** | Any number of phones can listen simultaneously |
| **Encrypted signalling** | PeerJS connection IDs are encrypted with AES-GCM + PBKDF2 before touching the cloud |
| **End-to-end audio encryption** | WebRTC uses DTLS-SRTP natively |
| **Push notifications** | Web Push via your own locally-generated VAPID keys |
| **Vibration** | Hardware vibration on every alert |
| **Wake Lock** | Sender screen stays on — CPU never sleeps |
| **Dark mode** | OLED-friendly black UI |
| **PWA** | Add to home screen for better background behaviour |

---

## How to use

### 1 — Choose a Secret Password

Pick any password and type it on **every device** that will participate.  
The password is never transmitted; it is only used locally to encrypt/decrypt signalling data.

### 2 — Sender (the phone next to the crib)

1. Open the app and make sure **Sender** mode is selected.
2. Enter your Secret Password.
3. Tap **▶ Start Monitoring**.
4. Grant microphone permission when the browser asks.
5. Adjust the **Sensitivity Threshold** slider until the orange marker sits just above the ambient noise floor shown by the green bar.
6. The screen will stay on automatically (Wake Lock).  
   The app will:
   - Silently monitor ambient sound.
   - Open the audio stream and send an alert when noise exceeds the threshold for **1.5 seconds**.
   - Close the stream automatically after **10 seconds** of silence.

### 3 — Receiver(s) (your phone(s) outdoors)

1. Open the app and select **Receiver** mode.
2. Enter the **same** Secret Password.
3. Tap **👂 Start Listening**.
4. Grant notification permission when asked.
5. The app connects to the Sender automatically.  
   When the Sender detects noise you will get:
   - Live audio (starts within a second or two)
   - An in-app alert + hardware vibration
   - A Web Push notification (works in background on Android Chrome)

Multiple receivers can be connected at the same time.

---

## Deploy to GitHub Pages

1. **Fork / clone** this repository.
2. Go to **Settings → Pages**.
3. Set Source to **Deploy from branch** → `main` → `/ (root)`.
4. Save. GitHub will deploy to `https://<your-username>.github.io/baby-monitor-bridge/` within a minute.

> **HTTPS is required.** GitHub Pages always serves over HTTPS, which is needed for `getUserMedia`, `Wake Lock`, and `Push` APIs.

---

## Push notification notes

Web Push requires a server to POST to the push endpoint — normally browsers cannot do this directly due to CORS restrictions on push services.

- When the Receiver **tab is open or the app is in the foreground** on Android Chrome, notifications and vibration work perfectly.
- For **true background push** (screen off, app closed), the Sender attempts to POST directly to the Receiver's push endpoint. Whether this succeeds depends on your browser and push service's CORS policy. For best results:
  - Install the app on your Android home screen (three-dot menu → *Add to Home Screen*).
  - Keep the app pinned / excluded from battery optimisation in Android settings.

---

## Privacy & Security

- **No backend server** — audio travels directly device-to-device via WebRTC.
- **PeerJS Cloud** is used only to exchange the initial WebRTC handshake. That handshake data is encrypted with AES-GCM (256-bit) using a key derived from your Secret Password via PBKDF2 (200 000 iterations).
- **Your audio never touches any server.**
- **VAPID keys** are generated once in your browser and stored in `localStorage`. They are never sent anywhere.
- **Secret Password** is never stored and never leaves your device.

---

## Browser support

| Browser | Sender | Receiver |
|---|---|---|
| Android Chrome 90+ | ✅ | ✅ |
| Android Firefox | ✅ | ✅ (push varies) |
| Desktop Chrome | ✅ | ✅ |
| Desktop Firefox | ✅ | ✅ |
| iOS Safari | ⚠ Wake Lock limited | ⚠ Push limited |

iOS Safari does not support the Wake Lock API and has limited Web Push support. Android Chrome is the recommended platform.

---

## Tech stack

- **Vanilla HTML / CSS / JavaScript** — zero build step, zero dependencies
- **PeerJS 1.5** — WebRTC signalling via free PeerJS Cloud
- **Web Audio API** — local noise monitoring (VOX)
- **Web Crypto API** — AES-GCM encryption, PBKDF2 key derivation, ECDSA VAPID signing
- **Web Push API + Service Worker** — background push notifications
- **Wake Lock API** — prevent Sender device from sleeping

