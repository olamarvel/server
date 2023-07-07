const { parseAsync } = require('json2csv')
const client = require('../services/sanityService')
const { isToday } = require('../utils')

exports.allClick = async (req, res) => {
 try {
  // Fetch all users and their userStats
  const query = `*[_type == "user"]{ _id, username, userStat[]->{ _id, click } }`
  const users = await client.fetch(query)
  console.log(`users`, users)
  // Calculate the total clicks of all users
  const totalClicks = users.reduce((total, user) => {
   const todayStat = user?.userStat?.find(stat => isToday(stat?.createdAt))
   return total + (todayStat ? todayStat.click : 0)
  }, 0)
  console.log(`totalClicks`, totalClicks)

  // Prepare the userStats data for CSV conversion
  const userStats = users.map(user => {
   const todayStat = user?.userStat?.find(stat => isToday(stat?.createdAt))
   return {
    userId: user._id,
    username: user.username,
    click: todayStat ? todayStat.click : 0,
   }
  })

  // Convert userStats data to CSV
  const csvData = await parseAsync(userStats, {
   fields: ['userId', 'username', 'click'],
  })

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
