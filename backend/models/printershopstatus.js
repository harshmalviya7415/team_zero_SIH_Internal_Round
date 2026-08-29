const mongoose = require("mongoose");

const printershopstatusSchema = new mongoose.Schema(
  {
    printershopid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Printershopreg",
      required: true,
    },
    status: {
      type: String,
      required: true,
      enums: ["Active", "Inactive"],
    },
    isavailableforbw: {
      type: Boolean,
      required: true,
    },
    isavailableforcolor: {
      type: Boolean,
      required: true,
    },   
  },

  {
    timestamps: true,
  },
);

const Printershopstatus = mongoose.model(
  "Printershopstatus",
  printershopstatusSchema,
);

module.exports = Printershopstatus;
