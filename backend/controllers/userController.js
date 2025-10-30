const User = require('../models/User');

const getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ registrationDate: -1 });
        
        res.json({
            success: true,
            users,
            count: users.length
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error while fetching users',
            error: error.message 
        });
    }
};

const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching profile',
            error: error.message
        });
    }
};

module.exports = { getUsers, getUserProfile };