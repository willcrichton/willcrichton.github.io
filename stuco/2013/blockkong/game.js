/*
BUGS THAT NEED FIXING. 
- THERE IS A LADDER ON THE MAIN SCREEN THAT I DON'T WANT

THINGS THAT COULD BE IMPROVED
- CAN ADD PHYSICS TO BE LIKE REAL DONKEY KONG
- MORE LEVELS. BUT THIS IS JUST A DEMO

* game.js: handles most game logic
*/
// paperjs has to have this run before
// any modules can reference paper variables
// todo--better, more modular way to do this?

paper.install(window);
paper.setup('blockKong');

define(function(require) {
	'use strict';

	//INSERT IMPORTS TO OTHER FILES HERE
	var
	    Block = require('block'), 
	    Barrel = require('barrel');
	
        var barrel_group = new Group();

	var Game = {
	    start: function() {
	        barrel_group = new Group();
		//DEFINE THE SCREEN
		var height1 = view.bounds.height/5;
		var wall_pos1 = new Point(view.bounds.width/2, view.bounds.height-height1);
		var rect1 = new Rectangle(new Point(0, 0), 
					  new Point(view.bounds.width, 50));
		var path1 = new Path.Rectangle(rect1);
		path1.fillColor = '#ff0000';
		path1.position = wall_pos1;

		var height2 = view.bounds.height*(2/5);
                var wall_pos2 = new Point(view.bounds.width/2, view.bounds.height-height2);
                var rect2 = new Rectangle(new Point(0, 0),
                                          new Point(view.bounds.width, 50));
                var path2 = new Path.Rectangle(rect2);
                path2.fillColor = '#ff0000';
                path2.position = wall_pos2;

		var height3 = view.bounds.height*(3/5);
                var wall_pos3 = new Point(view.bounds.width/2, view.bounds.height-height3);
                var rect3 = new Rectangle(new Point(0, 0),
                                          new Point(view.bounds.width, 50));
                var path3 = new Path.Rectangle(rect3);
                path3.fillColor = '#ff0000';
                path3.position = wall_pos3;

		var height4 = view.bounds.height*(4/5);
                var wall_pos4 = new Point(view.bounds.width/2, view.bounds.height-height4);
                var rect4 = new Rectangle(new Point(0, 0),
                                          new Point(view.bounds.width, 50));
                var path4 = new Path.Rectangle(rect4);
                path4.fillColor = '#ff0000';
                path4.position = wall_pos4;

		//GOAL LINE
		var wall_posG = new Point(view.bounds.width/2, 0);
                var rectG = new Rectangle(new Point(0, 0),
                                          new Point(view.bounds.width, 25));
                var pathG = new Path.Rectangle(rectG);
                pathG.fillColor = '#00ff00';
                pathG.position = wall_posG;
		

		//DEFINES THE LADDERS TO MOVE UP
		var ladder1_rast = new Raster('ladder');
		this.randL1 = Math.random() * view.bounds.width-15;
		var ladder1_pos = new Point(this.randL1,height4);
		ladder1_rast.position = ladder1_pos;

		var ladder2_rast = new Raster('ladder');
		this.randL2 = Math.random() * view.bounds.width-15;
                var ladder2_pos = new Point(this.randL2,height3);
                ladder2_rast.position = ladder2_pos;

		var ladder3_rast = new Raster('ladder');
		this.randL3 = Math.random() * view.bounds.width-15;
                var ladder3_pos = new Point(this.randL3,height2);
                ladder3_rast.position = ladder3_pos;

		var ladder4_rast = new Raster('ladder');
		this.randL4 = Math.random() * view.bounds.width-15;
                var ladder4_pos = new Point(this.randL4,height1);
                ladder4_rast.position = ladder4_pos;

		//DEFINE THE PLAYER AND SCORE
		var pos = new Point(35, view.bounds.height-35);
                this.player = new Block(pos); //make block object
		console.log(this.player);
		this.lastBarrel = 0;
		this.points = 5000
                this.score = 0;
                this.started = true;
		
	    },
	    
	    end: function() {
		document.getElementById('dialogue').style.display = 'block';
		document.getElementById('score').innerHTML = 'Your score was ' + this.score;
		project.activeLayer.removeChildren();
		barrel_group.removeChildren();
		this.started = false;
        },

	loop: function(e) 
	    {

		if (!this.started) {
		    return;
		}
		
		var player = this.player;
		var step = 5;
		
		if(this.points != 0)
		    this.points -= 2;
		
		var playerBounds = player.strokeBounds;		
		var nx = playerBounds.width / 2, ny = playerBounds.height / 2;

		//HANDLE COLLISIONS AGAINST PLATFORMS
		var bound1T = view.bounds.height/5 + 50;
                var bound1S = view.bounds.height/5 - 50;
		
		var bound2T = view.bounds.height*(2/5) + 50;
                var bound2S = view.bounds.height*(2/5) - 50;

		var bound3T = view.bounds.height*(3/5) + 50;
                var bound3S = view.bounds.height*(3/5) - 50;

		var bound4T = view.bounds.height*(4/5) + 50;
                var bound4S = view.bounds.height*(4/5) - 50;


		if(player.position.y <= 25)
		    {
			this.score = this.points;
			this.end();
		    }

		// handle keyboard events for moving your character
		if (Key.isDown('w') || Key.isDown('up')) 
		    { 
			if ((player.position.y <= ny))
                            {
				player.position.y -= 0;
                            }
			else if((player.position.y >= bound4S &&
				 player.position.y <= bound4T &&
				 player.position.x <= this.randL1+10 &&
				 player.position.x >= this.randL1-10) ||
				(player.position.y >= bound3S &&
				 player.position.y <= bound3T &&
                                 player.position.x <= this.randL2+10 &&
                                 player.position.x >= this.randL2-10) ||
				(player.position.y >= bound2S &&
				 player.position.y <= bound2T &&
                                 player.position.x <= this.randL3+10 &&
                                 player.position.x >= this.randL3-10) ||
				(player.position.y >= bound1S &&
				 player.position.y <= bound1T &&
                                 player.position.x <= this.randL4+10 &&
                                 player.position.x >= this.randL4-10))
			    {
				player.position.y -= step;
			    }
			else if((player.position.y <= bound1T &&
				 player.position.y >= bound1S && 
				 player.position.y >  bound1S + 50) ||
				(player.position.y <= bound2T &&
                                 player.position.y >= bound2S &&
                                 player.position.y >  bound2S + 50) ||
				(player.position.y <= bound3T &&
                                 player.position.y >= bound3S &&
                                 player.position.y >  bound3S + 50) ||
				(player.position.y <= bound4T &&
                                 player.position.y >= bound4S &&
				 player.position.y >  bound4S + 50))
			    {
				player.position.y -= 0;
			    }
			else
                            {
				player.position.y -= step;
                            }
		    } 
		else if (Key.isDown('s') || Key.isDown('down')) 
		    {
			if ((player.position.y >= view.bounds.height - ny))
                            {
				player.position.y += 0;
			    }
			else if((player.position.y >= bound4S &&
				 player.position.y <= bound4T &&
                                 player.position.x <= this.randL1+10 &&
                                 player.position.x >= this.randL1-10) ||
                                (player.position.y >= bound3S &&
				 player.position.y <= bound3T &&
                                 player.position.x <= this.randL2+10 &&
                                 player.position.x >= this.randL2-10) ||
                                (player.position.y >= bound2S &&
				 player.position.y <= bound2T &&
                                 player.position.x <= this.randL3+10 &&
                                 player.position.x >= this.randL3-10) ||
                                (player.position.y >= bound1S &&
				 player.position.y <= bound1T &&
                                 player.position.x <= this.randL4+10 &&
                                 player.position.x >= this.randL4-10))
                            {
                                player.position.y += step;
                            }
			else if((player.position.y <= bound1T &&
                                 player.position.y >= bound1S &&
                                 player.position.y <  bound1S + 50) ||
                                (player.position.y <= bound2T &&
                                 player.position.y >= bound2S &&
                                 player.position.y <  bound2S + 50) ||
                                (player.position.y <= bound3T &&
                                 player.position.y >= bound3S &&
                                 player.position.y <  bound3S + 50) ||
                                (player.position.y <= bound4T &&
                                 player.position.y >= bound4S &&
                                 player.position.y <  bound4S + 50))
                            {
                                player.position.y += 0;
                            }			
			else
                            {
				player.position.y += step;
                            } 
		    }

		if (Key.isDown('a') || Key.isDown('left')) 
		    {
			if ((player.position.x <= nx))
			    {
				player.position.x -= 0;
			    }
			else if((player.position.y < bound1T-5 &&
                                 player.position.y > bound1S+5) ||
                                (player.position.y < bound2T-5 &&
                                 player.position.y > bound2S+5) ||
                                (player.position.y < bound3T-5 &&
                                 player.position.y > bound3S+5) ||
                                (player.position.y < bound4T-5 &&
                                 player.position.y > bound4S+5))
                            {
                                player.position.x -= 0;
                            }

			else 
			    {
				player.position.x -= step;
			    }
		    } 
		else if (Key.isDown('d') || Key.isDown('right')) 
		    {
			if ((player.position.x >= view.bounds.width - nx))
                            {
				player.position.x += 0;
                            }
			else if((player.position.y < bound1T-5 &&
                                 player.position.y > bound1S+5) ||
                                (player.position.y < bound2T-5 &&
                                 player.position.y > bound2S+5) ||
                                (player.position.y < bound3T-5 &&
                                 player.position.y > bound3S+5) ||
                                (player.position.y < bound4T-5 &&
                                 player.position.y > bound4S+5))
                            {
                                player.position.x += 0;
                            }
			else
                            {
				player.position.x += step;
                            }
		    }
		
		//MAKES BARRELS
		if (e.time - this.lastBarrel >= 0.4) {
		    this.newBarrel();
		    this.lastBarrel = e.time;
		}
	       
		//MOVES THE BARRELS
		_.forEach(barrel_group.children, function(barrel) 
		{
		     var 
		     barrelbounds = barrel.strokeBounds,
		     playerbounds = player.strokeBounds,
		     overlap = barrelbounds.intersects(playerbounds);
		     if(overlap)
			 {
			     this.end();
			 }
		   
		     barrel.position.y += 2;

		}, this);
	    },
		    
		//DROPPING BARRELS
		newBarrel: function() 
		{
		    var posx = Math.random() * view.bounds.width;
		    var posB = new Point(posx, 0);
		    var barrel = new Barrel(posB);
		    barrel_group.addChild(barrel);

		    if(barrel.position.y >= view.bounds.height)
			{
			     barrel.remove();
			     //i think this removes this from group
			}
		    	   
		}
	    
	
	};
  
	view.onFrame = _.bind(Game.loop, Game);	
	return Game;
       
    });

