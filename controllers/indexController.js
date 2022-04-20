const passport = require('passport');
const Portfolio = require('../models/portfolio');
const Transaction = require('../models/transaction');
const { portfolioValue, portfolioHoldings } = require('../config/query-config');
const async = require('async');
const { format } = require('date-fns');

// Display home page if a user is loged in or redirect to log in.
exports.home = (req, res, next) => {
  async.parallel({
    portfolio: (callback) => {
      Portfolio.findOne({ 'owner': req.user._id }).exec(callback);
    },
    transactions: (callback) => {
      Transaction.find({ 'user': req.user._id }).sort({ date: -1 }).exec(callback);
    },
  }, (err, results) => {
    if (err) { return next(err); }
    // Successful, so render.
    const portfolio_value = portfolioValue(results.transactions);
    const top_holdings = portfolioHoldings(results.transactions).slice(0, 3);
    const recent_transactions = results.transactions.slice(0, 3);
    res.render('index', { title: 'Home', user: req.user, portfolio: results.portfolio, portfolio_value: portfolio_value, top_holdings: top_holdings, recent_transactions: recent_transactions, formatDate: format });
  });
};

// Handle log in on GET.
exports.login_get = (req, res, next) => {
  const message = req.session.message;
  if (message) { req.session.message = ''; }
  res.render('login', { title: 'Log in', message: message });
};

// Handle log in on POST.
exports.login_post = (
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true,
  })
);

// Handle log out on GET.
exports.logout_get = (req, res, next) => {
  req.logout();
  res.redirect('/login');
};
