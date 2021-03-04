function Padd(p1, p2) {
  return new paper.Point(p1.x + p2.x, p1.y + p2.y);
}

function Psub(p1, p2) {
  return new paper.Point(p1.x - p2.x, p1.y - p2.y);
}

function Pmul(p1, m) {
  return new paper.Point(p1.x * m, p1.y * m);
}

function Pdiv(p1, m) {
  return new paper.Point(p1.x / m, p1.y / m);
}

function Pdistsq(p1, p2) {
  var xd = p1.x - p2.x;
  var yd = p1.y - p2.y;
  return xd * xd + yd * yd;
}

function Pabs(p) {
  return Math.sqrt(p.x * p.x + p.y * p.y);
}

function Pnorm(p) {
  if (Pabs(p) < 0.001) {
    return new paper.Point(0, 0);
  } else {
    return Pdiv(p, Pabs(p));
  }
}

function Pscale(p, n) {
  return Pmul(Pnorm(p), n);
}

// Boids prototype
function Boid(position, velocity, maxspeed, type) {
  // type 0 = player, 1 = boid, 2 = hunter, 3 = dead, 4 = eating; 5 = super;
  this.type = type;

  // position, velocity is Paperjs Point
  this.position = position;
  this.velocity = velocity;

  // maxspeed = max dampen constant (basically max speed)
  this.maxspeed = maxspeed;

  // Paperjs raster
  this.rasters = null
  this.raster = null;
  this.draw = function(time) {
    // Update path in this function
    if (this.rasters === null) {
      /*this.path = new paper.Path.Circle(
          this.position,
          10);
      switch (this.type) {
        case 0:
          this.path.strokeColor = 'black';
          break;
        case 1:
          this.path.strokeColor = 'green';
          break;
        case 2:
          this.path.strokeColor = 'red';
          break;
        case 3:
          this.path.strokeColor = 'purple';
          break;
        case 4:
          this.path.strokeColor = 'orange';
          break;*/
      switch (this.type) {
        case 0:
          this.rasters = {
            up: [new paper.Raster('pacman/rghostup1.png'),
                 new paper.Raster('pacman/rghostup2.png')],
            down: [new paper.Raster('pacman/rghostdown1.png'),
                   new paper.Raster('pacman/rghostdown2.png')],
            left: [new paper.Raster('pacman/rghostleft1.png'),
                   new paper.Raster('pacman/rghostleft2.png')],
            right: [new paper.Raster('pacman/rghostright1.png'),
                    new paper.Raster('pacman/rghostright2.png')],
          }
          break;
        case 1:
          switch(Math.floor(Math.random() * 3)) {
            case 0:
              this.rasters = {
                up: [new paper.Raster('pacman/bghostup1.png'),
                     new paper.Raster('pacman/bghostup2.png')],
                down: [new paper.Raster('pacman/bghostdown1.png'),
                       new paper.Raster('pacman/bghostdown2.png')],
                left: [new paper.Raster('pacman/bghostleft1.png'),
                       new paper.Raster('pacman/bghostleft2.png')],
                right: [new paper.Raster('pacman/bghostright1.png'),
                        new paper.Raster('pacman/bghostright2.png')],
              }
              break;
            case 1:
              this.rasters = {
                up: [new paper.Raster('pacman/pghostup1.png'),
                     new paper.Raster('pacman/pghostup2.png')],
                down: [new paper.Raster('pacman/pghostdown1.png'),
                       new paper.Raster('pacman/pghostdown2.png')],
                left: [new paper.Raster('pacman/pghostleft1.png'),
                       new paper.Raster('pacman/pghostleft2.png')],
                right: [new paper.Raster('pacman/pghostright1.png'),
                        new paper.Raster('pacman/pghostright2.png')],
              }
              break;
            case 2:
              this.rasters = {
                up: [new paper.Raster('pacman/yghostup1.png'),
                     new paper.Raster('pacman/yghostup2.png')],
                down: [new paper.Raster('pacman/yghostdown1.png'),
                       new paper.Raster('pacman/yghostdown2.png')],
                left: [new paper.Raster('pacman/yghostleft1.png'),
                       new paper.Raster('pacman/yghostleft2.png')],
                right: [new paper.Raster('pacman/yghostright1.png'),
                        new paper.Raster('pacman/yghostright2.png')],
              }
              break;
          }
          break;
        case 2:
          this.rasters = {
            up: [new paper.Raster('pacman/pac1.png'),
                 new paper.Raster('pacman/pac2.png'),
                 new paper.Raster('pacman/pac3.png'),
                 new paper.Raster('pacman/pac2.png'),
                 new paper.Raster('pacman/pac1.png')]
          }
          break;
        case 3:
          this.rasters = {
            up: [new paper.Raster('pacman/deadghost1.png'),
                 new paper.Raster('pacman/deadghost2.png')]
          }
          break;
        case 4:
          this.rasters = {
            up: [new paper.Raster('pacman/pac1.png'),
                 new paper.Raster('pacman/pac2.png'),
                 new paper.Raster('pacman/pac3.png'),
                 new paper.Raster('pacman/pac2.png'),
                 new paper.Raster('pacman/pac1.png')]
          }
          break;
        case 5:
          this.rasters = {
            up: [new paper.Raster('pacman/whiteghost1.png'),
                 new paper.Raster('pacman/whiteghost2.png')]
          }
          this.rasters.up[0].scale(0.5);
          this.rasters.up[1].scale(0.5);
          break;
      }

      var keys = Object.keys(this.rasters);
      for (var i = 0; i < keys.length; i++) {
        var dirRasters = this.rasters[keys[i]];

        for (var j = 0; j < dirRasters.length; j++) {
          dirRasters[j].visible = false;
        }
      }

      this.raster = this.rasters.up[0];
    }

    this.raster.visible = false;
    var angle = Math.atan2(-this.velocity.y, this.velocity.x) * 180 / Math.PI;

    switch(this.type) {
      case 0:
      case 1:
        if (Pabs(this.velocity) > 0.01) {
          var frame = Math.floor(time / 10) % 2;
          var octant = angle / 45;
          if ((-3 <= octant) && (octant < -1)) {
            this.raster = this.rasters.down[frame];
          }
          else if ((-1 <= octant) && (octant < 1)) {
            this.raster = this.rasters.right[frame];
          }
          else if ((1 <= octant) && (octant < 3)) {
            this.raster = this.rasters.up[frame];
          }
          else {
            this.raster = this.rasters.left[frame];
          }
        }
        break;
      case 2:
      case 4:
        var frame = Math.floor(time / 3) % 5;
        this.raster = this.rasters.up[frame];
        this.raster.rotation = 0;
        this.raster.rotate(-angle + 90);
        break;
      case 3:
        this.raster = this.rasters.up[0];
        break;
      case 5:
        if (Pabs(this.velocity) > 0.01) {
          var frame = Math.floor(time / 10) % 2;
          this.raster = this.rasters.up[frame];
        }
        break;
    }

    this.raster.visible = true;
    this.raster.position = this.position;
  }

  this.removeRasters = function () {
    var keys = Object.keys(this.rasters);
    for (var i = 0; i < keys.length; i++) {
      var dirRasters = this.rasters[keys[i]];

      for (var j = 0; j < dirRasters.length; j++) {
        dirRasters[j].remove();
      }
    }
  }
}
