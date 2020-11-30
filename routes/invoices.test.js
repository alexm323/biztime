// Tell Node that we're in test "mode"
// Need to make sure that process.env line is before the require db because it will then determine whether it will use a test or normal db
process.env.NODE_ENV = 'test';
const request = require('supertest');
const app = require('../app');
const db = require('../db')

let testCompany;
let testInvoice;
// What we want to do before we test is create a variable where we will be storing the data that we get back and that will just make the testing easier. 
beforeEach(async () => {
    const companyResults = await db.query(`INSERT INTO companies (code,name,description) VALUES ('tsm','Team Solo Mid', 'Gaming company that started with League of Legends')
  RETURNING code, name, description`);
    testCompany = companyResults.rows[0]
    // console.log(testCompany)
    const invoiceResults = await db.query('INSERT INTO invoices (comp_code,amt) VALUES($1,$2) RETURNING id, comp_code, amt, paid, add_date, paid_date', [testCompany.code, 420])
    testInvoice = invoiceResults.rows[0]

})

afterEach(async () => {
    await db.query(`DELETE FROM companies`)
})
afterAll(async () => {
    await db.end()
})

describe("GET /invoices", () => {
    test('Get a list with one invoice', async () => {
        const res = await request(app).get('/invoices')
        expect(res.statusCode).toBe(200)
        // console.log(res.body)
        expect(res.body.invoices[0].amt).toEqual(420)
    })
})

describe("GET /invoices/:id", () => {
    test('Get a single invoice', async () => {
        const res = await request(app).get(`/invoices/${testInvoice.id}`)
        expect(res.statusCode).toBe(200);
        expect(res.body.invoice.amt).toEqual(420)
    })
    test('Responds with 404 for invalid id', async () => {
        const res = await request(app).get(`/invoices/0`)
        expect(res.statusCode).toBe(404);
    })
})
describe("post /invoices", () => {
    test('Create a single invoice ', async () => {
        const res = await request(app).post('/invoices').send({ comp_code: "tsm", amt: 9000 });
        expect(res.statusCode).toBe(201);
        expect(res.body.invoice.amt).toEqual(9000)
    })
})

describe("PUT /invoices/:id", () => {
    test('Updates a single invoice if it exists ', async () => {
        const res = await request(app).put(`/invoices/${testInvoice.id}`).send({ amt: 777, paid: true });
        expect(res.statusCode).toBe(200);
        expect(res.body.invoice.amt).toEqual(777)
    })
    test('Tries to update an invalid company', async () => {
        const res = await request(app).put(`/invoices/0`).send({ amt: 69420 });
        expect(res.statusCode).toBe(404);

    })

})

describe("DELETE /invoices/:id", () => {
    test('Deletes a single invoice ', async () => {
        const res = await request(app).delete(`/invoices/${testInvoice.id}`)
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ status: 'deleted' })
    })
})