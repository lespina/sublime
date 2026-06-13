class Vector {
  constructor(arg1, arg2) {
    if (arg1.constructor === Vector) {
      return new Vector(arg1.nums);
    }
    if (arg2 === undefined) {
      this.nums = arg1;
    } else {
      const mag = arg1;
      const angle = arg2;
      const x = mag * Math.cos(angle);
      const y = mag * Math.sin(angle);
      this.nums = [x, y];
    }
  }

  x() {
    return this.nums[0];
  }

  y() {
    return this.nums[1];
  }

  reverse() {
    const [x, y] = this.nums;
    this.nums = [-x, -y];
  }

  reverseX() {
    const [x, y] = this.nums;
    this.nums = [-x, y];
  }

  reverseY() {
    const [x, y] = this.nums;
    this.nums = [x, -y];
  }

  signX(positive) {
    const [x, y] = this.nums;
    if (positive) {
      this.nums = [Math.abs(x), y];
    } else {
      this.nums = [-Math.abs(x), y];
    }
  }

  signY(positive) {
    const [x, y] = this.nums;
    if (positive) {
      this.nums = [x, Math.abs(y)];
    } else {
      this.nums = [x, -Math.abs(y)];
    }
  }

  static random(bounds, includeNegatives) {
    const nums = [];
    if (includeNegatives) {
      bounds.forEach(bound => {
        let num = (Math.random() * bound);
        num = ((Math.random() < 0.5) ? -1 * num : num);
        nums.push(num);
      });
    } else {
      bounds.forEach(bound => {
        nums.push(Math.random() * bound);
      });
    }


    return new Vector(nums);
  }

  toArr() {
    return this.nums.slice(0);
  }

  magnitude() {
    let result = 0;
    this.nums.forEach(num => {
      result += (num * num);
    });

    return Math.sqrt(result);
  }

  angleBetween(otherVector) {
    const dotProd = this.dotProduct(otherVector);
    return Math.acos(dotProd / (this.magnitude() * otherVector.magnitude()));
  }

  dotProduct(otherVector) {
    let result = 0;
    for (let i=0; i<this.nums.length; i++) {
      result += this.nums[i] + otherVector.nums[i];
    }
    return result;
  }

  //defined as radian value of angle from the +x axis clockwise (ONLY WORKS FOR 2-D VECTORS)
  angle() {
    const [x, y] = this.nums;
    return Math.atan(y / x);
  }

  operate(operator, ...vectors) {
    const newNums = this.nums.slice(0);

    vectors.forEach(vector => {
      vector.nums.forEach((value, i) => {
        newNums[i] = operator(newNums[i], value);
      }, this);
    }, this);

    return new Vector(newNums);
  }

  add(...vectors) {
    return this.operate((a, b) => a + b, ...vectors);
  }

  subtract(...vectors) {
    return this.operate((a, b) => a - b, ...vectors);
  }

  multiply(...vectors) {
    return this.operate((a, b) => a * b, ...vectors);
  }

  div(...vectors) {
    return this.operate((a, b) => Math.floor(a / b), ...vectors);
  }

  fdiv(...vectors) {
    return this.operate((a, b) => a / b, ...vectors);
  }

  rotate(angle = Math.PI / 2) {
    const [x, y] = this.nums;
    const nums = [
      x * Math.cos(angle) + y * Math.sin(angle),
      -x * Math.sin(angle) + y * Math.cos(angle)
    ];
    return new Vector(nums);
  }

  dampen(factor) {
    this.nums = this.multiply(new Vector([factor, factor])).nums;
  }

  sameSignX(otherVector) {
    return Vector.sameSign(this.x(), otherVector.x());
  }

  sameSignY(otherVector) {
    return Vector.sameSign(this.y(), otherVector.y());
  }

  static sameSign(a, b) {
    return (
      a >= 0 && b >= 0 ||
      a <= 0 && b <= 0
    );
  }
}

module.exports = Vector;
