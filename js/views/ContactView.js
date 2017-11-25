define(function(require) {
    'use strict';

    var 
    $        = require('jQuery'),
    _        = require('Underscore'),
    C        = require('constants'),
    Backbone = require('Backbone'),
    template = require('text!templates/contact.tpl');

    var SpriteState = Backbone.Model.extend({
        defaults: {
            state: 0,
            position: 20,
            height: 0,
            direction: C.RIGHT,
            key: '',
            stateChange: 0,
            jumping: false,
            jumpVel: 0,
            mailed: false
        }
    });

    var MAP_WIDTH = 1297;
    var MOVESPEED = 150;
    var MARIO_YPOS = 220;
    var GRAVITY_DECEL = 0.5;
    var JUMP_VEL = 8;

    return Backbone.View.extend({

        id: 'contact',

        instructions: 'Arrow keys to move, jump to hit text boxes',
        
        initialize: function() {
            this.template = _.template(template);
            this.spriteState = new SpriteState();

            requestAnimationFrame(_.bind(this.onFrame, this));
            
            this.renderInit();
            this.render();

            this.listenTo(this.spriteState, 'change', this.render);
            this.lastFrame = 0;
        },

        controlDown: function(key, e) {
            var nodeName = e.target.nodeName.toLowerCase();
            if (nodeName == 'input' && (key == C.TAB || key == C.ENTER)) {
                $(e.target).blur();
            }

            if (nodeName != 'input') {
                this.spriteState.set('key', key);
            }
        },

        controlUp: function(key) {
            this.spriteState.set('key', '');
            if (key != C.UP && key != C.ACTION) {
                this.spriteState.set('state', 0);
            }
        },

        onFrame: function(time) {
            var delta = (time - this.lastFrame) / 1000;

            var pos = this.spriteState.get('position');

            var moved = true;

            if (this.spriteState.get('jumping')) {
                if (this.spriteState.get('state')) {

                    switch (this.spriteState.get('direction')) {
                    case C.LEFT:
                        pos = Math.max(0, pos - MOVESPEED * delta);
                        break;
                    case C.RIGHT:
                        pos = Math.min(MAP_WIDTH, pos + MOVESPEED * delta);
                        break;
                    }
                }

                var height = this.spriteState.get('height'),
                    jumpVel = this.spriteState.get('jumpVel');

                if (height + jumpVel < 0) {
                    this.spriteState.set('jumping', false);
                    this.spriteState.set('height', 0);
                    
                    if (this.spriteState.get('state') !== 0) {
                        this.spriteState.set('key', this.spriteState.get('direction'));
                    }
                } else {
                    this.spriteState.set('height', height + jumpVel);
                    this.spriteState.set('jumpVel', jumpVel - GRAVITY_DECEL);
                }

                moved = false;
            } else {
                switch (this.spriteState.get('key')) {
                case C.LEFT:
                    pos = Math.max(0, pos - MOVESPEED * delta);
                    this.spriteState.set('direction', C.LEFT);
                    break;
                case C.RIGHT:
                    pos = Math.min(MAP_WIDTH, pos + MOVESPEED * delta);
                    this.spriteState.set('direction', C.RIGHT);
                    break;
                case C.UP:
                case C.ACTION:
                    this.spriteState.set('jumping', true);
                    this.spriteState.set('jumpVel', JUMP_VEL);
                    moved = false;
                    break;
                default:
                    moved = false;
                    break;
                }
            }

            this.spriteState.set('position', pos);

            if (moved && time - this.spriteState.get('stateChange') > 100) {
                this.spriteState.set('state', 1 + (this.spriteState.get('state') % 3));
                this.spriteState.set('stateChange', time);
            }

            this.lastFrame = time;
            requestAnimationFrame(_.bind(this.onFrame, this));
        },
        
        renderInit: function() {
            this.$el.html(this.template());
        },

        render: function() {
            this.$mario = this.$('.mario');

            var pos = this.spriteState.get('position');
            var left = 0;
            var width = this.$el.width();
            var middle = width / 2 - 20;
            if (pos < middle || width === 0) {
                left = pos;
            } else if (MAP_WIDTH - pos < middle + 40) {
                left = width - (MAP_WIDTH - pos);
            } else {
                left = middle;
                this.$('#map').css('left', middle - pos);
            }

            var top = MARIO_YPOS - this.spriteState.get('height');
            this.$mario.css({
                left: left,
                top: top
            });

            this.$mario.attr('class', 'mario');

            this.$('input, textarea').each(_.bind(function(index, el) {
                var yDist = Math.abs(top - (this.$el.height() - parseInt($(el).css('bottom'), 10)));
                var xDist = pos - $(el).position().left;
                
                if (yDist < 1 && xDist > 0 && xDist < $(el).width()) {
                    if (el.type == 'submit' && !this.spriteState.get('mailed')) {
                        var data = new FormData(this.$('form')[0]);
                        $.ajax({
                            url: 'mail.php',
                            data: data,
                            processData: false,
                            contentType: false,
                            type: 'POST'
                        });

                        this.$('input, textarea').fadeOut(100, _.bind(function() {
                            this.$('#message').fadeIn(100);
                        }, this));

                        this.spriteState.set('mailed', true);
                    } else {
                        $(el).focus();
                    }
                }
            }, this));

            if (this.spriteState.get('jumping')) {
                this.$mario.addClass('mario-jump' + this.spriteState.get('direction'));
            } else {
                this.$mario.addClass('mario-' + this.spriteState.get('direction') + this.spriteState.get('state'));
            }
            
            return this;
        }

    });

});
