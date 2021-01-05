class Counter {
  constructor(d) {
    this.image = "";
    this.buttonUp;
    this.buttonDown;
    this.text = "";
  }

  show() {
    if (typeof this.buttonDown !== "undefined") {
      this.buttonDown.show();
    }
    if (typeof this.buttonUp !== "undefined") {
      this.buttonUp.show();
    }
  }

  hide() {
    if (typeof this.buttonDown !== "undefined") {
      this.buttonDown.hide();
    }
    if (typeof this.buttonUp !== "undefined") {
      this.buttonUp.hide();
    }
  }
}