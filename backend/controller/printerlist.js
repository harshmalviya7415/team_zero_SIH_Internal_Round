const Printershopreg = require("../models/printershopereg");

const printerlist = async (req, res) => {
  try {
    const printers = await Printershopreg.find({});
    res.json(printers);
  } catch (error) {
    console.error("Error listing printers:", error);
    res.status(500).json({ mess: "internal server error" });
  }
};

module.exports = { printerlist };
