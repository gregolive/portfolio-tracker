var express = require('express');
var router = express.Router();

const user_controller = require('../controllers/userController');

// GET request for one User.
router.get('/:username', user_controller.user_detail);

// GET request to delete User.
router.get('/:id/delete', user_controller.user_delete_get);

// POST request to delete User.
router.post('/:id/delete', user_controller.user_delete_post);

// GET request to update User.
router.get('/:id/update', user_controller.user_update_get);

// POST request to update User.
router.post('/:id/update', user_controller.user_update_post);

module.exports = router;
