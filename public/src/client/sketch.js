const socket = io.connect('http://127.0.0.1:8080');
const config = require('./src/config.json');

let data;

function setup() {
  data = Object.assign({}, config.data);
}

function draw() {

}