const Printershopreg = require("../models/printershopereg");

const Printershopstatus = require("../models/printershopstatus");

const printerlist = async (req, res) => {
  try {
    const printers = await Printershopreg.find({});
    const statuses = await Printershopstatus.find({});

    const printersWithStatus = printers.map(p => {
      const shopStatus = statuses.find(s => s.printershopid.toString() === p._id.toString());
      return {
        ...p.toObject(),
        statusDetails: shopStatus ? {
          status: shopStatus.status,
          isavailableforbw: shopStatus.isavailableforbw,
          isavailableforcolor: shopStatus.isavailableforcolor
        } : {
          status: "Inactive",
          isavailableforbw: false,
          isavailableforcolor: false
        }
      };
    });

    res.json(printersWithStatus);
  } catch (error) {
    console.error("Error listing printers:", error);
    res.status(500).json({ mess: "internal server error" });
  }
};

module.exports = { printerlist };
