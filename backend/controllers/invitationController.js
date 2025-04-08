// controllers/invitationController.js - Updated version
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { User } = require('../models');
require('dotenv').config();

// Invite an employee
const inviteEmployee = async (req, res) => {
  try {
    const { email, phone, role } = req.body;
    
    // Convert email to lowercase if provided
    const lowercaseEmail = email ? email.toLowerCase() : null;
    
    console.log('Invitation request received:', { email: lowercaseEmail, phone, role });
    
    // Validate input - require either email or phone
    if (!lowercaseEmail && !phone) {
      return res.status(400).json({ message: 'Email or phone number is required' });
    }
    
    // Check if user with this email already exists
    if (lowercaseEmail) {
      const existingUser = await User.findOne({ where: { email: lowercaseEmail } });
      if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }
    }
    
    // Generate a unique invitation token
    const invitationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    
    // Temporary data for the placeholder user
    const tempEmail = lowercaseEmail || `invitation_${invitationToken.substring(0, 8)}@placeholder.com`;
    
    // Create a temporary user record with invitation data
    const tempUser = await User.create({
      email: tempEmail, // Use the real email or a placeholder
      firstName: 'Invited',
      lastName: 'User',
      password: crypto.randomBytes(16).toString('hex'), // Temporary random password
      role: role || 'employee',
      resetToken: invitationToken,
      resetTokenExpiry: tokenExpiry
    });
    
    console.log('Temporary user created with ID:', tempUser.id);
    
    // Create invitation URL
    const frontendHost = process.env.NODE_ENV === 'production' 
      ? req.headers.host 
      : `${req.headers.host.split(':')[0]}:3000`;
    const invitationUrl = `http://${frontendHost}/register/${invitationToken}`;
    
    // For development, just log the invitation link
    console.log('Invitation link:', invitationUrl);
    
    // For actual email sending
    if (lowercaseEmail && process.env.EMAIL_HOST) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST,
          port: process.env.EMAIL_PORT,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
          }
        });
        
        await transporter.sendMail({
          from: '"Time Tracker" <noreply@timetracker.com>',
          to: lowercaseEmail,
          subject: 'Invitation to Time Tracker',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #3f51b5;">Welcome to Time Tracker</h2>
              <p>You've been invited to join Time Tracker, your company's time tracking solution.</p>
              
              <div style="margin: 25px 0;">
                <a href="${invitationUrl}" style="background-color: #3f51b5; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Complete Your Registration</a>
              </div>
              
              <p>After registration, you can:</p>
              <ul>
                <li>Download our mobile app for iOS or Android</li>
                <li>Clock in and out from your device</li>
                <li>Track your breaks</li>
                <li>View your time entries</li>
              </ul>
              
              <p>This invitation will expire in 7 days.</p>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="color: #666; font-size: 12px;">If you didn't expect this invitation, please ignore this email.</p>
            </div>
          `
        });
        console.log('Invitation email sent to:', lowercaseEmail);
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        // Continue anyway - we'll return the URL
      }
    }
    
    // For SMS invitations (if you implement this)
    if (phone) {
      // Implement SMS sending here
      console.log('Would send SMS to:', phone);
    }
    
    res.status(200).json({ 
      message: 'Invitation sent successfully',
      invitationUrl // Include for testing
    });
  } catch (error) {
    console.error('Error in invitation process:', error);
    res.status(500).json({ message: 'Error sending invitation', error: error.message });
  }
};

module.exports = { 
  inviteEmployee
};