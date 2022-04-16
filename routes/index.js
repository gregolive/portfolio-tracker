const express = require('express');
const router = express.Router();

const index_controller = require('../controllers/indexController');
const user_controller = require('../controllers/userController');

// GET home page.
router.get('/', index_controller.home);

// GET request to sign in.
router.get('/sign-in', index_controller.sign_in_get);

// POST request to sign in.
router.post('/sign-in', index_controller.sign_in_post);

// GET request to sign out.
router.get('/sign-out', index_controller.sign_out_get);

// GET request to sign up (create new User).
router.get('/sign-up', user_controller.user_create_get);

// POST request to sign up (create new User).
router.post('/sign-up', user_controller.user_create_post);

module.exports = router;
