// Support file
// Custom commands bisa ditambahkan di sini bila diperlukan.

// Beberapa halaman OrangeHRM demo memicu unhandled promise rejection dari kode
// aplikasinya sendiri, bukan dari Cypress. Kasus nyata: saat logout, axios
// membatalkan request dashboard yang masih berjalan, lalu kode OrangeHRM
// membaca `.response` dari hasil yang sudah undefined:
//
//   TypeError: Cannot read properties of undefined (reading 'response')
//
// Itu bukan kegagalan fitur yang sedang diuji, jadi kita abaikan — tapi
// SEMPIT: hanya pesan error itu. Error lain tetap menggagalkan test supaya
// bug asli tidak ikut tersembunyi.
Cypress.on('uncaught:exception', (err) => {
  const pesan = (err && err.message) || '';
  const upstreamDashboardAbort = pesan.includes(
    "Cannot read properties of undefined (reading 'response')"
  );

  if (upstreamDashboardAbort) {
    return false;
  }
  return true;
});
