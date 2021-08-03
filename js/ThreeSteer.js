// Ported from Stefan Gustavson's java implementation
// http://staffwww.itn.liu.se/~stegu/simplexnoise/simplexnoise.pdf
// Read Stefan's excellent paper for details on how this code works.
//
// Sean McCullough banksean@gmail.com
//
// Added 4D noise
// Joshua Koo zz85nus@gmail.com 

/**
 * You can pass in a random number generator object if you like.
 * It is assumed to have a random() method.
 */
 var SimplexNoise = function(r) {
	if (r == undefined) r = Math;
  this.grad3 = [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0], 
                                 [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1], 
                                 [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]]; 

  this.grad4 = [[0,1,1,1], [0,1,1,-1], [0,1,-1,1], [0,1,-1,-1],
	     [0,-1,1,1], [0,-1,1,-1], [0,-1,-1,1], [0,-1,-1,-1],
	     [1,0,1,1], [1,0,1,-1], [1,0,-1,1], [1,0,-1,-1],
	     [-1,0,1,1], [-1,0,1,-1], [-1,0,-1,1], [-1,0,-1,-1],
	     [1,1,0,1], [1,1,0,-1], [1,-1,0,1], [1,-1,0,-1],
	     [-1,1,0,1], [-1,1,0,-1], [-1,-1,0,1], [-1,-1,0,-1],
	     [1,1,1,0], [1,1,-1,0], [1,-1,1,0], [1,-1,-1,0],
	     [-1,1,1,0], [-1,1,-1,0], [-1,-1,1,0], [-1,-1,-1,0]];

  this.p = [];
  for (var i=0; i<256; i++) {
	  this.p[i] = Math.floor(r.random()*256);
  }
  // To remove the need for index wrapping, double the permutation table length 
  this.perm = []; 
  for(var i=0; i<512; i++) {
		this.perm[i]=this.p[i & 255];
	} 

  // A lookup table to traverse the simplex around a given point in 4D. 
  // Details can be found where this table is used, in the 4D noise method. 
  this.simplex = [ 
    [0,1,2,3],[0,1,3,2],[0,0,0,0],[0,2,3,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,3,0], 
    [0,2,1,3],[0,0,0,0],[0,3,1,2],[0,3,2,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,3,2,0], 
    [0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0], 
    [1,2,0,3],[0,0,0,0],[1,3,0,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,3,0,1],[2,3,1,0], 
    [1,0,2,3],[1,0,3,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,3,1],[0,0,0,0],[2,1,3,0], 
    [0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0], 
    [2,0,1,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,0,1,2],[3,0,2,1],[0,0,0,0],[3,1,2,0], 
    [2,1,0,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,1,0,2],[0,0,0,0],[3,2,0,1],[3,2,1,0]]; 
};

SimplexNoise.prototype.dot = function(g, x, y) { 
	return g[0]*x + g[1]*y;
};

SimplexNoise.prototype.dot3 = function(g, x, y, z) {
  return g[0]*x + g[1]*y + g[2]*z; 
}

SimplexNoise.prototype.dot4 = function(g, x, y, z, w) {
  return g[0]*x + g[1]*y + g[2]*z + g[3]*w;
};

