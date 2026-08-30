const mongoose = require("mongoose");

const printdetailsSchema = new mongoose.Schema(
  {
    printershopid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Printershopreg",
      required: true,
    },
    userid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Userreg",
      required: true,
    },
    urlofprinddocument: {
      type: String,
      required: true,
    },
    printcopies: {
      type: Number,
      required: true,
    },
    printpagenos: {
      type: String,
      required: true,
    },
    printpapersize: {
      type: String,
      required: true,
      enums: ["A4", "A3", "A2", "A1", "A0"],
    },
    printcolor: {
      type: String,
      required: true,
      enums: ["Black and White", "Colour"],
    },
    duplex: {
      type: Boolean,
      required: true,
      default: false,
    },
    printstatus: {
      type: String,
      required: true,
      enums: ["Pending", "In Progress", "Completed"],
    },
  },

  {
    timestamps: true,
  },
);

const Printdetails = mongoose.model("Printdetails", printdetailsSchema);

module.exports = Printdetails;
