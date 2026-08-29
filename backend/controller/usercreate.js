const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const gentoken = require("../config/gen");
const Userreg = require("../models/user");
const usercreat = async (req, res) => {
  const { fullname, email, mobile, college, password } = req.body;
  if (!fullname || !email || !mobile || !college || !password) {
    res.json({ mess: "pleas fill the field" });
    return;
  }
  const emailid = await Userreg.findOne({ email });
  const mobileid = await Userreg.findOne({ mobile });
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

  const userf = await Userreg.create({
    fullname,
    email,
    mobile,
    college,
    password: hashpass,
  });

  const token = await gentoken(userf._id);

  res.cookie("token", token, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: "Lax",
    secure: false,
  });
  console.log("usercreated");
  res.json(userf);
};

module.exports = { usercreat };