SimplexNoise.prototype.noise = function(xin, yin) { 
  var n0, n1, n2; // Noise contributions from the three corners 
  // Skew the input space to determine which simplex cell we're in 
  var F2 = 0.5*(Math.sqrt(3.0)-1.0); 
  var s = (xin+yin)*F2; // Hairy factor for 2D 
  var i = Math.floor(xin+s); 
  var j = Math.floor(yin+s); 
  var G2 = (3.0-Math.sqrt(3.0))/6.0; 
  var t = (i+j)*G2; 
  var X0 = i-t; // Unskew the cell origin back to (x,y) space 
  var Y0 = j-t; 
  var x0 = xin-X0; // The x,y distances from the cell origin 
  var y0 = yin-Y0; 
  // For the 2D case, the simplex shape is an equilateral triangle. 
  // Determine which simplex we are in. 
  var i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords 
  if(x0>y0) {i1=1; j1=0;} // lower triangle, XY order: (0,0)->(1,0)->(1,1) 
  else {i1=0; j1=1;}      // upper triangle, YX order: (0,0)->(0,1)->(1,1) 
  // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and 
  // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where 
  // c = (3-sqrt(3))/6 
  var x1 = x0 - i1 + G2; // Offsets for middle corner in (x,y) unskewed coords 
  var y1 = y0 - j1 + G2; 
  var x2 = x0 - 1.0 + 2.0 * G2; // Offsets for last corner in (x,y) unskewed coords 
  var y2 = y0 - 1.0 + 2.0 * G2; 
  // Work out the hashed gradient indices of the three simplex corners 
  var ii = i & 255; 
  var jj = j & 255; 
  var gi0 = this.perm[ii+this.perm[jj]] % 12; 
  var gi1 = this.perm[ii+i1+this.perm[jj+j1]] % 12; 
  var gi2 = this.perm[ii+1+this.perm[jj+1]] % 12; 
  // Calculate the contribution from the three corners 
  var t0 = 0.5 - x0*x0-y0*y0; 
  if(t0<0) n0 = 0.0; 
  else { 
    t0 *= t0; 
    n0 = t0 * t0 * this.dot(this.grad3[gi0], x0, y0);  // (x,y) of grad3 used for 2D gradient 
  } 
  var t1 = 0.5 - x1*x1-y1*y1; 
  if(t1<0) n1 = 0.0; 
  else { 
    t1 *= t1; 
    n1 = t1 * t1 * this.dot(this.grad3[gi1], x1, y1); 
  }
  var t2 = 0.5 - x2*x2-y2*y2; 
  if(t2<0) n2 = 0.0; 
  else { 
    t2 *= t2; 
    n2 = t2 * t2 * this.dot(this.grad3[gi2], x2, y2); 
  } 
  // Add contributions from each corner to get the final noise value. 
  // The result is scaled to return values in the interval [-1,1]. 
  return 70.0 * (n0 + n1 + n2); 
};

