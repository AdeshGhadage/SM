const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    smId: { type: String },
    college: { type: String, required: true },
    contact: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    token : String,
    resetToken: String,
    orderId: String,
    tshirtorderId: String,
});


module.exports = mongoose.model('User', userSchema);