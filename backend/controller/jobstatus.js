const Printdetails = require("../models/printdetails");
const { getIO } = require("../config/socket");

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

    // Emit real-time status update to all connected user clients
    try {
      const io = getIO();
      io.emit("job_status_changed", {
        jobId: job._id.toString(),
        status: dbStatus
      });
      console.log(`Real-time job status broadcasted for: ${jobId} -> ${dbStatus}`);
    } catch (socketError) {
      console.error("Failed to broadcast job status change socket event:", socketError.message);
    }

    res.json(job);
  } catch (error) {
    console.error("Error updating job status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { jobStatusUpdate };
