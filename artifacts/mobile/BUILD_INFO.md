# EAS Build Info — نبض (Nabd) Android APK

## Latest Build

| Field | Value |
|-------|-------|
| Build ID | `503fffe0-14dc-4abf-b13d-eeeca27a8851` |
| Platform | Android |
| Profile | preview (APK) |
| Status | in progress → check link below |
| Triggered | 2026-03-15 |
| Build Logs | https://expo.dev/accounts/saleh99/projects/nabd-app/builds/503fffe0-14dc-4abf-b13d-eeeca27a8851 |

## Build Command Used

```bash
cd artifacts/mobile
EXPO_TOKEN="$EXPO_TOKEN" npx eas-cli build --platform android --profile preview --non-interactive
```

## Terminal Output (captured)

```
Resolved "preview" environment for the build.
✔ Using remote Android credentials (Expo server)
✔ Using Keystore from configuration: Build Credentials 38d5Cx4J5- (default)
Compressing project files and uploading to EAS Build.
Your project archive is 225 MB.
✔ Uploaded to EAS 39s
✔ Computed project fingerprint
See logs: https://expo.dev/accounts/saleh99/projects/nabd-app/builds/503fffe0-14dc-4abf-b13d-eeeca27a8851
Waiting for build to complete...
```

## Previous Build

| Field | Value |
|-------|-------|
| Build ID | Previous build (9 hours before latest) |
| Status | ✅ completed |
| Profile | preview (APK) |

## How to Download APK

1. Open the build link above
2. Wait for status to turn green (✅ finished)
3. Click **"Download"** to get the APK file
4. Transfer to Android device and install

## APK connects to

Railway production API: `https://nabd-app-production-493a.up.railway.app`
(runs 24/7 — does not depend on Replit being active)
