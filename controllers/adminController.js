const jwt = require("jsonwebtoken");
const User = require("../Schema/user");
const Event = require("../Schema/eventSchema");
const Tshirt = require("../Schema/tshirtSchema");
const ADMIN_USERNAME = "Naroes";
const ADMIN_PASSWORD = "$2a$10$hashedpassword"; // Use bcrypt to hash and store securely
const SECRET_KEY = process.env.JWT_SECRET;

// Admin Login
exports.loginAdmin = async (req, res) => {
    const { email, password } = req.body;
    console.log(email, password);

    if (email !== ADMIN_USERNAME) {
        return res.status(403).json({ status: "error", message: "Unauthorized" });
    }

    if (!password || ADMIN_PASSWORD !== password) {
        return res.status(403).json({ status: "error", message: "Invalid credentials" });
    }

    const token = jwt.sign({ email, role: "admin" }, SECRET_KEY, { expiresIn: "1h" });

    return res.json({ status: "success", message: "Login successful", token });
};


// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await Tshirt.find({}, "email contact smId size orderId paymentId referral createdAt");
        res.json({ status: "success", message: "Users retrieved successfully", data: users });
    } catch (err) {
        res.status(500).json({ status: "error", message: "Server Error", data: null });
    }
};

// Get user by smId
exports.getUserBySmId = async (req, res) => {
    try {
        const user = await Tshirt.findOne({ smId: req.params.smId }, "email contact smId size orderId paymentId referral createdAt");
        if (!user) return res.status(404).json({ status: "error", message: "User not found", data: null });
        
        const events = await Event.find({
            $or: [
                { smId: req.params.smId },
                { teammembers: { $in: [req.params.smId] } }
            ]
        }, "event paid paymentId teammembers createdAt email contact");

        res.json({ status: "success", message: "User details retrieved", data: { ...user.toObject(), events: events.length > 0 ? events : [] } });
    } catch (err) {
        res.status(500).json({ status: "error", message: "Server Error", data: null });
    }
};

// Get event details by event name
exports.getEventDetails = async (req, res) => {
    try {
        let events = [];
        const query = req.query.event;
        if(!query){
            events = await Event.find({})
        } else{
            events = await Event.find({ event: query });
        }
        // if (!events.length) return res.status(404).json({ status: "error", message: "No regristration found for this event", data: null });
        res.json({ status: "success", message: "Event details retrieved", data: events });
    } catch (err) {
        res.status(500).json({ status: "error", message: "Server Error", data: null });
    }
};
