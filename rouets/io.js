const io = require('socket.io')();
const session = require('express-session');

const {
  generateMessage,
  generateLocationMessage,
} = require('../src/utils/messages');
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require('../src/utils/users');

io.on('connection', (socket) => {
  console.log('New WebSocket connection');
  // console.log(socket.handshake.query.username);
  socket.on('join-room', (roomId, userId, userName) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit('user-connected', userId);
  });

  socket.on('join', (options, callback) => {
    const { error, user } = addUser({ id: socket.id, ...options });
    if (error) {
      return callback(error);
    }

    socket.join(user.room);

    // socket.emit('message', generateMessage('Admin', 'Welcome!'));
    socket.broadcast
      .to(user.room)
      .emit('status', generateMessage('', `${user.username} joined!`));
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room),
    });
    callback();
  });

  //message event
  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit('message', generateMessage(user.username, message));
    callback();
  });

  socket.on('callRequest', (message, callback) => {
    const user = getUser(socket.id);

    // user.room: dest
    // SEND meetingId to both
    const roomId = new Date().getTime();

    io.to(user.room).emit('call', {
      roomId,
      username: user.username,
    });

    console.log('its a roomId');

    // callback();
  });

  socket.on('sendLocation', (coords, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit(
      'locationMessage',
      generateLocationMessage(
        user.username,
        `https://google.com/maps?q=${coords.latitude},${coords.longitude}`
      )
    );
    callback();
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        'status',
        generateMessage('', `${user.username} left!`)
      );
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

module.exports = io;
