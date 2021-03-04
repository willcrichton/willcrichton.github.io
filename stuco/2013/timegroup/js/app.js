/*
 * app.js: Set up the game.
 */

 define(function(require) {
  'use strict';

  // Prevent JS files from getting cached.
  requirejs.config({urlArgs: 'bust=' + (new Date()).getTime()});

  var game = require('game');
  game.start();
});
