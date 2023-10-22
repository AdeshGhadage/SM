const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Connect to MongoDB
mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const mongodb = mongoose.connection;
mongodb.on("error", (error) => console.error(error));
mongodb.once("open", () => console.log("Connected to Database"));

//rondom number generator
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

//hashing password
const bcrypt = require("bcrypt");
const saltRounds = 10;

//json web token
const jwt = require("jsonwebtoken");

//SendGrid mail
// const sgMail = require("@sendgrid/mail");
// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

//importing schema
const Registration = require("./Schema/user");

//cors
app.use(cors());

app.post("/register", async (req, res) => {
  var val = getRandomInt(1000);
  const user = await Registration.findOne({ sm_id: "24SM" + val });
  while (user) {
    val = getRandomInt(1000);
  }
  var sm_id = "24SM" + val;
  if (req.body.password.length < 8) {
    res.send("password should be of atleast 8 characters");
  } else {
    const alreadyRegistered = await Registration.findOne({
      email: req.body.email,
      contact: req.body.contact,
      name: req.body.name,
    });
    if (alreadyRegistered) {
      res.send("user already registered");
    } else {
      try {
        const password_hash = await bcrypt.hash(req.body.password, saltRounds);

        const registrationData = new Registration({
          name: req.body.name,
          email: req.body.email,
          password: password_hash,
          sm_id: sm_id,
          college: req.body.college,
          contact: req.body.contact,
          created_at: Date.now(),
        });

        registrationData
          .save()
          .then((result) => {
            res.send("registration data saved successfully");
            console.log(result);
          })
          .catch((err) => {
            res.send("something went wrong in saving registration data");
            console.log(err);
          });
      } catch (error) {
        res.send("something went wrong in password hashing");
        console.log(error);
      }
    }
  }
});

//login and authentication using jwt and cookie-parser
app.post("/login", async (req, res) => {
  sm_id = req.body.sm_id;
  password = req.body.password;
  try {
    const user = await Registration.findOne({ sm_id: sm_id });
    if (user) {
      const password_match = await bcrypt.compare(password, user.password);
      if (password_match) {
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        await Registration.updateOne({ sm_id: sm_id }, { $set: { token: token } });
        console.log(token);
        res.json({ token: token,
          message: "login successful",
         });
      }
    } else {
      res.send("invalid credentials");
    }
  } catch (error) {
    res.send("something went wrong");
    console.log(error);
  }
});


//logout using jwt clear cookie
app.post("/logout", async (req, res) => {
  try{
    const user = await Registration.findOne({ token: req.cookies.token });
    if(user){
      await Registration.updateOne({ token: req.cookies.token }, { $set: { token: "" } });
      res.clearCookie("token");
      res.send("logout successful");
    }else{
      res.send("user not logged in");
    }
  }
  catch(error){
    res.send("something went wrong");
    console.log(error);
  }
});

//get user data if local storage has vaild token
app.get("/user", async (req, res) => {
  try{
    const user = await Registration.findOne({ token: req.body.token });
    if(user){
      res.send(user);
    }else{
      res.send("user not logged in");
    }
  }
  catch(error){
    res.send("something went wrong");
    console.log(error);
  }
});


app.listen(process.env.PORT, () => {
  console.log("Server is running on port " + process.env.PORT);
});
