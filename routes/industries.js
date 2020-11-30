// Add in express
const express = require("express");
// Generic error handler
const ExpressError = require("../expressError")
// a class for allowing our routes to handle validation, 404, and other errors
const router = express.Router();
// connecting our database logic
const db = require("../db");
const slugify = require('slugify')



// Get all of the industries
router.get('/', async (req, res, next) => {
    try {

        const indResults = await db.query(`SELECT * FROM industries`);
        return res.json({ industries: indResults.rows, companies: compResults.rows })
    } catch (e) {
        return next(e);
    }
})

router.post('/', async (req, res, next) => {
    try {
        const { code, industry } = req.body
        const results = await db.query('INSERT INTO industries (code,industry) VALUES ($1,$2) RETURNING code,industry', [code, industry])
        return res.json({ industry: results.rows[0] })
    } catch (e) {
        return next(e)
    }
})

router.post('/:industryCode', async (req, res, next) => {
    try {
        const { industryCode } = req.params
        const { code } = req.body
        const results = await db.query('INSERT INTO companies_industries (company_code,industry_code) VALUES($1,$2) RETURNING company_code,industry_code', [code, industryCode])
        console.log(results)
        return res.json({ industry_association: results.rows[0] })
    } catch (e) {
        return next(e)
    }
})
router.get('/:industryCode', async (req, res, next) => {
    try {
        const { industryCode } = req.params
        const results = await db.query('SELECT industry FROM industries WHERE code=$1', [industryCode])
        const compResults = await db.query('SELECT company_code FROM companies_industries WHERE industry_code=$1', [industryCode])
        console.log(compResults.rows)
        const companies = compResults.rows.map(r => r.company_code)

        return res.json({ industry: results.rows[0], companies: companies })
    } catch (e) {
        return next(e)
    }
})
// Very important to put this router export here otherwise the app will not work 
module.exports = router;