const Portfolio = require('../models/portfolio');
const Transaction = require('../models/transaction');
const { portfolioValue, portfolioHoldings } = require('../config/query-config');
const { body, validationResult } = require('express-validator');
const async = require('async');
const { format } = require('date-fns');

// Display detail page for a specific Portfolio.
exports.portfolio_detail = (req, res, next) => {
  async.parallel({
    portfolio: (callback) => {
      Portfolio.findById(req.params.id).exec(callback);
    },
    transactions: (callback) => {
      Transaction.find({ 'user': req.user._id }).exec(callback);
    },
  }, (err, results) => {
    if (err) { return next(err); }
    if (results.portfolio == null) { // No results.
      let err = new Error('Portfolio not found');
      err.status = 404;
      return next(err);
    }
    // Successful, so render
    const portfolio_value = portfolioValue(results.transactions);
    const holdings = portfolioHoldings(results.transactions);
    res.render('portfolio/portfolio_detail', { title: results.portfolio.name, user: req.user, portfolio: results.portfolio, transactions: results.transactions, portfolio_value: portfolio_value, holdings: holdings, formatDate: format } );
  });
};

// Display Portfolio create form on GET.
exports.portfolio_create_get = (req, res, next) => {
  res.render('portfolio/portfolio_form', { title: 'Create Portfolio', user: req.user });
};

// Handle Portfolio create on POST.
exports.portfolio_create_post = [
  // Validate and sanitize the name field.
  body('name', 'Portfolio name required').trim().isLength({ min: 1 }).escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req).mapped();

    // Create a portfolio object with escaped and trimmed data.
    let portfolio = new Portfolio(
      { 
        name: req.body.name,
        owner: req.user,
      }
    );

    if (Object.keys(errors).length > 0) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render('portfolio/portfolio_form', { title: 'Create Portfolio', user: req.user, portfolio: portfolio, errors: errors });
      return;
    }
    else {
      // Data from form is valid.
      portfolio.save((err) => {
        if (err) { return next(err); }
        // Portfolio saved. Redirect to portfolio detail page.
        res.redirect(portfolio.url);
      });
    }
  }
];

// Display Portfolio delete form on GET.
exports.portfolio_delete_get = (req, res, next) => {
  res.send('NOT IMPLEMENTED: Portfolio delete GET');
};

// Handle Portfolio delete on POST.
exports.portfolio_delete_post = (req, res, next) => {
  res.send('NOT IMPLEMENTED: Portfolio delete POST');
};

// Display Portfolio update form on GET.
exports.portfolio_update_get = (req, res, next) => {
  res.send('NOT IMPLEMENTED: Portfolio update GET');
};

// Handle Portfolio update on POST.
exports.portfolio_update_post = (req, res, next) => {
  res.send('NOT IMPLEMENTED: Portfolio update POST');
};
