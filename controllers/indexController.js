const passport = require('passport');

// Display home page if a user is signed in or redirect to sign in.
exports.home = (req, res, next) => {
  if (req.user) {
    res.render('index', { title: 'Home', user: req.user });
  } else {
    res.redirect('/sign-in');
  }
};

// Handle sign in on GET.
exports.sign_in_get = (req, res, next) => {
  res.render('sign-in', { title: 'Sign in' });
};

// Handle sign in on POST.
exports.sign_in_post = (
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/sign-in'
  })
);

// Handle sign out on GET.
exports.sign_out_get = (req, res, next) => {
  req.logout();
  res.redirect('/sign-in');
};
