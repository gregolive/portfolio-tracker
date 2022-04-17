const passport = require('passport');

// Display home page if a user is loged in or redirect to log in.
exports.home = (req, res, next) => {
  const message = req.session.message;
  res.render('index', { title: 'Home', user: req.user, message: message });
};

// Handle log in on GET.
exports.login_get = (req, res, next) => {
  const message = req.session.message;
  req.session.message = '';
  res.render('login', { title: 'Log in', message: message });
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
