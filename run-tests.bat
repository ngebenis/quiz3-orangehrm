@echo off
REM ============================================================
REM  Jalankan semua spec Cypress di Windows (CMD / double-click)
REM  - Quiz 3      : cypress\e2e\login.cy.js
REM  - Hari 16     : cypress\e2e\intercept\login-intercept.cy.js
REM  - Hari 17     : cypress\e2e\pom\login-pom.cy.js
REM ============================================================
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo [X] Node.js belum terpasang. Install dulu dari https://nodejs.org
  pause
  exit /b 1
)

if not exist node_modules (
  echo [*] node_modules belum ada, menjalankan npm install...
  call npm install || goto :error
)

echo.
echo [*] Menjalankan Quiz 3 (login.cy.js)...
call npm run test:login || goto :error

echo.
echo [*] Menjalankan Hari 16 (login-intercept.cy.js)...
call npm run test:intercept || goto :error

echo.
echo [*] Menjalankan Hari 17 (login-pom.cy.js)...
call npm run test:pom || goto :error

echo.
echo [OK] Selesai. Report ada di folder cypress\reports\
echo      - report-login.html
echo      - report-intercept.html
echo      - report-pom.html
pause
exit /b 0

:error
echo.
echo [X] Ada test yang gagal atau perintah error. Cek output di atas.
pause
exit /b 1
