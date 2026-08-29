const bcrypt = require("bcryptjs");
const gentoken = require("../config/gen");
const Userreg = require("../models/user");

const userlogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.json({ mess: "pleas fill the field" });
    return;
  }

  try {
    const user = await Userreg.findOne({ email });
    if (!user) {
      res.json({ mess: "user not found" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.json({ mess: "invalid credentials" });
      return;
    }

    const token = await gentoken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "Lax",
      secure: false,
    });

    console.log("user logged in");
    res.json(user);
  } catch (error) {
    console.error("Error during user login:", error);
    res.status(500).json({ mess: "internal server error" });
  }
};

module.exports = { userlogin };
