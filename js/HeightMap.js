const MAX_HEIGHT = 0.7;
const MIN_HEIGHT = -0.7;

HeightMap = function (width, depth) {
  this.width = width;
  this.depth = depth;
  this.map = [];

  this.heightIterator = 0.05;

  this.allowUpdate = true;

  Object.defineProperty(HeightMap.prototype, "map", {
    enumerable: true,
    configurable: true,
  });

  Object.defineProperty(HeightMap.prototype, "heightIterator", {
    enumerable: true,
    configurable: true,
  });
};

HeightMap.prototype = Object.assign(Object.create(THREE.Group.prototype), {
  constructor: HeightMap,

  update: function ({ position, lastUpdatedPosition }) {
    if (this.allowUpdate) {
      var x = Math.floor(position.x + this.width / 2);
      var z = Math.floor(position.z + this.depth / 2);

      x = setPositionInsideHeightMapLimits(x, this.width);
      z = setPositionInsideHeightMapLimits(z, this.depth);

      const alreadyUpdated =
        x === lastUpdatedPosition.x && z === lastUpdatedPosition.z;

      if (!alreadyUpdated) {
        if (
          this.map[x][z] <= MAX_HEIGHT &&
          this.map[x][z] >= MIN_HEIGHT
        ) {
          this.map[x][z] += this.heightIterator;

          lastUpdatedPosition.x = x;
          lastUpdatedPosition.z = z;
        }
      }
    }
  },

  constructMap: function () {
    this.map = THREEx.Terrain.allocateHeightMap(this.width + 1, this.depth + 1);
  },

  showMap: function () {
    console.log(this.map);
  },

  denyUpdate: function () {
    this.allowUpdate = false;
  },

  allowUpdate: function () {
    this.allowUpdate = true;
  },
});
