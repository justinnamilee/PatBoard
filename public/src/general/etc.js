// misc functions

// does something? maybe?
function arr2num(o) {
  for (let k in o) {
    if (Array.isArray(o[k])) {
      let [n, d] = o[k];
      o[k] = n / d;
    }
  }
}


// calculate rotated sizes, should be in player, likely
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


// convert / scale font siies
function sze2fnt(f) {
  let m = config.font.size[f];

  if (typeof m === "undefined") {
    m = 1;
  }

  return (m * map(windowHeight, 0, 2160, config.font.min, config.font.max, true));
}


// should probably be in player class
function populate(r, p, s) {
  let t = config.metaTag;

  // remove old players
  for (let i = 0; i < p.length; i++) {
    let j = p[i];
    if (typeof j !== "undefined" && !s) {
      if (!Object.values(r[t].pool).includes(j.name)) {
        p[i] = new Player(config.board, i);
      }
    }
  }

  // populate data of players
  for (let q in r[t].pool) {
    if (r[t].pool[q] !== "") {
      let index = parseInt(q) - 1;

      if (p[index]) {
        // stuff the counter
        for (let c in config.counter.design) {
          p[index].counter[c].value = r.data[r[t].pool[q]][c];
        }

        // set name
        p[index].name = r.data[r[t].pool[q]].name;

        // populate enemies
        let e = 0;
        for (let w in r[t].pool) {
          if (r[t].pool[w] !== r[t].pool[q]) {
            let enemy = "enemy" + ++e;

            if (r[t].pool[w] !== "") {
              p[index].counter[enemy].disabled = false;
            } else {
              p[index].counter[enemy].disabled = true;
            }

            p[index].counter[enemy].text = r[t].pool[w];
          }
        }
      }
    }
  }
}
