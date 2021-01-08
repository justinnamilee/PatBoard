let config;
let socket;
let data = {}; // my state
let meta = {};
let design = {}; // holds html items for repositioning
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
    console.log("Unable to send data to server, disconnected.");
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
      console.log("You set your name to " + design.nameInput.value() + "!");
    }
    else {
      console.log("You changed your name from " + data.name + " to " + design.nameInput.value() + "!");
    }

    data.name = design.nameInput.value();
    design.nameInput.value(config.ui.design.name.default);
  }

  if (design.roomInput.value() !== "" && design.roomInput.value() !== config.ui.design.join.default && typeof data.name !== "undefined") {
    // * join room logic
    data.room = design.roomInput.value();
    console.log("You joined " + data.room + "!");

    design.roomInput.value("");
    design.roomInput.hide();
    design.joinButton.html(config.ui.design.join.text_alt);
    design.joinButton.show();
    design.nameInput.hide();
    design.resetButton.show();

    socketEmit("join", data);

    // * server is talking to the room
    socket.on(data.room, function (c, d) {
      // * update game data
      if (typeof c === "object") {
        if (sync && typeof c.data[data.name] === "object") {
          sync = false;

          data = c.data[data.name];
          meta = c[config.metaTag];

          p[data.player - 1] = new Player(config.board, 0);
          p[data.player - 1].disabled = false;

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

            setTimeout(windowResized, 50);
          }
        }

        if (typeof c.data === "object") {
          console.log("Game state updated.");
          populate(c, p, true); // ? with skip mode enabled
        }
      } else {
        if (c === "kick") {
          console.log("All were kicked: " + d);
          quitRoom();
        } else if (c === "message") {
          console.log("From server: ", d);
        }
      }
    });

    // * server is talking to us in this room only
    socket.on(d2pr(data), function (c, d) {
      if (c === "kick") {
        console.log("You were kicked: " + d);
        quitRoom();
      } else if (c === "message") {
        console.log("PM from server: " + d);
      }
    });
  }
}


function quitRoom() {
  console.log("You left " + data.room + "!");
  design.resetButton.hide();

  socket.off(data.room);
  socket.off(d2pr(data));

  for (let cb in config.counter.design) {
    udButton[cb].up.hide();
    udButton[cb].down.hide();
  }

  socketEmit("leave", data);

  data = { name: data.name };
  sync = true;
  p = [];

  design.roomInput.value(config.ui.design.join.default);
  design.roomInput.show();
  design.joinButton.html(config.ui.design.join.text);
  design.nameInput.show();
}


function connectServer() {
  if (typeof socket === "undefined") {
    console.log("Connecting to server.");

    socket = io.connect(config.listen);

    socket.on("connect", function () {
      console.log("Connected to server " + config.listen + ", nice!  ID: " + socket.id);
    });

    socket.on("disconnect", function () {
      console.log("Disconnected from server, boo.");
    });

    socket.on("status", function (s) {
      console.log("From server: " + s)
    });

    design.nameInput.show();
    design.joinButton.show();
    design.roomInput.show();
    design.connectButton.hide();
  }
}

function resetSession() {
  console.log("Resetting your board.");

  let rr = data.room;

  quitRoom();

  design.nameInput.hide();
  design.joinButton.hide();
  design.roomInput.hide();
  design.nameInput.value(data.name);
  design.roomInput.value(rr);

  setTimeout(joinRoom, 500);
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

  frameRate(config.framerate);
  createCanvas(windowWidth, windowHeight);

  // create buttons for counters
  for (let cb in config.counter.design) {
    udButton[cb] = {};
    udButton[cb].up = createButton("U");
    udButton[cb].up.position(0,0);
    udButton[cb].up.class("invisButton");
    udButton[cb].up.hide();
    udButton[cb].down = createButton("D");
    udButton[cb].down.position(0,0);
    udButton[cb].down.class("invisButton");
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

  let resetButton = createButton(config.ui.design.reset.text);
  design.resetButton = resetButton;
  resetButton.mousePressed(resetSession);
  resetButton.hide();

  // fit to window
  windowResized();
}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  console.log("Window resized to " + windowWidth + "x" + windowHeight + ".");
  design.nameInput.position(config.ui.design.name.position.x * windowWidth, config.ui.design.name.position.y * windowHeight);
  design.joinButton.position(config.ui.design.join.position.x * windowWidth - design.joinButton.width, config.ui.design.join.position.y * windowHeight);
  design.roomInput.position(config.ui.design.join.position.x * windowWidth - design.roomInput.width - design.joinButton.width, config.ui.design.join.position.y * windowHeight);
  design.connectButton.position(config.ui.design.connect.position.x * windowWidth - design.connectButton.width - design.roomInput.width - design.joinButton.width, config.ui.design.join.position.y * windowHeight);
  design.resetButton.position(config.ui.design.reset.position.x * windowWidth, config.ui.design.reset.position.y * windowHeight);

  // adjust hidden buttons if required
  if (p.slice(-1)[0]) {
    for (let cb in config.counter.design) {
      p.slice(-1)[0].counter[cb].positionButtons(udButton[cb]);
    }
  }
}


function draw() {
  // set bg
  background(bg);

  // controls
  if (p.slice(-1)[0]) {
    p.slice(-1)[0].index = 0;
    p.slice(-1)[0].show();
  }
}
