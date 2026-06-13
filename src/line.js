const LineIntersection = require('line-intersection');

class Line {
  constructor(start, end) {
    let [x, y] = start;
    this.start = {x, y};

    [x, y] = end;
    this.end = {x ,y};
  }

  rotate(pivot, angle) {
    let {x, y} = this.start;

    x -= pivot.x;
    y -= pivot.y;

    let rotX = x * Math.cos(angle) - y * Math.sin(angle);
    let rotY = x * Math.sin(angle) + y * Math.cos(angle);

    rotX += pivot.x;
    rotY += pivot.y;

    const start = [rotX, rotY];

    x = this.end.x;
    y = this.end.y;

    x -= pivot.x;
    y -= pivot.y;

    rotX = x * Math.cos(angle) - y * Math.sin(angle);
    rotY = x * Math.sin(angle) + y * Math.cos(angle);

    rotX += pivot.x;
    rotY += pivot.y;

    const end = [rotX, rotY];

    return new Line(start, end);
  }

  minX() {
    return Math.min(this.start.x, this.end.x);
  }

  maxX() {
    return Math.max(this.start.x, this.end.x);
  }

  minY() {
    return Math.min(this.start.y, this.end.y);
  }

  maxY() {
    return Math.max(this.start.y, this.end.y);
  }

  intersectsWith(otherLine) {
    return LineIntersection.isSegmentIntersected(
      [
        this.start,
        this.end,
        otherLine.start,
        otherLine.end
      ]
    );
  }
}

module.exports = Line;
