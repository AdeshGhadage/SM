const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const Razorpay = require("razorpay");
const shortid = require("shortid");
const crypto = require("crypto");
require("dotenv").config();
const sendEmail = require('./middleware/sendEmail');
const verifyAdmin = require('./middleware/verifyAdmin')
const app = express();
const {fees} = require('./constants/events')
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
const adminRouter = require('./routes/admin')
const nodemailer = require('nodemailer');
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
const Event = require("./Schema/eventSchema");
const Cap = require("./Schema/capSchema");
const Tshirt = require("./Schema/tshirtSchema");
const TshirtOrders = require("./Schema/tshirtOrdersSchema");
const EventOrders = require("./Schema/eventOrderSchema");

const redis = require('ioredis');
//razorpay payment gateway for capturethewater event
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// const transporter = nodemailer.createTransport({
//   port: 465,               // true for 465, false for other ports
//   host: "smtp.gmail.com",
//      auth: {
//           user: 'samudramanthan.iitkgp@gmail.com',
//           pass: process.env.APP_PASSWORD,
//        },
//   secure: true,
//   });

// console.log(transporter)

//cors
app.use(cors());
//need to update cors origin

app.use("/admin", adminRouter)

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.post("/register", async (req, res) => {
  // console.log(req.body)
  if (!req.body.password || req.body.password.length < 4) {
    return res.status(400).json({
      status: "error",
      message: "Password should be at least 4 characters long",
    });
  }

  try {
    const alreadyRegistered = await Registration.findOne({
      email: req.body.email,
    });


    if (alreadyRegistered) {
      return res.status(409).json({
        status: "error",
        message: "User already registered",
      });
    }

    const password_hash = await bcrypt.hash(req.body.password, saltRounds);

    const registrationData = new Registration({
      name: req.body.name,
      email: req.body.email,
      password: password_hash,
      college: req.body.college,
      contact: req.body.contact,
      created_at: Date.now(),
    });

    

    registrationData
      .save()
      .then((result) => {
        res.status(201).json({
          status: "success",
          message: "Registration data saved successfully",
          data: result,
        });
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({
          status: "error",
          message: "Something went wrong while saving registration data",
        });
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Something went wrong in password hashing",
    });
  }
});

