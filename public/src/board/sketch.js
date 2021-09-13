let p = [];
let config;
let socket;
let bg;
let img;
let ui = {};
let list = [];
let room = "PatBoard.js";
let startup = true;


// ! //
// ! // misc //


// helper for callbacks
function resetLayout() {
  for (let player of p) {
    player.setLayout(config.board, player.index);
  }
}


function checkRoom() {
  [r, t] = ui.roomSelect.value().split(" :: ", 2);

  if (typeof r !== "undefined") {
    if (r !== "" && list.find(e => e === r)) {
      // ! change all of this vvv lmao
      ui.roomSelect.value(r + " :: connected"); // TODO: move to config
      if (room !== r || startup) {
        startup = false;
        socket.off(room);
        console.log(`Changed room from ${room} to ${r}.`);
        room = r;
        socket.on(room, function (d) {
          populate(d, p);
        });
      }
    } else {
      p = [];
      ui.roomSelect.value(r);
    }
  }
}

// ! // end of misc //
// ! //


// ! //
// ! // p5js stuff //

// do this before anything else
function preload() {
  config = loadJSON("src/board/config.json");
  bg = loadImage("assets/space.jpg");
  img = {
    "health.png": loadImage("assets/health.png"),
    "eyeball.png": loadImage("assets/eyeball.png"),
    "lightning.png": loadImage("assets/lightning.png"),
    "horn.png": loadImage("assets/horn.png"),
    "enemy.png": loadImage("assets/enemy.png")
  };
}


// one-time setup
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

  // build our base canvas
  createCanvas(config.resolution.w, config.resolution.h);

  // room selector
  let roomSelect = createInput();
  roomSelect.position(config.room.position.x, config.room.position.y);
  ui.roomSelect = roomSelect;
  roomSelect.value(room);

  // add selector
  let boardSelect = createSelect();
  boardSelect.position(config.select.position.x + roomSelect.width, config.select.position.y);

  let resetButton = createButton("Reset");
  resetButton.position(5 + roomSelect.width + boardSelect.width, 5)
  resetButton.mousePressed(function() {
    if (typeof socket !== "undefined" && socket.connected) {
      socket.off(room);
      socket.emit("reset", room);
      resetLayout()
    }
  });

  for (let l in config.layout) {
    boardSelect.option(l);
  }

  boardSelect.selected(config.board);

  boardSelect.changed(function () {
    config.board = boardSelect.value();
    checkRoom();
    resetLayout();
  });

  // capture room list data & game data
  socket = io.connect(config.listen);

  socket.on("connect", function () {
    console.log("connected to server");
  });

  socket.on("disonnect", function () {
    console.log("disconnected from server")
  });

  socket.on("status", function () {
  });

  socket.on("session", function (l) {
    list = l;
    checkRoom();
  });

  // generate play spaces
  if (typeof config.layout[config.board] !== "undefined") {
    for (let i = 0; i < config.layout[config.board].position.length; i++) {
      p.push(new Player(config.board, i));
    }
  }

  windowResized();
}


// we be growin
function windowResized() {
  if (config.screen === "dynamic") {
    config.resolution.w = windowWidth;
    config.resolution.h = windowHeight;

    createCanvas(config.resolution.w, config.resolution.h);
  }
}


// output to screen
function draw() {
  background(bg);

  for (let i = 0; i < config.layout[config.board].position.length; i++) {
    if (i >= p.length) {
      p.push(new Player(config.board, i));
    }

    if (typeof p[i] !== "undefined") {
      p[i].show();
    }
  }
}
