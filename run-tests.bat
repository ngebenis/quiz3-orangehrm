@echo off
REM ============================================================
REM  Jalankan semua spec Cypress di Windows (CMD / double-click)
REM  - Quiz 3        : cypress\e2e\login.cy.js
REM  - Hari 16       : cypress\e2e\intercept\login-intercept.cy.js
REM  - Hari 17       : cypress\e2e\pom\login-pom.cy.js
REM  - Hari 18       : cypress\e2e\api\category-api.cy.js
REM  - Tugas 3 Fitur : cypress\e2e\pom3\login.cy.js
REM                    cypress\e2e\pom3\directory.cy.js
REM                    cypress\e2e\pom3\recruitment.cy.js
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
echo [*] Menjalankan Hari 18 (category-api.cy.js)...
call npm run test:api || goto :error

echo.
echo [*] Menjalankan Tugas 3 Fitur - Login (pom3\login.cy.js)...
call npm run test:fitur:login || goto :error

echo.
echo [*] Menjalankan Tugas 3 Fitur - Directory (pom3\directory.cy.js)...
call npm run test:fitur:directory || goto :error

echo.
echo [*] Menjalankan Tugas 3 Fitur - Recruitment (pom3\recruitment.cy.js)...
call npm run test:fitur:recruitment || goto :error

echo.
echo [OK] Selesai. Report ada di folder cypress\reports\
echo      - report-login.html
echo      - report-intercept.html
echo      - report-pom.html
echo      - report-api.html
echo      - report-pom3.html
pause
exit /b 0

:error
echo.
echo [X] Ada test yang gagal atau perintah error. Cek output di atas.
pause
exit /b 1
