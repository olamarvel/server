require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const cron = require('node-cron');
const { saveClicksToFile } = require('./controllers/dashboard');

cron.schedule('59 23 * * *', saveClicksToFile);

const routes = require('./routes')

const app = express()


app.set('view engine', 'ejs');
app.use(cors())

// Use bodyParser.urlencoded middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())
app.use(express.static('public'));

app.use('/', routes)

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Server running on port ${port}`))

module.exports = { app }