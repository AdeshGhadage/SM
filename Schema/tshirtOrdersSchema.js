const moongoose = require('mongoose');
const tShirtOrderSchema = new moongoose.Schema({
    email: String,
    contact: String,
    size: String,
    razorpayOrderId: String,
    paymentId: String,
    amount: Number,
    paid: {type: Boolean, default: false},
    createdAt: { type: Date, default: Date.now },
});
module.exports = moongoose.model('TshirtOrders', tShirtOrderSchema);