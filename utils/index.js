function isToday(dateString) {
 try {
  const date = new Date(dateString)
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

module.exports = { isToday }
