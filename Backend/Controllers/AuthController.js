const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register Function
const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ name, email, password: hashedPassword, role });
  await newUser.save();
  res.send("User Registered");
};

// Login Function
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).send("User not found");
  const validPass = await bcrypt.compare(password, user.password);
  if (!validPass) return res.status(400).send("Invalid password");

  const token = jwt.sign({ id: user._id, role: user.role }, "jwtSecretKey");
  res.json({ token, role: user.role });
};
