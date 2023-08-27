const bcrypt = require('bcrypt')
const saltRounds = 10
const client = require('../services/sanityService')
const jwt = require('jsonwebtoken')
const { v4: uuidv4 } = require('uuid')

const { isToday } = require('../utils')

exports.register = async (req, res) => {
 const { username, password } = req.body

 try {
  // Hash the password before storing it
  const hashedPassword = await bcrypt.hash(password, saltRounds)

  // Store the user with the hashed password
  const transaction = client.transaction().create({
   _type: 'user',
   username,
   password: hashedPassword,
  })

  await transaction.commit()
  res.json({ message: 'User registered' })
 } catch (error) {
  res.status(500).json({ message: 'Error registering user' })
 }
}
const calculateTokenExpiration = () => {
 const now = new Date()
 const midnight = new Date(
  now.getFullYear(),
  now.getMonth(),
  now.getDate() + 1,
  0,
  0,
  0,
  0
 )
 const expiresIn = Math.floor((midnight.getTime() - now.getTime()) / 1000)
 return expiresIn
}
exports.login = async (req, res) => {
 const { username, password } = req.body
 console.log(req.body)
 const expiresIn = calculateTokenExpiration() // Calculate expiration to midnight

 try {
  if (!username || !password) {
   res.status(400).json({ message: 'Invalid username or password' })
   return
  }
  // Fetch the user with the provided username
  const query = `*[_type == "user" && username == $username]`
  const params = { username }
  const users = await client.fetch(query, params)

  // For simplicity, we're assuming there's only one user with that username
  const user = users[0]

  if (user) {
   // Compare the provided password with the stored hashed password
   const passwordMatch = await bcrypt.compare(password, user.password)

   if (passwordMatch) {
    const tokenPayload = {
     id: user._id,
     username: user.username,
    }

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
     expiresIn, // Token will expire in 1 hour
    })
    //TODO
    res.json({ token, message: 'Logged in', click: user.click })
   } else {
    res.status(401).json({ message: 'Invalid credentials' })
   }
  } else {
   res.status(401).json({ message: 'Invalid credentials' })
  }
 } catch (error) {
  console.error(error)
  res.status(500).json({ message: 'Error logging in' })
 }
}

exports.addUrl = async (req, res) => {
 const { url } = req.body
 const { id } = req.user

 try {
  
  const stasQuery = `*[_type == "stats" && userId._ref == "${id}" && dateTime(_createdAt) > dateTime(now()) - 60*60*24]|order(_createdAt,desc)[0]`
  const stats = await client.fetch(stasQuery)
  console.log(id, url, stats, stasQuery)

  if (!stats) {
   // Create a new stats document for today's userStat
   const statsTransaction = client.create({
    _type: 'stats',
    ids: [url],
    createdAt: new Date().toISOString(),
    userId: {
     _ref: id,
     _type: 'reference',
    },
    click: 1,
   })

   const statsDoc = await statsTransaction

   res.json({ message: 'stat_created:URL added', click: statsDoc.click })
  } else {
   // Update existing stats document for today's userStat
   if (stats.ids?.includes(url)) {
    res.status(400).json({
     message: 'URL already exists',
     click: stats.click,
    })
    return
   }

   const statsId = stats._id
   const statsTransaction = await client
    .patch(statsId)
    .append('ids', [url])
    .inc({ click: 1 })
    .commit()

   console.log(`statsTransaction`, statsTransaction)

   res.json({
    message: 'stat_updated:URL added',
    click: statsTransaction.click,
   })
   //  await statsTransaction.commit()
  }
 } catch (error) {
  console.log(error)
  res.status(500).json({ message: 'Error adding URL' })
 }
}

exports.fetchUserStats = async (req, res) => {
 const { id } = req.user

 try {
  // Fetch the user's stats
  const statQuery = `*[_type == "stats" && userId._ref == "${id}" && dateTime(_createdAt) > dateTime(now()) - 60*60*24]|order(_createdAt,desc)[0]`
  const stats = await client.fetch(statQuery)

  // if (!users || users.length === 0) {
  //  res.status(404).json({ message: 'User not found' })
  //  return
  // }

  // const user = users[0]

  // if (!user.userStat) {
  //  user.userStat = []
  // }

  // Get today's userStat if it exists
  // const todayStat = user.userStat.find(stat => isToday(stat.createdAt))
  // console.log(todayStat, user.userStat)
  const clickData = {
   totalClicks: stats ? stats.click : 0,
  }

  res.json(clickData)
 } catch (error) {
  console.error(error)
  res.status(500).json({ message: 'Error fetching user stats' })
 }
}

//aytosave
//token expise done
// username frontend
