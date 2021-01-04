const config = require("./config.json");
const express = require("express");
const app = express();
const server = app.listen(config.listen);
const io = require("socket.io")(server);
const g = {};


// ! //////////////
// ! DATA FUNCTIONS

function d2rp(d) {
  return (d.room + "::" + d.name);
}

function d2g(d) {
  if (typeof g[d.room][d.name] === "undefined") {
    g[d.room] = Object.assign({}, config.data);
  }

  for (let k in d) {
    g[d.room][d.name] = d[k];
  }
}

// ! END DATA STUFF
// ! //////////////


// ! ////////////////////
// ! stuff just for pools

function poolAdd(r, n) {

}

function poolRemove(r, n) {
  for (let p in config.meta.pool) {
    if (r.meta.pool[p] === n)
    {
      r.meta.pool[p] = "";
    }
  }
}

// ! END pools~
// ! //////////


// * setup express server
app.use(express.static("public"));

// * setup socket
io.sockets.on("connection", function (s) {
  console.log("Client " + s.id + " has connected.");

  // disconnect
  s.on("disconnect", function () {
    console.log("Client " + s.id + " has disconnected.");
  });

  // handler for room join
  s.on("join", function (d) {
    console.log("Client " + s.id + " wants to join " + d.room + " as " + d.name + ".");

    if (d.name === config.metaTag) {
      // * invalid user name
      s.emit(d2rp(d), "kick", "Invalid name '" + config.metaTag + "', choose another.");
    } else {
      // * make the room if it doesn't exist
      if (!(d.room in g)) {
        g[d.room] = {};
        g[d.room][config.metaTag] = Object.assign({}, config.meta);
      }

      // * try to join the room
      if (d.name in g[d.room]) {
        // * client is rejoining without (quit)
        s.emit(d.room, g[d.room]);
      } else if (Object.keys(g[d.room]).length - 1 >= Object.keys(config.meta.pool).length) {
        // * client trying to join a full room
        s.emit(d2rp(d), "kick", "The room is full.");
      } else {
        // * put client in the room
        d2g(d); // ingest data
        poolAdd(g[d.room], d.name);
        s.emit(d.room, g[d.room]);
      }
    }
  });

  // handler for room leave
  s.on("leave", function (d) {
    console.log("Client " + s.id + " wants to leave join " + d.room + " as " + d.name + ".");

    if (d.room in g && d.name in g[d.room]) {
      delete g[d.room][d.name];
      poolRemove(g[d.room], d.name);
      emit(d.room, g[d.room]);
    }
  });

  // handler for value changes
  s.on("update", function (d) {
    if (d.room in q && d.name in g[d.room]) {
      d2g(d); // ingest data
      s.broadcast.emit(d.room, g[d.room]);
    } else {
      emit(d2rp, "kick", "You are in an abandoned room / not joined to this room.");
    }
  });
});

// TODO: keep game state here
// TODO: get data from clients
// TODO: send data to wallboard? or have wallboard poll on draw cycles
