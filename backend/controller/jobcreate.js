const Printdetails = require("../models/printdetails");

const jobcreat = async (req, res) => {
  const { printershopid, urlofprinddocument, printcopies, printpagenos, printpapersize, printcolor } = req.body;
  const userid = req.userId; 

  if (!printershopid || !urlofprinddocument || !printcopies || !printpagenos || !printpapersize || !printcolor) {
    res.json({ mess: "pleas fill all print details" });
    return;
  }

  try {
    const job = await Printdetails.create({
      printershopid,
      userid,
      urlofprinddocument,
      printcopies,
      printpagenos,
      printpapersize,
      printcolor,
      printstatus: "Pending",
    });

    console.log("print job created");
    res.json(job);
  } catch (error) {
    console.error("Error creating print job:", error);
    res.status(500).json({ mess: "internal server error" });
  }
};

module.exports = { jobcreat };
