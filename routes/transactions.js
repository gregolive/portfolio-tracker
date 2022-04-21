var express = require('express');
var router = express.Router({ mergeParams: true });

const transaction_controller = require('../controllers/transactionController');
const { authenticateUser } = require('../config/auth-config');

// GET request for creating a Transaction.
router.get('/create', authenticateUser, transaction_controller.transaction_create_get);

// POST request for creating Transaction.
router.post('/create', authenticateUser, transaction_controller.transaction_create_post);

// GET request for list of all Transactions.
router.get('/all', authenticateUser, transaction_controller.transaction_list);

// GET request to delete Transaction.
router.get('/:id/delete', authenticateUser, transaction_controller.transaction_delete_get);

// POST request to delete Transaction.
router.post('/:id/delete', authenticateUser, transaction_controller.transaction_delete_post);

// GET request to update Transaction.
router.get('/:id/update', authenticateUser, transaction_controller.transaction_update_get);

// POST request to update Transaction.
router.post('/:id/update', authenticateUser, transaction_controller.transaction_update_post);

// GET request for one Transaction.
router.get('/:id', authenticateUser, transaction_controller.transaction_detail);

module.exports = router;