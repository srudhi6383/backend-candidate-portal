const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require('fs');

const User = require("./models/User");
const Referral = require("./models/Referral");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


const uploadDir = path.resolve(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);  
}

mongoose.connect("mongodb+srv://srudhi24:mongodb123@cluster0.m9slaat.mongodb.net/referrals", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error: ", err));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("Uploads directory:", uploadDir);  
    cb(null, uploadDir); 
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Login API
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && user.password === password) {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

// Create Referral API
app.post("/api/referrals", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const { name, email, experience } = req.body;
    const referral = new Referral({
      name,
      email,
      experience,
      resume: req.file.path,  
    });
    await referral.save();
    res.json({ success: true });
  } catch (error) {
    console.error("Error during referral creation:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get Referrals API
app.get("/api/referrals", async (req, res) => {
  const referrals = await Referral.find();
  res.json(referrals);
});

// Update Referral Status API
app.put("/api/referrals/:id", async (req, res) => {
  const { status } = req.body;
  await Referral.findByIdAndUpdate(req.params.id, { status });
  res.json({ success: true });
});

app.listen(5000, () => console.log("Server running on port 5000"));
