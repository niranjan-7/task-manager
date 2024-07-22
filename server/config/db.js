const mongoose = require('mongoose');
const { PORT, MONGO_URI } = require('./config'); 

const connectDB = async () => {
  console.log(MONGO_URI)
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection failed', error);
    process.exit(1);
  }
};

module.exports = connectDB;
