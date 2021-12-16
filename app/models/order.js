const mongoose = require('mongoose')
const { Schema } = mongoose

const orderSchema = new Schema({
    customerId : { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items : { type: Object, required: true },
    phone : { type: String, required: true },
    address: { type: String, required: true },
    paymentType: { type: String, default: "online"},
    status: { type: String, default: "pending"},
    paymentStatus: { type: String, default: "pending"},
    razorpayOrderId: { type : String },
    razorpayPaymentId: { type: String},
    razorpaySignature: { type: String }
}, {
    timestamps: true
})

module.exports = mongoose.model('Order', orderSchema)