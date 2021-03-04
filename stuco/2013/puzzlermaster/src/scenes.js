// Game scene
// -------------
// Runs the core gameplay loop
//
// TODO
// Fix sprite running through wall glitch
// Invisible Sprite on start

Crafty.scene('Game3', function() {
  Crafty.e('2D, DOM, Text')
    .attr({ x: 0, y: 0 })
    .text('Level 3');

  Crafty.e('Platform').attr({x:40,y:250,w:20,h:3});
  Crafty.e('Platform').attr({x:200,y:250,w:20,h:3});
  this.player = Crafty.e('PlayerCharacter').at(1, 4);

  // Upper
  Crafty.e('Platform').attr({x:0,y:0,w:1085,h:1});
  // Lower
  Crafty.e('GameOver').attr({x:0,y:287,w:1085,h:1});
  // Left
  Crafty.e('Platform').attr({x:0,y:0,w:1,h:288});
  // Right
  Crafty.e('Platform').attr({x:1084,y:0,w:1,h:288});

  Crafty.e('Door').at(30, 10);
  this.unbind('DoorVisited', this.show_victory);
  this.unbind('EndGame', this.show_loss);

  this.show_victory = this.bind('DoorVisited', function() {
    if (!Crafty('Door').length) {
      Crafty.scene('Victory');
    }
  });

  this.show_loss = this.bind('EndGame', function() {
      Crafty.scene('GameOver');
  });
}, function() {
  this.unbind('DoorVisited', this.show_victory);
  this.unbind('EndGame', this.show_loss);
});

Crafty.scene('Game2', function() {

  Crafty.e('Platform').attr({x:40,y:250,w:300,h:3});
  Crafty.e('Platform').attr({x:450,y:250,w:300,h:3});
  Crafty.e('2D, DOM, Text')
    .attr({ x: 0, y: 0 })
    .text('Level 2');

  this.player = Crafty.e('PlayerCharacter').at(1, 4);

  // Upper
  Crafty.e('Platform').attr({x:0,y:0,w:1085,h:1});
  // Lower
  Crafty.e('GameOver').attr({x:0,y:287,w:1085,h:1});
  // Left
  Crafty.e('Platform').attr({x:0,y:0,w:1,h:288});
  // Right
  Crafty.e('Platform').attr({x:1084,y:0,w:1,h:288});

  Crafty.e('Door').at(30, 10);
  this.unbind('DoorVisited', this.show_victory);
  this.unbind('EndGame', this.show_loss);
  this.show_victory = this.bind('DoorVisited', function() {
    if (!Crafty('Door').length) {
      Crafty.scene('Game3');
    }
  });

  this.show_loss = this.bind('EndGame', function() {
      Crafty.scene('GameOver');
  });
}, function() {
  this.unbind('DoorVisited', this.show_victory);
  this.unbind('EndGame', this.show_loss);
});

Crafty.scene('Game1', function() {
  Crafty.e('Platform').attr({x:40,y:270,w:800,h:3});
  Crafty.e('2D, DOM, Text')
    .attr({ x: 0, y: 0 })
    .text('Level 1');

  this.player = Crafty.e('PlayerCharacter').at(1, 4);

  // Upper
  Crafty.e('Platform').attr({x:0,y:0,w:1085,h:1});
  // Lower
  Crafty.e('GameOver').attr({x:0,y:287,w:1085,h:1});
  // Left
  Crafty.e('Platform').attr({x:0,y:0,w:1,h:288});
  // Right
  Crafty.e('Platform').attr({x:1084,y:0,w:1,h:288});

  Crafty.e('Door').at(30, 13);
  this.unbind('KeyDown', this.restart_game);
  this.unbind('DoorVisited', this.show_victory);
  this.unbind('EndGame', this.show_loss);
  this.show_victory = this.bind('DoorVisited', function() {
    if (!Crafty('Door').length) {
      Crafty.scene('Game2');
    }
  });

  this.show_loss = this.bind('EndGame', function() {
      Crafty.scene('GameOver');
  });
}, function() {
  this.unbind('DoorVisited', this.show_victory);
  this.unbind('EndGame', this.show_loss);
});

// game over scene
// -------------
// Tells the player when they've won and lets them start a new game
Crafty.scene('GameOver', function() {
  // Display some text in celebration of the victory
  Crafty.e('2D, DOM, Text')
    .attr({ x: 0, y: 0 })
    .text('Game Over!');

  // Watch for the player to press a key, then restart the game
  //  when a key is pressed
  this.restart_game = this.bind('KeyDown', function() {
    Crafty.scene('Game1');
  });
}, function() {
  // Remove our event binding from above so that we don't
  //  end up having multiple redundant event watchers after
  //  multiple restarts of the game
  this.unbind('KeyDown', this.restart_game);
});

// Victory scene
// -------------
// Tells the player when they've won and lets them start a new game
Crafty.scene('Victory', function() {
  // Display some text in celebration of the victory
  Crafty.e('2D, DOM, Text')
    .attr({ x: 0, y: 0 })
    .text('Victory!');

  // Watch for the player to press a key, then restart the game
  //  when a key is pressed
  this.restart_game = this.bind('KeyDown', function() {
    Crafty.scene('Game1');
  });
}, function() {
  // Remove our event binding from above so that we don't
  //  end up having multiple redundant event watchers after
  //  multiple restarts of the game
  this.unbind('KeyDown', this.restart_game);
});

// Loading scene
// -------------
// Handles the loading of binary assets such as images and audio files
Crafty.scene('Loading', function(){
  // Draw some text for the player to see in case the file
  //  takes a noticeable amount of time to load
  Crafty.e('2D, DOM, Text')
    .text('Loading...')
    .attr({ x: 0, y: Game.height()/2 - 24, w: Game.width() })
    .css($text_css);

  // Load our sprite map image
  Crafty.load(['assets/door.png',
               'assets/stickman.png',
               'assets/door_knock_3x.mp3',
               'assets/door_knock_3x.ogg',
               'assets/door_knock_3x.aac'
               ], function(){
    // Once the image is loaded...

    // Define the individual sprites in the image
    // Each one (spr_tree, etc.) becomes a component
    // These components' names are prefixed with "spr_"
    //  to remind us that they simply cause the entity
    //  to be drawn with a certain sprite
    Crafty.sprite(18, 31, 'assets/stickman.png', {   // i changed this line
            spr_player:[0,4], 
    },2,0);                                             // until here
    Crafty.sprite(32, 31, 'assets/door.png', {   // i changed this line
            spr_door:[0,0], 
    },0,0);  
    // Define our sounds for later use
    Crafty.audio.add({
      knock: ['assets/door_knock_3x.mp3',
              'assets/door_knock_3x.ogg',
              'assets/door_knock_3x.aac']
    });
    
    var gridspace = Crafty.e("2D");
    var plats = new Array();
    var curIdx = 0;
    var numPlats = 0;

    gridspace.onMouseDown = function(e) {
        console.log(e.x, e.y);
        if(numPlats > 20) {
            plats[curIdx].destroy();
        }
        plats[curIdx] = Crafty.e('Platform').attr({x:e.x-14,y:e.y-10,w:10,h:5});
        curIdx = (curIdx + 1) % 21;
        numPlats = numPlats + 1;
    };

    Crafty.addEvent(gridspace, Crafty.stage.elem, "mousedown", gridspace.onMouseDown);
    Crafty.scene('Game1');
  })
});
