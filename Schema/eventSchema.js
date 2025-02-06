const mongoose = require('mongoose');
const eventSchema = new mongoose.Schema({
    email: { type: String, required: true },
    smId: { type: String, required: true },
    contact: { type: String, required: true },
    event: { type: String, required: true },
    paid: { type: Boolean, default: false },
    paymentId: { type: String },
    teammembers: { type: Array, default: [] },
    razorpayOrderId: { type: String },
    createdAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model('Event', eventSchema);