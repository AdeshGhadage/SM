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
    if (!query) {
      events = await Event.find({})
    } else {
      events = await Event.find({ event: query });
    }
    // if (!events.length) return res.status(404).json({ status: "error", message: "No regristration found for this event", data: null });
    res.json({ status: "success", message: "Event details retrieved", data: events });
  } catch (err) {
    res.status(500).json({ status: "error", message: "Server Error", data: null });
  }
};


exports.getStats = async (req, res) => {
  try {
    // Fetch all events
    const events = await Event.find();

    // Fetch all users
    // Step 1: Fetch all users who purchased a T-shirt
    const tshirtBuyers = await Tshirt.find({}, "smId email contact");

    // Step 2: Fetch user details for these smIds from Users collection
    const userSmIds = tshirtBuyers.map(user => user.smId);
    const usersData = await User.find({ smId: { $in: userSmIds } }, "smId name college");

    // Step 3: Create a Map for Quick Lookup
    const userMapLookup = new Map(usersData.map(user => [user.smId, user]));

    // Step 4: Enrich the Tshirt Data
    // const enrichedTshirtBuyers = tshirtBuyers.map(user => ({
    //   smId: user.smId,
    //   email: user.email,
    //   contact: user.contact,
    //   name: userMap.get(user.smId)?.name || null,
    //   college: userMap.get(user.smId)?.college || null
    // }));


    // Convert users list to a map for quick lookup
    const userMap = new Map();
    tshirtBuyers.forEach(user => {
      userMap.set(user.smId, {
        smId: user.smId,
        email: user.email,
        contact: user.contact,
        name: userMapLookup.get(user.smId)?.name || null,
        college: userMapLookup.get(user.smId)?.college || null
      });
    });

    // Process event-wise registrations
    const eventWiseRegistrations = events.reduce((acc, event) => {
      // Find existing event entry
      let eventEntry = acc.find(e => e.event === event.event);

      // Get captain details
      const captain = userMap.get(event.smId) || {};

      // Get team members (handle null case)
      const teammembers = event.teammembers
        ? event.teammembers.map(memberId => userMap.get(memberId) || {}).filter(member => member.smId)
        : [];

      // Create registration object
      const registration = {
        captainSmId: captain.smId || null,
        email: captain.email || null,
        contact: captain.contact || null,
        teammembers,
        paymentId: event.paymentId,
        createdAt: event.createdAt
      };

      if (eventEntry) {
        // If event already exists in the array, push new registration into its list
        eventEntry.registrations.push(registration);
      } else {
        // If event does not exist, create a new entry
        acc.push({
          event: event.event,
          registrations: [registration]
        });
      }

      return acc;
    }, []);

    const registeredUsersSet = new Set(
      events.flatMap(event => [event.smId, ...(event.teammembers || [])])
    );

    const collegeWiseCount = new Map();

    userMap.forEach(user => {
      if (user.college) {
        collegeWiseCount.set(user.college, (collegeWiseCount.get(user.college) || 0) + 1);
      }
    });

    // Step 2: Convert College-wise Map to Array
    const collegeWiseParticipants = Array.from(collegeWiseCount, ([college, count]) => ({
      college,
      count
    }));

    // Fetch users who only purchased T-shirts
    const tshirtOnlyBuyers = tshirtBuyers
      .filter(user => !registeredUsersSet.has(user.smId))
      .map(user => ({
        smId: user.smId,
        name: userMap.get(user.smId).name,
        email: user.email,
        contact: user.contact,
        college: userMap.get(user.smId).college
      }));

    return res.status(200).json({
      status: "success",
      data: {
        totalRegistrations: tshirtBuyers.length,
        eventWiseRegistrations,
        tshirtOnlyBuyers,
        collegeWiseParticipants
      }
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
}