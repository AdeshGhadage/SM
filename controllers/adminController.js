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
    // console.log(email, password);

    if (email !== ADMIN_USERNAME) {
        return res.status(403).json({ status: "error", message: "Unauthorized" });
    }

    if (!password || ADMIN_PASSWORD !== password) {
        return res.status(403).json({ status: "error", message: "Invalid credentials" });
    }

    const token = jwt.sign({ email, role: "admin" }, SECRET_KEY);

    return res.json({ status: "success", message: "Login successful", token });
};


// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const tshirtUsers = await Tshirt.find({}, "email contact smId size orderId paymentId referral createdAt");
        const userDetailsMap = await User.find({}, "smId name college").then(users => 
            users.reduce((acc, user) => {
                acc[user.smId] = { name: user.name, college: user.college };
                return acc;
            }, {})
        );
        
        const users = tshirtUsers.map(user => ({
            ...user.toObject(),
            name: userDetailsMap[user.smId]?.name || "N/A",
            college: userDetailsMap[user.smId]?.college || "N/A"
        }));

        res.json({ status: "success", message: "Users retrieved successfully", data: users });
    } catch (err) {
        res.status(500).json({ status: "error", message: "Server Error", data: null });
    }
};

// Get user by smId
exports.getUserBySmId = async (req, res) => {
    try {
        const tshirt = await Tshirt.findOne({ smId: req.params.smId }, "email contact smId size orderId paymentId referral createdAt");
        if (!tshirt) return res.status(404).json({ status: "error", message: "User not found", data: null });
        
        const userDetails = await User.findOne(
            { smId: req.params.smId },
            "name college"
        );
        
        const user = {
            ...tshirt.toObject(),
            name: userDetails?.name || "N/A",
            college: userDetails?.college || "N/A"
        };
        

        const events = await Event.find({
            $or: [
                { smId: req.params.smId },
                { teammembers: { $in: [req.params.smId] } }
            ]
        }, "event paid paymentId teammembers createdAt email contact");

        res.json({ status: "success", message: "User details retrieved", data: { ...user, events: events.length > 0 ? events : [] } });
    } catch (err) {
        console.error(err)
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
