const MAX_HEIGHT = 200;

HeightMap = function (width, depth) {
  this.width = width;
  this.depth = depth;

  this.map = [];

  this.heightIterator = 0.5;

  this.lastUpdatedX = null;
  this.lastUpdatedZ = null;
  this.lastUpdatedId = null;

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

  update: function (id, x, z) {
    if (this.allowUpdate) {
      var intX = Math.floor(x + (this.width / 2));
      var intZ = Math.floor(z + (this.depth / 2));

      const alreadyUpdated =
        id === this.lastUpdatedId &&
        intX === this.lastUpdatedX &&
        intZ === this.lastUpdatedZ;

      if (!alreadyUpdated) {
        if (this.map[intX][intZ] <= MAX_HEIGHT) {
          this.map[intX][intZ] += this.heightIterator;

          this.lastUpdatedId = id;
          this.lastUpdatedX = intX;
          this.lastUpdatedZ = intZ;
        }

        // console.log(this.lastUpdatedId, this.lastUpdatedX, this.lastUpdatedZ, this.map[intX][intZ]);
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
