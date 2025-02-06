const moongoose = require('mongoose');
const eventOrderSchema = new moongoose.Schema({
    smId: { type: String, required: true },
    email: { type: String, required: true },
    contact: { type: String, required: true },
    event: { type: String, required: true },
    paid: { type: Boolean, default: false },
    paymentId: { type: String },
    teammembers: { type: Array, default: [] },
    razorpayOrderId: { type: String },
    amount: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
});
module.exports = moongoose.model('EventOrders', eventOrderSchema);