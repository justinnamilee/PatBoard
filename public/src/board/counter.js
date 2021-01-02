class Counter {
  constructor(d) {
    this.position = Object.assign({}, d.position);
    arr2num(this.position);
    this.size = Object.assign({}, d.size);
    arr2num(this.size);
    this.fill = d.fill;
    this.stroke = d.stroke;
    this.image = d.image;
    this.text = d.text;
    this.textSize = d.textSize;
    this.value = 0;
  }

  show(cw, ch) {
    push();

    translate(this.position.x * (cw / 2), this.position.y * (ch / 2));
    fill(215);
    textSize(config.textSize);
    textAlign(CENTER, CENTER);
    rectMode(CENTER);
    imageMode(CENTER);

    if (typeof this.image !== "undefined") {
      image(img[this.image], 0, -this.size.w * ((5 * ch) / 8), 50, 50);
    }

    rect(0, 0, this.size.w * cw, this.size.h * ch);
    fill(0);
    noStroke();

    if (typeof this.textSize !== "undefined") {
      textSize(this.textSize);
    }

    if (typeof this.text !== "undefined") {
      text(this.text, 0, this.size.h * ((7 * ch) / 8));
    }

    stroke(this.stroke);
    fill(this.fill);
    text("-", -this.size.w * (cw / 3), 0);
    text(this.value, 0, 0);
    text("+", this.size.w * (cw / 3), 0);
    noFill();

    pop();
  }
}
