/*
barrel.js: defines the falling barrels.
*/

define(function(require) {
    'use strict';

    //IMPORT ANY FILES HERE IF NECESSARY                                                  

    function Barrel(position) {

        //our block is an instance of a paper Group
	//Group.call(this); DO I NEED THIS
	
	//Creates the circle for the barrel
	var circle = new Path.Circle(position, 30);

	// Pass a color name to the fillColor property, which is internally
	// converted to a Color.
	circle.fillColor = 'brown';

	circle.position = position;
	return circle;

    };
    return Barrel;
    });
