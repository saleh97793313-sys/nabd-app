#!/bin/bash
set -e

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║     نشر تطبيق نبض على Railway           ║"
echo "╚══════════════════════════════════════════╝"
echo ""

RAILWAY="npx --yes @railway/cli@latest"
export RAILWAY_NO_TELEMETRY=1

echo "═══ الخطوة ١: تسجيل الدخول ═══"
echo "سيظهر لك رابط — افتحه في المتصفح وسجّل الدخول"
echo ""
$RAILWAY login --browserless

echo ""
echo "✅ تم تسجيل الدخول بنجاح!"
echo ""

echo "═══ الخطوة ٢: إنشاء مشروع جديد ═══"
$RAILWAY init

echo ""
echo "✅ تم إنشاء المشروع!"
echo ""

echo "═══ الخطوة ٣: ضبط متغيرات البيئة ═══"
DB_URL="${DATABASE_URL}"
if [ -z "$DB_URL" ]; then
  echo "⚠️  لم يتم العثور على DATABASE_URL"
  echo "أدخل رابط قاعدة البيانات:"
  read -r DB_URL
fi

$RAILWAY variables set NODE_ENV=production
$RAILWAY variables set DATABASE_URL="$DB_URL"
$RAILWAY variables set SESSION_SECRET="$(openssl rand -hex 32)"

echo ""
echo "✅ تم ضبط المتغيرات!"
echo ""

echo "═══ الخطوة ٤: النشر ═══"
echo "جاري رفع الكود... (قد يستغرق 2-5 دقائق)"
echo ""
$RAILWAY up --detach

echo ""
echo "═══ الخطوة ٥: الحصول على الرابط ═══"
DOMAIN=$($RAILWAY domain 2>/dev/null || echo "")

if [ -n "$DOMAIN" ]; then
  echo ""
  echo "╔══════════════════════════════════════════╗"
  echo "║  ✅ تم النشر بنجاح!                     ║"
  echo "╠══════════════════════════════════════════╣"
  echo "║  الرابط: https://$DOMAIN"
  echo "║  الداشبورد: https://$DOMAIN/dashboard"
  echo "║  الـ API: https://$DOMAIN/api/healthz"
  echo "╚══════════════════════════════════════════╝"
  echo ""
  echo "EXPO_PUBLIC_API_URL=https://$DOMAIN/api" > artifacts/mobile/.env
  echo "✅ تم تحديث artifacts/mobile/.env تلقائياً"
  echo "   EXPO_PUBLIC_API_URL=https://$DOMAIN/api"
else
  echo ""
  echo "⚠️  لم يتم إنشاء دومين تلقائياً"
  echo "افتح railway.com وأضف دومين من إعدادات المشروع"
  echo "ثم أنشئ ملف artifacts/mobile/.env:"
  echo "EXPO_PUBLIC_API_URL=https://YOUR_DOMAIN/api"
fi

echo ""
echo "🎉 انتهى!"
