const Circle = require('./circle');

class SandBox {
  constructor(xDim, yDim, numCircles) {
    this.xDim = xDim;
    this.yDim = yDim;

    this.inView = [];
    for (let i=0; i<numCircles; i++) {
      const circle = Circle.createRandom();
      this.inView.push(circle);
    }
  }

  static start(xDim, yDim, numCircles) {
    const sandbox = new SandBox(xDim, yDim, numCircles);
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    sandbox.animateCallback(ctx);
  }

  render(ctx) {
    ctx.clearRect(0, 0, this.xDim, this.yDim);
    this.inView.forEach(circle => {
      circle.render(ctx);
    });
  }

  update(otherCircles) {
    const newView = [];
    this.inView.forEach((circle, i) => {
      otherCircles.forEach((otherCircle, j) => {
        if (!circle.cannotCollide && i !== j && circle.intersectsWith(otherCircle)) {
          circle.rebound();
        }
      });


      circle.update();
      if (circle.inBounds(this.xDim, this.yDim)) {
        newView.push(circle);
      }
    }, this);

    this.inView = newView;
  }

  animateCallback(ctx) {
    this.update(this.inView);
    this.render(ctx);
    requestAnimationFrame(this.animateCallback.bind(this, ctx));
  }
}

module.exports = SandBox;