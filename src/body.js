const Line = require('./line');
const Vector = require('./vector');
const _ = require('lodash');

const COLOR = "#FF0000";
const HEX_DIGITS = "0123456789ABCDEF";

class Body {
  static createRandom(xDim, yDim, x, y, options, mass) {
    const randDensity = Math.random();

    mass = mass || randDensity * 10;

    let pos;
    if (x) {
      pos = new Vector([x, y]);
    } else {
      pos = Vector.random([0.9 * xDim, 0.9 * yDim]);
    }

    options = options || { size: 10 };

    return new this(
      pos,
      Vector.random([10, 10], true),
      randDensity * 10,
      Body.randomColor(),
      options
    );
  }

  static randomColor() {
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += HEX_DIGITS[Math.floor((Math.random() * 16))];
    }

    return color;
  }

  static copy(body) {
    return new body.constructor(
      body.pos,
      body.moveStep,
      body.mass,
      body.color,
      body.size
    );
  }

  constructor(startPos = [0, 0], startVel = [0, 0], mass = 1, color = COLOR, options = { size: 10 }) {
    this.color = color;
    //corresponds to center point of body
    this.pos = new Vector(startPos);
    this.moveStep = new Vector(startVel);
    this.mass = mass;
    for (let key in options) {
      this[key] = options[key];
    }
    this.acceleration = new Vector([0,0]);

    this.orientation = 0;
    const randNum = Math.random();
    this.orientMoveStep = ((randNum > 0.5) ? 1 * randNum : -1 * randNum);
  }

  allowCollision() {
    this.cannotCollide = false;
  }

  updatePosition() {
    this.pos = this.pos.add(this.moveStep);
  }

  updateOrientation() {
    this.orientation += this.orientMoveStep;
  }

  updateVelocity() {
    this.moveStep = this.moveStep.add(this.acceleration);
  }

  updateAcceleration(newAcc) {
    this.acceleration = new Vector(newAcc);
    // this.acceleration = this.acceleration.add(this.jerk);
  }

  update(extAcceleration, grid) {
    const start = this.gridPos(grid.gridSize);
    if (extAcceleration) {
      this.moveStep = this.moveStep.add(extAcceleration);
    }

    this.updatePosition();
    this.updateOrientation();
    this.updateVelocity();

    const end = this.gridPos(grid.gridSize);

    grid.move(this.id, start, end);
  }

  drawRot(ctx, draw){
    const [x, y] = this.pos.toArr();

    ctx.translate(x, y);

    ctx.rotate(this.orientation);

    draw(ctx);

    ctx.rotate(-this.orientation);
    ctx.translate(-x, -y);
  }

  inBounds(xDim, yDim) {
    const top = 0;
    const bottom = yDim;
    const right = xDim;
    const left = 0;

    let answer = true;

    this.asLines().forEach(line => {
      if (
        line.maxX() > right ||
        line.minX() < left ||
        line.maxY() > bottom ||
        line.minY() < top
      ) { answer = false; }
    });

    return answer;
  }

  intersectsWith(otherBody) {
    const thisLines = this.asLines();
    const otherLines = otherBody.asLines();
    for (let i=0; i<thisLines.length; i++) {
      for (let j=0; j<otherLines.length; j++) {
        if (thisLines[i].intersectsWith(otherLines[j])) {
          return otherLines[j];
        }
      }
    }
    return false;
  }

  asLines() {
    const [x, y] = this.pos.nums;
    return [new Line([x - 1, y - 1], [x + 1, y + 1])];
  }

  chooseV1fx(otherBody) {
    const randNum = Math.random();
    const newVel = Math.abs((this.moveStep.magnitude()) * randNum);

    const thisMomentum = this.mass * this.x();
    const otherMomentum = otherBody.mass * otherBody.x();
    const totalMomentum = thisMomentum + otherMomentum;

    let posOrNeg = ((totalMomentum > 0) ? 1 : -1);

    if (this.mass > otherBody.mass) {
      return newVel * posOrNeg;
    } else {
      return newVel * -posOrNeg;
    }
  }

  interchangeMomenta() {
    const px = this.x() * this.mass;
    const py = this.y() * this.mass;
    const p = px + py;

    const l = this.orientMoveStep * this.momentInertia;

    const deltaP = Math.random() * 0.1 * p;
    const deltaPx = p / 2;
    const deltaPy = p / 2;

    const deltaL1 = Math.random() * 0.1 * l;
    const deltaL2 = Math.random() * 0.1 * l;

    this.moveStep.nums[0] -= (deltaPx / this.mass);
    this.moveStep.nums[1] -= (deltaPy / this.mass);

    this.orientMoveStep += (deltaPx + deltaPy) / this.momentInertia;
    this.orientMoveStep -= (deltaL1 + deltaL2) / this.momentInertia;

    this.moveStep.nums[0] += (deltaL1 / this.mass);
    this.moveStep.nums[1] += (deltaL2 / this.mass);
  }

  collide(otherBody, dampeningFactor) {
    this.rebound(otherBody);
    this.angularRebound(otherBody);

    // this.interchangeMomenta();
    // otherBody.interchangeMomenta();

    this.dampen(dampeningFactor);
    otherBody.dampen(dampeningFactor);
  }

  rebound(otherBody) {
    //CONSTANTS:
    const v10x = this.x();
    const v10y = this.y();
    const v20x = otherBody.x();
    const v20y = otherBody.y();

    const initMagSq1 = Math.pow(v10x, 2) + Math.pow(v10y, 2);
    const initMagSq2 = Math.pow(v20x, 2) + Math.pow(v20y, 2);

    const m1 = this.mass;
    const m2 = otherBody.mass;
    const u1 = m1 / m2;
    const u2 = m2 / m1;

    //CHOOSING RANDOM VALUE FOR: x component of final velocity of this particle
    const v1fx = this.chooseV1fx(otherBody);

    const v2fx = u1 * v10x + v20x - u1 * v1fx;

    const a = 1 + u1;
    const b = -2 * (u1 * v10y + v20y);
    const c = u2 * Math.pow((u1 * v10y + v20y), 2) - (
        initMagSq1 + u2 * initMagSq2 - Math.pow(v1fx, 2) - u2 * Math.pow(v2fx, 2)
      );

    const sqrtDiscriminant = Math.sqrt(Math.abs(b*b - 4*a*c));
    const varTerm = ((Math.random() > 0.5) ? sqrtDiscriminant : -sqrtDiscriminant);
    const v1fy = (-b + varTerm) / (2*a);

    const v2fy = u1 * v10y + v20y - u1 * v1fy;

    // const initMomentumX = m1 * v10x + m2 * v20x;
    // const finalMomentumX = m1 * v1fx + m2 * v2fx;
    //
    // const initMomentumY = m1 * v10y + m2 * v20y;
    // const finalMomentumY = m1 * v1fy + m2 * v2fy;

    const initEnergy = m1 * (v10x * v10x + v10y * v10y) + m2 * (v20x * v20x + v20y * v20y);
    const finalEnergy = m1 * (v1fx * v1fx + v1fy * v1fy) + m2 * (v2fx * v2fx + v2fy * v2fy);

    if (Math.abs(finalEnergy - initEnergy) < 0.00001) {
      this.moveStep = new Vector([v1fx, v1fy]);
      otherBody.moveStep = new Vector([v2fx, v2fy]);
    } else {
      if (Math.random() > 0.5) {
        if (!this.moveStep.sameSignX(otherBody.moveStep)) {
          otherBody.moveStep.reverseX();
        }
        this.moveStep.reverseX();
      } else {
        if (!this.moveStep.sameSignY(otherBody.moveStep)) {
          otherBody.moveStep.reverseY();
        }
        this.moveStep.reverseY();
      }
    }

    this.cannotCollide = true;
    window.setTimeout(this.allowCollision.bind(this), 150);
  }

  angularRebound(otherBody) {
    const i1 = this.momentInertia;
    const w1 = this.orientMoveStep;

    const i2 = otherBody.momentInertia;
    const w2 = otherBody.orientMoveStep;

    const l = i1 * w1 + i2 * w2;

    const a = i2 * i2 + i1 * i2;
    const b = -2 * i2 * l;

    const q2 = -b / a - w2;
    const q1 = (l - i2 * q2) / i1;

    this.orientMoveStep = q1;
    otherBody.orientMoveStep = q2;
  }

  x() {
    return this.moveStep.x();
  }

  y() {
    return this.moveStep.y();
  }

  posArr() {
    return this.pos.toArr();
  }

  gridPos(gridSize) {
    const [x, y] = this.posArr();
    return [Math.floor(x / gridSize), Math.floor(y / gridSize)];
  }

  reverse() {
    this.moveStep.reverse();
  }

  angle() {
    return this.moveStep.angle();
  }

  rotate(angle) {
    this.moveStep.rotate(angle);
  }

  reverseOnBounds(xDim, yDim, dampeningFactor, grid) {
    const top = new Line([0, 0], [xDim, 0]);
    top.side = 'TOP';
    const bottom = new Line([0, yDim], [xDim, yDim]);
    bottom.side = 'BOTTOM';
    const left = new Line([0, 0], [0, yDim]);
    left.side = 'LEFT';
    const right = new Line([xDim, 0], [xDim, yDim]);
    right.side = 'RIGHT';

    const boundsBody = { asLines: () => [top, bottom, left, right] };
    const intersectedLine = this.intersectsWith(boundsBody);

    if (intersectedLine) {
      const start = this.gridPos(grid.gridSize);

      switch (intersectedLine.side) {
        case 'TOP':
          this.pos.nums[1] = 0;
          this.moveStep.signY(true);
          break;
        case 'BOTTOM':
          this.pos.nums[1] = yDim;
          this.moveStep.signY(false);
          break;
        case 'LEFT':
          this.pos.nums[0] = 0;
          this.moveStep.signX(true);
          break;
        case 'RIGHT':
          this.pos.nums[0] = xDim;
          this.moveStep.signX(false);
          break;
        default:
          alert('bounds error');
      }

      const end = this.gridPos(grid.gridSize);
      grid.move(this.id, start, end);
    }

    this.moveStep = this.moveStep.multiply(new Vector([dampeningFactor, dampeningFactor]));
    if (Math.abs(this.moveStep.x()) < 0.1) {
      this.moveStep.nums[0] = 0;
    }
    if (Math.abs(this.moveStep.y()) < 0.1) {
      this.moveStep.nums[1] = 0;
    }
  }

  dampen(factor) {
    this.moveStep.dampen(factor);
    this.orientMoveStep *= factor;
  }
}

module.exports = Body;
