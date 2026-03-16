# EAS Build Info — نبض (Nabd) Android APK

## Latest Build ✅ COMPLETED (OTP + keyboard nav + auth fix)

| Field | Value |
|-------|-------|
| Build ID | `b4bdb863-bc78-4f99-8d94-a3e229c28cb9` |
| Platform | Android |
| Profile | preview (APK) |
| Status | ✅ finished |
| Finished at | 2026-03-16 01:26:48 |
| Build Logs | https://expo.dev/accounts/saleh99/projects/nabd-app/builds/b4bdb863-bc78-4f99-8d94-a3e229c28cb9 |
| **APK Download URL** | **https://expo.dev/artifacts/eas/oju3trWDdWSz4yBiqyFLJM.apk** |

**Features added:**
- نظام OTP: رمز تحقق يُرسل للإيميل عند التسجيل أو تسجيل الدخول لحساب غير مفعّل
- شاشة التحقق: 6 خانات تلقائية مع عداد إعادة الإرسال (60 ثانية)
- كيبورد: انتقال تلقائي بين الحقول + تركيز فوري عند فتح الشاشة
- إصلاح bug تسجيل الدخول: حذف `enterAsGuest` race condition من `AuthGate`

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
