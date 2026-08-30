const Printdetails = require("../models/printdetails");

const printerjoblist = async (req, res) => {
  try {
    const printershopid = req.userId;
    const jobs = await Printdetails.find({ printershopid, printstatus: { $ne: "Pending" } })
      .populate("userid")
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    console.error("Error fetching printer jobs:", error);
    res.status(500).json({ mess: "internal server error" });
  }
};

module.exports = { printerjoblist };
