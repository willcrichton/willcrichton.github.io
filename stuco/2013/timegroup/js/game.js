/**
 * game.js: Main game loop.
 */

// Run before any modules can reference paper variables.
paper.install(window);
paper.setup('canvas');

define(function(require) {
  'use strict';

  var State = require('state');
  var Renderer = require('renderer');
  var Util = require('util');

  var Game = {};

  Game.start = function() {
    State.reloadInstruction();
  };

  Game.loop = function() {
    Renderer.renderInstruction(State.instructionToRender);
    Renderer.renderScore(State.score);
    Renderer.renderTimer(State.timer.toFixed(1));
    Renderer.renderUserCount(State.users ? State.users.length : 0);
    Renderer.renderShapes(State.shapesToRender, function(shape) {
      _.forEach(State.instructions, function(instruction) {
        if (instruction.kind === shape.kind && instruction.color === shape.color) {
          State.finishInstruction();
          State.reloadInstruction();
        }
      });
    });
  };

  view.onFrame = _.bind(Game.loop, Game);
  return Game;
});
