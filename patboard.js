const config = require('./etc/config.json');
const express = require('express');
const app = express();
const server = app.listen(config.listen);
const io = require('socket.io')(server);
const player = {};

app.use(express.static('public'));

io.sockets.on('connection', function(s) {
  console.log('New connection from: ' + s.id);

  // handler for incoming data
  s.on('change', function(d) {
    s.broadcast.emit('update', d);

    if (config.debug)
    {
      console.log('New data from: ' + s.id + ': ' + d);
    }
  });
});

// TODO: keep game state here
// TODO: get data from clients
// TODO: send data to wallboard? or have wallboard poll on draw cycles
