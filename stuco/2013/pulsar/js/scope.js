/*
 * fish.js: defines the Fish class, the main entity in the game
 */

define(function(require) {
    'use strict';

    var 
    C    = require('constants'),
    Util = require('util');

    function Scope(position) {

        // our Fish is an instance of a paper Group
        Group.call(this);

        var start = new Point(0, 0);

        // points of fish outline
        var segments = [start,
                        start.add([0, 2]),
                        start.add([18, 2]),
                        start.add([18, 20]), 
                        start.add([22, 20]), 
                        start.add([22, 2]),
                        start.add([40, 2]),
                        start.add([40, -2]),
                        start.add([22,-2]),
                        start.add([22,-20]),
                        start.add([18,-20]),
                        start.add([18,-2]),
                        start.add([0,-2])];

        var outline = new Path(segments);
        outline.strokeColor = 'white';
        outline.fillColor = '#aaa';
        outline.closed = true;
        console.log("DREW CROSSHAIRS");
        //outline.smooth();
        
        this.addChild(outline);
        this.position = position;
        console.log(this.position);
        this.orientation = C.LEFT;
        this.velocity = [0, 0];
    }

    Scope.prototype = Object.create(Group.prototype);

    Scope.prototype.addVelocity = function(vector) {
       this.velocity = [Util.addVelocity(this.velocity[0], vector[0]),
                        Util.addVelocity(this.velocity[1], vector[1])];
    }

    return Scope;
});
