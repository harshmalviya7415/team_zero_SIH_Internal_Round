const Printershopreg = require("../models/printershopereg");

const printerverify = async (req, res) => {
  try {
    const printer = await Printershopreg.findById(req.userId).select("-password");
    if (!printer) {
      return res.status(401).json({ mess: "printer shop not found" });
    }
    res.json(printer);
  } catch (error) {
    console.error("Printer verification error:", error);
    res.status(500).json({ mess: "internal server error" });
  }
};

module.exports = { printerverify };
