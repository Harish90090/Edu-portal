const express = require('express');
const { getUsers, getUserProfile } = require('../controllers/userController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/users', getUsers);
router.get('/profile', authenticateToken, getUserProfile);

module.exports = router;