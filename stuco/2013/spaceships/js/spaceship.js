/*
 * Spaceship.js: defines the Spaceship class, the main entity in the game
 */

define(function(require) {
    'use strict';

    var 
    C    = require('constants'),
    Util = require('util');

    function Spaceship(position,ship) {

        // our Spaceship is an instance of a paper Group
        Group.call(this);

        // temporary raster of Spaceship
        var raster = new Raster(ship);
        raster.position = view.center;
        raster.scale(0.5);
        raster.rotate(90);

        this.addChild(raster);
        this.position = position;
        this.orientation = C.LEFT;
        this.velocity = [0, 0];
    }

    Spaceship.prototype = Object.create(Group.prototype);

    Spaceship.prototype.addVelocity = function(vector) {
       this.velocity = [Util.addVelocity(this.velocity[0], vector[0]),
                        Util.addVelocity(this.velocity[1], vector[1])];
    }

    Spaceship.prototype.shoot = function() {
       this.velocity = [C.BULLET_SPEED,0];
    }

    return Spaceship;
});
