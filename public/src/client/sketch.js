let config;
let socket;
let data = {}; // my state
let game = { data: {} }; // state according to server
let design = {}; // holds html items for repositioning
let status;
let connected = false;
let udButton = {};
let sync = true;
let p = [];


// ! //////////////
// ! misc functions

function socketEmit(t, d) {
  if (typeof d === "undefined") {
    d = data;
  }

  if (typeof t === "undefined") {
    t = config.defaultEmit;
  }

  if (typeof socket !== "undefined" && socket.connected) {
    socket.emit(t, d);
  } else {
    status.add("Unable to send data to server, disconnected.");
  }
}


function k2t(k) {
  let c = "?";

  if (typeof k !== "undefined") {
    c = k.toString();
  }

  return (c);
}


function d2pr(d) {
  return (d.room + "::" + d.name);
}


// ! end of misc
// ! ///////////


// ! ///////////////////////
// ! THESE ARE BUTTON LOGICS

function joinRoom() {
  if (design.nameInput.value() !== "" && design.nameInput.value() !== config.ui.design.name.default) {
    if (typeof data.name === "undefined") {
      status.add("You set your name to " + design.nameInput.value() + "!");
    }
    else {
      status.add("You changed your name from " + data.name + " to " + design.nameInput.value() + "!");
    }

    data.name = design.nameInput.value();
    design.nameInput.value(config.ui.design.name.default);
  }

  if (design.roomInput.value() !== "" && design.roomInput.value() !== config.ui.design.join.default && typeof data.name !== "undefined") {
    // * join room logic
    data.room = design.roomInput.value();
    status.add("You joined " + data.room + "!");

    design.roomInput.value("");
    design.roomInput.hide();
    design.joinButton.html(config.ui.design.join.text_alt);
    design.nameInput.hide();

    socketEmit("join", data);

    // * server is talking to the room
    socket.on(data.room, function (c, d) {
      // * update game data
      if (typeof c === "object") {
        if (sync && typeof c.data[data.name] === "object") {
          sync = false;

          data = Object.assign({}, c.data[data.name]);
          p[0] = new Player(config.board, 0);
          p[0].disabled = false;

          // ! // setup callbacks for invisButtons
          for (let cb in config.counter.design) {
            udButton[cb].up.mousePressed(function () {
              data[cb]++;
              socket.emit("update", data);
            });

            udButton[cb].down.mousePressed(function () {
              data[cb]--;
              socket.emit("update", data);
            });

            udButton[cb].up.show();
            udButton[cb].down.show();
          }
        }

        if (typeof c.data === "object") {
          console.log("Game state updated.");

          for (let p in c.data) {
            game.data[p] = c.data[p];
          }

          game[config.metaTag] = { "pool": { "1": data.name }, "name": data.room };

          populate(game, p);
        }
      } else {
        if (c === "kick") {
          status.add("All were kicked: " + d);
          quitRoom();
        } else if (c === "message") {
          status.add("From server: ", d);
        }
      }
    });

    // * server is talking to us in this room only
    socket.on(d2pr(data), function (c, d) {
      if (c === "kick") {
        status.add("You were kicked: " + d);
        quitRoom();
      } else if (c === "message") {
        status.add("PM from server: " + d);
      }
    });
  }
}


function quitRoom() {
  status.add("You left " + data.room + "!");

  socket.off(data.room);
  socket.off(d2pr(data));

  design.roomInput.value(config.ui.design.join.default);
  design.roomInput.show();
  design.joinButton.html(config.ui.design.join.text);
  design.nameInput.show();

  for (let cb in config.counter.design) {
    udButton[cb].up.hide();
    udButton[cb].down.hide();
  }

  socketEmit("leave", data);

  data = { name: data.name };
  status.data = data;
  game = { data: {} };
  sync = true;
  p = [];
}


function connectServer() {
  if (typeof socket === "undefined") {
    status.add("Connecting to server.");

    socket = io.connect(config.listen);

    socket.on("connect", function () {
      status.add("Connected to server " + config.listen + ", nice!  ID: " + socket.id);
      connected = true;
    });

    socket.on("disconnect", function () {
      status.add("Disconnected from server, boo.");
      connected = false;
    });

    socket.on("status", function (s) {
      status.add("From server: " + s)
    });

    design.nameInput.show();
    design.joinButton.show();
    design.roomInput.show();
    design.connectButton.hide();
  }
}

// ! END OF BUTTON LOGICS
// ! ////////////////////


// ! ////////////////
// ! p5js stuff below

function preload() {
  config = loadJSON("src/client/config.json");
  bg = loadImage("assets/space.jpg");
  img = {
    "health.png": loadImage("assets/health.png"),
    "eyeball.png": loadImage("assets/eyeball.png"),
    "lightning.png": loadImage("assets/lightning.png"),
    "horn.png": loadImage("assets/horn.png"),
    "enemy.png": loadImage("assets/enemy.png")
  };
}


function setup() {
  // load override paramters & update
  let c = getURLParams();

  for (let k in c) {
    if (k in config) {
      // replace hardcoded value (care)
      config[k] = decodeURI(c[k]);
      console.log("Overriding config:", k, config[k]);
    }
  }

  // setup status tracker ASAP
  status = new Status(data);

  frameRate(config.framerate);
  createCanvas(windowWidth, windowHeight);

  // create buttons for counters
  for (let cb in config.counter.design) {
    udButton[cb] = {};
    udButton[cb].up = createButton("U");
    udButton[cb].up.class("invisButton");
    udButton[cb].down = createButton("D");
    udButton[cb].down.class("invisButton");
    udButton[cb].up.hide();
    udButton[cb].down.hide();
  }

  let nameInput = createInput();
  design.nameInput = nameInput;
  nameInput.hide();
  nameInput.value(config.ui.design.name.default);

  let roomInput = createInput();
  design.roomInput = roomInput;
  roomInput.hide();
  roomInput.value(config.ui.design.join.default);

  let joinButton = createButton(config.ui.design.join.text);
  design.joinButton = joinButton;
  joinButton.hide();
  joinButton.mousePressed(function () {
    if (typeof data.room === "undefined") {
      joinRoom();
    } else {
      quitRoom();
    }
  });

  let connectButton = createButton(config.ui.design.connect.text);
  design.connectButton = connectButton;
  connectButton.mousePressed(connectServer);

  // fit to window
  windowResized();
}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  status.add("Window resized to " + windowWidth + "x" + windowHeight + ".");
  design.nameInput.position(config.ui.design.name.position.x * windowWidth, config.ui.design.name.position.y * windowHeight);
  design.joinButton.position(config.ui.design.join.position.x * windowWidth - design.joinButton.width, config.ui.design.join.position.y * windowHeight);
  design.roomInput.position(config.ui.design.join.position.x * windowWidth - design.roomInput.width - design.joinButton.width, config.ui.design.join.position.y * windowHeight);
  design.connectButton.position(config.ui.design.connect.position.x * windowWidth - design.connectButton.width - design.roomInput.width - design.joinButton.width, config.ui.design.join.position.y * windowHeight);
}


function draw() {
  background(bg ? bg : 0);

  // status
  status.show();

  // controls
  if (connected) {
    if (p.length > 0 && typeof p[0] === "object") {
      for (let cb in config.counter.design) {
        p[0].counter[cb].positionButtons(udButton[cb]);
      }

      p[0].show();
    }
  }
}