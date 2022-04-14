const express = require('express');
const router = express.Router();

/* GET home page if user signed in or redirect to sign in page. */
router.get('/', (req, res, next) => {
  if (req.user) {
    res.render('index', { title: 'Home', user: req.user });
  } else {
    res.redirect('/sign-in');
  }
});

/* GET sign in */
router.get('/sign-in', (req, res, next) => {
  res.render('sign-in', { title: 'Sign in' });
});

/* GET sign up */
router.get('/sign-up', (req, res, next) => {
  res.render('sign-up', { title: 'Sign up' });
});

module.exports = router;
