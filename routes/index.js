const express = require('express');
const router = express.Router();
const passport = require('passport');

const user_controller = require('../controllers/userController');

/* GET home page if user signed in or redirect to sign in page. */
router.get('/', (req, res) => {
  if (req.user) {
    res.render('index', { title: 'Home', user: req.user });
  } else {
    res.redirect('/sign-in');
  }
});

/* GET sign in */
router.get('/sign-in', (req, res) => {
  res.render('sign-in', { title: 'Sign in' });
});

/* POST sign in */
router.post('/sign-in',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/sign-in'
  })
);

/* GET sign out */
router.get('/sign-out', (req, res) => {
  req.logout();
  res.redirect('/sign-in');
});

/* GET sign up (create new User) */
router.get('/sign-up', user_controller.user_create_get);

/* POST sign up (create new User) */
router.post('/sign-up', user_controller.user_create_post);

module.exports = router;
