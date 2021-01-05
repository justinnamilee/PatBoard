let config;
let socket;
let data = {}; // my state
let game = {}; // state according to server
let design = {}; // holds html items for repositioning
let status = ["Welcome!"];
let connected = false;
let sync = true;


// ! //////////////
// ! misc functions

function statusAdd(s) {
  status.unshift(s);
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


function k2t(k) {
  let c = "?";

  if (typeof k !== "undefined") {
    c = k.toString();
  }

  return (c);
}


function d2pr(d) {
  return (d.room + "::" + d.name);
}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  statusAdd("Window resized to " + windowWidth + "x" + windowHeight + ".");
  design.nameInput.position(config.design.name.position.x * windowWidth, config.design.name.position.y * windowHeight);
  design.joinButton.position(config.design.join.position.x * windowWidth - design.joinButton.width, config.design.join.position.y * windowHeight);
  design.roomInput.position(config.design.join.position.x * windowWidth - design.roomInput.width - design.joinButton.width, config.design.join.position.y * windowHeight);
  design.connectButton.position(config.design.connect.position.x * windowWidth - design.connectButton.width - design.roomInput.width - design.joinButton.width, config.design.join.position.y * windowHeight);
  design.controlInput.position(config.design.control.position.x * windowWidth + design.controlInput.width / 2, config.design.control.position.y * windowHeight - (4 * design.controlInput.height / 3));
}

// ! end of misc
// ! ///////////


// ! ///////////////////////
// ! THESE ARE BUTTON LOGICS

function joinRoom() {
  if (design.nameInput.value() !== "" && design.nameInput.value() !== config.design.name.default) {
    if (typeof data.name === "undefined") {
      statusAdd("You set your name to " + design.nameInput.value() + "!");
    }
    else {
      statusAdd("You changed your name from " + data.name + " to " + design.nameInput.value() + "!");
    }

    data.name = design.nameInput.value();
    design.nameInput.value(config.design.name.default);
  }

  if (design.roomInput.value() !== "" && design.roomInput.value() !== config.design.join.default && typeof data.name !== "undefined") {
    // * join room logic
    data.room = design.roomInput.value();
    statusAdd("You joined " + data.room + "!");

    design.roomInput.value("");
    design.roomInput.hide();
    design.joinButton.html(config.design.join.text_alt);
    design.nameInput.hide();

    socketEmit("join", data);

    // * server is talking to the room
    socket.on(data.room, function (c, d) {
      // * update game data
      if (typeof c === "object") {
        if (sync && typeof c.data[data.name] === "object") {
          sync = false;
          data = Object.assign({}, c.data[data.name]);
        }

        if (typeof c.data === "object") {
          for (let p in c.data) {
            console.log("Game state updated.");
            //if (p !== data.name) {
            game[p] = c.data[p];
            //}
          }
        }
      } else {
        if (c === "kick") {
          statusAdd("All were kicked: " + d);
          quitRoom();
        } else if (c === "message") {
          statusAdd("From server: ", d);
        }
      }
    });

    // * server is talking to us in this room only
    socket.on(d2pr(data), function (c, d) {
      if (c === "kick") {
        statusAdd("You were kicked: " + d);
        quitRoom();
      } else if (c === "message") {
        statusAdd("PM from server: " + d);
      }
    });
  }
}


function quitRoom() {
  statusAdd("You left " + data.room + "!");

  socket.off(data.room);
  socket.off(d2pr(data));

  design.roomInput.value(config.design.join.default);
  design.roomInput.show();
  design.joinButton.html(config.design.join.text);
  design.nameInput.show();

  socketEmit("leave", data);

  data = { name: data.name };
  game = {};
  sync = true;
}


function connectServer() {
  if (typeof socket === "undefined") {
    statusAdd("Connecting to server.");

    socket = io.connect(config.listen);

    socket.on("connect", function () {
      statusAdd("Connected to server " + config.listen + ", nice!  ID: " + socket.id);
      connected = true;
    });

    socket.on("disconnect", function () {
      statusAdd("Disconnected from server, boo.");
      connected = false;
    });

    socket.on("status", function (s) {
      statusAdd("From server: " + s)
    });

    design.nameInput.show();
    design.joinButton.show();
    design.roomInput.show();
    design.connectButton.hide();
  }
}


// ! END OF BUTTON LOGICS
// ! ////////////////////


// ! ////////////////
// ! p5js stuff below

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

  let roomInput = createInput();
  design.roomInput = roomInput;
  roomInput.hide();
  roomInput.value(config.design.join.default);

  let joinButton = createButton(config.design.join.text);
  design.joinButton = joinButton;
  joinButton.hide();
  joinButton.mousePressed(function () {
    if (typeof data.room === "undefined") {
      joinRoom();
    } else {
      quitRoom();
    }
  });

  let connectButton = createButton(config.design.connect.text);
  design.connectButton = connectButton;
  connectButton.mousePressed(connectServer);

  let controlInput = createInput();
  design.controlInput = controlInput;
  controlInput.hide();

  // fit to window
  windowResized();
}


function keyTyped() {
  if (key === 'h') {
    data.health--;
    socket.emit("update", data);
  } else if (key === 'H') {
    data.health++;
    socket.emit("update", data);
  }
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
  text(`P:${k2t(data.name)} R:${k2t(data.room)} N:${k2t(data.player)}`, 0, windowHeight);

  // bounding box
  noFill();
  stroke(config.design.status.fill);
  strokeWeight(1);

  rect(
    windowWidth * config.design.status.position.x - config.design.status.buffer,
    windowHeight * config.design.status.position.y - config.design.status.buffer,
    windowWidth * (config.design.status.size.w) + config.design.status.buffer,
    windowHeight * (config.design.status.size.h) + config.design.status.buffer
  );

  // control
  if (connected) {
    design.controlInput.show();
    design.controlInput.value("");

    push();
    textAlign(LEFT, TOP);

    text(
      "Command Box",
      windowWidth * config.design.control.position.x,
      windowHeight * config.design.control.position.y - design.controlInput.height
    );

    pop();
  } else {
    design.controlInput.hide();
  }
}