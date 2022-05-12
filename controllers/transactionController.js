const Portfolio = require('../models/portfolio');
const Transaction = require('../models/transaction');
const { body, validationResult } = require('express-validator');
const { format } = require('date-fns');

// Display list of all Transactions.
exports.transaction_list = (req, res, next) => {
  Transaction.find({ 'user': req.user._id }).populate('portfolio')
  .exec((err, transactions) => {
    if (err) { return next(err); }
    // Successful, so render
    res.render('transaction/transaction_list', { title: 'All Transactions', user: req.user, transactions: transactions, portfolio: transactions[0].portfolio, formatDate: format });
  });
};

// Display detail page for a specific Transaction.
exports.transaction_detail = (req, res, next) => {
  Transaction.findById(req.params.id).populate('portfolio')
  .exec((err, transaction) => {
    if (err) { return next(err); }
    if (transaction == null) { // No results.
      let err = new Error('Transaction not found');
      err.status = 404;
      return next(err);
    }
    // Successful, so render
    const message = req.session.message;
    if (message) { req.session.message = ''; }
    res.render('transaction/transaction_detail', { title: 'Transaction Details', user: req.user, transaction: transaction, portfolio: transaction.portfolio, formatDate: format, message: message } );
  });
};

// Display Transaction create form on GET.
exports.transaction_create_get = async (req, res, next) => {
  const portfolio = await Portfolio.findOne({ 'owner': req.user._id }).catch((err) => { return next(err); });
  res.render('transaction/transaction_form', { title: 'New Transaction', user: req.user, portfolio: portfolio, types: ['Buy', 'Sell'], formatDate: format });
};

// Handle Transaction create on POST.
exports.transaction_create_post = [
  // Validate and sanitize the name field.
  body('date', 'Invalid date').isISO8601().toDate(),
  body('ticker', 'Ticker must be between 1 and 5 characters').trim().isLength({ min: 1, max: 5 }).escape(),
  body('shares', 'Number of shares required').trim().isLength({ min: 1 }).escape()
    .isNumeric().withMessage('Entered value must be a number'),
  body('avg_price', 'Average price required').trim().isLength({ min: 1 }).escape()
    .isNumeric().withMessage('Entered value must be a number'),
  body('type').escape(),

  // Process request after validation and sanitization.
  async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req).mapped();

    // Create a transaction object with escaped and trimmed data.
    let transaction = new Transaction(
      { 
        date: req.body.date,
        ticker: req.body.ticker.toUpperCase(),
        shares: req.body.shares,
        avg_price: req.body.avg_price,
        type: req.body.type,
        portfolio: req.params.portfolio_id,
        user: req.user._id,
      }
    );

    const portfolio = await Portfolio.findOne({ 'owner': req.user._id }).catch((err) => { return next(err); });

    if (Object.keys(errors).length > 0) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render('transaction/transaction_form', { title: 'New Transaction', user: req.user, transaction: transaction, portfolio: portfolio, types: ['Buy', 'Sell'], formatDate: format, errors: errors });
      return;
    } else {
      // Data from form is valid.
      transaction.save((err) => {
        if (err) { return next(err); }
        // Transaction saved. Redirect to transaction detail page.
        res.redirect(transaction.url);
      });
    }
  }
];

// Display Transaction delete form on GET.
exports.transaction_delete_get = (req, res, next) => {
  Transaction.findById(req.params.id).populate('portfolio')
  .exec((err, transaction) => {
    if (err) { return next(err); }
    if (transaction == null) { // No results, redirect to index.
      res.redirect('/');
    }
    // Successful, so render.
    res.render('transaction/transaction_delete', { title: 'Delete Transaction', user: req.user, transaction: transaction, portfolio: transaction.portfolio, formatDate: format });
  });
};

// Handle Transaction delete on POST.
exports.transaction_delete_post = (req, res, next) => {
  Transaction.findByIdAndRemove(req.body.transactionid, (err) => {
    if (err) { return next(err); }
    // Success - go to bookinstance list
    res.redirect('/portfolio/' + req.params.portfolio_id);
  });
};

// Display Transaction update form on GET.
exports.transaction_update_get = (req, res, next) => {
  Transaction.findById(req.params.id).populate('portfolio')
  .exec((err, transaction) => {
    if (err) { return next(err); }
    if (transaction == null) { // No results.
      let err = new Error('Transaction not found');
      err.status = 404;
      return next(err);
    }
    // Success.
    res.render('transaction/transaction_update', { title: 'Edit Transaction', user: req.user, transaction: transaction, portfolio: transaction.portfolio, types: ['Buy', 'Sell'], formatDate: format });
  });
};

// Handle Transaction update on POST.
exports.transaction_update_post = [
  // Validate and sanitize fields.
  body('date', 'Invalid date').isISO8601().toDate(),
  body('ticker', 'Ticker must be between 1 and 5 characters').trim().isLength({ min: 1, max: 5 }).escape(),
  body('shares', 'Number of shares required').trim().isLength({ min: 1 }).escape()
    .isNumeric().withMessage('Entered value must be a number'),
  body('avg_price', 'Average price required').trim().isLength({ min: 1 }).escape()
    .isNumeric().withMessage('Entered value must be a number'),
  body('type').escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req).mapped();

    // Create a Genre object with escaped/trimmed data and old id.
    let transaction = new Transaction({
      date: req.body.date,
      ticker: req.body.ticker,
      shares: req.body.shares,
      avg_price: req.body.avg_price,
      type: req.body.type,
      portfolio: req.params.portfolio_id,
      user: req.user._id,
      _id: req.params.id,
    });

    if (Object.keys(errors).length > 0) {
      // There are errors. Render form again with sanitized values/errors messages.
      res.render('transaction/transaction_update', { title: 'Edit Transaction', user: req.user, transaction: transaction, portfolio: transaction.portfolio, types: ['Buy', 'Sell'], formatDate: format, errors: errors });
      return;
    } else {
      // Data from form is valid. Update the record.
      Transaction.findByIdAndUpdate(req.params.id, transaction, {}, (err, updated_transaction) => {
        if (err) { return next(err); }
        // Successful - redirect to portfolio detail page.
        req.session.message = 'Transaction updated! 👍';
        res.redirect(updated_transaction.url);
      });
    }
  }
];
