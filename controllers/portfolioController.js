const Portfolio = require('../models/portfolio');
const { body, validationResult } = require('express-validator');
const async = require('async');

// Display detail page for a specific Portfolio.
exports.portfolio_detail = (req, res, next) => {
  async.parallel({
    portfolio: function(callback) {
        Portfolio.findById(req.params.id)
          .exec(callback);
    },
  }, function(err, results) {
      if (err) { return next(err); }
      if (results.portfolio == null) { // No results.
          let err = new Error('Portfolio not found');
          err.status = 404;
          return next(err);
      }
      // Successful, so render
      res.render('portfolio/portfolio_detail', { title: results.portfolio.name, user: req.user, portfolio: results.portfolio } );
  });
};

// Display Portfolio create form on GET.
exports.portfolio_create_get = (req, res, next) => {
  res.render('portfolio/portfolio_form', { title: 'Create Portfolio', user: req.user });
};

// Handle Portfolio create on POST.
exports.portfolio_create_post = [
  // Validate and sanitize the name field.
  body('name', 'Genre name required').trim().isLength({ min: 1 }).escape().withMessage('Portfolio named required.'),

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
      portfolio.save(function (err) {
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
