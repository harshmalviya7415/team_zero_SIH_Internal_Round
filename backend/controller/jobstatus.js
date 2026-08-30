const Printdetails = require("../models/printdetails");

const jobStatusUpdate = async (req, res) => {
  const { jobId, status } = req.body;

  if (!jobId || !status) {
    return res.status(400).json({ message: "Job ID and Status are required" });
  }

  // Map frontend status to database status enums
  let dbStatus = status;
  if (status === "Printing" || status === "Queued" || status === "In Progress" || status === "printing") {
    dbStatus = "In Progress";
  } else if (status === "Ready for Collection" || status === "Completed" || status === "collected" || status === "ready") {
    dbStatus = "Completed";
  }

  try {
    const job = await Printdetails.findByIdAndUpdate(
      jobId,
      { printstatus: dbStatus },
      { new: true }
    );

    if (!job) {
      return res.status(404).json({ message: "Print job not found" });
    }

    console.log(`Job ${jobId} status updated to ${dbStatus}`);
    res.json(job);
  } catch (error) {
    console.error("Error updating job status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { jobStatusUpdate };
