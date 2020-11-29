// Add in express
const express = require("express");
// Generic error handler
const ExpressError = require("../expressError")
// a class for allowing our routes to handle validation, 404, and other errors
const router = express.Router();
// connecting our database logic
const db = require("../db");



// Get all of the companies
router.get('/', async (req, res, next) => {
    try {
        const results = await db.query(`SELECT * FROM companies`);
        // return res.json({ users: results.rows })
        return res.json({ companies: results.rows })
    } catch (e) {
        return next(e);
    }
})
// get a specific company
router.get('/:code', async (req, res, next) => {
    try {
        const { code } = req.params
        const companyResults = await db.query(`SELECT * FROM companies WHERE code=$1`, [code]);
        const invoiceResults = await db.query(`SELECT id FROM invoices WHERE comp_code=$1`, [code]);

        if (companyResults.rows.length === 0) {
            throw new ExpressError(`Company ${req.params.code} not found`, 404)
        }
        const company = companyResults.rows[0]
        const invoices = invoiceResults.rows
        company.invoices = invoices.map(inv => inv.id);

        return res.json({ "company": company });
    } catch (e) {
        return next(e);
    }
})
// creates a new company 
router.post('/', async (req, res, next) => {
    try {
        const { code, name, description } = req.body
        const results = await db.query('INSERT INTO companies (code,name,description) VALUES ($1,$2,$3) RETURNING code,name,description', [code, name, description])
        res.status(201).json({ company: results.rows[0] })
    } catch (e) {
        next(e)
    }

})
// updates an existing company using their code
router.put('/:code', async (req, res, next) => {
    try {
        const { code } = req.params
        const { name, description } = req.body
        const results = await db.query('UPDATE companies SET name=$1,description=$2 WHERE code=$3 RETURNING code,name,description', [name, description, code])
        if (results.rows.length === 0) {
            throw new ExpressError(`Unable to find ${code}, double check your company code`, 404)
        }
        res.json({ company: results.rows[0] })
    } catch (e) {
        next(e)
    }

})
// deletes a company if it exists 
router.delete('/:code', async (req, res, next) => {
    try {
        const { code } = req.params
        const results = await db.query('DELETE FROM companies WHERE code=$1', [code])
        console.log(results)
        if (results.rowCount === 0) {
            throw new ExpressError(`Unable to find ${code}, so nothing was deleted`, 404)
        }
        res.status(200).json({ status: 'Deleted' })
    } catch (e) {
        next(e)
    }
})
// Very important to put this router export here otherwise the app will not work 
module.exports = router;