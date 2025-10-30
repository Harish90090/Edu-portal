const express = require('express');
const { 
    getContacts, 
    getMessages, 
    getChatSessions, 
    markMessagesAsRead 
} = require('../controllers/chatController');

const router = express.Router();

router.get('/contacts/:userId', getContacts);
router.get('/messages/:userId/:otherUserId', getMessages);
router.get('/sessions/:userId', getChatSessions);
router.post('/mark-read', markMessagesAsRead);

module.exports = router;