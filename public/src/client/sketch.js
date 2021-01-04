let socket;

let config;
let data = {}; // my state
let game = {}; // state according to server
let design = {}; // holds html items for repositioning
let status = ["Welcome!"];
let changed = false;

function statusAdd(s) {
  status.unshift(s);
}

function updateData(d) {
  console.log(d);
  return undefined;
}

function socketEmit(t, d) {
  if (typeof d === "undefined") {
    d = data;
  }

  if (typeof t === "undefined") {
    t = config.defaultEmit;
  }

  if (typeof socket !== "undefined" && socket.connected) {
    socket.emit(t, d);
  } else {
    statusAdd("Unable to send data to server, disconnected.");
  }
}

function preload() {
  config = loadJSON("src/client/config.json");
}

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

  frameRate(config.framerate);
  createCanvas(windowWidth, windowHeight);

  let nameInput = createInput();
  design.nameInput = nameInput;
  nameInput.hide();
  nameInput.value(config.design.name.default);

  let submitButton = createButton(config.design.name.text);
  design.submitButton = submitButton;
  submitButton.hide();
  submitButton.mousePressed(function () {
    if (nameInput.value() !== "" && nameInput.value() !== config.design.status.default) {
      if (typeof data.name === "undefined") {
        statusAdd("You set your name to " + nameInput.value() + "!");
      }
      else {
        statusAdd("You changed your name from " + data.name + " to " + nameInput.value() + "!");
      }

      data.name = nameInput.value();
      nameInput.value("");

      if (typeof data.room !== "undefined")
      {
        socketEmit("change", data);
      }
    }
  });

  let joinButton = createButton(config.design.join.text);
  design.joinButton = joinButton;
  joinButton.hide();
  joinButton.mousePressed(function () {
    if (typeof data.room === "undefined") {
      if (roomInput.value() !== "" && roomInput.value() !== config.design.join.default && typeof data.name !== "undefined") {
        data.room = roomInput.value();
        statusAdd("You joined " + data.room + "!");
        roomInput.value("");
        roomInput.hide();
        joinButton.html(config.design.join.text_alt);

        socketEmit("join", data);
        socket.on(data.room, (d) => updateData(d));
      }
    } else {
      statusAdd("You left " + data.room + "!");
      socket.off(data.room);
      roomInput.value(config.design.join.default);
      roomInput.show();
      joinButton.html(config.design.join.text);

      socketEmit("leave", data);

      data = { name: data.name };
      game = {};
    }
  });

  let roomInput = createInput();
  design.roomInput = roomInput;
  roomInput.hide();
  roomInput.value(config.design.join.default);

  let connectButton = createButton(config.design.connect.text);
  design.connectButton = connectButton;
  connectButton.mousePressed(function () {
    if (typeof socket === "undefined") {
      statusAdd("Connecting to server.");

      socket = io.connect(config.listen);

      socket.on('connect', function () {
        statusAdd("Connected to server " + config.listen + ", nice!  ID: " + socket.id);

        nameInput.show();
        submitButton.show();
        joinButton.show();
        roomInput.show();
      });
      socket.on('disconnect', () => statusAdd("Disconnected from server, boo."));

      connectButton.hide();
    }
  });

  // fit to window
  windowResized();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  statusAdd("Window resized to " + windowWidth + "x" + windowHeight + ".");
  design.nameInput.position(config.design.name.position.x * windowWidth, config.design.name.position.y * windowHeight);
  design.submitButton.position(design.nameInput.x + design.nameInput.width, config.design.name.position.y * windowHeight);
  design.joinButton.position(config.design.join.position.x * windowWidth - design.joinButton.width, config.design.join.position.y * windowHeight);
  design.roomInput.position(config.design.join.position.x * windowWidth - design.roomInput.width - design.joinButton.width, config.design.join.position.y * windowHeight);
  design.connectButton.position(config.design.connect.position.x * windowWidth - design.connectButton.width - design.roomInput.width - design.joinButton.width, config.design.join.position.y * windowHeight);
}

function draw() {
  background(0);

  // draw status window
  fill(config.design.status.fill);
  noStroke();

  if (status.length > config.design.status.maxSize) {
    status.pop();
  }

  textSize(config.design.status.textSize);

  text(
    status.map(t => ">> " + t).join("\n"),
    windowWidth * config.design.status.position.x,
    windowHeight * config.design.status.position.y,
    windowWidth * config.design.status.size.w,
    windowHeight * config.design.status.size.h
  );

  // debug stuff


  noFill();
  stroke(config.design.status.fill);
  strokeWeight(1);

  rect(
    windowWidth * config.design.status.position.x - config.design.status.buffer,
    windowHeight * config.design.status.position.y - config.design.status.buffer,
    windowWidth * (config.design.status.size.w) + config.design.status.buffer,
    windowHeight * (config.design.status.size.h) + config.design.status.buffer
  );
}