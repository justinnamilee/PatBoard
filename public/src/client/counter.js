// class Counter {
//   constructor(d) {
//     this.image = "";
//     this.text = "";
//   }

//   show() {

//   }

//   hide() {
//     if (typeof this.buttonDown !== "undefined") {
//       this.buttonDown.hide();
//     }
//     if (typeof this.buttonUp !== "undefined") {
//       this.buttonUp.hide();
//     }
//   }
// }

class Counter {
  constructor(d) {
    this.position = Object.assign({}, d.position);
    arr2num(this.position);
    this.size = Object.assign({}, d.size);
    arr2num(this.size);
    this.fill = d.fill;
    this.stroke = d.stroke;
    this.image = d.image;
    this.buttonUp;
    this.buttonDown;
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
    textSize(sze2fnt(config.text.size)); // default size
    textAlign(CENTER, CENTER);

    let rel = {
      w: this.size.w * cw,
      h: this.size.h * ch
    };

    // draw rect and stick the image in the corner
    fill(this.fill);
    rect(0, 0, rel.w, rel.h);

    let imageSize = 0;

    if (typeof this.image !== "undefined") {
      let x, y, h, w;

      if (rel.h > config.image.size.max) {
        imageMode(CENTER);
        x = (config.image.size.max - rel.w) / 2;
        y = 0;
        w = config.image.size.max;
        h = config.image.size.max;
        imageSize = config.image.size.max;
      }
      else {
        imageMode(CORNER);
        x = -rel.w / 2;
        y = -rel.h / 2;
        w = rel.h;
        h = rel.h;
        imageSize = rel.h;
      }

      rectMode(CORNER);
      fill(255);
      imageSize = imageSize / 2;
      rect(-rel.w / 2, -rel.h / 2, imageSize * 2, rel.h);
      image(img[this.image], x, y, w, h);
      noFill();
      rect(-rel.w / 2, -rel.h / 2, imageSize * 2, rel.h);
    }

    // redraw the stroke only
    noFill();
    rectMode(CENTER);
    rect(0, 0, rel.w, rel.h);
    this.buttonDown.position()

    // set stroke and fill for text
    fill(this.textColor);
    noStroke();

    if (typeof this.text === "string") {
      textSize(sze2fnt("small"));
      textAlign(CENTER, BOTTOM);
      text(this.text, imageSize, -rel.h / 2);
      textSize(sze2fnt(config.text.size));
      textAlign(CENTER, CENTER);
    }

    if (typeof this.textSize === "string") {
      textSize(sze2fnt(this.textSize));
    }

    if (typeof this.stroke === "number") {
      stroke(this.stroke);
    }

    if (typeof this.buttonDown !== "undefined") {
      this.buttonDown.show();
    }
    if (typeof this.buttonUp !== "undefined") {
      this.buttonUp.show();
    }

    let dFill = config.counter.fill.enabled;

    if (this.disabled) {
      dFill = config.counter.fill.disabled;

      if (typeof this.buttonDown !== "undefined") {
        this.buttonDown.hide();
      }
      if (typeof this.buttonUp !== "undefined") {
        this.buttonUp.hide();
      }
    }
    else if (typeof this.value === "number") {
      text(this.value, imageSize, +2);
    }

    fill(dFill);
    noStroke();
    rect(0, 0, rel.w, rel.h);

    pop();
  }
}
