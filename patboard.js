const config = require("./config.json");
const express = require("express");
const app = express();
const server = app.listen(config.listen);
const io = require("socket.io")(server);
const g = {};

app.use(express.static("public"));

io.sockets.on("connection", function(s) {
  console.log("New connection from: " + s.id);

  // handler for incoming data
  s.on("change", function(d) {
    s.broadcast.emit(d.room, d);

    console.log("New data from: " + s.id + ": " + d);
  });

  // handler for room join
  s.on("join", function(d) {
    console.log(d);

    // ! look for room
    // ! create one if not
    // ! add this player to room
    // ! emit to room?
  });

  // handler for room leave
  s.on("leave", function(d) {
    console.log(d);
  });
});

// TODO: keep game state here
// TODO: get data from clients
// TODO: send data to wallboard? or have wallboard poll on draw cycles
