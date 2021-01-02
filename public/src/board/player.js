// define positions and sizes
let layout, design;

class Player {
  constructor(c, n) {
    if (typeof layout === "undefined") {
      layout = config.layout;
    }

    if (typeof design === "undefined") {
      design = config.design;
    }

    this.index = n;
    this.count = c;

    this.rotation = layout[c].rotation[n];

    this.position = Object.assign({}, layout[c].position[n]);
    arr2num(this.position); // encode any fractions

    this.size = Object.assign({}, layout[c].size[n]);
    arr2num(this.size); // encode any fractions

    this.color = "#" + Math.floor(Math.random() * 16777215).toString(16);

    this.counter = {};
    for (let k in design) {
      this.counter[k] = new Counter(design[k]);
    }

    this.debug = false;
  }

  show() {
    let rel = rot2sze(this.rotation);

    push();

    translate(this.position.x * width, this.position.y * height);
    angleMode(DEGREES);
    rotate(this.rotation);

    fill(config.playerEnabled);
    strokeWeight(3);
    stroke(this.color);

    rectMode(CENTER);
    rect(0, 0, this.size.w * rel.w, this.size.h * rel.h);

    for (let k in this.counter) {
      this.counter[k].show(this.size.w * rel.w, this.size.h * rel.h);
    }

    noStroke();
    fill(0);
    textAlign(LEFT, BOTTOM);
    text(
      `P${this.index + 1}`,
      -((this.size.w * rel.w) / 2) + 2,
      (this.size.h * rel.h) / 2
    );

    pop();
  }

  setDebug(flag) {
    this.debug = flag;
    console.log(this);
  }

  setColor(color) {
    this.color = color;
    console.log(`Changed player ${this.i + 1} color to ${this.color}.`);
  }
}
