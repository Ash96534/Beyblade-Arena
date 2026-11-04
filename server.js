const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

const players = {};

io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  players[socket.id] = {
    id: socket.id,
    x: Math.random() * 800,
    y: Math.random() * 600,
    angle: 0,
    spin: 0,
    hp: 100,
  };

  socket.emit('init', { id: socket.id, players });
  socket.broadcast.emit('playerJoined', players[socket.id]);

  socket.on('update', (data) => {
    if (players[socket.id]) {
      players[socket.id] = { ...players[socket.id], ...data };
      socket.broadcast.emit('playerUpdate', players[socket.id]);
    }
  });

  socket.on('disconnect', () => {
    socket.broadcast.emit('playerLeft', socket.id);
    delete players[socket.id];
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Beyblade Arena server running on port ${PORT}`);
});
