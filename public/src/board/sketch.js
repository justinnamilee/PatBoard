let p = [];
let config;
let socket;
let bg;
let img;
let ui = {};
let list = [];
let room = "PatBoard.js";


// ! //
// ! // misc //

function populate(r) {
  console.log("populating!");
  room = r.meta.room;
  for (let p in r.meta.pool) {
    if (r.meta.pool[p] !== "") {
      let index = parseInt(p);

      for (let c in config.design) {
        console.log(p, c, r.data[r.meta.pool[p]][c]);
        p[index].counter[c].value = r.data[r.meta.pool[p]][c];
      }
    }
  }
}


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
      if (room !== r) {
        socket.off(room);
        console.log(`Changed room from ${room} to ${r}.`);
        room = r;
        socket.on(room, populate);
      }
    } else {
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

  // add selector
  let boardSelect = createSelect();
  ui.boardSelect = boardSelect;

  for (let l in config.layout) {
    boardSelect.option(l);
  }

  boardSelect.selected(config.board);

  boardSelect.changed(function () {
    config.board = boardSelect.value();

    resetLayout();
  });

  // room selector
  let roomSelect = createInput();
  ui.roomSelect = roomSelect;
  roomSelect.value(room);

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

  // data from client
  socket.on("update", function () {
    console.log("data from client");
  });

  // generate play spaces
  if (typeof config.layout[config.board] !== "undefined") {
    for (let i = 0; i < config.layout[config.board].position.length; i++) {
      p.push(new Player(config.board, i));
    }
  }

  windowResized();
}

function windowResized() {
  ui.roomSelect.position(config.room.position.x, config.room.position.y);
  ui.boardSelect.position(config.select.position.x + ui.roomSelect.width, config.select.position.y);
}



// output to screen
function draw() {
  if (typeof p !== "undefined") {
    p[0].health++;
  }

  if (config.screen === "dynamic" && windowWidth !== config.resolution.w && windowHeight !== config.resolution.h) {
    config.resolution.w = windowWidth;
    config.resolution.h = windowHeight;

    createCanvas(config.resolution.w, config.resolution.h);
  }

  background(bg);

  for (let i = 0; i < config.layout[config.board].position.length; i++) {
    if (i >= p.length) {
      p.push(new Player(config.board, i));
    }

    p[i].show();
  }

  // noLoop();
}
