const moongoose = require('mongoose');
const tshirtSchema = new moongoose.Schema({
    email: String,
    contact: String,
    smId : String,
    size: String,
    orderId: String,
    paymentId: String,
    referral: String,
    createdAt: { type: Date, default: Date.now },
});
module.exports = moongoose.model('Tshirt', tshirtSchema);