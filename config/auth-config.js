exports.authenticateUser = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
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
