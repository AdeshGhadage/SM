const jwt = require("jsonwebtoken");

const verifyAdmin = (req, res, next) => {
    let token = req.header("Authorization");
    if (!token) return res.status(401).json({ message: "Access Denied" });
    
    try {
        const SECRET_KEY = process.env.JWT_SECRET;
        token = token.split(' ')[1];
        const verified = jwt.verify(token, SECRET_KEY);
        if (verified.role !== "admin") return res.status(403).json({ message: "Forbidden" });
        next();
    } catch (err) {
        console.error(err)
        res.status(401).json({ message: "Invalid Token" });
    }
};


module.exports = verifyAdmin;