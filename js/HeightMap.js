const MAX_HEIGHT = 0.5;

HeightMap = function (width, depth) {
  this.width = width;
  this.depth = depth;

  this.map = [];

  this.heightIterator = 0.05;

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

  update: function ({id, position}) {
    if (this.allowUpdate) {
      var x = Math.floor(position.x + this.width / 2);
      var z = Math.floor(position.z + this.depth / 2);

      x = setPositionInsideHeightMapLimits(x, this.width);
      z = setPositionInsideHeightMapLimits(z, this.depth);
     
      const alreadyUpdated =
        id === this.lastUpdatedId &&
        x === this.lastUpdatedX &&
        z === this.lastUpdatedZ;

      if (!alreadyUpdated) {
        if (this.map[x][z] <= MAX_HEIGHT) {
          this.map[x][z] += this.heightIterator;

          this.lastUpdatedId = id;
          this.lastUpdatedX = x;
          this.lastUpdatedZ = z;
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
