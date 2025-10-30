const mongoose = require('mongoose');

const chatSessionSchema = new mongoose.Schema({
    student: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    teacher: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    lastMessage: { 
        type: String,
        trim: true
    },
    lastMessageTime: { 
        type: Date, 
        default: Date.now 
    },
    unreadCount: { 
        type: Number, 
        default: 0 
    },
    messageCount: {
        type: Number,
        default: 0
    },
    isActive: { 
        type: Boolean, 
        default: true 
    }
}, {
    timestamps: true
});

chatSessionSchema.index({ student: 1, teacher: 1 }, { unique: true });
chatSessionSchema.index({ lastMessageTime: -1 });

module.exports = mongoose.model('ChatSession', chatSessionSchema);