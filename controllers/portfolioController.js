const Portfolio = require('../models/portfolio');
const Transaction = require('../models/transaction');
const { portfolioValue, portfolioHoldings } = require('../config/query-config');
const { body, validationResult } = require('express-validator');
const async = require('async');
const axios = require('axios');
const { format } = require('date-fns');

// Display detail page for a specific Portfolio.
exports.portfolio_detail = async (req, res, next) => {
  const portfolio = await Portfolio.findById(req.params.id).catch((err) => { return next(err); });
  if (portfolio == null) { // No results.
    let err = new Error('Portfolio not found');
    err.status = 404;
    return next(err);
  }
  const transactions = await Transaction.find({ 'user': req.user._id }).sort({ date: -1 }).catch((err) => { return next(err); });
  
  const holdings = portfolioHoldings(transactions);
  for (let i = 0; i < holdings.length; i++) {
    await axios.get(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${holdings[i].ticker}&apikey=${process.env.ALPHA_VANTAGE_KEY}`)
      .then((res) => { holdings[i].price_data = res.data['Global Quote']; })
  }

  const portfolio_value = portfolioValue(transactions);
  const message = req.session.message;
  if (message) { req.session.message = ''; }
  res.render('portfolio/portfolio_detail', { title: portfolio.name, user: req.user, portfolio: portfolio, transactions: transactions.slice(0, 10), portfolio_value: portfolio_value, holdings: holdings, formatDate: format, message: message } );
};

// Display Portfolio create form on GET.
exports.portfolio_create_get = (req, res, next) => {
  res.render('portfolio/portfolio_form', { title: 'New Portfolio', user: req.user });
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
      res.render('portfolio/portfolio_form', { title: 'New Portfolio', user: req.user, portfolio: portfolio, errors: errors });
      return;
    } else {
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
  async.parallel({
    portfolio: (callback) => {
      Portfolio.findById(req.params.id).exec(callback)
    },
    transaction_count: (callback) => {
      Transaction.countDocuments({ 'user': req.user._id }, callback)
    },
  }, (err, results) => {
    if (err) { return next(err); }
    if (results.portfolio == null) { // No results, redirect to index.
      res.redirect('/');
    }
    // Successful, so render.
    res.render('portfolio/portfolio_delete', { title: 'Delete Portfolio', user: req.user, portfolio: results.portfolio, transaction_count: results.transaction_count });
  });
};

// Handle Portfolio delete on POST.
exports.portfolio_delete_post = (req, res, next) => {
  // Delete portfolio and related transactions.
  async.parallel({
    one: (callback) => {
      Portfolio.findByIdAndDelete(req.body.portfolioid).exec(callback)
    },
    two: (callback) => {
      Transaction.deleteMany({ 'user': req.user._id }).exec(callback)
    },
  }, (err, results) => {
    if (err) { return next(err); }
    // Success - go to home page
    res.redirect('/');
  });
};

// Display Portfolio update form on GET.
exports.portfolio_update_get = (req, res, next) => {
  Portfolio.findById(req.params.id)
  .exec((err, portfolio) => {
    if (err) { return next(err); }
    if (portfolio == null) { // No results.
      let err = new Error('Portfolio not found');
      err.status = 404;
      return next(err);
    }
    // Success.
    res.render('portfolio/portfolio_update', { title: 'Edit Portfolio', user: req.user, portfolio: portfolio });
  });
};

// Handle Portfolio update on POST.
exports.portfolio_update_post = [
  // Validate and sanitize fields.
  body('name', 'Portfolio name required').trim().isLength({ min: 1 }).escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req).mapped();

    // Create a Genre object with escaped/trimmed data and old id.
    let portfolio = new Portfolio({
      name: req.body.name,
      _id: req.params.id,
    });

    if (Object.keys(errors).length > 0) {
      // There are errors. Render form again with sanitized values/errors messages.
      res.render('portfolio/portfolio_update', { title: 'Edit Portfolio', user: req.user, portfolio: portfolio, errors: errors });
      return;
    } else {
      // Data from form is valid. Update the record.
      Portfolio.findByIdAndUpdate(req.params.id, portfolio, {}, (err, updated_portfolio) => {
        if (err) { return next(err); }
        // Successful - redirect to portfolio detail page.
        req.session.message = 'Portfolio updated! 👍';
        res.redirect(updated_portfolio.url);
      });
    }
  }
];
