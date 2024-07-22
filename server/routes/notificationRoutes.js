const express = require('express');
const { getNotificationsForUser } = require('../controllers/notificationController');

const router = express.Router();

router.post('/', getNotificationsForUser);  // Changed to POST request to handle email in req.body

module.exports = router;
