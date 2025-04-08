const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { Op } = require('sequelize');
const crypto = require('crypto');

// Login function
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role }, 
      process.env.JWT_SECRET, 
      { 
        expiresIn: '1h',
        audience: 'time-tracker-app',
        issuer: 'time-tracker-api'
      }
    );
    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Token generation function
const generateAuthToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role }, 
    process.env.JWT_SECRET, 
    {
      expiresIn: '1h',
      audience: 'time-tracker-app',
      issuer: 'time-tracker-api'
    }
  );
};

// Verify invitation token
const verifyInvitation = async (req, res) => {
  try {
    const { token } = req.params;
    
    if (!token) {
      return res.status(400).json({ message: 'Invalid invitation token' });
    }
    
    // Find user with this reset token
    const invitedUser = await User.findOne({
      where: {
        resetToken: token,
        resetTokenExpiry: { [Op.gt]: new Date() } // Token not expired
      }
    });
    
    if (!invitedUser) {
      return res.status(400).json({ message: 'Invitation token is invalid or has expired' });
    }
    
    // Return basic user info
    res.status(200).json({
      message: 'Invitation token is valid',
      user: {
        email: invitedUser.email.includes('placeholder.com') ? '' : invitedUser.email
      }
    });
  } catch (error) {
    console.error('Error verifying invitation:', error);
    res.status(500).json({ message: 'Error verifying invitation' });
  }
};

// Complete registration from invitation
const completeInvitation = async (req, res) => {
  try {
    const { token, firstName, lastName, email, password } = req.body;
    
    if (!token || !firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Find user with this reset token
    const invitedUser = await User.findOne({
      where: {
        resetToken: token,
        resetTokenExpiry: { [Op.gt]: new Date() } // Token not expired
      }
    });
    
    if (!invitedUser) {
      return res.status(400).json({ message: 'Invitation token is invalid or has expired' });
    }
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Update the temporary user record
    invitedUser.firstName = firstName;
    invitedUser.lastName = lastName;
    invitedUser.email = email;
    invitedUser.password = hashedPassword;
    invitedUser.resetToken = null;
    invitedUser.resetTokenExpiry = null;
    
    await invitedUser.save();
    
    // Generate JWT token for automatic login
    const authToken = generateAuthToken(invitedUser);
    
    // Send notification about new user registration
    try {
      const { notifyAllManagers } = require('./notificationController');
      
      await notifyAllManagers(
        'new_employee',
        `${firstName} ${lastName} has joined the team`,
        { 
          userId: invitedUser.id,
          email: email
        }
      );
    } catch (notificationError) {
      console.error('Error sending new user notification:', notificationError);
      // Continue anyway - registration succeeded
    }
    
    res.status(200).json({
      message: 'Registration completed successfully',
      token: authToken,
      user: {
        id: invitedUser.id,
        firstName: invitedUser.firstName,
        lastName: invitedUser.lastName,
        email: invitedUser.email,
        role: invitedUser.role
      }
    });
  } catch (error) {
    console.error('Error completing registration:', error);
    res.status(500).json({ message: 'Error completing registration' });
  }
};

// Regular register with invitation check
const register = async (req, res) => {
  try {
    // For security, block direct registration without invitation
    return res.status(403).json({ 
      message: 'Direct registration is not allowed. Please use an invitation link from your administrator.'
    });
    
    // Note: If you want to keep an open registration, remove the above return and uncomment the code below
    /*
    const { firstName, lastName, email, password } = req.body;
    
    // Validate input
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'employee'  // Default role
    });
    
    // Generate JWT token
    const token = generateAuthToken(user);
    
    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
    */
  } catch (error) {
    console.error('Error in registration:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Change password function
const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Both old and new passwords are required' });
    }
    
    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password
    user.password = hashedPassword;
    await user.save();
    
    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Stub functions to prevent errors
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Don't reveal that email doesn't exist for security
      return res.status(200).json({ message: 'If your email is registered, you will receive a password reset link' });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour
    
    // Save token to user
    user.resetToken = resetToken;
    user.resetTokenExpiry = tokenExpiry;
    await user.save();
    
    // In production, send email here
    console.log(`Password reset token for ${email}: ${resetToken}`);
    
    res.status(200).json({ message: 'If your email is registered, you will receive a password reset link' });
  } catch (error) {
    console.error('Error in forgot password:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Stub function for reset password
const resetPassword = async (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
};

module.exports = {
  login,
  generateAuthToken,
  register,
  forgotPassword,
  resetPassword,
  changePassword,
  verifyInvitation,
  completeInvitation
};
