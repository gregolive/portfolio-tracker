const Transaction = require('../models/transaction');
const Portfolio = require('../models/portfolio');
const { body, validationResult } = require('express-validator');
const async = require('async');
const { format } = require('date-fns');

// Display detail page for a specific Transaction.
exports.transaction_detail = (req, res, next) => {
  async.parallel({
    transaction: (callback) => {
      Transaction.findById(req.params.id).exec(callback);
    },
    portfolio: (callback) => {
      Portfolio.findOne({ 'owner': req.user._id }).exec(callback);
    },
  }, (err, results) => {
    if (err) { return next(err); }
    if (results.transaction == null) { // No results.
      let err = new Error('Transaction not found');
      err.status = 404;
      return next(err);
    }
    // Successful, so render
    const message = req.session.message;
    if (message) { req.session.message = ''; }
    res.render('transaction/transaction_detail', { title: 'Transaction Details', user: req.user, transaction: results.transaction, portfolio: results.portfolio, formatDate: format, message: message } );
  });
};

// Display Transaction create form on GET.
exports.transaction_create_get = (req, res, next) => {
  res.render('transaction/transaction_form', { title: 'New Transaction', user: req.user, types: ['Buy', 'Sell'], formatDate: format });
};

// Handle Transaction create on POST.
exports.transaction_create_post = [
  // Validate and sanitize the name field.
  body('date', 'Invalid date').isISO8601().toDate(),
  body('ticker', 'Ticker must be between 3 and 5 characters').trim().isLength({ min: 3, max: 5 }).escape(),
  body('shares', 'Number of shares required').trim().isLength({ min: 1 }).escape()
    .isNumeric().withMessage('Entered value must be a number'),
  body('avg_price', 'Average price required').trim().isLength({ min: 1 }).escape()
    .isNumeric().withMessage('Entered value must be a number'),
  body('type').escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req).mapped();

    // Create a transaction object with escaped and trimmed data.
    let transaction = new Transaction(
      { 
        date: req.body.date,
        ticker: req.body.ticker,
        shares: req.body.shares,
        avg_price: req.body.avg_price,
        type: req.body.type,
        portfolio: req.params.portfolio_id,
        user: req.user._id,
      }
    );

    if (Object.keys(errors).length > 0) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render('transaction/transaction_form', { title: 'New Transaction', user: req.user, types: ['Buy', 'Sell'], formatDate: format, transaction: transaction, errors: errors });
      return;
    } else {
      // Data from form is valid.
      transaction.save((err) => {
        if (err) { return next(err); }
        // Transaction saved. Redirect to transaction detail page.
        res.redirect('/portfolio/' + req.params.portfolio_id + transaction.url);
      });
    }
  }
];

// Display Transaction delete form on GET.
exports.transaction_delete_get = (req, res, next) => {
  res.send('NOT IMPLEMENTED: Transaction delete GET');
};

// Handle Transaction delete on POST.
exports.transaction_delete_post = (req, res, next) => {
  res.send('NOT IMPLEMENTED: Transaction delete POST');
};

// Display Transaction update form on GET.
exports.transaction_update_get = (req, res, next) => {
  Transaction.findById(req.params.id)
  .exec((err, transaction) => {
    if (err) { return next(err); }
    if (transaction == null) { // No results.
      let err = new Error('Transaction not found');
      err.status = 404;
      return next(err);
    }
    // Success.
    res.render('transaction/transaction_update', { title: 'Edit Transaction', user: req.user, transaction: transaction, types: ['Buy', 'Sell'], formatDate: format});
  });
};

// Handle Transaction update on POST.
exports.transaction_update_post = (req, res, next) => {
  res.send('NOT IMPLEMENTED: Transaction update POST');
};
