const Printershopstatus = require("../models/printershopstatus");

const statusupdate = async (req, res) => {
  const { status, isavailableforbw, isavailableforcolor } = req.body;
  const printershopid = req.userId; 

  if (!status || isavailableforbw === undefined || isavailableforcolor === undefined) {
    res.json({ mess: "pleas fill all status details" });
    return;
  }

  try {
    
    const updatedStatus = await Printershopstatus.findOneAndUpdate(
      { printershopid },
      { status, isavailableforbw, isavailableforcolor },
      { new: true, upsert: true }
    );

    console.log("printer status updated");
    res.json(updatedStatus);
  } catch (error) {
    console.error("Error updating printer status:", error);
    res.status(500).json({ mess: "internal server error" });
  }
};

module.exports = { statusupdate };
