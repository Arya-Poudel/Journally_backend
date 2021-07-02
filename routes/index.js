const express = require('express');
const router = express.Router();
const home_controller = require('../controllers/home_controller');

/* show home page. */
router.get('/', home_controller.home_page);

router.post('/signup', home_controller.create_user);

module.exports = router;