//login and authentication using jwt and cookie-parser
app.post("/login", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).json({
      status: "error",
      message: "Email and password are required",
    });
  }

  try {
    const user = await Registration.findOne({ email: email });

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Invalid credentials",
      });
    }

    const password_match = await bcrypt.compare(password, user.password);

    if (!password_match) {
      return res.status(401).json({
        status: "error",
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    // await Registration.updateOne({ email: email }, { $set: { token: token } });

    // console.log(token, user);
    return res.status(200).json({
      status: "success",
      message: "Login successful",
      token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        smId: user.smId,
        college: user.college,
        contact: user.contact,
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
});

// app.post("/sendOtp", async (req, res) => {
//   let client;
//   try {
//     const { email } = req.body;
//     if (!email) return res.status(400).json({ status: "error", message: "Email is required" });

//     client =new redis({
//       host: '127.0.0.1',
//       port: 6379,
//       password: ''
//     });

//     client.on('error', (error)=>{
//       console.error(error);
//     })

//     const otp = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit OTP
//     await client.setex(`otp:${email}`, 300, otp.toString()); // Store OTP in Redis for 5 minutes
//     console.log(otp);
//     const mailOptions = {
//       from: "samudramanthan.iitkgp@gmail.com",
//       to: email,
//       subject: "Your OTP Code",
//       text: `Your OTP code is ${otp}. It expires in 5 minutes.`,
//     };

//     transporter.sendMail(mailOptions, (error, info) => {
//       if (error) throw error;
//       res.json({ status: "success", message: "OTP sent successfully" });
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ status: "error", message: "Error generating otp" });
//   } finally {
//     if (client && client.status !== 'close') {
//       await client.quit()
//     }
//   }
// })
// //get user data by localstroge sm_id and token

// app.post("/verifyOtp", async (req, res) => {
//   let client;
//   try {
//     const { email, otp, name, password, college, contact } = req.body;
//     if (!email || !otp || !password) return res.status(400).json({ status: "error", message: "Missing fields" });

//     const storedOtp = await redisClient.get(`otp:${email}`);
//     if (!storedOtp || storedOtp !== otp) return res.status(400).json({ status: "error", message: "Invalid OTP" });

//     const alreadyRegistered = await Registration.findOne({ email });
//     if (alreadyRegistered) return res.status(409).json({ status: "error", message: "User already registered" });

//     const password_hash = await bcrypt.hash(password, saltRounds);
//     const newUser = new Registration({ name, email, password: password_hash, college, contact, created_at: Date.now() });
//     client = new redis({
//       host: '127.0.0.1',
//       port: 6379,
//       password: ''
//     });

//     client.on('error', (error) => {
//       console.error(error);
//     })

//     await newUser.save();
//     await client.del(`otp:${email}`); // Delete OTP after successful registration
//     res.status(201).json({ status: "success", message: "Registration successful" });
//   } catch (error) {
//     res.status(500).json({ status: "error", message: "Registration failed" });
//   } finally {
//     if (client && client.status !== 'close') {
//       await client.quit()
//     }
//   }
// })

app.get("/user", async (req, res) => {
  try {
    const token = req.headers.token;

    if (!token) {
      return res.status(401).json({
        status: "error",
        message: "Authorization token is required",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await Registration.findOne({ _id: decoded.id });

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    const data = {
      name: user.name,
      email: user.email,
      smId: user.smId,
      college: user.college,
      contact: user.contact,
    };

    return res.status(200).json({
      status: "success",
      message: "User data retrieved successfully",
      data: data,
    });
  } catch (error) {
    console.error(error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        status: "error",
        message: "Invalid token",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        status: "error",
        message: "Token has expired",
      });
    }

    return res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
});




// //razorpay payment gateway for capturethewater event
// app.post("/razorpay/capturethewater", async (req, res) => {
//   const token = req.body.token;

//   if (!token) {
//     return res.status(401).json({
//       status: "error",
//       message: "Authorization token is required",
//     });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     const user = await Registration.findOne({ _id: decoded.id });

//     if (!user) {
//       return res.status(404).json({
//         status: "error",
//         message: "User not found",
//       });
//     }

//     const amount = 100;
//     const options = {
//       amount: (amount * 100).toString(),
//       currency: "INR",
//       receipt: shortid.generate(),
//     };

//     const response = await razorpay.orders.create(options);

//     // Update order ID in the user's database record
//     await Registration.updateOne(
//       { _id: decoded.id },
//       { $set: { orderId: response.id } }
//     );

//     console.log("Order ID updated in user database");

//     return res.status(200).json({
//       status: "success",
//       message: "Order created successfully",
//       data: {
//         id: response.id,
//         currency: response.currency,
//         amount: response.amount,
//         name: user?.name,
//         email: user?.email,
//         contact: user?.contact,
//         sm_id: user?.sm_id,
//         teamSize: 4,
//       },
//     });
//   } catch (error) {
//     console.error(error);

//     if (error.name === "JsonWebTokenError") {
//       return res.status(401).json({
//         status: "error",
//         message: "Invalid token",
//       });
//     }

//     if (error.name === "TokenExpiredError") {
//       return res.status(401).json({
//         status: "error",
//         message: "Token has expired",
//       });
//     }

//     return res.status(500).json({
//       status: "error",
//       message: "Something went wrong while creating the order",
//     });
//   }
// });


// // Handle the Razorpay webhook endpoint
// app.post("/success/capturethewater", async (req, res) => {
//   try {
//     const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

//     if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
//       return res.status(400).json({
//         status: "error",
//         message: "Missing required fields in the request body",
//       });
//     }

//     // Verify the signature
//     const generatedSignature = crypto
//       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//       .update(`${razorpay_order_id}|${razorpay_payment_id}`)
//       .digest("hex");

//     if (generatedSignature !== razorpay_signature) {
//       return res.status(400).json({
//         status: "error",
//         message: "Invalid webhook signature",
//       });
//     }

//     // Signature is valid. Fetch user details based on the order ID
//     const event = await Event.findOne({ orderId: razorpay_order_id });

//     if (!event) {
//       return res.status(404).json({
//         status: "error",
//         message: "No user found for the provided order ID",
//       });
//     }

//     // Update the payment ID in the event collection
//     event.paymentId = razorpay_payment_id;
//     await event.save();

//     return res.status(200).json({
//       status: "success",
//       message: "Payment processed successfully",
//     });
//   } catch (error) {
//     console.error("Error in webhook processing:", error);

//     return res.status(500).json({
//       status: "error",
//       message: "An internal server error occurred while processing the webhook",
//     });
//   }
// });



// app.post("/register/event", async (req, res) => {
//   const { token, event, orderId, teammembers } = req.body;

//   if (!token || !event || !orderId || !teammembers) {
//     return res.status(400).json({
//       status: "error",
//       message: "Missing required fields in the request body",
//     });
//   }

//   try {
//     // Decode the token and fetch user details
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await Registration.findOne({ _id: decoded.id });

//     if (!user) {
//       return res.status(404).json({
//         status: "error",
//         message: "User not found",
//       });
//     }


//     // Create a new event registration record
//     const newEvent = new Event({
//       name: user.name,
//       email: user.email,
//       sm_id: user.sm_id,
//       college: user.college,
//       contact: user.contact,
//       event,
//       orderId,
//       teammembers,
//       created_at: Date.now(),
//     });

//     await newEvent.save();

//     console.log("Event registered successfully:", newEvent);

//     return res.status(200).json({
//       status: "success",
//       message: "User successfully registered for the event",
//       data: {
//         name: user.name,
//         email: user.email,
//         event,
//         orderId,
//         teammembers,
//       },
//     });
//   } catch (error) {
//     console.error("Error in event registration:", error);

//     if (error.name === "JsonWebTokenError") {
//       return res.status(401).json({
//         status: "error",
//         message: "Invalid token",
//       });
//     }

//     if (error.name === "TokenExpiredError") {
//       return res.status(401).json({
//         status: "error",
//         message: "Token has expired",
//       });
//     }

//     return res.status(500).json({
//       status: "error",
//       message: "An internal server error occurred while registering for the event",
//     });
//   }
// });

app.post("/orders", async (req, res) => {
  
  const { event, teammembers, type, size, token, referral } = req.body;

  if (!token || !type ) {
    return res.status(400).json({
      status: "error",
      message: "Missing required fields in the request body",
    });
  }

  if (!type || (type !== "event" && type !== "tshirt")) {
    return res.status(400).json({ error: "Invalid type. Must be either 'event' or 'tshirt'." });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await Registration.findOne({ _id: decoded.id });

  if (!user) {
    return res.status(404).json({
      status: "error",
      message: "User not found",
    });
  }


  let referralValid = false;
  let referralUser = null;
  
  if (referral) {
    referralUser = await Registration.findOne({ smId: referral });
    referralValid = !!referralUser;
  }

  let amount;
  if (type === "event") {
    // Event Registration Validation
    if (!event) {
      return res.status(400).json({ error: "Event name is required for event registration." });
    }

    if(!user.smId){
      return res.status(400).json({ error: "smId is required." });
    }

    // Check if any teammate is already registered in another team for the same event
    // console.log(teammembers)
    for(const teammate of teammembers){
      const isRegister = await Registration.findOne({smId: teammate});
      if(!isRegister){
        return res.status(400).json({error: `User with smId ${teammate} does not exists`})
      }
    }
    
    for (const teammate of teammembers) {
      // Check if the teammate is already part of another team
      const existingTeammate = await Event.findOne({
        $or: [
          {smId: teammate},
          {teammembers: { $in: [teammate] }},
        ],
        event: event,
      })

      if (existingTeammate) {
        return res.status(400).json({ error: `User with smId '${teammate}' is already part of another team for the same event.` });
      }
    }

    // Retrieve event fees
    // console.log(fees[event], teammembers.length)
    amount = fees[event] * ((teammembers!==null && teammembers.length > 0) ? teammembers.length + 1 : 1); // Assuming `fees` is a predefined object mapping event names to fees
    // console.log(amount)
    if (amount === undefined) {
      return res.status(400).json({ error: `No event with name '${event}' was found.` });
    }
  } else if (type === "tshirt") {
   
    amount = fees['tShirt'];
  }

  try {
    // Create Razorpay Order
    const razorpayOrder = await razorpay.orders.create({
      amount: amount * 100, // Amount in paise
      currency: "INR",
    });

    // Prepare data for storage

    if(type==='tshirt'){
      const orderData = {
        email: user.email,
        contact: user.contact,
        size,
        amount,
        razorpayOrderId: razorpayOrder.id,
        referral: referralValid ? referral : null,
      };
  
      // Save the order
      const newOrder = new TshirtOrders(orderData);
      await newOrder.save();
    } else{
      // console.log(teammembers)
      const orderData = {
        smId: user.smId,
        contact: user.contact,
        email: user.email,
        event,
        teammembers: teammembers,
        amount,
        razorpayOrderId: razorpayOrder.id,
      };
  
      // Save the order
      const newOrder = new EventOrders(orderData);
      await newOrder.save();
    }

    

    // Respond with Razorpay order details
    res.status(200).json({
      status: "success",
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      name: user.name,
      email: user.email,
      contact: user.contact
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ status:"error", message: "Failed to create order" });
  }
});

app.post("/verify-payment/tshirt", async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  // console.log(req.body)
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ success: false, message: "Missing required payment details." });
  }

  try {
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ success: "error", message: "Payment verification failed!" });
    }

    // Update T-shirt order as paid
    const updatedOrder = await TshirtOrders.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        paid: true,
        paymentId: razorpay_payment_id,
      },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ success: "error", message: "T-Shirt order not found!" });
    }

    // Generate SM_ID
    const sm_id_generated = process.env.SM + Math.floor(1000 + Math.random() * 9000);

    //UPDATE THE SM_ID IN THE USERS
    const updatedUser = await Registration.findOneAndUpdate(
      {email: updatedOrder.email},
      {
        smId: sm_id_generated
      },
      {new: true}
    )

    // Save to T-shirt collection
    await Tshirt.create({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      smId: sm_id_generated,
      size: updatedOrder.size,
      email: updatedOrder.email,
      contact: updatedOrder.contact,
      referral: updatedOrder.referral, // Store the referral code
    });

    if (updatedOrder.referral) {
      // Check if the referral ID exists in the Registration collection
      const referringUser = await Registration.findOne({ smId: updatedOrder.referral });
    
      if (referringUser) {
        // If referral ID is valid, increment referralCount
        await Registration.findOneAndUpdate(
          { smId: updatedOrder.referral },
          { $inc: { referralCount: 1 } }
        );
      }
    }

    // sendEmail(transporter, 'registration', {
    //   from: 'samudramanthan.iitkgp@gmail.com',
    //   to: updatedOrder.email,
    //   subject: 'Welcome to Samudramanthan 2025',
    //   sm_id: sm_id_generated,
    // })

    res.status(200).json({
      success: "success",
      message: "T-Shirt payment verified and updated successfully!",
      smId: sm_id_generated,
    });
  } catch (error) {
    console.error("Error verifying T-shirt payment:", error);
    res.status(500).json({ success: "error", message: "Server error during T-shirt payment verification." });
  }
});


