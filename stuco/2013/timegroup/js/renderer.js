/**
 * renderer.js: Renders objects for the game.
 */

define(function(require) {
  'use strict';

  var Renderer = {};

  Renderer.renderShapes = function(shapes, callback) {
    _.forEach(shapes, function(s) {
      s.draw(callback);
    });
  };

  Renderer.renderInstruction = function(shape) {
    document.getElementById('instruction').innerHTML = shape ? shape.toString() : '';
  };

  Renderer.renderScore = function(score) {
    document.getElementById('score').innerHTML = score;
  };

  Renderer.renderTimer = function(time) {
    document.getElementById('time').setAttribute('value', time);
  };

  Renderer.renderUserCount = function(count) {
    document.getElementById('user-count').innerHTML = count;
  };

  return Renderer;
});
