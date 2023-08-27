const express = require('express')
const userRoutes = require('./userRoutes')
const dashboardRoute = require('./dashboard')

const router = express.Router()

router.use('/user', userRoutes)
router.use('/dashboard', dashboardRoute)

module.exports = router
