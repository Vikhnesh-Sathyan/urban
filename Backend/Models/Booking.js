const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
    required: true,
  },
  name: String,
  phone: String,
  date: String,
  time: String,
  notes: String,
});

module.exports = mongoose.model("Booking", bookingSchema);
