// cypress/e2e/api/category-api.cy.js
// Hari 18 - API Automation using Cypress
// Website: https://fakeapi.platzi.com/en/rest/categories
// 12 test case, setiap test punya assertion pada status code DAN response body value.
//
// Pola tiap test: Action (request) dulu -> Assertion (status + body).
import { CategoryApi } from '../../api/CategoryApi';
import {
  apiBaseUrl,
  seededCategory,
  invalidPayload,
  expectedErrors,
  statusCodes,
  slugify,
  uniqueName,
  payloadFor,
  deleteSuccessBody,
  payloadWithoutImage
} from '../../support/data/categoryData';

describe('API Automation - Platzi Categories', () => {
  const categoryApi = new CategoryApi();

  // Id kategori yang dibuat di dalam satu test, dihapus di afterEach supaya
  // API publik ini tidak dipenuhi data sampah dari setiap run.
  let createdIds = [];

  const trackId = (id) => {
    createdIds.push(id);
    return id;
  };

  beforeEach(() => {
    createdIds = [];
  });

  afterEach(() => {
    createdIds.forEach((id) => categoryApi.deleteQuietly(id));
  });

  // TC-API-001
  it('TC-API-001: GET daftar categories mengembalikan array dan status 200', () => {
    // Action
    categoryApi
      .getList()
      // Assertion
      .then((response) => {
        expect(response.status).to.eq(statusCodes.ok);
        expect(response.body).to.be.an('array');
        expect(response.body).to.have.length.greaterThan(0);
      });
  });

  // TC-API-002
  it('TC-API-002: Setiap item category punya struktur field yang lengkap', () => {
    // Action
    categoryApi
      .getList('?limit=5')
      // Assertion
      .then((response) => {
        expect(response.status).to.eq(statusCodes.ok);
        expect(response.body).to.have.length(5);

        response.body.forEach((category) => {
          expect(category).to.have.all.keys(
            'id',
            'name',
            'slug',
            'image',
            'creationAt',
            'updatedAt'
          );
          expect(category.id).to.be.a('number');
          expect(category.name).to.be.a('string').and.not.be.empty;
          expect(category.image).to.match(/^https?:\/\//);
        });
      });
  });

  // TC-API-003
  it('TC-API-003: GET category berdasarkan id mengembalikan data yang benar', () => {
    // Action
    categoryApi
      .getById(seededCategory.id)
      // Assertion
      .then((response) => {
        expect(response.status).to.eq(statusCodes.ok);
        expect(response.body.id).to.eq(seededCategory.id);
        expect(response.body.slug).to.eq(seededCategory.slug);
        expect(response.body.name).to.be.a('string').and.not.be.empty;
      });
  });

  // TC-API-004
  it('TC-API-004: Parameter limit membatasi jumlah data yang dikembalikan', () => {
    // Action
    categoryApi
      .getList('?limit=3')
      // Assertion
      .then((response) => {
        expect(response.status).to.eq(statusCodes.ok);
        expect(response.body).to.be.an('array');
        expect(response.body).to.have.length(3);
      });
  });

  // TC-API-005
  it('TC-API-005: POST membuat category baru dan mengembalikan status 201', () => {
    const name = uniqueName('QA API Create');

    // Action
    categoryApi
      .create(payloadFor(name))
      // Assertion
      .then((response) => {
        expect(response.status).to.eq(statusCodes.created);
        expect(response.body.id).to.be.a('number');
        expect(response.body.name).to.eq(name);
        // Slug dibuat otomatis oleh API dari name
        expect(response.body.slug).to.eq(slugify(name));
        expect(response.body.image).to.eq(payloadFor(name).image);

        trackId(response.body.id);
      });
  });

  // TC-API-006
  it('TC-API-006: Category yang dibuat bisa diambil ulang lewat GET by id', () => {
    const name = uniqueName('QA API Read');

    // Action
    categoryApi
      .create(payloadFor(name))
      .then((created) => {
        expect(created.status).to.eq(statusCodes.created);
        const id = trackId(created.body.id);
        // Action lanjutan: baca ulang data yang baru dibuat
        return categoryApi.getById(id).then((fetched) => {
          // Assertion
          expect(fetched.status).to.eq(statusCodes.ok);
          expect(fetched.body.id).to.eq(id);
          expect(fetched.body.name).to.eq(name);
        });
      });
  });

  // TC-API-007
  it('TC-API-007: PUT mengubah name category dan slug ikut berubah', () => {
    const initialName = uniqueName('QA API Update');
    const updatedName = uniqueName('QA API Updated');

    // Action
    categoryApi
      .create(payloadFor(initialName))
      .then((created) => {
        expect(created.status).to.eq(statusCodes.created);
        const id = trackId(created.body.id);

        return categoryApi.update(id, { name: updatedName }).then((updated) => {
          // Assertion
          expect(updated.status).to.eq(statusCodes.ok);
          expect(updated.body.id).to.eq(id);
          expect(updated.body.name).to.eq(updatedName);
          expect(updated.body.slug).to.eq(slugify(updatedName));
          // Slug baru membuktikan perubahan benar-benar tersimpan
          expect(updated.body.slug).to.not.eq(created.body.slug);
        });
      });
  });

  // TC-API-008
  it('TC-API-008: DELETE menghapus category dan GET setelahnya mengembalikan 400', () => {
    const name = uniqueName('QA API Delete');

    // Action
    categoryApi
      .create(payloadFor(name))
      .then((created) => {
        expect(created.status).to.eq(statusCodes.created);
        // Sengaja tidak di-track: test ini yang menghapus sendiri
        const id = created.body.id;

        return categoryApi.delete(id).then((deleted) => {
          // Assertion: API mengembalikan teks "true" (bukan JSON boolean),
          // terlihat dari content-type: text/html. Dibandingkan sebagai string
          // sesuai perilaku nyata API.
          expect(deleted.status).to.eq(statusCodes.ok);
          expect(String(deleted.body)).to.eq(deleteSuccessBody);

          return categoryApi.getByIdRaw(id).then((afterDelete) => {
            expect(afterDelete.status).to.eq(statusCodes.badRequest);
            expect(afterDelete.body.name).to.eq(expectedErrors.notFound);
          });
        });
      });
  });

  // TC-API-009
  it('TC-API-009: GET category dengan id tidak ada mengembalikan 400 EntityNotFoundError', () => {
    // Action
    categoryApi
      .getByIdRaw(999999)
      // Assertion
      .then((response) => {
        expect(response.status).to.eq(statusCodes.badRequest);
        expect(response.body.name).to.eq(expectedErrors.notFound);
        expect(response.body.path).to.contain('/categories/999999');
      });
  });

  // TC-API-010
  it('TC-API-010: GET category dengan id non-numerik ditolak dengan pesan validasi', () => {
    // Action
    categoryApi
      .getByIdRaw('abc')
      // Assertion
      .then((response) => {
        expect(response.status).to.eq(statusCodes.badRequest);
        expect(response.body.message).to.contain(expectedErrors.notNumeric);
        expect(response.body.error).to.eq('Bad Request');
      });
  });

  // TC-API-011
  it('TC-API-011: POST dengan name kosong ditolak validator dan data tidak dibuat', () => {
    // Action
    categoryApi
      .createRaw(invalidPayload)
      // Assertion
      .then((response) => {
        expect(response.status).to.eq(statusCodes.badRequest);
        expect(response.body.message).to.be.an('array');
        expect(response.body.message).to.include(expectedErrors.nameEmpty);
        expect(response.body.error).to.eq('Bad Request');
        // Data tidak boleh terbuat: API tidak mengembalikan id
        expect(response.body).to.not.have.property('id');
      });
  });

  // TC-API-012
  it('TC-API-012: POST tanpa image ditolak dengan pesan validasi image', () => {
    // Action
    categoryApi
      .createRaw(payloadWithoutImage)
      // Assertion
      .then((response) => {
        expect(response.status).to.eq(statusCodes.badRequest);
        expect(response.body.message).to.be.an('array');
        expect(response.body.message).to.include(expectedErrors.imageEmpty);
        expect(response.body.message).to.include(expectedErrors.imageNotUrl);
        expect(response.body.error).to.eq('Bad Request');
      });
  });

  // TC-API-013
  it('TC-API-013: GET products berdasarkan category hanya berisi produk kategori tersebut', () => {
    // Action
    categoryApi
      .getProductsOfCategory(seededCategory.id)
      // Assertion
      .then((response) => {
        expect(response.status).to.eq(statusCodes.ok);
        expect(response.body).to.be.an('array');
        expect(response.body).to.have.length.greaterThan(0);

        response.body.forEach((product) => {
          expect(product.category.id).to.eq(seededCategory.id);
          expect(product.category.slug).to.eq(seededCategory.slug);
          expect(product.price).to.be.a('number');
        });
      });
  });

  // TC-API-014
  // CATATAN: payload kosong {} membuat API crash 500, bukan 400. Ini bug di
  // sisi Platzi (seharusnya divalidasi). Test ini mendokumentasikan perilaku
  // nyata tersebut — kalau API diperbaiki menjadi 400, test ini yang harus
  // diubah. Bug dilaporkan di README, tidak ditutupi.
  it('TC-API-014: POST payload kosong membuat API mengembalikan 500 (bug API)', () => {
    // Action
    categoryApi
      .createRaw({})
      // Assertion
      .then((response) => {
        expect(response.status).to.eq(statusCodes.serverError);
        expect(response.body.statusCode).to.eq(statusCodes.serverError);
        expect(response.body.message).to.eq('Internal server error');
      });
  });
});
