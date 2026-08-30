const mongoose = require("mongoose");

const paymentDetailsSchema = new mongoose.Schema(
    {
        printerjobid: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Printdetails",
            // Made optional because it is only populated after successful payment verification
        },
        userid: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Userreg",
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        currency: {
            type: String,
            required: true,
            default: "INR"
        },
        receipt: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            required: true,
            enum: ["Created", "Paid", "Failed"],
            default: "Created",
        },
        razorpay_order_id: {
            type: String,
            required: true,
        },
        razorpay_payment_id: {
            type: String,
        },
        razorpay_signature: {
            type: String,
        },
        // Store print specifications to be saved in Printdetails after successful payment
        printSpecs: {
            printershopid: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Printershopreg",
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
            },
            printcolor: {
                type: String,
                required: true,
            }
        }
    },
    {
        timestamps: true,
    },
);

const Paymentdetails = mongoose.model(
    "Paymentdetails",
    paymentDetailsSchema,
);

module.exports = Paymentdetails;
