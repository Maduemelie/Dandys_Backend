const User = require('../model/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;
// console.log(JWT_SECRET);
const nodemailer = require('nodemailer');

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
 const expiresInMinutes = 60; // Set the expiration time in minutes
 const expirationTime = Date.now() + expiresInMinutes * 60 * 1000; // Calculate the expiration time in milliseconds
 const token = jwt.sign({ userId: user._id, exp: expirationTime }, JWT_SECRET);

  console.log(process.env.JWT_SECRET);
  res
    .status(200)
    .json({ message: 'Login successful!', token, userId: user._id });
};

const forgetPassword = async (req, res) => {
  const { email } = req.body;
  console.log(email);
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
 const expiresInMinutes = 5; // Set the expiration time in minutes
 const expirationTime = Date.now() + expiresInMinutes * 60 * 1000; // Calculate the expiration time in milliseconds
 const token = jwt.sign({ userId: user._id, exp: expirationTime }, JWT_SECRET);

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });
  
  try {
    const mailOptions = {
      from: process.env.EMAIL,
      to: user.email,
      subject: 'Password Reset',
      html: `
        <p>Hello,</p>
        <p>You requested a password reset. Click <a href="https://dandys-auth-app.onrender.com/reset-password/${token}">here</a> to reset your password.</p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      `,
    };
    // Send the email
    await transporter.sendMail(mailOptions);

    res.status(200).json('Password reset email sent successfully');
  } catch (error) {
    console.error(error);
  }
};

const resetPassword = async (req, res) => {
  const { password, confirmPassword } = req.body;
  const { token } = req.params;
  console.log(password, confirmPassword, token);
  try {
  if (!token) {
    return res.status(400).json({ message: 'Invalid token' });
  }
  if (!password || !confirmPassword) {
    return res.status(400).json({ message: 'Please fill in all fields' });
  } 
  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }
  const decodedToken = jwt.verify(token, JWT_SECRET);
  const userId = decodedToken.userId;
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  user.password = hashedPassword;
    await user.save();
    res.status(200).json({ message: 'Password reset successful' });
  }catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }

}
module.exports = {
  registerUser,
  loginUser,
  forgetPassword,
  resetPassword
};
