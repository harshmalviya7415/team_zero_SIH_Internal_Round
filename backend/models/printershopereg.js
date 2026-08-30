const mongoose = require("mongoose");

const printershopregSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
    },
    shopname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    mobile: {
      type: Number,
      required: true,
    },
    college: {
      type: String,
      required: true,
        },
    services: {
        type: [String],
        required: true,
        enum: ["Black and White", "Colour"]
    },
    pagesizes: {
        type: [String],
        required: true,
        enum: ["A4", "A3", "A2", "A1", "A0"]
    },
    password: {
      type: String,
      required: true,
    },
  },

  {
    timestamps: true,
  },
);

const Printershopreg = mongoose.model("Printershopreg", printershopregSchema);

module.exports = Printershopreg;
