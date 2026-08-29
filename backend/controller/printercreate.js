const bcrypt = require("bcryptjs");
const gentoken = require("../config/gen");
const Printershopreg = require("../models/printershopereg");

const printercreat = async (req, res) => {
  const { fullname, shopname, email, mobile, college, services, pagesizes, password } = req.body;
  
  if (!fullname || !shopname || !email || !mobile || !college || !services || !pagesizes || !password) {
    res.json({ mess: "pleas fill the field" });
    return;
  }

  try {
    const emailid = await Printershopreg.findOne({ email });
    const mobileid = await Printershopreg.findOne({ mobile });

    if (emailid) {
      res.json({ mess: "email alredy exixt" });
      console.log("email alredy exixt");
      return;
    }
    if (mobileid) {
      res.json({ mess: "mobile number alredy exixt" });
      console.log("mobile number alredy exixt");
      return;
    }

    const hashpass = await bcrypt.hash(password, 10);

    const printerf = await Printershopreg.create({
      fullname,
      shopname,
      email,
      mobile,
      college,
      services,
      pagesizes,
      password: hashpass,
    });

    const token = await gentoken(printerf._id);

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "None",
      secure: false,
    });
    
    console.log("printercreated");
    res.json(printerf);
  } catch (error) {
    console.error("Error creating printer:", error);
    res.status(500).json({ mess: "internal server error" });
  }
};

module.exports = { printercreat };
