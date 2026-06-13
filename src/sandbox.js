const shuffle = require('shuffle-array');
const Circle = require('./circle');
const Square = require('./square');
const Triangle = require('./triangle');
const Vector = require('./vector');
const Grid = require('./grid');
const Util = require('./util');
const Stats = require('stats-js');
const _ = require('lodash');

const BODIES = [Square, Triangle, Circle];
const GRIDSIZE = 50;

class SandBox {
  constructor(xDim, yDim, numBodies, gravityOn, dampeningFactor = 0.99) {
    this.xDim = xDim;
    this.yDim = yDim;
    this.dampeningFactor = dampeningFactor;
    this.gravity = gravityOn;
    this.nextId = 0;
    this.attractiveForce = () => new Vector([0, 0]);
    this.grid = new Grid(xDim / GRIDSIZE, yDim / GRIDSIZE, GRIDSIZE);
    this.maxSize = 30 || GRIDSIZE;
    this.add(numBodies);
    this.initializeStats();
  }

  initializeStats() {
    this.stats = new Stats();
    this.stats.setMode(0);
    const counter = document.getElementById('counter');
    document.getElementById('stats-panel').insertBefore(this.stats.domElement, counter);
  }

  getRelativePos(e) {
    //reference: https://stackoverflow.com/questions/55677/how-do-i-get-the-coordinates-of-a-mouse-click-on-a-canvas-element
    let x, y;
    if (e.pageX || e.pageY) {
      x = e.pageX;
      y = e.pageY;
    } else {
      x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
      y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }
    const canvas = document.getElementById('canvas');
    const width = Util.getWidth();
    const [offsetX, offsetY] = Util.getMarginOffsets(width);
    const scale = Util.getScale(width);
    x -= (canvas.offsetLeft - offsetX);
    y -= (canvas.offsetTop - offsetY);
    return [x / scale, y / scale];
  }

  setAttractor(e) {
    const [x, y] = this.getRelativePos(e);

    const mousePos = new Vector([x, y]);
    this.attractiveForce = function() {
      const attractiveForce = mousePos.subtract(this.pos);
      const mag = attractiveForce.magnitude();
      attractiveForce.dampen(1 / mag);
      return attractiveForce;
    };
  }

  toggleGravity() {
    this.gravity = !this.gravity;
  }

  removeForces() {
    this.gravity = false;
    this.attractiveForce = () => new Vector([0, 0]);
  }

  freeze() {
    const bodies = this.grid.collection();

    for (let bodyId in bodies) {
      const body = bodies[bodyId];
      body.moveStep = new Vector([0, 0]);
    }
  }

  clear() {
    const bodyCount = document.getElementById('body-count');
    bodyCount.innerHTML = 0;
    this.grid.clear();
  }

  rotateGravity() {
    const forces = [
      [0, 1], [1, 0], [0, -1], [-1, 0]
    ];
    return () => {
      forces.unshift(forces.pop());
      this.gravity = new Vector(forces[0]);
    };
  }

  static start(xDim, yDim, numCircles, gravityOn) {
    const sandbox = new SandBox(xDim, yDim, numCircles, gravityOn);
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    sandbox.animateCallback(ctx);
    return sandbox;
  }

  add(n = 1) {
    const bodyCount = document.getElementById('body-count');
    const count = bodyCount.innerHTML;
    bodyCount.innerHTML = parseInt(count) + n;
    for (let i=0; i<n; i++) {
      const body = shuffle(BODIES)[0].createRandom(this.xDim, this.yDim, null, null, this.maxSize);
      body.id = this.nextId++;
      const pos = body.gridPos(GRIDSIZE);
      this.grid.add(body, pos);
    }
  }

  render(ctx) {
    ctx.clearRect(0, 0, this.xDim, this.yDim);
    const grad = ctx.createLinearGradient(0, 0, 0, this.yDim);
    grad.addColorStop(0, 'white');
    grad.addColorStop(1, '#ADD8E6');
    ctx.fillStyle = grad;//'#ADD8E6';

    ctx.fillRect(0, 0, this.xDim, this.yDim);
    _.values(this.grid.collection()).forEach(circle => {
      circle.render(ctx);
    });
  }

  update() {
    const gravity = (this.gravity) ? new Vector([0, 1]) : new Vector([0, 0]);
    const bodies = this.grid.collection();

    for (let bodyId in bodies) {
      const body = bodies[bodyId];
      if (!body.inBounds(this.xDim, this.yDim)) {
        body.reverseOnBounds(this.xDim, this.yDim, this.dampeningFactor, this.grid);
      }
    }

    for (let bodyId in bodies) {
      const body = bodies[bodyId];
      const gridPos = body.gridPos(this.grid.gridSize);
      const adjSpace = this.grid.adjacentPositions(gridPos);

      for (let i=0; i<adjSpace.length; i++) {
        const pos = adjSpace[i];
        const otherBodies = this.grid.get(pos);

        for (let otherBodyId in otherBodies) {
          const otherBody = otherBodies[otherBodyId];
          if (!body.cannotCollide && bodyId !== otherBodyId && body.intersectsWith(otherBody)) {
            body.collide(otherBody, this.dampeningFactor);
            const extAcceleration = this.attractiveForce.call(otherBody).add(gravity);
            otherBody.update(extAcceleration, this.grid, this.yDim);
          }
        }
      }

      const extAcceleration = this.attractiveForce.call(body).add(gravity);
      body.update(extAcceleration, this.grid, this.yDim);
    }
  }

  animateCallback(ctx) {
    this.stats.begin();
    this.update();
    this.render(ctx);
    this.stats.end();
    requestAnimationFrame(this.animateCallback.bind(this, ctx));
  }
}

module.exports = SandBox;
