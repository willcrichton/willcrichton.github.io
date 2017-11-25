define(function(require){
    'use strict';

    requirejs.config({
        enforceDefine: true,
        inlineText: true,
        urlArgs: "bust=" + (new Date()).getTime(),

        shim: {
            'jQuery': {
                exports: '$'
            },

            'Underscore': {
                exports: '_'
            },

            'Backbone': {
                deps: ['Underscore', 'jQuery'],
                exports: 'Backbone'
            }
        },

        paths: {
            'jQuery'     : 'vendor/jquery-2.0.3.min',
            'Underscore' : 'vendor/underscore-min',
            'Backbone'   : 'vendor/backbone-min'
        }
    });

    // requestAnimationFrame polyfill for unsupported browsers
    if ( !window.requestAnimationFrame ) {
        window.requestAnimationFrame = ( function() {
            return window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element ) {
                    window.setTimeout( callback, 1000 / 60 );
                };
        } )();
    }

    require([
        'jQuery',
        'Underscore',
        'Backbone',
        'Router',
        'constants'
    ], function($, _, Backbone, Router, C) {

        // precache images
        _.forEach(C.IMAGES_TO_CACHE, function(src) {
            var img = new Image();
            img.src = 'images/' + src;
        });

        var isMobile = /Mobi/.test(navigator.userAgent);

        // create router/views
        var appRouter = new Router();

        var screenWidth = 404;
        console.log(window.innerWidth, screenWidth);
        if (window.innerWidth < screenWidth) {
            var scale = window.innerWidth / screenWidth;
            var translate = ((1 - scale) * screenWidth) / 2;
            $('#screen').css({
                '-webkit-transform': 'scale(' + scale + ') translateX(-' + translate + 'px)'
            });
        }

        // light up gameboy light
        // if (!isMobile) {
        //     $('#on-light').show();
        // }

        // handle router events
        appRouter.on('changeView', function() {
            if (this.currentView.id == 'home') {
                $('#back-home, #instructions').fadeOut(100);
            } else {
                $('#back-home, #instructions').fadeIn(100);
                $('#instructions').html(this.currentView.instructions);
            }
        });

        var eventsMap = {
            'control-up': C.UP,
            'control-left': C.LEFT,
            'control-down': C.DOWN,
            'control-right': C.RIGHT,
            'control-a': C.ACTION,
            'control-b': C.ACTION
        };

        var keyMap = {
            38: C.UP, 87: C.UP,
            39: C.RIGHT, 68: C.RIGHT,
            37: C.LEFT, 65: C.LEFT,
            40: C.DOWN, 83: C.DOWN,
            32: C.ACTION, 13: C.ACTION,
            9: C.TAB, 21: C.EXIT
        };

        _.forEach(eventsMap, function(key, id) {
            $('#' + id).mousedown(function(e) {
                e.preventDefault();

                if (appRouter.currentView.controlDown) {
                    appRouter.currentView.controlDown(key, e);
                }
            }).mouseup(function(e) {
                e.preventDefault();

                if (appRouter.currentView.controlUp) {
                    appRouter.currentView.controlUp(key, e);
                }
            });
        });

        $(document).keydown(function(e) {
            if (keyMap[e.which] && appRouter.currentView.controlDown) {
                appRouter.currentView.controlDown(keyMap[e.which], e);
            }
        }).keyup(function(e) {
            if (keyMap[e.which] && appRouter.currentView.controlUp) {
                appRouter.currentView.controlUp(keyMap[e.which], e);
            }
        });

        Backbone.history.start();
    });
});
