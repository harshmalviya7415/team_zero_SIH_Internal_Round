const Printdetails = require("../models/printdetails");

const joblist = async (req, res) => {
  try {
    const userid = req.userId;
    const jobs = await Printdetails.find({ userid })
      .populate("printershopid")
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ mess: "internal server error" });
  }
};

module.exports = { joblist };
