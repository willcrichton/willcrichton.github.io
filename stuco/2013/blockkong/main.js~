/*
 * main.js: set up the game and splash screen
 */

define(function(require) {
    'use strict';

    // prevent JS files from getting cached (for development)
    requirejs.config({urlArgs: 'bust=' + (new Date()).getTime()});
    
    var game = require('game');
    document.getElementById('play').addEventListener('click', function() {
        document.getElementById('dialogue').style.display = 'none';
        document.getElementById('fishies').style.display = 'block';
        game.start();
    });
});
