const bcrypt = require("bcryptjs");
const gentoken = require("../config/gen");
const Printershopreg = require("../models/printershopereg");

const printerlogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.json({ mess: "pleas fill the field" });
    return;
  }

  try {
    const printer = await Printershopreg.findOne({ email });
    if (!printer) {
      res.json({ mess: "printer shop not found" });
      return;
    }

    const isMatch = await bcrypt.compare(password, printer.password);
    if (!isMatch) {
      res.json({ mess: "invalid credentials" });
      return;
    }

    const token = await gentoken(printer._id);

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "None",
      secure: false,
    });

    console.log("printer logged in");
    res.json(printer);
  } catch (error) {
    console.error("Error during printer login:", error);
    res.status(500).json({ mess: "internal server error" });
  }
};

module.exports = { printerlogin };
