# EAS Build Info — نبض (Nabd) Android APK

## Latest Build ✅ COMPLETED

| Field | Value |
|-------|-------|
| Build ID | `503fffe0-14dc-4abf-b13d-eeeca27a8851` |
| Platform | Android |
| Profile | preview (APK) |
| Status | ✅ finished |
| Finished at | 2026-03-15 23:28:10 |
| Build Logs | https://expo.dev/accounts/saleh99/projects/nabd-app/builds/503fffe0-14dc-4abf-b13d-eeeca27a8851 |
| **APK Download URL** | **https://expo.dev/artifacts/eas/aUKWciHPJy2NSGRMJ1yEUR.apk** |

## EXPO_TOKEN Verification

```
$ EXPO_TOKEN="$EXPO_TOKEN" npx eas-cli whoami
saleh99 (authenticated using EXPO_TOKEN)
saleh97793313@gmail.com
✅ Token verified and working
```

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
Build status: finished ✅
Application Archive URL: https://expo.dev/artifacts/eas/aUKWciHPJy2NSGRMJ1yEUR.apk
```

## How to Install APK

1. Download APK: https://expo.dev/artifacts/eas/aUKWciHPJy2NSGRMJ1yEUR.apk
2. Transfer to Android device
3. Enable "Install from unknown sources" in Android settings
4. Install the APK file

## APK connects to

Railway production API: `https://nabd-app-production-493a.up.railway.app`
- Runs 24/7 — does not depend on Replit being active
- Use test credentials from the secure environment store (do not commit credentials here)
