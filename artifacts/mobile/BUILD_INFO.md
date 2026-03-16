# EAS Build Info — نبض (Nabd) Android APK

## Latest Build ✅ COMPLETED (auth fix - no more "زائر" after login)

| Field | Value |
|-------|-------|
| Build ID | `47edf78a-569f-448a-8130-8abc002556f3` |
| Platform | Android |
| Profile | preview (APK) |
| Status | ✅ finished |
| Finished at | 2026-03-16 00:26:29 |
| Build Logs | https://expo.dev/accounts/saleh99/projects/nabd-app/builds/47edf78a-569f-448a-8130-8abc002556f3 |
| **APK Download URL** | **https://expo.dev/artifacts/eas/9TaBEAbUUA8bRcnSyah2hx.apk** |

**Fix applied:** Removed `enterAsGuest()` race condition from `AuthGate` in `_layout.tsx`. Previously, this caused the app to override a successful login with guest mode due to a timing issue between state updates and navigation. Now `restoreAuth()` correctly handles guest initialization.

## Previous Build (Railway API fix)

| Field | Value |
|-------|-------|
| Build ID | `dc83de3c-d910-4877-90b9-44a6dec11a34` |
| Status | ✅ finished |
| APK URL | https://expo.dev/artifacts/eas/temddN3KUxwrJfpjPDpmsY.apk |

## First Build (missing API URL)

| Field | Value |
|-------|-------|
| Build ID | `503fffe0-14dc-4abf-b13d-eeeca27a8851` |
| Status | ✅ finished (but missing API URL — clinics/offers don't load) |
| APK URL | https://expo.dev/artifacts/eas/aUKWciHPJy2NSGRMJ1yEUR.apk |

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

## How to Install APK

1. Uninstall any previous version of نبض from your device
2. Download APK: https://expo.dev/artifacts/eas/9TaBEAbUUA8bRcnSyah2hx.apk
3. Transfer to Android device
4. Enable "Install from unknown sources" in Android settings
5. Install the APK file

## APK connects to

Railway production API: `https://nabd-app-production-493a.up.railway.app`
- Runs 24/7 — does not depend on Replit being active

## Test Credentials

- mohammed@example.com / nabd1234
- fatima@example.com / nabd1234
- ahmed@example.com / nabd1234
- mariam@example.com / nabd1234
- Saleh97793313@gmail.com / nabd@2026 (owner account)
