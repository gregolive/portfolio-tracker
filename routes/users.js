var express = require('express');
var router = express.Router();

const user_controller = require('../controllers/userController');

/* GET request for one User. */
router.get('/:username', user_controller.user_view);

module.exports = router;
