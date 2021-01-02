let p = [];
let config;
let bg;
let img;

// do this before anything else
function preload() {
  config = loadJSON("src/config.json");
  bg = loadImage("assets/carpet.jpg");
  img = {
    "lightning.png": loadImage("assets/lightning.png"),
    "eyeball.png": loadImage("assets/eyeball.png"),
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
      config[k] = c[k];
    }
  }

  // set resolution
  if (config.screen === "dynamic") {
    config.resolution.w = windowWidth;
    config.resolution.h = windowHeight;
  }

  createCanvas(config.resolution.w, config.resolution.h);

  // generate play spaces
  for (let i = 0; i < config.players; i++) {
    p.push(new Player(config.players, i));
    p[i].setDebug(false);
  }
}

// output to screen
function draw() {
  background(bg);
  for (let player of p) {
    player.show();
  }

  noLoop();
}

// capture keys
function keyPressed() {

}
