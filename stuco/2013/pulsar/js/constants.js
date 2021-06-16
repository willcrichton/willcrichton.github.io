/*
 * constants.js: contains various numeric constants for tuning the game
 */

define(function(require) {
    'use strict';

    return {
        SIZE_GAIN: 7,               // base pixels of gain for every fish eaten
        MAX_VELOCITY: 3,            // max speed for player 
        ACCELERATION: 0.2,          // how rapidly he accelerates
        DECELERATION: 0.07,         // how quickly he decelerates
        LEFT: 1,                    
        RIGHT: 0,
        MAX_ENEMY_VARIANCE: 1.8,    // enemies are up to 1 + X (or minus) times player size
        MIN_ENEMY_VARIANCE: 0.4,    // enemies are at least 1 + X (or minus) times player size
        FISH_SPAWN_TIME: 0.7,       // how frequently (in seconds) fish spawn
        MIN_EAT_OVERLAP: 0.05,      // minimum area needed for small fish to eat or be eaten (ratio)

        SHOT_COOLDOWN: 0.18
    };
}); 
