class Status {

  constructor(d) {
    this.status = ["Welcome!"];
    this.data = d;
  }

  add(s) {
    this.status.unshift(s);
  }

  show() {
    // draw status window
    fill(config.ui.design.status.fill);
    noStroke();

    if (this.status.length > config.ui.design.status.maxSize) {
      this.status.splice(config.ui.design.status.maxSize);
    }

    textSize(sze2fnt(config.ui.design.status.textSize));

    // debug stuff
    text(`P:${k2t(this.data.name)} R:${k2t(this.data.room)} N:${k2t(this.data.player)}`, 0, windowHeight);

    // bounding box
    if (typeof config.ui.design.status.fill === "undefined") {
      noFill();
    } else {
      fill(config.ui.design.status.fill);
    }

    stroke(config.ui.design.status.fill);
    strokeWeight(1);

    rect(
      windowWidth * config.ui.design.status.position.x - config.ui.design.status.buffer,
      windowHeight * config.ui.design.status.position.y - config.ui.design.status.buffer,
      windowWidth * (config.ui.design.status.size.w) + config.ui.design.status.buffer,
      windowHeight * (config.ui.design.status.size.h) + config.ui.design.status.buffer
    );

    fill(255);
    noStroke();
    text(
      this.status.map(t => ">> " + t).join("\n"),
      windowWidth * config.ui.design.status.position.x,
      windowHeight * config.ui.design.status.position.y,
      windowWidth * config.ui.design.status.size.w,
      windowHeight * config.ui.design.status.size.h
    );
  }
}