const passport = require('passport');
const Portfolio = require('../models/portfolio');
const Transaction = require('../models/transaction');
const async = require('async');
const { format } = require('date-fns');

// Display home page if a user is loged in or redirect to log in.
exports.home = (req, res, next) => {
  async.parallel({
    portfolio: (callback) => {
      Portfolio.findOne({ 'owner': req.user._id }).exec(callback);
    },
    transactions: (callback) => {
      Transaction.find({ 'user': req.user._id }).sort({ date: -1}).exec(callback);
    },
  }, (err, results) => {
    if (err) { return next(err); }
    // Successful, so render.
    const total = results.transactions.reduce((sum, t) => sum + t.total, 0).toFixed(2);
    const top_holdings = results.transactions.reduce((holdings, transaction) => {
      const target = holdings.find((el) => el.ticker === transaction.ticker);
      if (target) {
        target.total += transaction.total;
      } else {
        holdings.push({ ticker: transaction.ticker, total: transaction.total  })
      }
      return holdings;
    }, []).slice(0, 3);
    const recent_transactions = results.transactions.slice(0, 3) || [];
    res.render('index', { title: 'Home', user: req.user, portfolio: results.portfolio, total: total, top_holdings: top_holdings, recent_transactions: recent_transactions, formatDate: format });
  });
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
