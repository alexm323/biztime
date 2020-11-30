// Add in express
const express = require("express");
// Generic error handler
const ExpressError = require("../expressError")
// a class for allowing our routes to handle validation, 404, and other errors
const router = express.Router();
// connecting our database logic
const db = require("../db");
const datetime = require('date-time')
// Return invoices data
router.get('/', async (req, res, next) => {
    try {
        const results = await db.query("SELECT * FROM invoices")
        return res.json({ invoices: results.rows })
    } catch (e) {
        next(e)
    }

})
// Returns a single invoices data
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params
        const results = await db.query('SELECT * FROM invoices WHERE id=$1', [id])
        if (results.rows.length === 0) {
            throw new ExpressError(`Unable to find an invoice with id of ${id}`, 404)
        }
        return res.json({ invoice: results.rows[0] })
    } catch (e) {
        next(e)
    }

})
// Creates a new invoice
router.post('/', async (req, res, next) => {
    try {
        const { comp_code, amt } = req.body
        const results = await db.query('INSERT INTO invoices (comp_code,amt) VALUES($1,$2) RETURNING id, comp_code, amt, paid, add_date, paid_date', [comp_code, amt])
        return res.status(201).json({ invoice: results.rows[0] })
    } catch (e) {
        next(e)
    }

})
// Updates an invoice, if it exists 
router.put('/:id', async (req, res, next) => {
    try {
        let currentDate;

        const { id } = req.params
        const { amt, paid } = req.body
        if (paid === false) {

            const results = await db.query('UPDATE invoices SET amt=$1,paid=$2,paid_date=NULL WHERE id=$3 RETURNING id, comp_code, amt, paid, add_date, paid_date', [amt, paid, id])
            if (results.rows.length === 0) {
                throw new ExpressError(`Invoice with id of ${id} could not be found`, 404)
            }

            return res.json({ invoice: results.rows[0] })
        } else {
            currentDate = datetime()
            const results = await db.query(`UPDATE invoices SET amt=$1,paid=$2,paid_date=$4 WHERE id=$3 RETURNING id, comp_code, amt, paid, add_date, paid_date`, [amt, paid, id, currentDate])
            if (results.rows.length === 0) {
                throw new ExpressError(`Invoice with id of ${id} could not be found`, 404)
            }

            return res.json({ invoice: results.rows[0] })
        }


    } catch (e) {
        next(e)
    }
})
// Delete an invoice if it exists
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params
        const results = await db.query('DELETE FROM invoices WHERE id=$1', [id])
        if (results.rowCount === 0) {
            throw new ExpressError(`Could not delete invoice with id of ${id}`, 404)
        }
        return res.json({ status: 'deleted' })
    } catch (e) {
        next(e)
    }

})

// Need to export it to be routed because we are using it in the app.js
module.exports = router;