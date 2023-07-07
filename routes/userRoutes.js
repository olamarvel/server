const express = require('express');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const userController = require('../controllers/userController');
const dashController = require('../controllers/dashboard');
const { verifyToken, verifyGetRouteToken } = require('../middleware/auth');


const router = express.Router();

router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/add-url',verifyToken, userController.addUrl);
router.get('/fetch-stats/:token', verifyGetRouteToken, userController.fetchUserStats);
router.get('/',dashController.allClick)
module.exports = router;
