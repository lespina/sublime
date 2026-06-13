class Grid {
  static createGrid(width, height) {
    const result = [];
    for (let i=0; i<width; i++) {
      result[i] = [];
      for (let j=0; j<height; j++) {
        result[i][j] = {};
      }
    }
    return result;
  }

  constructor(width, height, gridSize) {
    this.gridSize = gridSize;
    this.dimensions = [width, height];
    this.grid = Grid.createGrid(width, height);
    this.bucket = {};
  }

  get(pos) {
    const [x, y] = pos;
    return this.grid[x][y];
  }

  add(item, pos) {
    let [i, j] = this.inRange(pos);
    this.grid[i][j][item.id] = item;
    this.bucket[item.id] = item;
    return this;
  }

  remove(item, pos) {
    const [i, j] = this.inRange(pos);
    delete this.grid[i][j][item.id];
    delete this.bucket[item.id];
    return this;
  }

  clear() {
    const [width, height] = this.dimensions;
    this.grid = Grid.createGrid(width, height);
    this.bucket = {};
  }

  move(id, start, end) {
    const [i, j] = this.inRange(start);
    const item = this.grid[i][j][id];
    if (!item) { throw 'item not found'; }
    delete this.grid[i][j][id];

    const [k, l] = this.inRange(end);
    this.grid[k][l][id] = item;
    return this;
  }

  includes(item) {
    return item.id in this.bucket;
  }

  collection() {
    return Object.assign({}, this.bucket);
  }

  inRange(pos) {
    const [i, j] = pos;
    const newI = this.inRangeX(i);
    const newJ = this.inRangeY(j);
    return [newI, newJ];
  }

  inRangeX(n) {
    const width = this.dimensions[0];
    if (n < 0) { return 0; }
    if (n > width - 1) { return width - 1; }
    return n;
  }

  inRangeY(n) {
    const height = this.dimensions[1];
    if (n < 0) { return 0; }
    if (n > height - 1) { return height - 1; }
    return n;
  }

  adjacentPositions(pos) {
    const [x, y] = pos;
    const [width, height] = this.dimensions;

    const result = [];
    for (let i = x-1; i <= x+1; i++) {
      if (i < 0 || i > width - 1) { continue; }
      for (let j = y-1; j <= y+1; j++) {
        if (j < 0 || j > height - 1) { continue; }
        result.push([i, j]);
      }
    }

    return result;
  }
}

module.exports = Grid;
