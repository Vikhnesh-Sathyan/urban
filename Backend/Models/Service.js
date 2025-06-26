const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String,
  category: String,
  image: String,
  status: { type: String, default: "pending" },
  addedBy: String,
  detailedDescription: String,
  provider: {
    name: String,
    rating: Number
  }
});

module.exports = mongoose.model("Service", serviceSchema);
