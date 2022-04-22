const passport = require('passport');
const Portfolio = require('../models/portfolio');
const Transaction = require('../models/transaction');
const { portfolioHoldings, portfolioValue, portfolioCostBasis, dailyChange } = require('../config/query-config');
const axios = require('axios');
const { format } = require('date-fns');

// Display home page if a user is loged in or redirect to log in.
exports.home = async (req, res, next) => {
  const portfolio = await Portfolio.findOne({ 'owner': req.user._id }).catch((err) => { return next(err); });
  const transactions = await Transaction.find({ 'user': req.user._id }).sort({ date: -1 }).catch((err) => { return next(err); });
  
  const holdings = portfolioHoldings(transactions);
  for (let i = 0; i < holdings.length; i++) {
    await axios.get(`https://finnhub.io/api/v1/quote?symbol=${holdings[i].ticker}&token=${process.env.FINNHUB_API_KEY}`)
      .then((res) => {
        holdings[i].current_price = res.data['c'];
        holdings[i].day_change = res.data['d'];
        holdings[i].day_percent_change = res.data['dp'];
      });
  }
  holdings.sort((a, b) => (b.shares * b.current_price) - (a.shares * a.current_price))

  const recent_transactions = transactions.slice(0, 5);
  const top_holdings = holdings.slice(0, 3);
  for (let i = 0; i < top_holdings.length; i++) {
    await axios.get(`https://finnhub.io/api/v1/stock/profile2?symbol=${top_holdings[i].ticker}&token=${process.env.FINNHUB_API_KEY}`)
      .then((res) => top_holdings[i].company = res.data['name']);
  }
  
  const cost_basis = portfolioCostBasis(transactions);
  const portfolio_value = portfolioValue(holdings);
  const total_change = (portfolio_value - cost_basis);
  const total_percent_change = ((portfolio_value - cost_basis) / cost_basis * 100);
  const daily_change = dailyChange(holdings);
  const daily_percent_change = (daily_change / (portfolio_value - daily_change) * 100);
  
  res.render('index', {
    title: 'Home',
    user: req.user,
    portfolio: portfolio,
    top_holdings: top_holdings,
    recent_transactions: recent_transactions,
    portfolio_value: portfolio_value.toFixed(2),
    total_change: total_change.toFixed(2),
    total_percent_change: total_percent_change.toFixed(2),
    daily_change: daily_change.toFixed(2),
    daily_percent_change: daily_percent_change.toFixed(2),
    formatDate: format,
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
