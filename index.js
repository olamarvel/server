// require('dotenv').config()
// const express = require('express');
// const bodyParser = require('body-parser');
// const sanityClient = require('@sanity/client');
// const cors = require('cors');
// const bcrypt = require('bcrypt');
// const saltRounds = 10;

// // Instantiate the Sanity client
// const client = sanityClient({
//   projectId: process.env.SANITY_PROJECT_ID,
//   dataset: process.env.SANITY_DATASET,
//   token: process.env.SANITY_TOKEN,
//   apiVersion:'2021-10-21',
//   useCdn: false // `false` if you want to ensure fresh data
// });

// const app = express();

// app.use(cors()); // use CORS middleware
// app.use(bodyParser.json()); // for parsing application/json

// app.post('/user/register', async (req, res) => {
//   const { email, password } = req.body;
//   // Hash the password before storing it
//   bcrypt.hash(password, saltRounds, async (err, hash) => {
//     if (err) {
//       res.status(500).json({ message: 'Error hashing password' });
//     } else {
//       // Store the user with the hashed password
//       const transaction = client
//         .transaction()
//         .create({ _type: 'user', email, password: hash });

//       await transaction.commit();
//       res.json({ message: 'User registered' });
//     }
//   });
// });

// app.post('/user/login', async (req, res) => {
//   const { email, password } = req.body;

//   // Fetch the user with the provided email
//   const query = `*[_type == "user" && email == $email]`;
//   const params = { email };
//   const users = await client.fetch(query, params);

//   // For simplicity, we're assuming there's only one user with that email
//   const user = users[0];

//   if (user) {
//     // Compare the provided password with the stored hashed password
//     bcrypt.compare(password, user.password, (err, result) => {
//       if (err) {
//         res.status(500).json({ message: 'Error comparing passwords' });
//       } else if (result) {
//         res.json({ token: '123', message: 'Logged in' });
//       } else {
//         res.status(401).json({ message: 'Invalid credentials' });
//       }
//     });
//   } else {
//     res.status(401).json({ message: 'Invalid credentials' });
//   }
// });

// // Login endpoint (for the sake of example, it's super simplified)
// app.post('/user/login', async (req, res) => {
//   const { email, password } = req.body;

//   // Fetch the user with the provided email
//   const query = `*[_type == "user" && email == $email]`;
//   const params = { email };
//   const users = await client.fetch(query, params);

//   // For simplicity, we're assuming there's only one user with that email
//   const user = users[0];

//   // In real life, NEVER store or compare passwords in plain text!
//   if (user && user.password === password) {
//     res.json({ token: '123', message: 'Logged in' });
//   } else {
//     res.status(401).json({ message: 'Invalid credentials' });
//   }
// });

// // Add URL endpoint
// app.post('/user/add-url', async (req, res) => {
//   const { url, token } = req.body;

//   // For simplicity, we're not actually checking the token
//   // In real life, use the token to find the corresponding user

//   const userQuery = `*[_type == "user"]`;
//   const users = await client.fetch(userQuery);

//   // For simplicity, we're just using the first user
//   const user = users[0];

//   if (!user.urls.includes(url)) {
//     user.urls.push(url);
//     user.clicks += 1;

//     const transaction = client
//       .transaction()
//       .patch(user._id, {
//         set: { urls: user.urls, clicks: user.clicks }
//       });

//     await transaction.commit();
//     res.json({ message: 'URL added' });
//   } else {
//     res.status(400).json({ message: 'URL already exists' });
//   }
// });

// const port = process.env.PORT || 3000;
// app.listen(port, () => console.log(`Server running on port ${port}`));

require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const routes = require('./routes')

const app = express()

app.use(cors())
app.use(bodyParser.json())

app.use('/', routes)

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Server running on port ${port}`))

module.exports = { app }
