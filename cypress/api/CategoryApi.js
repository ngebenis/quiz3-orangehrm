// cypress/api/CategoryApi.js
// Service layer untuk endpoint Category Platzi.
//
// Tujuannya sama seperti Page Object di UI test: spec hanya menyebut aksi
// ("createCategory"), tidak menulis URL atau bentuk request berulang kali.
// Kalau endpoint berubah, cukup satu tempat ini yang disentuh.
import { apiBaseUrl } from '../support/data/categoryData';

export class CategoryApi {
  // URL dasar endpoint categories
  url() {
    return `${apiBaseUrl}/categories`;
  }

  urlById(id) {
    return `${this.url()}/${id}`;
  }

  /**
   * Ambil daftar kategori (opsional dengan query string).
   * cy.request melempar error sendiri kalau status di luar 2xx, jadi untuk
   * test jalur negatif kita pakai failOnStatusCode: false.
   */
  getList(query = '') {
    return cy.request({
      method: 'GET',
      url: `${this.url()}${query}`
    });
  }

  getById(id) {
    return cy.request({
      method: 'GET',
      url: this.urlById(id)
    });
  }

  /**
   * Request GET yang boleh gagal (untuk test status 400).
   */
  getByIdRaw(id) {
    return cy.request({
      method: 'GET',
      url: this.urlById(id),
      failOnStatusCode: false
    });
  }

  getProductsOfCategory(id) {
    return cy.request({
      method: 'GET',
      url: `${this.urlById(id)}/products`
    });
  }

  create(payload) {
    return cy.request({
      method: 'POST',
      url: this.url(),
      body: payload
    });
  }

  /**
   * Request POST yang boleh gagal (validasi payload).
   */
  createRaw(payload) {
    return cy.request({
      method: 'POST',
      url: this.url(),
      body: payload,
      failOnStatusCode: false
    });
  }

  update(id, payload) {
    return cy.request({
      method: 'PUT',
      url: this.urlById(id),
      body: payload
    });
  }

  delete(id) {
    return cy.request({
      method: 'DELETE',
      url: this.urlById(id)
    });
  }

  /**
   * Hapus tanpa peduli hasilnya — dipakai di afterEach untuk bersih-bersih
   * data uji di API publik, supaya run berikutnya tidak menumpuk sampah.
   */
  deleteQuietly(id) {
    if (!id) return;
    cy.request({
      method: 'DELETE',
      url: this.urlById(id),
      failOnStatusCode: false
    });
  }
}
