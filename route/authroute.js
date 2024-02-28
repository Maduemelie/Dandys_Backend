const express = require('express');
const router = express.Router();
const authController = require('../controller/auth');

router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.post('/forget-password', authController.forgetPassword);
router.post('/reset-password/:token', authController.resetPassword);
module.exports = router 