// 3D simplex noise 
SimplexNoise.prototype.noise3d = function(xin, yin, zin) { 
  var n0, n1, n2, n3; // Noise contributions from the four corners 
  // Skew the input space to determine which simplex cell we're in 
  var F3 = 1.0/3.0; 
  var s = (xin+yin+zin)*F3; // Very nice and simple skew factor for 3D 
  var i = Math.floor(xin+s); 
  var j = Math.floor(yin+s); 
  var k = Math.floor(zin+s); 
  var G3 = 1.0/6.0; // Very nice and simple unskew factor, too 
  var t = (i+j+k)*G3; 
  var X0 = i-t; // Unskew the cell origin back to (x,y,z) space 
  var Y0 = j-t; 
  var Z0 = k-t; 
  var x0 = xin-X0; // The x,y,z distances from the cell origin 
  var y0 = yin-Y0; 
  var z0 = zin-Z0; 
  // For the 3D case, the simplex shape is a slightly irregular tetrahedron. 
  // Determine which simplex we are in. 
  var i1, j1, k1; // Offsets for second corner of simplex in (i,j,k) coords 
  var i2, j2, k2; // Offsets for third corner of simplex in (i,j,k) coords 
  if(x0>=y0) { 
    if(y0>=z0) 
      { i1=1; j1=0; k1=0; i2=1; j2=1; k2=0; } // X Y Z order 
      else if(x0>=z0) { i1=1; j1=0; k1=0; i2=1; j2=0; k2=1; } // X Z Y order 
      else { i1=0; j1=0; k1=1; i2=1; j2=0; k2=1; } // Z X Y order 
    } 
  else { // x0<y0 
    if(y0<z0) { i1=0; j1=0; k1=1; i2=0; j2=1; k2=1; } // Z Y X order 
    else if(x0<z0) { i1=0; j1=1; k1=0; i2=0; j2=1; k2=1; } // Y Z X order 
    else { i1=0; j1=1; k1=0; i2=1; j2=1; k2=0; } // Y X Z order 
  } 
  // A step of (1,0,0) in (i,j,k) means a step of (1-c,-c,-c) in (x,y,z), 
  // a step of (0,1,0) in (i,j,k) means a step of (-c,1-c,-c) in (x,y,z), and 
  // a step of (0,0,1) in (i,j,k) means a step of (-c,-c,1-c) in (x,y,z), where 
  // c = 1/6.
  var x1 = x0 - i1 + G3; // Offsets for second corner in (x,y,z) coords 
  var y1 = y0 - j1 + G3; 
  var z1 = z0 - k1 + G3; 
  var x2 = x0 - i2 + 2.0*G3; // Offsets for third corner in (x,y,z) coords 
  var y2 = y0 - j2 + 2.0*G3; 
  var z2 = z0 - k2 + 2.0*G3; 
  var x3 = x0 - 1.0 + 3.0*G3; // Offsets for last corner in (x,y,z) coords 
  var y3 = y0 - 1.0 + 3.0*G3; 
  var z3 = z0 - 1.0 + 3.0*G3; 
  // Work out the hashed gradient indices of the four simplex corners 
  var ii = i & 255; 
  var jj = j & 255; 
  var kk = k & 255; 
  var gi0 = this.perm[ii+this.perm[jj+this.perm[kk]]] % 12; 
  var gi1 = this.perm[ii+i1+this.perm[jj+j1+this.perm[kk+k1]]] % 12; 
  var gi2 = this.perm[ii+i2+this.perm[jj+j2+this.perm[kk+k2]]] % 12; 
  var gi3 = this.perm[ii+1+this.perm[jj+1+this.perm[kk+1]]] % 12; 
  // Calculate the contribution from the four corners 
  var t0 = 0.6 - x0*x0 - y0*y0 - z0*z0; 
  if(t0<0) n0 = 0.0; 
  else { 
    t0 *= t0; 
    n0 = t0 * t0 * this.dot3(this.grad3[gi0], x0, y0, z0); 
  }
  var t1 = 0.6 - x1*x1 - y1*y1 - z1*z1; 
  if(t1<0) n1 = 0.0; 
  else { 
    t1 *= t1; 
    n1 = t1 * t1 * this.dot3(this.grad3[gi1], x1, y1, z1); 
  } 
  var t2 = 0.6 - x2*x2 - y2*y2 - z2*z2; 
  if(t2<0) n2 = 0.0; 
  else { 
    t2 *= t2; 
    n2 = t2 * t2 * this.dot3(this.grad3[gi2], x2, y2, z2); 
  } 
  var t3 = 0.6 - x3*x3 - y3*y3 - z3*z3; 
  if(t3<0) n3 = 0.0; 
  else { 
    t3 *= t3; 
    n3 = t3 * t3 * this.dot3(this.grad3[gi3], x3, y3, z3); 
  } 
  // Add contributions from each corner to get the final noise value. 
  // The result is scaled to stay just inside [-1,1] 
  return 32.0*(n0 + n1 + n2 + n3); 
};

