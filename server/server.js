const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const taskRoutes = require('./routes/taskRoutes');
const notificationRoutes = require('./routes/notificationRoutes')
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
  },
});

app.set('io', io);

connectDB();

app.use(cors({
  origin: "*", // specify the client URL or use "*" to allow all origins
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // allow cookies to be sent and received
  optionsSuccessStatus: 204
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/tasks', taskRoutes);
app.use('/api/notifications', notificationRoutes); 

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = { io };
