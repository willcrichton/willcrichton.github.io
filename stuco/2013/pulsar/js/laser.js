/*
 * laser.js: defines the Laser class, an entity in the game
 */

define(function(require) {
    'use strict';

    var 
    C    = require('constants'),
    Util = require('util');

    function Laser(position, target) {

        // our Laser is an instance of a paper Group
        Group.call(this);

        var start = new Point(0, 0);

        // points of fish outline
        var segments = [start,
                        start.add([13, -7])];

        var outline = new Path(segments);
        outline.strokeColor = 'red';
        outline.fillColor = '#F00';
        outline.closed = true;
        outline.smooth();
        
        this.addChild(outline);
        this.position = position;
        
        this.orientation = C.LEFT;
        this.velocity = [0, 0];
    }

    Laser.prototype = Object.create(Group.prototype);

    

    return Laser;
});
