/*
block.js: defines the player character. 
 */

define(function(require) {
    'use strict';

    //IMPORT ANY FILES HERE IF NECESSARY

    function makeBlock(position) { 

	//our block is an instance of a paper Group
	//Group.call(this); DO I NEED THIS

	//Creates the square for the character
	var rectangle = new Rectangle(new Point(0, 0), new Point(50, 50));
	var path = new Path.Rectangle(rectangle);
	path.fillColor = '#000000';
	path.selected = true;

	path.position = position;
	return path;
	
    };
    return makeBlock;
    });
