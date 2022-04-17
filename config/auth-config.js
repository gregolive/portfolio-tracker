exports.authenticateUser = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.session.message = 'Please log in to continue.';
    res.redirect('/login');
  }
};

exports.checkNotAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  } else {
    next();
  }
};
