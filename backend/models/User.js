const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: { 
        type: String, 
        required: [true, 'First name is required'],
        trim: true
    },
    lastName: { 
        type: String, 
        required: [true, 'Last name is required'],
        trim: true
    },
    email: { 
        type: String, 
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: { 
        type: String, 
        required: [true, 'Password is required'],
        minlength: 6
    },
    type: { 
        type: String, 
        enum: ['student', 'teacher'], 
        required: true 
    },
    studentId: { 
        type: String,
        sparse: true
    },
    teacherId: { 
        type: String,
        sparse: true
    },
    department: { 
        type: String,
        trim: true
    },
    registrationDate: { 
        type: Date, 
        default: Date.now 
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    lastSeen: {
        type: Date,
        default: Date.now
    }
});

userSchema.index({ unique: true });


module.exports = mongoose.model('User', userSchema);
