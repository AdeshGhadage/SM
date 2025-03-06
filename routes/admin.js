const express = require("express");
const { loginAdmin, getAllUsers, getUserBySmId, getEventDetails } = require("../controllers/adminController");
const router = express.Router();
const verifyAdmin = require('../middleware/verifyAdmin')
// Admin routes
router.post("/login", loginAdmin);
router.get("/getAllUsers", verifyAdmin, getAllUsers);
router.get("/getUser/:smId", verifyAdmin, getUserBySmId);
router.get("/getEventDetails", verifyAdmin, getEventDetails);

module.exports = router;