const { parseAsync } = require('json2csv')
const client = require('../services/sanityService')
const { isToday, calculateTokenExpiration } = require('../utils')

exports.allClick = async (req, res) => {
 try {
  // Fetch all users and their userStats
  const csvData = await convertClickCsv()

  // Set the response headers for CSV download
  res.setHeader('Content-Type', 'text/csv; charset=utf-8')
  res.setHeader('Content-Disposition', 'attachment; filename=userStats.csv')

  // Send the CSV data as the response
  res.send(csvData)
 } catch (error) {
  console.error(error)
  res.status(500).json({ message: 'Error retrieving userStats' })
 }
}

exports.saveClicksToFile = async () => {
 try {
  const csvData = await convertClickCsv()

  // Define the path for the CSV file
  const filePath = path.join(__dirname, 'userStats.csv')

  // Write the CSV data to a file on the server
  fs.writeFileSync(filePath, csvData)
 } catch (error) {
  console.error(error)
  res.status(500).json({ message: 'Error saving userStats' })
 }
}

exports.postLogin = async (req, res) => {
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

    res.render('home.ejs', { token, message: 'Logged in', click: user.click })
    // res.json({ token, message: 'Logged in', click: user.click })
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

exports.login = (req, res) => {
 res.render('login')
}

exports.home = async (req, res) => {
 const query = `*[_type == "stats"  && 
    dateTime(_createdAt) > dateTime(now()) - 60*60*24]
    |order(_createdAt,desc)
      .click
    `
 const stats = await client.fetch(query)

 const totalClicks = stats.reduce((total, stat) => total + (stat ? stat : 0), 0)
 res.render('home', { totalClicks })
}

exports.userClicks = async (req, res) => {
 const query = `*[_type == "stats"  && 
 dateTime(_createdAt) > dateTime(now()) - 60*60*24]
 |order(_createdAt,desc){
   click,"username":userId->username
 }`
 const userStat = await client.fetch(query)
 res.render('clicks', { userStat })
}

async function convertClickCsv() {
 const query = `*[_type == "stats"  && 
  dateTime(_createdAt) > dateTime(now()) - 60*60*24]
  |order(_createdAt,desc){
    click,"username":userId->username
  }`
 const stats = await client.fetch(query)
 //  console.log(`users`, stats)

 // Convert userStats data to CSV
 const csvData = await parseAsync(stats, {
  fields: ['username', 'click'],
 })
 return csvData
}
