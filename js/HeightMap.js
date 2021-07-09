HeightMap = function (width, height) {

  this.width = width;
  this.height = height;

  this.map = [];

  this.lastUpdatedX = null;
  this.lastUpdatedZ = null;
  this.lastUpdatedId = null;

  Object.defineProperty(HeightMap.prototype, 'map', {
    enumerable: true,
    configurable: true,
  })
};

HeightMap.prototype = Object.assign(Object.create(THREE.Group.prototype), {
  constructor: HeightMap,

  update: function (id, x, z) {
    var intX = Math.floor(x + (this.width / 2));
    var intZ = Math.floor(z + (this.height / 2));

    const alreadyUpdated = id === this.lastUpdatedId && intX === this.lastUpdatedX && intZ === this.lastUpdatedZ;

    if(!alreadyUpdated){
      this.map[intX][intZ] += 1;

      this.lastUpdatedId = id;
      this.lastUpdatedX = intX;
      this.lastUpdatedZ = intZ;

      console.log(this.lastUpdatedId, this.lastUpdatedX, this.lastUpdatedZ, this.map[intX][intZ]);

    }
  },

  constructMap: function () {
    var map = [];

    for (var i = 0; i < this.height; i++) {
      map[i] = new Array(this.width).fill(0);
    }

    this.map = map;
  },

  showMap: function () {
    console.log(this.map);
  }

});

