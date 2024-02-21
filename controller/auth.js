const User = require('../model/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const registerUser = async (req, res) => {
  const { firstName, lastName, gender, email, password, confirmPassword } =
        req.body;
    console.log(req.body);
  if (
    !firstName ||
    !lastName ||
    !gender ||
    !email ||
    !password ||
    !confirmPassword
  ) {
    return res.status(400).json({ message: 'Please fill in all fields' });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({
    firstName,
    lastName,
    gender,
    email,
    password: hashedPassword,
  });
  await user.save();

  res.status(201).json({ message: 'User created successfully' });
};
const JWT_SECRET = process.env.JWT_SECRET;
console.log(JWT_SECRET);
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Please fill in all fields' });
  }
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const token = jwt.sign({ userId: user._id },JWT_SECRET,  {
    expiresIn: '1h',
  });
    console.log(process.env.JWT_SECRET);
  res
    .status(200)
    .json({ message: 'Login successful!', token, userId: user._id });
};

module.exports = {
  registerUser,
  loginUser,
};
