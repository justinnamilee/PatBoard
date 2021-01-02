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
