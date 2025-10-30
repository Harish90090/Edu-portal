const User = require('../models/User');
const Message = require('../models/Message');
const ChatSession = require('../models/ChatSession');

const getContacts = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        let contacts = [];
        
        if (user.type === 'student') {
            contacts = await User.find({ type: 'teacher' }).select('firstName lastName email teacherId department isOnline lastSeen');
        } else {
            contacts = await User.find({ type: 'student' }).select('firstName lastName email studentId isOnline lastSeen');
        }

        const chatSessions = await ChatSession.find({
            $or: [{ student: userId }, { teacher: userId }],
            isActive: true
        }).populate('student teacher', 'firstName lastName');

        const contactsWithChatData = contacts.map(contact => {
            const session = chatSessions.find(s => 
                (s.student._id.toString() === contact._id.toString() && s.teacher._id.toString() === userId) ||
                (s.teacher._id.toString() === contact._id.toString() && s.student._id.toString() === userId)
            );
            
            return {
                ...contact.toObject(),
                unreadCount: session ? session.unreadCount : 0,
                lastMessage: session ? session.lastMessage : null,
                lastMessageTime: session ? session.lastMessageTime : null
            };
        });

        res.json({
            success: true,
            contacts: contactsWithChatData
        });
    } catch (error) {
        console.error('Get contacts error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while fetching contacts',
            error: error.message 
        });
    }
};

const getMessages = async (req, res) => {
    try {
        const { userId, otherUserId } = req.params;
        
        const user = await User.findById(userId);
        const otherUser = await User.findById(otherUserId);
        
        if (!user || !otherUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const messages = await Message.find({
            $or: [
                { sender: userId, receiver: otherUserId },
                { sender: otherUserId, receiver: userId }
            ]
        })
        .populate('sender', 'firstName lastName type')
        .populate('receiver', 'firstName lastName type')
        .sort({ timestamp: 1 });

        res.json({
            success: true,
            messages
        });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while fetching messages',
            error: error.message 
        });
    }
};

const getChatSessions = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const sessions = await ChatSession.find({
            $or: [{ student: userId }, { teacher: userId }],
            isActive: true
        })
        .populate('student', 'firstName lastName studentId email')
        .populate('teacher', 'firstName lastName teacherId department email')
        .sort({ lastMessageTime: -1 });

        res.json({
            success: true,
            sessions
        });
    } catch (error) {
        console.error('Get chat sessions error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while fetching chat sessions',
            error: error.message 
        });
    }
};

const markMessagesAsRead = async (req, res) => {
    try {
        const { userId, otherUserId } = req.body;
        
        await Message.updateMany(
            { 
                sender: otherUserId, 
                receiver: userId, 
                read: false 
            },
            { read: true }
        );
        
        await ChatSession.findOneAndUpdate(
            { 
                $or: [
                    { student: userId, teacher: otherUserId },
                    { student: otherUserId, teacher: userId }
                ]
            },
            { unreadCount: 0 }
        );

        res.json({
            success: true,
            message: 'Messages marked as read'
        });
    } catch (error) {
        console.error('Mark messages as read error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while marking messages as read',
            error: error.message 
        });
    }
};

module.exports = { 
    getContacts, 
    getMessages, 
    getChatSessions, 
    markMessagesAsRead 
};