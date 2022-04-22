const User = require('../models/user');
const Portfolio = require('../models/portfolio');
const Transaction = require('../models/transaction');
const { body, validationResult } = require('express-validator');
const async = require('async');
const bcrypt = require('bcryptjs');

// Display detail page for a specific User.
exports.user_detail = (req, res, next) => {
  async.parallel({
    user: (callback) => {
      User.findOne({ username: req.params.username }).exec(callback)
    },
    portfolio: (callback) => {
      Portfolio.findOne({ 'owner': req.user._id }).exec(callback);
    },
    transaction_count: (callback) => {
      Transaction.countDocuments({ 'user': req.user._id }, callback)
    },
  }, (err, results) => {
    if (err) { return next(err); }
    //Successful, so render
    const message = req.session.message;
    if (message) { req.session.message = ''; }
    res.render('user/user_detail', { title: results.user.username, user: results.user, portfolio: results.portfolio, transaction_count: results.transaction_count, message: message });
  });
};

// Display User create form on GET.
exports.user_create_get = (req, res, next) => {
  res.render('register', { title: 'Register' });
};

// Handle User create on POST.
exports.user_create_post = [
  // Validate and sanitize fields.
  body('username').trim().isLength({ min: 5 }).escape().withMessage('Username must be at least 5 characters long')
    .isAlphanumeric().withMessage('Username has non-alphanumeric characters').custom(username => {
      return User.findOne({ username: username }).then(user => {
        if (user) { return Promise.reject('Username already in use'); }
      });
    }),
  body('email').trim().escape().isEmail().withMessage('Email must be valid').custom(email => {
    return User.findOne({ email: email }).then(user => {
      if (user) { return Promise.reject('Email already in use'); }
    });
  }),
  body('password').trim().isLength({ min: 6 }).escape().withMessage('Password must be at least 6 characters long'),
  body('passwordConfirm').trim().isLength({ min: 6 }).escape().withMessage('Please confirm your password').custom((value, { req }) => {
    if (value !== req.body.password) { throw new Error('Passwords do not match'); }
    return true;
  }),
  
  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req).mapped();

    if (Object.keys(errors).length > 0) {
      // There are errors. Render form again with sanitized values/errors messages.
      res.render('register', { title: 'Register', user: req.body, errors: errors });
      return;
    } else {
      // Data from form is valid. Create an User object with escaped and trimmed data and hashed password.
      bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
        if (err) { return next(err); }
        let user = new User({
          username: req.body.username,
          email: req.body.email,
          password: hashedPassword,
        });
        user.save((error) => {
          if (error) { return next(error); }
          // Successful - redirect home.
          req.session.message = 'Account created! 🎉 Please login.';
          res.redirect('/login');
        });
      });
    }
  }
];

// Display User delete form on GET.
exports.user_delete_get = (req, res, next) => {
  async.parallel({
    portfolio: (callback) => {
      Portfolio.findOne({ 'owner': req.user._id }).exec(callback)
    },
    transaction_count: (callback) => {
      Transaction.countDocuments({ 'user': req.user._id }, callback)
    },
  }, (err, results) => {
    if (err) { return next(err); }
    if (req.user == null) { // No results, redirect to index.
      res.redirect('/');
    }
    // Successful, so render.
    res.render('user/user_delete', { title: 'Delete Account', user: req.user, portfolio: results.portfolio, transaction_count: results.transaction_count });
  });
};

// Handle User delete on POST.
exports.user_delete_post = (req, res, next) => {
  // Delete user, their portfolio, and transactions.
  async.parallel({
    one: (callback) => {
      User.findByIdAndDelete(req.body.userid).exec(callback)
    },
    two: (callback) => {
      Portfolio.deleteOne({ 'owner': req.body.userid }).exec(callback)
    },
    three: (callback) => {
      Transaction.deleteMany({ 'user': req.body.userid }).exec(callback)
    },
  }, (err, results) => {
    if (err) { return next(err); }
    // Success - go to login page
    res.redirect('/');
  });
};

// Display User update form on GET.
exports.user_update_get = (req, res, next) => {
  // Get user for form.
  async.parallel({
    user: (callback) => {
      User.findOne({ username: req.params.username }).exec(callback)
    },
    portfolio: (callback) => {
      Portfolio.findOne({ 'owner': req.user._id }).exec(callback);
    },
  }, (err, results) => {
    if (err) { return next(err); }
    if (results.user == null) { // No results.
      let err = new Error('User not found');
      err.status = 404;
      return next(err);
    }
    // Success.
    res.render('user/user_update', { title: 'Update Account', user: results.user, portfolio: results.portfolio });
  });
};

// Handle User update on POST.
exports.user_update_post = [
  // Validate and sanitize fields.
  body('username').trim().isLength({ min: 5 }).escape().withMessage('Username must be at least 5 characters long')
    .isAlphanumeric().withMessage('Username has non-alphanumeric characters').custom((username, { req }) => {
      return User.findOne({ username: username }).then(user => {
        if (user && username !== req.user.username) { return Promise.reject('Username already in use'); }
      });
    }),
  body('email').trim().escape().isEmail().withMessage('Email must be valid').custom((email, { req }) => {
    return User.findOne({ email: email }).then(user => {
      if (user && email !== req.user.email) { return Promise.reject('Email already in use'); }
    });
  }),
  body('password').trim().isLength({ min: 6 }).escape().withMessage('Password must be at least 6 characters long'),
  body('passwordConfirm').trim().isLength({ min: 6 }).escape().withMessage('Please confirm your password').custom((value, { req }) => {
    if (value !== req.body.password) { throw new Error('Passwords do not match'); }
    return true;
  }),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req).mapped();

    if (Object.keys(errors).length > 0) {
      // There are errors. Render form again with sanitized values/errors messages.
      res.render('user/user_update', { title: 'Update Account', user: req.body, errors: errors });
      return;
    } else {
      // Data from form is valid. Update the record. Create a User object with escaped/trimmed data and old id.
      bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
        if (err) { return next(err); }
        let user = new User({
          username: req.body.username,
          email: req.body.email,
          password: hashedPassword,
          _id: req.user._id,
        });
        User.findByIdAndUpdate(req.user._id, user, {}, (error, updated_user) => {
          if (error) { return next(error); }
          // Successful - redirect to user detail page.
          req.session.message = 'Account details updated! 👍';
          res.redirect(user.url);
        });
      });
    }
  }
];
