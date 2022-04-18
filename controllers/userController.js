const User = require('../models/user');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

// Display detail page for a specific User.
exports.user_detail = (req, res, next) => {
  User.findOne({ username: req.params.username })
    .exec((err, user) => {
      if (err) { return next(err); }
      //Successful, so render
      res.render('user/user_detail', { title: user.username, user: user });
  });
};

// Display User create form on GET.
exports.user_create_get = (req, res) => {
  res.render('register', { title: 'Register' });
};

// Handle User create on POST.
exports.user_create_post = [
  // Validate and sanitize fields.
  body('username').trim().isLength({ min: 5 }).escape().withMessage('Username must be at least 5 characters long.')
    .isAlphanumeric().withMessage('Username has non-alphanumeric characters.').custom(username => {
      return User.findOne({ username: username }).then(user => {
        if (user) { return Promise.reject('Username already in use.'); }
      });
    }),
  body('email').trim().escape().isEmail().withMessage('Email must be valid.').custom(email => {
    return User.findOne({ email: email }).then(user => {
      if (user) { return Promise.reject('Email already in use.'); }
    });
  }),
  body('password').trim().isLength({ min: 6 }).escape().withMessage('Password must be at least 6 characters long.'),
  body('passwordConfirm').trim().isLength({ min: 6 }).escape().withMessage('Please confirm your password.').custom((value, { req }) => {
    if (value !== req.body.password) { throw new Error('Passwords do not match.'); }
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
exports.user_delete_get = (req, res) => {
  res.send('NOT IMPLEMENTED: User delete GET');
};

// Handle User delete on POST.
exports.user_delete_post = (req, res) => {
  res.send('NOT IMPLEMENTED: User delete POST');
};

// Display User update form on GET.
exports.user_update_get = (req, res) => {
  res.send('NOT IMPLEMENTED: User update GET');
};

// Handle User update on POST.
exports.user_update_post = (req, res) => {
  res.send('NOT IMPLEMENTED: User update POST');
};