app.post("/verify-payment/event", async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ success: false, message: "Missing required payment details." });
  }

  try {
    // Generate signature for verification
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ success: "error", message: "Payment verification failed!" });
    }

    // Update event order as paid
    const updatedOrder = await EventOrders.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        paid: true,
        paymentId: razorpay_payment_id,
      },
      { new: true }
    );

    // console.log(updatedOrder);

    if (!updatedOrder) {
      return res.status(404).json({ success: "error", message: "Event order not found!" });
    }

    await Event.create({
      paid:true,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      smId: updatedOrder.smId,
      email: updatedOrder.email,
      contact: updatedOrder.contact,
      event: updatedOrder.event,
      teammembers: (updatedOrder.teammembers && updatedOrder.teammembers.length!==0)?updatedOrder.teammembers:null,
    });

    res.status(200).json({
      success: "success",
      message: "Event payment verified and updated successfully!",
    });
  } catch (error) {
    console.error("Error verifying event payment:", error);
    res.status(500).json({ success: "error", message: "Server error during event payment verification." });
  }
});

app.post("/cap", async (req, res) => {
  const {
    name,
    email,
    smId,
    college,
    contact,
    major,
    yos,
    sm,
    idea,
    experience,
    whysm,
  } = req.body;

  // Validate required fields
  if (
    !name ||
    !email ||
    !college ||
    !contact ||
    !major ||
    !yos ||
    !sm ||
    !idea ||
    !experience ||
    !whysm
  ) {
    return res.status(400).json({
      status: "error",
      message: "Missing required fields in the request body",
    });
  }

  try {
    // Create a new Campus Ambassador entry
    const cap = new Cap({
      name,
      email,
      smId,
      college,
      contact,
      major,
      yos,
      sm,
      idea,
      experience,
      whysm,
      created_at: Date.now(),
    });

    const result = await cap.save();

    // console.log("Campus Ambassador data saved:", result);

    return res.status(200).json({
      status: "success",
      message: "Campus Ambassador data successfully submitted",
      data: {
        id: result._id,
        name: result.name,
        email: result.email,
        college: result.college,
        contact: result.contact,
      },
    });
  } catch (error) {
    console.error("Error saving Campus Ambassador data:", error);

    return res.status(500).json({
      status: "error",
      message: "An internal server error occurred while saving data",
    });
  }
});

