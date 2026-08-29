const Userreg = require("../models/user");

const userverify = async (req, res) => {
  try {
    const user = await Userreg.findById(req.userId).select("-password");
    if (!user) {
      return res.status(401).json({ mess: "user not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ mess: "internal server error" });
  }
};

module.exports = { userverify };
