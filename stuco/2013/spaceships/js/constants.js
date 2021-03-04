/*
 * constants.js: contains various numeric constants for tuning the game
 */

define(function(require) {
    'use strict';

    return {
        MAX_VELOCITY: 4,            // max speed for player 
        ACCELERATION: 0.2,          // how rapidly he accelerates
        DECELERATION: 0.07,         // how quickly he decelerates
        LEFT: 1,                    
        RIGHT: 0,
        CHECK_ZOMBIE_TIME: 5,
        SHIP_SPAWN_TIME: 1,       // how frequently (in seconds) fish spawn
        BULLET_SPAWN_TIME: .2,
        BULLET_SPEED: 12,
        MIN_EAT_OVERLAP: 0.05,       // minimum area needed for small fish to eat or be eaten (ratio)
        STALE: 1,
        
    };
}); 
