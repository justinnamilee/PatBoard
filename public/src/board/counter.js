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
    rectMode(CENTER);
    imageMode(CORNER);
    textSize(config.textSize); // default size
    textAlign(CENTER, CENTER);

    let relW = this.size.w * cw;
    let relH = this.size.h * ch;

    // draw rect and stick the image in the corner
    fill(this.fill);
    rect(0, 0, relW, relH);

    if (typeof this.image !== "undefined") {
      image(img[this.image], -relW / 2, -relH / 2, relH, relH);
    }

    // redraw the stroke only
    noFill();
    rect(0, 0, relW, relH);

    // set override text properties
    if (typeof this.textSize !== "undefined") {
      textSize(this.textSize);
    }

    // if (typeof this.text !== "undefined") {
    //   text(this.text, 0, this.size.h * ((7 * ch) / 8));
    // }

    // stroke(this.stroke);
    // fill(this.fill);
    // text("-", -this.size.w * (cw / 3), 0);
    // text(this.value, 0, 0);
    // text("+", this.size.w * (cw / 3), 0);
    // noFill();

    pop();
  }
}