app.post("/cap/isregistered", async (req, res) => {
  const { token } = req.body;

  // Check if token is provided
  if (!token) {
    return res.status(400).json({
      status: "error",
      message: "failed authentication",
    });
  }

  try {
    // Decode the token to get user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user based on the decoded ID
    const user = await Registration.findOne({ _id: decoded.id });

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // Check if the user is registered in the Campus Ambassador program
    const cap = await Cap.findOne({ email: user.email });

    if (cap) {
      return res.status(200).json({
        status: "success",
        message: "successfully registered as Campus Ambassador",
      });
    } else {
      return res.status(404).json({
        status: "failed",
        message: "failed registered in the Campus Ambassador program",
      });
    }
  } catch (error) {
    console.error("Error in /cap/isregistered:", error);
    return res.status(500).json({
      status: "error",
      message: "An internal server error occurred",
    });
  }
});


app.post("/event/isregistered", async (req, res) => {
  const { token, link: event_name } = req.body;

  // Validate input
  if (!token || !event_name) {
    return res.status(400).json({
      status: "error",
      message: "Token and event name are required.",
    });
  }

  try {
    // Decode the token to get user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Registration.findOne({ _id: decoded.id });

    if (!user.smId) {
      return res.status(200).json({
        status: "success",
        message: "User is not registered for the event.",
        isRegistered: false,
        data: {}
      });
    }
    // Check if the user is registered for the event
    const event = await Event.findOne({
      event: event_name,
      $or: [
        { smId: user.smId },
        { teammembers: user.smId }
      ]
    });
    
    // Respond based on whether the user is registered for the event
    if (event) {
      return res.status(200).json({
        status: "success",
        message: "User is successfully registered for the event.",
        isRegistered: true,
        data: event
      });
    } else {
      return res.status(200).json({
        status: "success",
        message: "User is not registered for the event.",
        isRegistered: false,
        data: {}
      });
    }
  } catch (error) {
    console.error("Error verifying token or fetching event data:", error);
    return res.status(500).json({
      status: "error",
      message: "An internal server error occurred. Please try again later.",
    });
  }
});


