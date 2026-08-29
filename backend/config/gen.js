const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const gentoken = async (id) => {
  try {
    const token = await jwt.sign({ id }, process.env.SECRET_KEY, {
      expiresIn: "30d",
    });
    return token;
  } catch (error) {
    console.error("Eror On genrate token", error);
  }
};

module.exports = gentoken;
