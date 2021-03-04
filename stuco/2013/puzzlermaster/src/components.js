
// The Grid component allows an element to be located
//  on a grid of tiles
Crafty.c('Grid', {
  init: function() {
    this.attr({
      w: Game.map_grid.tile.width,
      h: Game.map_grid.tile.height
    })
  },

  // Locate this entity at the given position on the grid
  at: function(x, y) {
    if (x === undefined && y === undefined) {
      return { x: this.x/Game.map_grid.tile.width, y: this.y/Game.map_grid.tile.height }
    } else {
      this.attr({ x: x * Game.map_grid.tile.width, y: y * Game.map_grid.tile.height });
      return this;
    }
  }
});

// An "Actor" is an entity that is drawn in 2D on canvas
//  via our logical coordinate grid
Crafty.c('Actor', {
  init: function() {
    this.requires('2D, Canvas, Grid');
  },
});

Crafty.c('GameOver', {
  init: function() {
    this.requires('2D, Canvas, Solid, Color')
      .color('black');
  },

    visit: function() {
      this.destroy();
      Crafty.audio.play('knock');
      Crafty.trigger('EndGame', this);
  }
});

  Crafty.c('Platform', {
  init: function() {
    this.requires('2D, Canvas, Solid, Color')
      .color('black');
  },
});

// A door is a tile on the grid that the PC must visit in order to win the game
Crafty.c('Door', {
  init: function() {
    this.requires('Actor, spr_door');
  },

    visit: function() {
      this.destroy();
      Crafty.audio.play('knock');
      Crafty.trigger('DoorVisited', this);
    }
  });

// This is the player-controlled character
Crafty.c('PlayerCharacter', {
  init: function() {
    this.requires('Actor, Fourway, Collision, spr_player, Gravity, SpriteAnimation')
      .fourway(4)
      .gravity('Platform')
      .gravityConst(.25)
      .collision()
      .stopOnSolids()
      .onHit('Door',this.visitDoor)
      .onHit('GameOver',this.endGame)
      .animate('PlayerMovingUp',    0, 0, 3)
      .animate('PlayerMovingRight', 0, 3, 3)
      .animate('PlayerMovingDown',  0, 2, 3)
      .animate('PlayerMovingLeft',  0, 1, 3);
  
    var animation_speed = 8;

    this.bind('NewDirection', function(data) {
        if (data.x > 0) {
          this.animate('PlayerMovingRight', animation_speed, -1);
        } else if (data.x < 0) {
          this.animate('PlayerMovingLeft', animation_speed, -1);
        } else if (data.y > 0) {
          this.animate('PlayerMovingDown', animation_speed, -1);
        } else if (data.y < 0) {
          this.animate('PlayerMovingUp', animation_speed, -1);
        } 
          else {
          this.stop();
        }
      });
  },

  // Registers a stop-movement function to be called when
  //  this entity hits an entity with the "Solid" component
  stopOnSolids: function() {
    this.onHit('Solid', this.stopMovement);
    return this;
  },

  // Stops the movement
  stopMovement: function() {
    this._speed = 0;
    if (this._movement) {
      this.x -= this._movement.x;
      this.y -= this._movement.y;
    }
  },

  endGame: function(data) {
    endGame = data[0].obj;
    endGame.visit();
  },

  visitDoor: function(data) {
    door = data[0].obj;
    door.visit();
  }
});
