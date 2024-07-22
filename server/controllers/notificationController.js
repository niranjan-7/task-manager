const Notification = require('../models/Notification');

const getNotificationsForUser = async (req, res) => {
  const { userEmail } = req.body;

  if (!userEmail) {
    return res.status(400).json({ message: 'User email is required' });
  }

  try {
    const notifications = await Notification.find({ users: userEmail }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
};

module.exports = {
  getNotificationsForUser,
};
