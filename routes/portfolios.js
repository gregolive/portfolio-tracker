var express = require('express');
var router = express.Router();

const portfolio_controller = require('../controllers/portfolioController');
const { authenticateUser } = require('../config/auth-config');

// GET request for one Portfolio.
router.get('/portfolio/:id', authenticateUser, portfolio_controller.portfolio_detail);

// GET request for creating a Portfolio.
router.get('/create', authenticateUser, portfolio_controller.portfolio_create_get);

// POST request for creating Portfolio.
router.post('/create', authenticateUser, portfolio_controller.portfolio_create_post);

// GET request to delete Portfolio.
router.get('/:id/delete', authenticateUser, portfolio_controller.portfolio_delete_get);

// POST request to delete Portfolio.
router.post('/:id/delete', authenticateUser, portfolio_controller.portfolio_delete_post);

// GET request to update Portfolio.
router.get('/:id/update', authenticateUser, portfolio_controller.portfolio_update_get);

// POST request to update Portfolio.
router.post('/:id/update', authenticateUser, portfolio_controller.portfolio_update_post);

module.exports = router;