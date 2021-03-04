/*
board.js: defines the game screen. 
*/

define(function(require) {
	'use strict';

	//IMPORT ANY FILES HERE IF NECESSARY

	function makeScreen(position) { 

	    //our block is an instance of a paper Group
	    //Group.call(this); DO I NEED THIS 

	    //Creates the 5 platforms for the screen
	    var rectangle = new Rectangle(new Point(0,0), new Point(view.bounds.width, 100));
	    var path = new Path.Rectangle(rectangle);
	    path.fillColor = '#FF0000';
	    path.selected = true;

	    path.position = position;
	    return path;
	    
	};
	return makeScreen;
    });
