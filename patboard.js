const config = require("./config.json");
const express = require("express");
const app = express();
const server = app.listen(config.listen);
const io = require("socket.io")(server);
const g = {};

app.use(express.static("public"));

function d2rp(d) {
  return (d.room + "::" + d.name);
}

io.sockets.on("connection", function (s) {
  console.log("Client " + s.id + " has connected.");

  // disconnect
  s.on("disconnect", function () {
    console.log("Client " + s.id + " has disconnected.");
  });

  // handler for room join
  s.on("join", function (d) {
    console.log("Client " + s.id + " wants to join " + d.room + " as " + d.name + ".");

    if (d.name === config.meta) {
      // * invalid user name
      s.emit(d2rp(d), "kick", "Invalid name '" + config.meta + "', choose another.");
    } else {
      // * make the room if it doesn't exist
      if (!(d.room in g)) {
        g[d.room] = {};
        g[d.room][config.meta] = {};
      }

      // * try to join the room
      if (d.name in g[d.room]) {
        // * client is rejoining without (quit)
        s.emit(d.room, g[d.room]);
      } else if (Object.keys(g[d.room]).length - 1 >= config.maxPlayers) {
        // * client trying to join a full room
        s.emit(d2rp(d), "kick", "The room is full.");
      } else {
        // * put client in the room
        g[d.room][d.name] = d;
        s.emit(d.room, g[d.room]);
      }
    }
  });

  // handler for room leave
  s.on("leave", function (d) {
    console.log("Client " + s.id + " wants to leave join " + d.room + " as " + d.name + ".");

    if (d.room in g && d.name in g[d.room]) {
      delete (g[d.room][d.name]);
      emit(d.room, g[d.room]);
    }
  });

  // handler for value changes
  s.on("update", function (d) {
    // ! put new values into
  });
});

// TODO: keep game state here
// TODO: get data from clients
// TODO: send data to wallboard? or have wallboard poll on draw cycles
