const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');

// Import models
const User = require('./models/User');
const Message = require('./models/Message');
const ChatSession = require('./models/ChatSession');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: ["http://localhost:3000", "http://127.0.0.1:5500", "http://localhost:5500", "http://localhost:8080"],
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://harishachar9090_db_user:pJbpolPttMx4A8VR@cluster0.448oax9.mongodb.net/st-portal?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGODB_URI)
.then(() => console.log(' MongoDB connected successfully'))
.catch(err => console.log(' MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);
app.use('/api/chat', chatRoutes);

// Health check route
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
        message: 'EduPortal Server is running',
        timestamp: new Date().toISOString()
    });
});

// Socket.IO for real-time chat
const connectedUsers = new Map();

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('user_join', async (userId) => {
        try {
            connectedUsers.set(userId, socket.id);
            socket.join(userId);
            
            await User.findByIdAndUpdate(userId, { 
                isOnline: true,
                lastSeen: new Date()
            });

            socket.broadcast.emit('user_status_update', { 
                userId: userId, 
                isOnline: true 
            });
            
            console.log(`User ${userId} joined chat`);
        } catch (error) {
            console.error('Error in user_join:', error);
        }
    });

    socket.on('send_message', async (data) => {
        try {
            const { senderId, receiverId, message } = data;
            
            const sender = await User.findById(senderId);
            const receiver = await User.findById(receiverId);
            
            if (!sender || !receiver) {
                socket.emit('message_error', { error: 'User not found' });
                return;
            }

            const newMessage = new Message({
                sender: senderId,
                receiver: receiverId,
                message: message
            });
            
            await newMessage.save();
            
            await newMessage.populate('sender', 'firstName lastName type');
            await newMessage.populate('receiver', 'firstName lastName type');
            
            const studentId = sender.type === 'student' ? senderId : receiverId;
            const teacherId = sender.type === 'teacher' ? senderId : receiverId;
            
            await ChatSession.findOneAndUpdate(
                { student: studentId, teacher: teacherId },
                {
                    student: studentId,
                    teacher: teacherId,
                    lastMessage: message,
                    lastMessageTime: new Date(),
                    $inc: { 
                        unreadCount: 1,
                        messageCount: 1
                    }
                },
                { upsert: true, new: true }
            );
            
            const receiverSocketId = connectedUsers.get(receiverId);
            if (receiverSocketId) {
                io.to(receiverId).emit('receive_message', newMessage);
            }
            
            socket.emit('message_sent', newMessage);
            
        } catch (error) {
            console.error('Error sending message:', error);
            socket.emit('message_error', { error: 'Failed to send message' });
        }
    });

    socket.on('mark_messages_read', async (data) => {
        try {
            const { userId, otherUserId } = data;
            
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
            
        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    });

    socket.on('disconnect', async () => {
        try {
            for (let [userId, socketId] of connectedUsers.entries()) {
                if (socketId === socket.id) {
                    connectedUsers.delete(userId);
                    
                    await User.findByIdAndUpdate(userId, { 
                        isOnline: false,
                        lastSeen: new Date()
                    });

                    socket.broadcast.emit('user_status_update', { 
                        userId: userId, 
                        isOnline: false 
                    });
                    
                    console.log(`User ${userId} disconnected`);
                    break;
                }
            }
        } catch (error) {
            console.error('Error in disconnect:', error);
        }
    });

    socket.on('typing_start', (data) => {
        socket.to(data.receiverId).emit('user_typing', {
            userId: data.senderId,
            isTyping: true
        });
    });

    socket.on('typing_stop', (data) => {
        socket.to(data.receiverId).emit('user_typing', {
            userId: data.senderId,
            isTyping: false
        });
    });
});


// ----------------------------------------
// 👇 STATIC FILE SERVING CONFIGURATION 👇
// ----------------------------------------

// Assuming your structure is:
// - Edu-portal/
//   - backend/ (where this server.js file is)
//   - frontend/ (where index.html is)

// 1. Serve static assets from the 'frontend' directory.
// path.join(__dirname, '..', 'frontend') goes up one level ('..') from the backend folder 
// to the root, then into the 'frontend' folder.
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// 2. Catch all GET requests that haven't been handled by your API routes (/api/*)
// and send the index.html file. This is crucial for single-page applications (SPAs) 
// and resolves the "Cannot GET /" error.
app.get('*', (req, res) => {
res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
console.log(`Server running on http://localhost:${PORT}`);

});
