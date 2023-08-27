function isToday(dateString) {
 try {
  const date = new Date(dateString)
  console.log(dateString)
  if (isNaN(date.getTime())) {
   console.error('Invalid date string: ', dateString)
   return false
  }
  const today = new Date()
  return (
   date.getDate() === today.getDate() &&
   date.getMonth() === today.getMonth() &&
   date.getFullYear() === today.getFullYear()
  )
 } catch (err) {
  console.error('Error parsing date string: ', err)
  return false
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

module.exports = { isToday, calculateTokenExpiration }
