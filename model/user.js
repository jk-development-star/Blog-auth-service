const { Schema, model } = require("mongoose");
const validator = require("validator");;
const bcrypt = require('bcryptjs');

const userSchema = new Schema({
  user_name: {
    type: String,
    required: [true, "Username is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Invalid email, Please try with correct one.");
      }
    },
  },
  user_type: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: true,
    minlength: [8, 'Password must be at least 8 characters long'],
    validate(value) {
      if (!validator.isAlphanumeric(value)) {
        throw new Error("Password should be alphanumeric only!");
      }
    },
  },
});

userSchema.pre('save', async function (next) {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

// Create the User model
const User = model('User', userSchema);
module.exports = User;