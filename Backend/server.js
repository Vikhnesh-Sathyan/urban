const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const Booking = require("./Models/Booking");
const Service = require("./Models/Service");



const app = express();
app.use(cors());
app.use(express.json());

app.use('/uploads', express.static('uploads'));


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");  // Folder to save images
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // unique name
  },
});

const upload = multer({ storage: storage });


// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/register", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

// Create a User schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: String,
});

const User = mongoose.model("User", userSchema);

// Routes
app.get("/", (req, res) => {
  res.send("Backend Server is Running ✅");
});

// Register route
app.post("/api/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const newUser = new User({ name, email, password, role });
    await newUser.save();

    res.status(201).json({ message: "Registration successful" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Registration failed" });
  }
});

// Login route
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Send back user info including role
    res.json({
      message: "Login successful",
      user: { email: user.email, role: user.role, name: user.name }
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
});

// Add image to the schema
const serviceSchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String,
  category: String,
  image: String,
  status: { type: String, default: "pending" },
  addedBy: String,
});



// Add Service by Provider
app.post("/api/add-service", upload.single("image"), async (req, res) => {
  try {
    const { name, price, description, category, addedBy } = req.body;
    const image = req.file ? req.file.filename : "";

    const newService = new Service({
      name,
      price,
      description,
      category,
      image, // save filename only
      addedBy,
    });

    await newService.save();
    res.json({ message: "Service submitted for approval!" });
  } catch (err) {
    res.status(500).json({ message: "Failed to add service", error: err.message });
  }
});


// Approve Service by Admin
app.patch("/api/approve-service/:id", async (req, res) => {
  try {
    await Service.findByIdAndUpdate(req.params.id, { status: "approved" });
    res.json({ message: "Service approved!" });
  } catch (err) {
    res.status(500).json({ message: "Approval failed" });
  }
});

// Get All Services
app.get("/api/services", async (req, res) => {
  try {
    const { category } = req.query;
    const query = { status: "approved" };
    
    if (category) {
      query.category = category;
    }
    
    const services = await Service.find(query);
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch services" });
  }
});

// Get Single Service by ID
app.get("/api/services/:id", async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    res.json(service);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch service" });
  }
});

// Get All Pending Services for Admin View
app.get("/api/pending-services", async (req, res) => {
  const services = await Service.find({ status: "pending" });
  res.json(services);
});

app.put("/api/update-service/:id", upload.single("image"), (req, res) => {
  const updateFields = {
    name: req.body.name,
    price: req.body.price,
    description: req.body.description,
    category: req.body.category,
    addedBy: req.body.addedBy
  };

  // If new image uploaded, include image path
  if (req.file) {
    updateFields.image = req.file.filename;
  }

  Service.findByIdAndUpdate(req.params.id, updateFields, { new: true })
    .then(updatedService => {
      res.json({
        message: "Service updated successfully!",
        updatedService
      });
    })
    .catch(err => res.status(400).json({ message: "Error: " + err }));
});

app.post("/api/booking", async (req, res) => {
  try {
    const booking = new Booking(req.body);
    await booking.save();
    res.status(201).json({ message: "Booking confirmed!" });
  } catch (err) {
    console.error("Booking error:", err);
    res.status(500).json({ message: "Server error" });
  }
});




// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
