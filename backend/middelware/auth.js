const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "not authenticated" });

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.userId = decoded.id;
    next();
  } catch (err) {
    console.error("auth errors", err);
    return res.status(401).json({ message: "invalid or expired token" });
  }
};

module.exports = { auth };
