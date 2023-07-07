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

exports.login = async (req, res) => {
 const { username, password } = req.body
 console.log(req.body)
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
     expiresIn: '1h', // Token will expire in 1 hour
    })

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
  // Fetch the user
  const userQuery = `*[_type == "user" && _id=="${id}"]{
    _id,
      userStat[]->
    }`
  const users = await client.fetch(userQuery)
  console.log(id, url, users, userQuery)
  // For simplicity, we're just using the first user
  const user = users[0]

  if (!user) {
   res.status(401).send('User not found')
   return
  } else if (!user.userStat) {
   user.userStat = []
  }

  // Check if the userStat for today already exists
  // Get today's date in "YYYY-MM-DD" format
  const userStatIndex = user?.userStat?.findIndex(stat =>
   isToday(stat.createdAt)
  )
  console.log(userStatIndex)
  if (userStatIndex === -1) {
   // Create a new stats document for today's userStat
   const statsTransaction = client.create({
    _type: 'stats',
    ids: [url],
    createdAt: new Date().toISOString(),
    click: 1,
   })

   const statsDoc = await statsTransaction
   const userTransaction = client.transaction().patch(user._id, {
    set: {
     userStat: [
      ...(user.userStat || []),
      { _type: 'reference', _ref: statsDoc._id, _key: uuidv4() },
     ],
    },
   })

   await userTransaction.commit()

   res.json({ message: 'stat_created:URL added', click: statsDoc.click })
  } else {
   // Update existing stats document for today's userStat
   if (user?.userStat[userStatIndex]?.ids?.includes(url)) {
    res.status(400).json({
     message: 'URL already exists',
     click: user?.userStat[userStatIndex]?.click,
    })
    return
   }

   const statsId = user.userStat[userStatIndex]._id
   const statsTransaction = client.transaction().patch(statsId, patch => {
    patch.set({ ids: [...user.userStat[userStatIndex].ids, url] })
    patch.inc({ click: 1 })
    return patch
   })

   console.log(`statsTransaction`, await statsTransaction.commit())

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
  const userQuery = `*[_type == "user" && _id == "${id}"] {
      _id,
      userStat[]-> {
        _id,
        click,
        createdAt,
      },
    }`
  const users = await client.fetch(userQuery)

  if (!users || users.length === 0) {
   res.status(404).json({ message: 'User not found' })
   return
  }

  const user = users[0]

  if (!user.userStat) {
   user.userStat = []
  }

  // Get today's userStat if it exists
  const todayStat = user.userStat.find(stat => isToday(stat.createdAt))
  console.log(todayStat, user.userStat)
  const clickData = {
   totalClicks: todayStat ? todayStat.click : 0,
   stats: user.userStat.map(stat => ({
    id: stat._id,
    click: stat.click,
    createdAt: stat.createdAt,
   })),
  }

  res.json(clickData)
 } catch (error) {
  console.error(error)
  res.status(500).json({ message: 'Error fetching user stats' })
 }
}