// 4D simplex noise
SimplexNoise.prototype.noise4d = function( x, y, z, w ) {
	// For faster and easier lookups
	var grad4 = this.grad4;
	var simplex = this.simplex;
	var perm = this.perm;
	
   // The skewing and unskewing factors are hairy again for the 4D case
   var F4 = (Math.sqrt(5.0)-1.0)/4.0;
   var G4 = (5.0-Math.sqrt(5.0))/20.0;
   var n0, n1, n2, n3, n4; // Noise contributions from the five corners
   // Skew the (x,y,z,w) space to determine which cell of 24 simplices we're in
   var s = (x + y + z + w) * F4; // Factor for 4D skewing
   var i = Math.floor(x + s);
   var j = Math.floor(y + s);
   var k = Math.floor(z + s);
   var l = Math.floor(w + s);
   var t = (i + j + k + l) * G4; // Factor for 4D unskewing
   var X0 = i - t; // Unskew the cell origin back to (x,y,z,w) space
   var Y0 = j - t;
   var Z0 = k - t;
   var W0 = l - t;
   var x0 = x - X0;  // The x,y,z,w distances from the cell origin
   var y0 = y - Y0;
   var z0 = z - Z0;
   var w0 = w - W0;

   // For the 4D case, the simplex is a 4D shape I won't even try to describe.
   // To find out which of the 24 possible simplices we're in, we need to
   // determine the magnitude ordering of x0, y0, z0 and w0.
   // The method below is a good way of finding the ordering of x,y,z,w and
   // then find the correct traversal order for the simplex we’re in.
   // First, six pair-wise comparisons are performed between each possible pair
   // of the four coordinates, and the results are used to add up binary bits
   // for an integer index.
   var c1 = (x0 > y0) ? 32 : 0;
   var c2 = (x0 > z0) ? 16 : 0;
   var c3 = (y0 > z0) ? 8 : 0;
   var c4 = (x0 > w0) ? 4 : 0;
   var c5 = (y0 > w0) ? 2 : 0;
   var c6 = (z0 > w0) ? 1 : 0;
   var c = c1 + c2 + c3 + c4 + c5 + c6;
   var i1, j1, k1, l1; // The integer offsets for the second simplex corner
   var i2, j2, k2, l2; // The integer offsets for the third simplex corner
   var i3, j3, k3, l3; // The integer offsets for the fourth simplex corner
   // simplex[c] is a 4-vector with the numbers 0, 1, 2 and 3 in some order.
   // Many values of c will never occur, since e.g. x>y>z>w makes x<z, y<w and x<w
   // impossible. Only the 24 indices which have non-zero entries make any sense.
   // We use a thresholding to set the coordinates in turn from the largest magnitude.
   // The number 3 in the "simplex" array is at the position of the largest coordinate.
   i1 = simplex[c][0]>=3 ? 1 : 0;
   j1 = simplex[c][1]>=3 ? 1 : 0;
   k1 = simplex[c][2]>=3 ? 1 : 0;
   l1 = simplex[c][3]>=3 ? 1 : 0;
   // The number 2 in the "simplex" array is at the second largest coordinate.
   i2 = simplex[c][0]>=2 ? 1 : 0;
   j2 = simplex[c][1]>=2 ? 1 : 0;    k2 = simplex[c][2]>=2 ? 1 : 0;
   l2 = simplex[c][3]>=2 ? 1 : 0;
   // The number 1 in the "simplex" array is at the second smallest coordinate.
   i3 = simplex[c][0]>=1 ? 1 : 0;
   j3 = simplex[c][1]>=1 ? 1 : 0;
   k3 = simplex[c][2]>=1 ? 1 : 0;
   l3 = simplex[c][3]>=1 ? 1 : 0;
   // The fifth corner has all coordinate offsets = 1, so no need to look that up.
   var x1 = x0 - i1 + G4; // Offsets for second corner in (x,y,z,w) coords
   var y1 = y0 - j1 + G4;
   var z1 = z0 - k1 + G4;
   var w1 = w0 - l1 + G4;
   var x2 = x0 - i2 + 2.0*G4; // Offsets for third corner in (x,y,z,w) coords
   var y2 = y0 - j2 + 2.0*G4;
   var z2 = z0 - k2 + 2.0*G4;
   var w2 = w0 - l2 + 2.0*G4;
   var x3 = x0 - i3 + 3.0*G4; // Offsets for fourth corner in (x,y,z,w) coords
   var y3 = y0 - j3 + 3.0*G4;
   var z3 = z0 - k3 + 3.0*G4;
   var w3 = w0 - l3 + 3.0*G4;
   var x4 = x0 - 1.0 + 4.0*G4; // Offsets for last corner in (x,y,z,w) coords
   var y4 = y0 - 1.0 + 4.0*G4;
   var z4 = z0 - 1.0 + 4.0*G4;
   var w4 = w0 - 1.0 + 4.0*G4;
   // Work out the hashed gradient indices of the five simplex corners
   var ii = i & 255;
   var jj = j & 255;
   var kk = k & 255;
   var ll = l & 255;
   var gi0 = perm[ii+perm[jj+perm[kk+perm[ll]]]] % 32;
   var gi1 = perm[ii+i1+perm[jj+j1+perm[kk+k1+perm[ll+l1]]]] % 32;
   var gi2 = perm[ii+i2+perm[jj+j2+perm[kk+k2+perm[ll+l2]]]] % 32;
   var gi3 = perm[ii+i3+perm[jj+j3+perm[kk+k3+perm[ll+l3]]]] % 32;
   var gi4 = perm[ii+1+perm[jj+1+perm[kk+1+perm[ll+1]]]] % 32;
   // Calculate the contribution from the five corners
   var t0 = 0.6 - x0*x0 - y0*y0 - z0*z0 - w0*w0;
   if(t0<0) n0 = 0.0;
   else {
     t0 *= t0;
     n0 = t0 * t0 * this.dot4(grad4[gi0], x0, y0, z0, w0);
   }
  var t1 = 0.6 - x1*x1 - y1*y1 - z1*z1 - w1*w1;
   if(t1<0) n1 = 0.0;
   else {
     t1 *= t1;
     n1 = t1 * t1 * this.dot4(grad4[gi1], x1, y1, z1, w1);
   }
  var t2 = 0.6 - x2*x2 - y2*y2 - z2*z2 - w2*w2;
   if(t2<0) n2 = 0.0;
   else {
     t2 *= t2;
     n2 = t2 * t2 * this.dot4(grad4[gi2], x2, y2, z2, w2);
   }   var t3 = 0.6 - x3*x3 - y3*y3 - z3*z3 - w3*w3;
   if(t3<0) n3 = 0.0;
   else {
     t3 *= t3;
     n3 = t3 * t3 * this.dot4(grad4[gi3], x3, y3, z3, w3);
   }
  var t4 = 0.6 - x4*x4 - y4*y4 - z4*z4 - w4*w4;
   if(t4<0) n4 = 0.0;
   else {
     t4 *= t4;
     n4 = t4 * t4 * this.dot4(grad4[gi4], x4, y4, z4, w4);
   }
   // Sum up and scale the result to cover the range [-1,1]
   return 27.0 * (n0 + n1 + n2 + n3 + n4);
};


