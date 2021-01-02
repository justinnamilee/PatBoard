let p = [];
let config;
let bg;
let img;

// do this before anything else
function preload() {
  config = loadJSON("src/config.json");
  bg = loadImage("assets/carpet.jpg");
  img = {
    "health.png": loadImage("assets/health.png"),
    "eyeball.png": loadImage("assets/eyeball.png"),
    "lightning.png": loadImage("assets/lightning.png"),
    "horn.png": loadImage("assets/horn.png"),
    "enemy.png": loadImage("assets/enemy.png")
  };
}

// helper for callbacks
function resetLayout() {
  for (let player of p) {
    player.setLayout(config.board, player.index);
  }
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
  let select = createSelect();

  select.position(config.select.position.x, config.select.position.y);

  for (let l in config.layout) {
    select.option(l);
  }

  select.selected(config.board);

  select.changed(function () {
    config.board = select.value();

    resetLayout();
  });

  // generate play spaces
  if (typeof config.layout[config.board] !== "undefined") {
    for (let i = 0; i < config.layout[config.board].position.length; i++) {
      p.push(new Player(config.board, i));
    }
  }
}

// output to screen
function draw() {
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
