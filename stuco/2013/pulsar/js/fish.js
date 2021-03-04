/*
 * fish.js: defines the Fish class, the main entity in the game
 */

define(function(require) {
    'use strict';

    var 
    C    = require('constants'),
    Util = require('util');

    function Fish(position) {

        // our Fish is an instance of a paper Group
        Group.call(this);

        var start = new Point(0, 0);

        // points of fish outline
        var segments = [start,
                        start.add([13, 7]),
                        start.add([20, 20]),
                        start.add([27, 7]), 
                        start.add([40, 0]), 
                        start.add([27, -7]),
                        start.add([20, -20]),
                        start.add([13, -7])];

        var outline = new Path(segments);
        outline.strokeColor = 'white';
        outline.fillColor = '#a00';
        outline.closed = true;
        outline.smooth();
        
        this.addChild(outline);
        this.position = position;
        //console.log(this.position);
        this.orientation = C.LEFT;
        this.velocity = [0, 0];
        this.origin = "";
    }

    Fish.prototype = Object.create(Group.prototype);

    Fish.prototype.addVelocity = function(vector) {
       this.velocity = [Util.addVelocity(this.velocity[0], vector[0]),
                        Util.addVelocity(this.velocity[1], vector[1])];
    }

    return Fish;
});
