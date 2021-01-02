class Player {
  constructor(l, n) {
    this.index = n;

    this.setLayout(l, n);

    this.color = "#" + Math.floor(Math.random() * 16777215).toString(16);

    this.counter = {};
    for (let k in config.counter.design) {
      this.counter[k] = new Counter(config.counter.design[k]);
    }

    this.debug = false;
  }

  show() {
    let rel = rot2sze(this.rotation);

    push();

    translate(this.position.x * width, this.position.y * height);
    angleMode(DEGREES);
    rotate(this.rotation);

    fill(config.player.fill.enabled);
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

  setColor(color) {
    this.color = color;
    console.log(`Changed player ${this.i + 1} color to ${this.color}.`);
  }

  setLayout(l, n) {
    this.layout = l;

    this.rotation = config.layout[l].rotation[n];

    this.position = Object.assign({}, config.layout[l].position[n]);
    arr2num(this.position); // encode any fractions

    this.size = Object.assign({}, config.layout[l].size[n]);
    arr2num(this.size); // encode any fractions
  }
}
