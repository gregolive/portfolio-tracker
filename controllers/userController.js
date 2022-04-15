const User = require('../models/user');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

// Display User create form on GET.
exports.user_create_get = (req, res, next) => {
  res.render('sign-up', { title: 'Sign up' });
};

// Handle User create on POST.
exports.user_create_post = [
  // Validate and sanitize fields.
  body('username').trim().isLength({ min: 1 }).escape().withMessage('Username cannot be blank.')
    .isAlphanumeric().withMessage('Username has non-alphanumeric characters.').custom(username => {
      return User.findOne({ username: username }).then(user => {
        if (user) { return Promise.reject('Username already in use'); }
      });
    }),
  body('email').trim().escape().isEmail().withMessage('Email must be valid.').custom(email => {
    return User.findOne({ email: email }).then(user => {
      if (user) { return Promise.reject('Email already in use.'); }
    });
  }),
  body('password').trim().isLength({ min: 1 }).escape().withMessage('Please enter a password.'),
  body('passwordConfirm').trim().custom((value, { req }) => {
    if (value !== req.body.password) { throw new Error('Passwords do not match.'); }
    return true; // Indicates the success of this synchronous custom validator
  }),
  
  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req).mapped();

    if (Object.keys(errors).length > 0) {
      // There are errors. Render form again with sanitized values/errors messages.
      res.render('sign-up', { title: 'Sign up', user: req.body, errors: errors });
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
        user.save(function (error) {
          if (error) { return next(error); }
          // Successful - redirect home.
          res.redirect('/');
        });
      });
    }
  }
];
