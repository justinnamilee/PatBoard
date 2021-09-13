const config = require("./config.json");
const express = require("express");
const app = express();
const server = app.listen(config.listen);
const io = require("socket.io")(server);
const g = {};


// ! //
// ! // DATA FUNCTIONS //

function d2rp(d) {
  return (d.room + "::" + d.name);
}

function d2g(d) {
  if (typeof g[d.room].data[d.name] === "undefined") {
    g[d.room].data[d.name] = Object.assign({}, config.data);
  }

  for (let k in d) {
    g[d.room].data[d.name][k] = d[k];
  }
}

// ! // END DATA STUFF  //
// ! //


// ! //
// ! // stuff just for pools //

function poolAdd(r, n) {
  for (let p in r[config.metaTag].pool) {
    if (r[config.metaTag].pool[p] === "") {
      r[config.metaTag].pool[p] = n;
      r.data[n].player = parseInt(p);
      break;
    }
  }
}

function poolRemove(r, n) {
  for (let p in r[config.metaTag].pool) {
    if (r[config.metaTag].pool[p] === n) {
      r[config.metaTag].pool[p] = "";
      r.data[n].player = 0; // ? // Is this required?
      break;
    }
  }
}

// ! // END pools~ //
// ! //


// * make sure we refresh wallboards
setInterval(function() {
  io.sockets.emit("session", Object.keys(g));
}, 4567);

setInterval(function() {
  for (let s in g) {
    if (typeof g[s] !== "undefined"){
      io.sockets.emit(s, g[s]);
    }
  }
}, 5678);


// * setup express server
app.use(express.static("public"));

// * setup socket stuff
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
        console.log("Creating room " + d.room + ".");
        g[d.room] = { data: {} };
        g[d.room][config.metaTag] = JSON.parse(JSON.stringify(config.meta));
        g[d.room][config.metaTag].name = d.room;

        io.sockets.emit("session", Object.keys(g));
      }

      // * try to join the room
      if (d.name in g[d.room].data) {
        // * client is rejoining without (quit)
        s.emit(d.room, g[d.room]);

        io.sockets.emit("session", Object.keys(g));
      } else if (!(d.name in g[d.room].data) && Object.keys(g[d.room].data).length - 1 >= Object.keys(config.meta.pool).length) {
        // * client trying to join a full room
        s.emit(d2rp(d), "kick", "The room is full.");

        io.sockets.emit("session", Object.keys(g));
      } else {
        // * put client in the room
        d2g(d); // ingest data
        poolAdd(g[d.room], d.name);
        io.sockets.emit(d.room, g[d.room]);
        io.sockets.emit("session", Object.keys(g));

        console.log("Adding client " + d.name + " to room " + d.room + ".");
      }
    }
  });

  // hanlder for reset room
  s.on("reset", function(d) {
    console.log("Client " + s.id + " wants to reset " + d + ".");

    if (d in g) {
      delete g[d];
    }

    io.sockets.emit("session", Object.keys(g));
  });

  // handler for room leave
  s.on("leave", function (d) {
    console.log("Client " + s.id + " wants to leave " + d.room + " as " + d.name + ".");

    if (d.room in g && d.name in g[d.room].data) {
      poolRemove(g[d.room], d.name);
      delete g[d.room].data[d.name];
      io.sockets.emit(d.room, g[d.room]);
    }

    io.sockets.emit("session", Object.keys(g));
  });

  // handler for value changes
  s.on("update", function (d) {
    // ? console.log("Caught update from client!", d);

    if (d.room in g && d.name in g[d.room].data) {
      d2g(d); // ingest data
      io.sockets.emit(d.room, g[d.room]);
    } else {
      s.emit(d2rp(d), "kick", "You are in an abandoned room / not joined to this room.");
    }
  });
});
