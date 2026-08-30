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
      default: "Inactive",
    },
    isavailableforbw: {
      type: Boolean,
      required: true,
      default: false,
    },
    isavailableforcolor: {
      type: Boolean,
      required: true,
      default: false,
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