Entity = function (id, mesh) {
  THREE.Group.apply(this);

  this.id = id;

  this.mesh = mesh;
  this.mass = 1;
  this.maxSpeed = 10;

  this.position = new THREE.Vector3(0, 0, 0);
  this.velocity = new THREE.Vector3(0, 0, 0);

  this.box = new THREE.Box3().setFromObject(mesh);
  this.raycaster = new THREE.Raycaster();

  this.velocitySamples = [];
  this.numSamplesForSmoothing = 20;

  Object.defineProperty(Entity.prototype, "width", {
    enumerable: true,
    configurable: true,
    get: function () {
      return this.box.max.x - this.box.min.x;
    },
  });

  Object.defineProperty(Entity.prototype, "height", {
    enumerable: true,
    configurable: true,
    get: function () {
      return this.box.max.y - this.box.min.y;
    },
  });

  Object.defineProperty(Entity.prototype, "depth", {
    enumerable: true,
    configurable: true,
    get: function () {
      return this.box.max.z - this.box.min.z;
    },
  });

  Object.defineProperty(Entity.prototype, "forward", {
    enumerable: true,
    configurable: true,
    get: function () {
      return new THREE.Vector3(0, 0, -1)
        .applyQuaternion(this.quaternion)
        .negate();
    },
  });

  Object.defineProperty(Entity.prototype, "backward", {
    enumerable: true,
    configurable: true,
    get: function () {
      return this.forward.clone().negate();
    },
  });

  Object.defineProperty(Entity.prototype, "left", {
    enumerable: true,
    configurable: true,
    get: function () {
      return this.forward
        .clone()
        .applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI * 0.5);
    },
  });

  Object.defineProperty(Entity.prototype, "right", {
    enumerable: true,
    configurable: true,
    get: function () {
      return this.left.clone().negate();
    },
  });

  this.add(this.mesh);

  this.radius = 200; //temp
};

