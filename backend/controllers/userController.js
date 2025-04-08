// controllers/userController.js
const { User } = require('../models');

const getAllUsers = async (req, res) => {
  try {
    console.log("Fetching all users");
    const users = await User.findAll();
    
    console.log(`Found ${users.length} users`);
    
    // Log the first user to see its structure
    if (users.length > 0) {
      console.log('Sample user:', JSON.stringify(users[0], null, 2));
    }
    
    res.status(200).json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

module.exports = {
  getAllUsers
};