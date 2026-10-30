#!/bin/bash
# Rekam video simulasi aplikasi OrangeHRM (Login -> Directory -> Recruitment).
#
# Kenapa begini:
#  - Perekam bawaan Cypress (video: true) di Electron headless menghasilkan
#    area halaman kosong/putih (surface AUT tidak dilukis ke rekaman).
#  - x11grab pada mode headless juga hitam karena proses tidak menggambar ke X.
#  - Solusi yang terbukti: jalankan Cypress dengan --headed di Xvfb :99, lalu
#    rekam layar X tersebut memakai ffmpeg x11grab.
set -u
cd /opt/data/cache/scratch/quiz3-orangehrm || exit 1
export LD_LIBRARY_PATH=/opt/data/cache/scratch/xprefix/usr/lib/x86_64-linux-gnu:/opt/data/cache/scratch/xprefix/usr/lib
export DISPLAY=:99

OUT=/opt/data/output/video-simulasi-3fitur.mp4
mkdir -p /opt/data/output
rm -f "$OUT"

# Pastikan Xvfb hidup
if ! pgrep -f "Xvfb.patched :99" >/dev/null 2>&1; then
  rm -f /tmp/.X99-lock /tmp/.X11-unix/X99
  /tmp/xkb/Xvfb.patched :99 -screen 0 1366x768x24 -nolisten tcp >/tmp/xvfb.out 2>&1 &
  sleep 4
fi

/usr/local/bin/ffmpeg -hide_banner -loglevel warning -f x11grab -video_size 1366x768 \
  -framerate 12 -i :99 -vf "scale=1366:-2" -c:v libx264 -preset veryfast -crf 28 \
  -pix_fmt yuv420p -movflags +faststart "$OUT" >/tmp/ffmpeg-rekam.log 2>&1 &
FF=$!
sleep 3

# Mode --headed wajib: hanya dengan begitu jendela Electron benar-benar
# menggambar ke display X, sehingga x11grab menangkap halaman aplikasi.
npx cypress run --headed --config-file cypress.pom3.config.js \
  --spec 'cypress/e2e/demo/simulasi.cy.js' \
  --config "specPattern=cypress/e2e/demo/**/*.cy.js,video=false,retries=0" \
  > /tmp/simrekam.log 2>&1
STATUS=$?

sleep 2
kill -INT "$FF" 2>/dev/null
wait "$FF" 2>/dev/null

echo "CYPRESS_EXIT=$STATUS"
grep -E 'passing|failing|✓|1\)' /tmp/simrekam.log | head -8
ls -la "$OUT" 2>/dev/null
echo "=== DONE ==="
