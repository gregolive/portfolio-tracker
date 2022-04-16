const express = require('express');
const router = express.Router();

const index_controller = require('../controllers/indexController');
const user_controller = require('../controllers/userController');
const { authenticateUser, checkNotAuthenticated } = require('../config/auth-config');

// GET home page.
router.get('/', authenticateUser, index_controller.home);

// GET request to log in.
router.get('/login', checkNotAuthenticated, index_controller.login_get);

// POST request to log in.
router.post('/login', checkNotAuthenticated, index_controller.login_post);

// GET request to log out.
router.get('/logout', index_controller.logout_get);

// GET request to register (create new User).
router.get('/register', checkNotAuthenticated, user_controller.user_create_get);

// POST request to register (create new User).
router.post('/register', checkNotAuthenticated, user_controller.user_create_post);

module.exports = router;
