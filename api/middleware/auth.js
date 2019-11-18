const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const authToken = req.headers.authorization.split(" ")[1];
    const verifiedToken = jwt.verify(authToken, process.env.JWT_PRIVATE_KEY);
    req.userData = verifiedToken;
    next();
  } catch (err) {
    return res.status(401).json({
      message: "User Auth failed"
    });
  }
};