//tshirt
app.post("/tshirt/isregistered", async (req, res) => {
  const { token } = req.body;

  // Validate token input
  if (!token) {
    return res.status(400).json({
      status: "error",
      message: "Token is required.",
    });
  }

  try {
    // Decode the token to get user ID
    try{
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
      const user = await Registration.findOne({ _id: decoded.id });

      // Check if the user has registered for a T-shirt
      const tshirt = await Tshirt.findOne({ email: user.email });

      if (tshirt) {
        // Respond with user's sm_id if registered for T-shirt
        return res.status(200).json({
          status: "success",
          message: "User is successfully registered for the T-shirt.",
          register: true,
          smId: user.smId
        });
      } else {
        // Respond with false if user is not registered for T-shirt
        return res.status(200).json({
          status: "success",
          message: "User is not registered for the T-shirt.",
          register: false,
          smId: null
        });
      }                     
    }catch(err){
      return res.status(401).json({
        status: "error",
        message: "Invalid token",
      });
    }
  } catch (error) {
    console.error("Error verifying token or fetching T-shirt registration:", error);
    return res.status(500).json({
      status: "error",
      message: "An internal server error occurred. Please try again later.",
    });
  }
});



app.listen(process.env.PORT, () => {
  console.log("Server is running on port " + process.env.PORT);
});
