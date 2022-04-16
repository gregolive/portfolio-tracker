const passport = require('passport');

// Display home page if a user is loged in or redirect to log in.
exports.home = (req, res, next) => {
  if (req.user) {
    res.render('index', { title: 'Home', user: req.user });
  } else {
    res.redirect('/login');
  }
  return;
};

// Handle log in on GET.
exports.login_get = (req, res, next) => {
  res.render('login', { title: 'Log in' });
};

// Handle log in on POST.
exports.login_post = (
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  })
);

// Handle log out on GET.
exports.logout_get = (req, res, next) => {
  req.logout();
  res.redirect('/login');
};
