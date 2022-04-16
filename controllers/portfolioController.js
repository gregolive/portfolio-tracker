const Portfolio = require('../models/portfolio');
const { body, validationResult } = require('express-validator');

// Display detail page for a specific Portfolio.
exports.portfolio_detail = (req, res) => {
  res.send('NOT IMPLEMENTED: Portfolio detail: ' + req.params.id);
};

// Display Portfolio create form on GET.
exports.portfolio_create_get = (req, res, next) => {
  res.render('portfolio/portfolio_form', { title: 'Create Portfolio' });
};

// Handle Portfolio create on POST.
exports.portfolio_create_post = [
  // Validate and sanitize the name field.
  body('name', 'Portfolio name required').trim().isLength({ min: 1 }).escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {

    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a portfolio object with escaped and trimmed data.
    let portfolio = new Portfolio(
      { 
        name: req.body.name
      }
    );

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render('portfolio/portfolio_form', { title: 'Create Portfolio', portfolio: portfolio, errors: errors.array()});
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
exports.portfolio_delete_get = (req, res) => {
  res.send('NOT IMPLEMENTED: Portfolio delete GET');
};

// Handle Portfolio delete on POST.
exports.portfolio_delete_post = (req, res) => {
  res.send('NOT IMPLEMENTED: Portfolio delete POST');
};

// Display Portfolio update form on GET.
exports.portfolio_update_get = (req, res) => {
  res.send('NOT IMPLEMENTED: Portfolio update GET');
};

// Handle Portfolio update on POST.
exports.portfolio_update_post = (req, res) => {
  res.send('NOT IMPLEMENTED: Portfolio update POST');
};
