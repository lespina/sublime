const Line = require('./line.js');
const Vector = require('./vector.js');
const Body = require('./body.js');

class Triangle extends Body {
  static createRandom(xDim, yDim, x, y, sideSize) {
    sideSize = sideSize || 50;
    sideSize = Math.random() * (0.9 * sideSize) + 0.1 * sideSize;
    return Body.createRandom.call(this, xDim, yDim, x, y, sideSize, sideSize);
  }

  static copy(triangle) {
    return new Triangle(
      triangle.pos,
      triangle.moveStep,
      triangle.mass,
      triangle.color,
      triangle.sideSize
    );
  }

  constructor(startPos = [0, 0], startVel = [0, 0], mass = 1, color, sideSize = 50) {

    super(startPos, startVel, mass, color, { sideSize });
    this.momentInertia = this.mass * Math.pow(this.sideSize, 2) / 18;
    this.type = "triangle";
  }

  render(ctx) {
    this.drawRot(ctx);
  }

  top() {
    return this.sideSize / Math.sqrt(3);
  }

  bottomLeft() {
    const x = -this.top() * Math.sin(240 * Math.PI / 180);
    const y = this.top() * Math.cos(240 * Math.PI / 180);
    return [x, y];
  }

  bottomRight() {
    const x = -this.top() * Math.sin(120 * Math.PI / 180);
    const y = this.top() * Math.cos(120 * Math.PI / 180);
    return [x, y];
  }

  drawRot(ctx){
    super.drawRot(ctx, (innerCtx) => {
      ctx.fillStyle = this.color;

      ctx.beginPath();
      ctx.moveTo(0, this.top());

      let [x, y] = this.bottomRight();

      ctx.lineTo(x, y);

      [x, y] = this.bottomLeft();
      ctx.lineTo(x, y);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.fillStyle = "#000000";
      ctx.moveTo(0, this.top());
      [x, y] = this.bottomRight();
      ctx.lineTo(x, y);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fill();
    });
  }

  asLines() {
    const [x, y] = this.pos.toArr();

    const top = [x, y + this.top()];

    const [x0, y0] = this.bottomLeft();
    const bottomLeft = [x + x0, y + y0];

    const [x1, y1] = this.bottomRight();
    const bottomRight = [x + x1, y + y1];

    const lines = [
      new Line(top, bottomRight).rotate({x, y}, this.orientation),
      new Line(bottomRight, bottomLeft).rotate({x, y}, this.orientation),
      new Line(bottomLeft, top).rotate({x, y}, this.orientation),
    ];

    return lines;
  }

  reverseOnBounds(xDim, yDim, dampeningFactor) {
    const [x, y] = this.pos.toArr();

    const top = 0;
    const bottom = yDim;
    const right = xDim;
    const left = 0;

    this.asLines().forEach(line => {
      const lineWidth = line.maxX() - line.minX();
      const lineHeight = line.maxY() - line.minY();

      const s = this.sideSize / Math.sqrt(3);
      const dist = s;

      if (line.maxX() > right) {
        this.moveStep.signX(false);
        // this.pos.nums[0] = xDim - dist;
      } else if (line.minX() < left) {
        this.moveStep.signX(true);
        // this.pos.nums[0] = dist;
      } else if (line.maxY() > bottom) {
        this.moveStep.signY(false);
        // this.pos.nums[1] = yDim - dist;
      } else if (line.minY() < top) {
        this.moveStep.signY(true);
        // this.pos.nums[1] = dist;
      }
    });

    this.moveStep = this.moveStep.multiply(new Vector([0.95, 0.95]));
    this.orientMoveStep *= dampeningFactor;
    if (Math.abs(this.moveStep.x()) < 0.1) {
      this.moveStep.nums[0] = 0;
    }
    if (Math.abs(this.moveStep.y()) < 0.3) {
      this.moveStep.nums[1] = 0;
    }
    this.orientMoveStep = -this.orientMoveStep;
  }

  update(extAcceleration, grid, yDim) {
    let maxY = 0;

    this.asLines().forEach(line => {
      if (line.maxY() > maxY) {
        maxY = line.maxY();
      }
    });

    const start = this.gridPos(grid.gridSize);
    if (extAcceleration && maxY <= yDim) {
      this.moveStep = this.moveStep.add(extAcceleration);
    }

    this.updatePosition();
    this.updateOrientation();
    this.updateVelocity();

    const end = this.gridPos(grid.gridSize);

    grid.move(this.id, start, end);
  }

}

module.exports = Triangle;
