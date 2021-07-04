HeightMap = function () {

  this.width = 5000;
  this.height = 5000;

  Object.defineProperty(HeightMap.prototype, 'width', {
    enumerable: true,
    configurable: true,
  });

  Object.defineProperty(HeightMap.prototype, 'height', {
    enumerable: true,
    configurable: true,
  });
}

// HeightMap.prototype = Object.assign(Object.create(THREE.Group.prototype), {
//   constructor: HeightMap,
// }