Entity.prototype = Object.assign(Object.create(THREE.Group.prototype), {
  constructor: Entity,

  update: function () {
    this.velocity.clampLength(0, this.maxSpeed);
    this.velocity.setY(0);
    this.position.add(this.velocity);
  },

  bounce: function (box) {
    if (this.position.x > box.max.x) {
      this.position.setX(box.max.x);
      this.velocity.angle = this.velocity.angle + 0.1;
    }

    if (this.position.x < box.min.x) {
      this.position.setX(box.min.x);
      this.velocity.angle = this.velocity.angle + 0.1;
    }

    if (this.position.z > box.max.z) {
      this.position.setZ(box.max.z);
      this.velocity.angle = this.velocity.angle + 0.1;
    }
    if (this.position.z < box.min.z) {
      this.position.setZ(box.min.z);
      this.velocity.angle = this.velocity.angle + 0.1;
    }

    if (this.position.y > box.max.y) {
      this.position.setY(box.max.y);
    }

    if (this.position.y < box.min.y) {
      this.position.setY(-box.min.y);
    }
  },

  wrap: function (box) {
    if (this.position.x > box.max.x) {
      this.position.setX(box.min.x + 1);
    } else if (this.position.x < box.min.x) {
      this.position.setX(box.max.x - 1);
    }

    if (this.position.z > box.max.z) {
      this.position.setZ(box.min.z + 1);
    } else if (this.position.z < box.min.z) {
      this.position.setZ(box.max.z - 1);
    }

    if (this.position.y > box.max.y) {
      this.position.setY(box.min.y + 1);
    } else if (this.position.y < box.min.y) {
      this.position.setY(box.max.y + 1);
    }
  },

  lookWhereGoing: function (smoothing) {
    var direction = this.position
      .clone()
      .add(this.velocity)
      .setY(this.position.y);
    if (smoothing) {
      if (this.velocitySamples.length == this.numSamplesForSmoothing) {
        this.velocitySamples.shift();
      }

      this.velocitySamples.push(this.velocity.clone().setY(this.position.y));
      direction.set(0, 0, 0);
      for (var v = 0; v < this.velocitySamples.length; v++) {
        direction.add(this.velocitySamples[v]);
      }
      direction.divideScalar(this.velocitySamples.length);
      direction = this.position.clone().add(direction).setY(this.position.y);
    }
    this.lookAt(direction);
  },

  getPosition: function () {
    return {
      x: Math.floor(this.position.x),
      y: Math.floor(this.position.y),
      z: Math.floor(this.position.z),
    };
  },

  showPosition: function () {
    console.log(this.getPosition());
  },
});

SteeringEntity = function (id, mesh) {
  this.id = id;

  Entity.call(this, this.id, mesh);

  this.maxForce = 5;
  this.arrivalThreshold = 400;

  this.wanderAngle = 0;
  this.wanderDistance = 10;
  this.wanderRadius = 5;
  this.wanderRange = 1;

  this.avoidDistance = 400;
  this.avoidBuffer = 20; //NOT USED

  this.inSightDistance = 200;
  this.tooCloseDistance = 60;

  this.pathIndex = 0;

  this.steeringForce = new THREE.Vector3(0, 0, 0);
};

