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

function populate(r) {
  let t = config.metaTag;
  room = r[t].name;

  // remove old players
  for (let i = 0; i < p.length; i++) {
    let j = p[i];
    if (typeof j !== "undefined") {
      if (!Object.values(r[t].pool).includes(j.name)) {
        p[i] = new Player(config.board, i);
      }
    }
  }

  // populate data of players
  for (let q in r[t].pool) {
    if (r[t].pool[q] !== "") {
      let index = parseInt(q) - 1;

      // stuff the counter
      for (let c in config.counter.design) {
        p[index].counter[c].value = r.data[r[t].pool[q]][c];
      }

      // set name
      p[index].name = r.data[r[t].pool[q]].name;

      // populate enemies
      let e = 0;
      for (let w in r[t].pool) {
        if (r[t].pool[w] !== r[t].pool[q]) {
          let enemy = "enemy" + ++e;

          if (r[t].pool[w] !== "") {
            p[index].counter[enemy].disabled = false;
          } else {
            p[index].counter[enemy].disabled = true;
          }

          p[index].counter[enemy].text = r[t].pool[w];
        }
      }
    }
  }
}

// misc functions
function rot2sze(a) {
  // compensate size for rotation
  return a === 90 || a === 270
    ? {
      h: width,
      w: height
    }
    : {
      h: height,
      w: width
    };
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
      if (room !== r || startup) {
        startup = false;
        socket.off(room);
        console.log(`Changed room from ${room} to ${r}.`);
        room = r;
        socket.on(room, function (d) {
          populate(d);
        });
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

  // room selector
  let roomSelect = createInput();
  roomSelect.position(config.room.position.x, config.room.position.y);
  ui.roomSelect = roomSelect;
  roomSelect.value(room);

  // add selector
  let boardSelect = createSelect();
  boardSelect.position(config.select.position.x + roomSelect.width, config.select.position.y);

  for (let l in config.layout) {
    boardSelect.option(l);
  }

  boardSelect.selected(config.board);

  boardSelect.changed(function () {
    config.board = boardSelect.value();

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
