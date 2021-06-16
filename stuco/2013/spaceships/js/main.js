/*
 * main.js: set up the game and splash screen
 */

define(function(require) {
    'use strict';

    // prevent JS files from getting cached (for development)
    requirejs.config({urlArgs: 'bust=' + (new Date()).getTime()});
    
    var game = require('game');
    document.getElementById('play').addEventListener('click', function() {
    	//document.getElementById('top').style.background = "url(http://www.psdgraphics.com/file/stars.jpg) no-repeat center center fixed";
        //document.getElementById('top').style.background-size = "cover";
        document.getElementById('dialogue').style.display = 'none';
        document.getElementById('spaceships').style.display = 'block';
        game.start();
    });

});
