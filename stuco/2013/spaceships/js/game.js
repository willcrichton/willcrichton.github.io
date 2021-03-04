/*
 * game.js: handles most game logic
 */

// paperjs has to have this run before
// any modules can reference paper variables
// todo--better, more modular way to do this?
paper.install(window);
paper.setup('spaceships');

define(function(require) {
    'use strict';

    var 
    Spaceship = require('spaceship'),
    C    = require('constants'),
    Util = require('util');
        

    var Game = {
        start: function() {
            this.player = new Spaceship(view.bounds.leftCenter,'s1');
            this.lastSpaceship = 0;
            this.lastRemoval = 0;
            this.score = 0;
            this.lives = 3;
            this.started = true;
            this.lastBulletTime = -99999999999;
            this.player.rotate(180);
            this.bulletList = [];

            this.livesText = new PointText(new Point(75, 50));
            this.livesText.justification = 'center';
            this.livesText.fillColor = 'white';
            this.livesText.content = 'Lives: ' + this.lives;
            this.livesText.fontSize = 25;

            this.scoreText = new PointText(new Point(75, 75));
            this.scoreText.justification = 'center';
            this.scoreText.fillColor = 'white';
            this.scoreText.content = 'Score: ' + this.score;
            this.scoreText.fontSize = 25;


            for (var i = 0; i < 5; i++) {
                this.newEnemy();
            }
        },

        end: function() {
            document.getElementById('dialogue').style.display = 'block';
            document.getElementById('score').innerHTML = 'You have let the aliens through! <br> However you did get ' + this.score + " points.";
            project.activeLayer.removeChildren();
            this.started = false;
        },

        loop: function(e) {

            if (!this.started) {
                return;
            }

            var player = this.player;

            // handle keyboard events for moving spaceship
            if (Key.isDown('w') || Key.isDown('up')) { 
                player.addVelocity([0, -C.ACCELERATION]);
            } else if (Key.isDown('s') || Key.isDown('down')) {
                player.addVelocity([0, C.ACCELERATION]);
            } 
            
            if (Key.isDown('a') || Key.isDown('left')) {
                player.addVelocity([-C.ACCELERATION, 0]);
            } else if (Key.isDown('d') || Key.isDown('right')) {
                player.addVelocity([C.ACCELERATION, 0]);
            }

            if(Key.isDown('space') && e.time - this.lastBulletTime >= C.BULLET_SPAWN_TIME ){
                var copy = new Spaceship(new Point(player.position.x+100,player.position.y),'s0');
                copy.shoot();
                this.lastBulletTime = e.time;
                this.bulletList.push(copy);
            }

            // do simple 2D physics for the player
            // calculate velocity with deceleration
            var playerBounds = player.strokeBounds;

            if (!view.bounds.contains(playerBounds)) {
                
                // fixme: player can still get stuck. detection isn't 
                var nx = playerBounds.width / 2, ny = playerBounds.height / 2;
                if ((player.position.x <= nx && player.velocity[0] < 0) ||
                    (player.position.x >= view.bounds.width - nx && player.velocity[0] > 0)) {
                    player.velocity[0] = 0;
                } else if((player.position.y <= ny && player.velocity[1] < 0) ||
                          (player.position.y >= view.bounds.height - ny && player.velocity[1] > 0)) {
                    player.velocity[1] = 0;
                }
            }

            // move the spaceship by the given velocity
            player.position = player.position.add(player.velocity);

            // handle enemy spaceship logic and collisions
            _.forEach(project.activeLayer.children, function(otherSpaceship) {
                if (player.id         === otherSpaceship.id || 
                    this.livesText.id === otherSpaceship.id || 
                    this.scoreText.id === otherSpaceship.id) {
                    return;
                }
                var otherBounds = otherSpaceship.strokeBounds;
                _.forEach(this.bulletList,function(bullet){
                
                    if(bullet.id === otherSpaceship.id)
                        return;
                    
                    overlap = otherBounds.intersect(bullet.strokeBounds),
                    overlapArea = overlap.width * overlap.height,
                    otherArea   = otherBounds.width * otherBounds.height;
                
                    if (overlapArea / otherArea > C.MIN_EAT_OVERLAP & overlap.width > 0) {
                        if(C.STALE == 1)
                            this.score += Math.max(3,10-Math.floor(this.bulletList.length/4));
                        else
                            this.score += 10;
                        this.scoreText.content = 'Score: ' + this.score;
                        otherSpaceship.remove();
                        bullet.remove();
                        var index = this.bulletList.indexOf(bullet);
                        this.bulletList.splice(index,1);
                    }
                },this);
                
                var 
                overlap = otherBounds.intersect(playerBounds),
                overlapArea = overlap.width * overlap.height,
                otherArea   = otherBounds.width * otherBounds.height;
                

                if (overlapArea / otherArea > C.MIN_EAT_OVERLAP & overlap.width > 0) {
                    this.lives--;
                    otherSpaceship.remove();
                    this.scoreText.content = 'Score: ' + this.score;
                    if(this.lives > 0)
                        player.position = view.bounds.leftCenter;
                    else 
                        this.end();
                    this.livesText.content = 'Lives: ' + this.lives;
                    
                    /* Remove all bullets on new life */
                    _.forEach(this.bulletList,function(bullet){
                        bullet.remove();
                    },this);
                    this.bulletList = [];
                }
                
                
                
                otherSpaceship.position = otherSpaceship.position.add(otherSpaceship.velocity);


            }, this);
            
            Util.decelerate(player.velocity);
            
            // generate spaceshipes every second
            if (e.time - this.lastSpaceship >= C.SHIP_SPAWN_TIME) {
                this.newEnemy();
                this.lastSpaceship = e.time;
            }
            
            // Delete gone things
            if (e.time - this.lastRemoval >= C.CHECK_ZOMBIE_TIME) {
                _.forEach(this.bulletList,function(bullet){
                    if (!bullet.strokeBounds.intersects(view.bounds) && !view.bounds.contains(bullet.strokeBounds)) {
                        bullet.remove();
                        var index = this.bulletList.indexOf(bullet);
                        this.bulletList.splice(index,1);
                    }
                },this);
                _.forEach(project.activeLayer.children, function(ship) {
                    // todo: add GC
                    if (!ship.strokeBounds.intersects(view.bounds) && !view.bounds.contains(ship.strokeBounds)) {
                      ship.remove();
                    }
                },this);
 
                this.lastRemoval = e.time;
                console.log(this.bulletList.length);
            }
       
        },

        newEnemy: function() {
            var pos = Math.random() * view.bounds.height;
            var enemytype = Math.floor(Math.random() * 7.0) + 2;
            var enemy = new Spaceship([view.bounds.width, pos],'s'+ enemytype);
            
            var cur_scale = this.player.strokeBounds.width / enemy.strokeBounds.width;

            var scale = cur_scale;
            enemy.scale(scale);

            enemy.position.x += enemy.strokeBounds.width / 2;
            
            enemy.addVelocity([-3 * (cur_scale / scale), 0]);
            enemy.children[0].fillColor = '#' + (Math.round(0xffffff * Math.random())).toString(16);
        }
    };

    view.onFrame = _.bind(Game.loop, Game);

    return Game;
});