SteeringEntity.prototype = Object.assign(Object.create(Entity.prototype), {
  constructor: SteeringEntity,

  seek: function (position) {
    var desiredVelocity = position.clone().sub(this.position);
    desiredVelocity.normalize().setLength(this.maxSpeed).sub(this.velocity);
    this.steeringForce.add(desiredVelocity);
  },

  flee: function (position) {
    var desiredVelocity = position.clone().sub(this.position);
    desiredVelocity.normalize().setLength(this.maxSpeed).sub(this.velocity);
    this.steeringForce.sub(desiredVelocity);
  },

  arrive: function (position) {
    var desiredVelocity = position.clone().sub(this.position);
    desiredVelocity.normalize();
    var distance = this.position.distanceTo(position);
    if (distance > this.arrivalThreshold)
      desiredVelocity.setLength(this.maxSpeed);
    else
      desiredVelocity.setLength(
        (this.maxSpeed * distance) / this.arrivalThreshold
      );
    desiredVelocity.sub(this.velocity);
    this.steeringForce.add(desiredVelocity);
  },

  pursue: function (target) {
    var lookAheadTime =
      this.position.distanceTo(target.position) / this.maxSpeed;
    var predictedTarget = target.position
      .clone()
      .add(target.velocity.clone().setLength(lookAheadTime));
    this.seek(predictedTarget);
  },

  evade: function (target) {
    var lookAheadTime =
      this.position.distanceTo(target.position) / this.maxSpeed;
    var predictedTarget = target.position
      .clone()
      .sub(target.velocity.clone().setLength(lookAheadTime));
    this.flee(predictedTarget);
  },

  idle: function () {
    this.velocity.setLength(0);
    this.steeringForce.set(0, 0, 0);
  },

  wander: function () {
    var center = this.velocity
      .clone()
      .normalize()
      .setLength(this.wanderDistance);
    var offset = new THREE.Vector3(1, 1, 1);
    offset.setLength(this.wanderRadius);
    offset.x = Math.sin(this.wanderAngle) * offset.length();
    offset.z = Math.cos(this.wanderAngle) * offset.length();
    offset.y = Math.sin(this.wanderAngle) * offset.length();

    this.wanderAngle +=
      Math.random() * this.wanderRange - this.wanderRange * 0.5;
    center.add(offset);
    center.setY(0);
    this.steeringForce.add(center);
  },

  interpose: function (targetA, targetB) {
    var midPoint = targetA.position
      .clone()
      .add(targetB.position.clone())
      .divideScalar(2);
    var timeToMidPoint = this.position.distanceTo(midPoint) / this.maxSpeed;
    var pointA = targetA.position
      .clone()
      .add(targetA.velocity.clone().multiplyScalar(timeToMidPoint));
    var pointB = targetB.position
      .clone()
      .add(targetB.velocity.clone().multiplyScalar(timeToMidPoint));
    midPoint = pointA.add(pointB).divideScalar(2);
    this.seek(midPoint);
  },

  separation: function (entities, separationRadius = 300, maxSeparation = 100) {
    var force = new THREE.Vector3(0, 0, 0);
    var neighborCount = 0;

    for (var i = 0; i < entities.length; i++) {
      if (
        entities[i] != this &&
        entities[i].position.distanceTo(this.position) <= separationRadius
      ) {
        force.add(entities[i].position.clone().sub(this.position));
        neighborCount++;
      }
    }
    if (neighborCount != 0) {
      force.divideScalar(neighborCount);
      force.negate();
    }
    force.normalize();
    force.multiplyScalar(maxSeparation);
    this.steeringForce.add(force);
  },

  isOnLeaderSight: function (leader, ahead, leaderSightRadius) {
    return (
      ahead.distanceTo(this.position) <= leaderSightRadius ||
      leader.position.distanceTo(this.position) <= leaderSightRadius
    );
  },

  followLeader: function (
    leader,
    entities,
    distance = 400,
    separationRadius = 300,
    maxSeparation = 100,
    leaderSightRadius = 1600,
    arrivalThreshold = 200
  ) {
    var tv = leader.velocity.clone();
    tv.normalize().multiplyScalar(distance);
    var ahead = leader.position.clone().add(tv);
    tv.negate();
    var behind = leader.position.clone().add(tv);

    if (this.isOnLeaderSight(leader, ahead, leaderSightRadius)) {
      this.evade(leader);
    }
    this.arrivalThreshold = arrivalThreshold;
    this.arrive(behind);
    this.separation(entities, separationRadius, maxSeparation);
  },

  getNeighborAhead: function (entities) {
    var maxQueueAhead = 500;
    var maxQueueRadius = 500;
    var res;
    var qa = this.velocity.clone().normalize().multiplyScalar(maxQueueAhead);
    var ahead = this.position.clone().add(qa);

    for (var i = 0; i < entities.length; i++) {
      var distance = ahead.distanceTo(entities[i].position);
      if (entities[i] != this && distance <= maxQueueRadius) {
        res = entities[i];
        break;
      }
    }
    return res;
  },

  queue: function (entities, maxQueueRadius = 500) {
    var neighbor = this.getNeighborAhead(entities);
    var brake = new THREE.Vector3(0, 0, 0);
    var v = this.velocity.clone();
    if (neighbor != null) {
      brake = this.steeringForce.clone().negate().multiplyScalar(0.8);
      v.negate().normalize();
      brake.add(v);
      if (this.position.distanceTo(neighbor.position) <= maxQueueRadius) {
        this.velocity.multiplyScalar(0.3);
      }
    }

    this.steeringForce.add(brake);
  },

  inSight: function (entity) {
    if (this.position.distanceTo(entity.position) > this.inSightDistance)
      return false;
    var heading = this.velocity.clone().normalize();
    var difference = entity.position.clone().sub(this.position);
    var dot = difference.dot(heading);
    if (dot < 0) return false;
    return true;
  },

  flock: function (entities) {
    var averageVelocity = this.velocity.clone();
    var averagePosition = new THREE.Vector3(0, 0, 0);
    var inSightCount = 0;
    for (var i = 0; i < entities.length; i++) {
      if (entities[i] != this && this.inSight(entities[i])) {
        averageVelocity.add(entities[i].velocity);
        averagePosition.add(entities[i].position);
        if (
          this.position.distanceTo(entities[i].position) < this.tooCloseDistance
        ) {
          this.flee(entities[i].position);
        }
        inSightCount++;
      }
    }
    if (inSightCount > 0) {
      averageVelocity.divideScalar(inSightCount);
      averagePosition.divideScalar(inSightCount);
      this.seek(averagePosition);
      this.steeringForce.add(averageVelocity.sub(this.velocity));
    }
  },

  followPath: function (path, loop, thresholdRadius = 1) {
    var wayPoint = path[this.pathIndex];
    if (wayPoint == null) return;
    if (this.position.distanceTo(wayPoint) < thresholdRadius) {
      if (this.pathIndex >= path.length - 1) {
        if (loop) this.pathIndex = 0;
      } else {
        this.pathIndex++;
      }
    }
    if (this.pathIndex >= path.length - 1 && !loop) this.arrive(wayPoint);
    else this.seek(wayPoint);
  },

  avoid: function (obstacles) {
    var dynamic_length = this.velocity.length() / this.maxSpeed;
    var ahead = this.position
      .clone()
      .add(this.velocity.clone().normalize().multiplyScalar(dynamic_length));
    var ahead2 = this.position.clone().add(
      this.velocity
        .clone()
        .normalize()
        .multiplyScalar(this.avoidDistance * 0.5)
    );
    //get most threatening
    var mostThreatening = null;
    for (var i = 0; i < obstacles.length; i++) {
      if (obstacles[i] === this) continue;
      var collision =
        obstacles[i].position.distanceTo(ahead) <= obstacles[i].radius ||
        obstacles[i].position.distanceTo(ahead2) <= obstacles[i].radius;
      if (
        collision &&
        (mostThreatening == null ||
          this.position.distanceTo(obstacles[i].position) <
            this.position.distanceTo(mostThreatening.position))
      ) {
        mostThreatening = obstacles[i];
      }
    }
    //end
    var avoidance = new THREE.Vector3(0, 0, 0);
    if (mostThreatening != null) {
      avoidance = ahead
        .clone()
        .sub(mostThreatening.position)
        .normalize()
        .multiplyScalar(100);
    }
    this.steeringForce.add(avoidance);
  },

  update: function () {
    this.steeringForce.clampLength(0, this.maxForce);
    this.steeringForce.divideScalar(this.mass);
    this.velocity.add(this.steeringForce);
    this.steeringForce.set(0, 0, 0);
    Entity.prototype.update.call(this);
  },
});

/**
 * Returns a random number between min (inclusive) and max (exclusive)
 */
Math.getRandomArbitrary = function (min, max) {
  return Math.random() * (max - min) + min;
};

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
Math.getRandomInt = function (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

THREE.Vector3.prototype.perp = function () {
  return new THREE.Vector3(-this.z, 0, this.x);
};

THREE.Vector3.prototype.sign = function (vector) {
  return this.perp().dot(vector) < 0 ? -1 : 1;
};

Object.defineProperty(THREE.Vector3.prototype, "angle", {
  enumerable: true,
  configurable: true,
  get: function () {
    return Math.atan2(this.z, this.x);
  },

  set: function (value) {
    this.x = Math.cos(value) * this.length();
    this.z = Math.sin(value) * this.length();
  },
});
