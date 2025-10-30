const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'eduportal-secret-key-2024';

const register = async (req, res) => {
    try {
        const { firstName, lastName, email, password, type, studentId, teacherId, department } = req.body;
        
        if (!firstName || !lastName || !email || !password || !type) {
            return res.status(400).json({ 
                success: false,
                message: 'All required fields must be provided' 
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ 
                success: false,
                message: 'User with this email already exists' 
            });
        }

        if (type === 'student' && !studentId) {
            return res.status(400).json({
                success: false,
                message: 'Student ID is required for students'
            });
        }

        if (type === 'teacher' && (!teacherId || !department)) {
            return res.status(400).json({
                success: false,
                message: 'Teacher ID and department are required for teachers'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        
        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            type,
            studentId: type === 'student' ? studentId : undefined,
            teacherId: type === 'teacher' ? teacherId : undefined,
            department: type === 'teacher' ? department : undefined
        });
        
        await newUser.save();

        const token = jwt.sign(
            { 
                userId: newUser._id, 
                type: newUser.type,
                email: newUser.email
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        const userResponse = {
            id: newUser._id,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            email: newUser.email,
            type: newUser.type,
            studentId: newUser.studentId,
            teacherId: newUser.teacherId,
            department: newUser.department,
            registrationDate: newUser.registrationDate,
            isOnline: newUser.isOnline
        };

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: userResponse
        });

    } catch (error) {
        console.error('Registration error:', error);
        
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'User with this email already exists'
            });
        }
        
        res.status(500).json({ 
            success: false,
            message: 'Server error during registration',
            error: error.message 
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password, type } = req.body;
        
        if (!email || !password || !type) {
            return res.status(400).json({ 
                success: false,
                message: 'Email, password, and user type are required' 
            });
        }

        const user = await User.findOne({ email, type });
        if (!user) {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid email, password, or user type' 
            });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid email, password, or user type' 
            });
        }
        
        user.isOnline = true;
        user.lastSeen = new Date();
        await user.save();
        
        const token = jwt.sign(
            { 
                userId: user._id, 
                type: user.type,
                email: user.email
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        const userResponse = {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            type: user.type,
            studentId: user.studentId,
            teacherId: user.teacherId,
            department: user.department,
            registrationDate: user.registrationDate,
            isOnline: user.isOnline,
            lastSeen: user.lastSeen
        };

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: userResponse
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error during login',
            error: error.message 
        });
    }
};

module.exports = { register, login };