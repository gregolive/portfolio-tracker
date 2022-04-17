var express = require('express');
var router = express.Router();

const user_controller = require('../controllers/userController');
const { authenticateUser } = require('../config/auth-config');

// GET request to delete User.
router.get('/:username/delete', authenticateUser, user_controller.user_delete_get);

// POST request to delete User.
router.post('/:username/delete', authenticateUser, user_controller.user_delete_post);

// GET request to update User.
router.get('/:username/update', authenticateUser, user_controller.user_update_get);

// POST request to update User.
router.post('/:username/update', authenticateUser, user_controller.user_update_post);

// GET request for one User.
router.get('/:username', authenticateUser, user_controller.user_detail);

module.exports = router;
