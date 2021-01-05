// misc functions

function rot2sze(a) {
  // compensate size for rotation
  return a === 90 || a === 270
    ? {
      h: width,
      w: height
    }
    : {
      h: height,
      w: width
    };
}

function arr2num(o) {
  for (let k in o) {
    if (Array.isArray(o[k])) {
      let [n, d] = o[k];
      o[k] = n / d;
    }
  }
}

function sze2fnt(f) {
  let m = config.font.size[f];

  if (typeof m === "undefined") {
    m = 1;
  }

  return (m * map(windowHeight, 0, 2160, config.font.min, config.font.max, true));
}
