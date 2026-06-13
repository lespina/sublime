const SandBox = require('./sandbox.js');
const Circle = require('./circle.js');
const Square = require('./square.js');
const Triangle = require('./triangle.js');
const shuffle = require('shuffle-array');

document.addEventListener('DOMContentLoaded', () => {
  window.onkeydown = function(e) {
    return (e.keyCode !== 32);
  };

  const bodies = [Circle, Square, Triangle];

  const [xDim, yDim] = [750, 400];
  const s = SandBox.start(xDim, yDim, 3, true);
  document.addEventListener('keyup', (e) => {
    e.preventDefault();
    switch (e.keyCode) {
      case 13:
        s.add(100);
        break;
      case 16:
        s.add(10);
        break;
      case 32:
        s.add();
        break;
      case 67:
        s.clear();
        break;
      case 70:
        s.removeForces();
        s.freeze();
        break;
      case 71:
        s.toggleGravity();
        break;
      case 82:
        s.removeForces();
        break;
    }
  });
  const canvas = document.getElementById('canvas');
  canvas.addEventListener('click', s.setAttractor.bind(s));
});
