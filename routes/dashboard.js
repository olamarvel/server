const express = require('express')
const { home, userClicks } = require('../controllers/dashboard')
const router = express.Router()
const { verifyToken, verifyGetRouteToken } = require('../middleware/auth')
const dashboard = require('./../controllers/dashboard')
router.get('/', dashboard.login)
router.post('/', dashboard.postLogin)
router.get("/home",dashboard.home)
router.get('/userClick', dashboard.userClicks)

module.exports = router