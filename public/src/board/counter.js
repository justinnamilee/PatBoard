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
    this.disabled = d.disabled;
    this.textColor = d.textColor;

    if (typeof this.textColor === "undefined") {
      this.textColor = config.text.color;
    }
  }

  show(cw, ch) {
    push();

    translate(this.position.x * (cw / 2), this.position.y * (ch / 2));
    rectMode(CENTER);
    textSize(config.textSize); // default size
    textAlign(CENTER, CENTER);

    let rel = {
      w: this.size.w * cw,
      h: this.size.h * ch
    };

    // draw rect and stick the image in the corner
    fill(this.fill);
    rect(0, 0, rel.w, rel.h);

    if (typeof this.image !== "undefined") {
      if (rel.h > config.image.size.max) {
        imageMode(CENTER);
        image(img[this.image], (config.image.size.max - rel.w) / 2, 0, config.image.size.max, config.image.size.max);
      }
      else {
        imageMode(CORNER);
        image(img[this.image], -rel.w / 2, -rel.h / 2, rel.h, rel.h);
      }
    }

    // redraw the stroke only
    noFill();
    rect(0, 0, rel.w, rel.h);

    // set stroke and fill for text
    fill(this.textColor);
    noStroke();

    if (typeof this.textSize !== "undefined") {
      textSize(this.textSize);
    }

    if (typeof this.text !== "undefined") {
      text(this.text, 0, -rel.h);
    }

    if (typeof this.stroke !== "undefined") {
      stroke(this.stroke);
    }

    let dFill = config.counter.fill.enabled;

    if (this.disabled) {
      dFill = config.counter.fill.disabled;
    }
    else {
      text(this.value, 0, 0);
    }

    fill(dFill);
    noStroke();
    rect(0, 0, rel.w, rel.h);

    pop();
  }
}
