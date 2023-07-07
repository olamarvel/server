const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const { token } = req.body;

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach the decoded user information to the request object
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

const verifyGetRouteToken = (req, res, next) => {
  const getToken = req.params.token
  if (!getToken) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(getToken, process.env.JWT_SECRET);
    req.user = decoded; // Attach the decoded user information to the request object
    next();
  } catch (err) {
    console.log(err)
    return res.status(403).json({ message: 'Invalid token' });
  }
};

module.exports = { verifyToken,verifyGetRouteToken };