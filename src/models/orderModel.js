const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        userEmail: {
            type: String,
            required: true
        },
        username: {
            type: String,
            required: true
        },
        userPhone: {
            type: String,
            required: true
        },
        receiverPhone: {
            type: String,
            required: true
        },
        receiverAddress: {
            type: String,
            required: true
        },
        transactionId: {
            type: String,
            required: false
        },
        orderList: {
            type: Array,
            required: true
        },
        totalPrice: {
            type: String,
            required: true
        },
        paymentMethod: {
            type: String,
            required: true
        },
        orderCompleted: {
            type: Boolean,
            required: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("order", orderSchema);
