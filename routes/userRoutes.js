const express = require('express');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/add-url',verifyToken, userController.addUrl);

module.exports = router;
