// misc functions

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

function populate(r, p) {
  let t = config.metaTag;

  // remove old players
  for (let i = 0; i < p.length; i++) {
    let j = p[i];
    if (typeof j !== "undefined") {
      if (!Object.values(r[t].pool).includes(j.name)) {
        p[i] = new Player(config.board, i);
      }
    }
  }

  // populate data of players
  for (let q in r[t].pool) {
    if (r[t].pool[q] !== "") {
      let index = parseInt(q) - 1;

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
