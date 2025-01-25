const mongoose = require("mongoose");

const referralSchema = new mongoose.Schema({
  name: String,
  email: String,
  experience: String,
  resume: String,
  status: { type: String, default: "New" },
});

module.exports = mongoose.model("Referral", referralSchema);
