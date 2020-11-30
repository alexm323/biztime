/** BizTime express application. */
const express = require("express");
const app = express();
const ExpressError = require("./expressError")
// I knew I had to do this but wasn't sure how to, lets us append the companies and invoices lines for the routes
const companiesRoutes = require("./routes/companies");
const invoicesRoutes = require("./routes/invoices");
const industryRoutes = require("./routes/industries")

app.use(express.json());
// middleware for the routes depending on which file we are using 
app.use("/companies", companiesRoutes);
app.use("/invoices", invoicesRoutes);
app.use("/industries", industryRoutes);
/** 404 handler */

app.use(function (req, res, next) {
  const err = new ExpressError("Not Found", 404);
  return next(err);
});

/** general error handler */

app.use((err, req, res, next) => {
  res.status(err.status || 500);

  return res.json({
    error: err,
    message: err.message
  });
});


module.exports = app;
