const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: {
    type: String,
    enum: ['user', 'provider', 'admin'],
    default: 'user'
  }
});
