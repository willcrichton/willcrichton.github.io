/*jshint multistr: true */
define(function(require) {
    'use strict';

    var
    $        = require('jQuery'),
    _        = require('Underscore'),
    C        = require('constants'),
    Backbone = require('Backbone'),
    template = require('text!templates/portfolio.tpl'),
    projectTpl = require('text!templates/project.tpl');

    var Sprite = Backbone.Model.extend({
        defaults: {
            direction: C.DOWN,
            state: 0,
            position: [135, 170],
            stateChange: 0,
            swording: false,
            key: '',
            chestOpen: false
        }
    });

    var projects = [
        {
            x: 150, y: 60,
            title: 'Lantern',
            body: _.template(require('text!templates/portfolio/lantern.tpl'))()
        },
        {
            x: 50, y: 180,
            title: 'WebGL',
            body: 'I\'ve been working with WebGl/Three.js for some time now. I taught a course on basic 3D web applications at CMU and was a technical reviewer for the book "Learning Three.js."\
<br /><br />For the last two years, I\'ve been maintaining a framework for game creation on the web &mdash; Glen. <br /><br /><a target="_blank" href="http://github.com/willcrichton/glen">github.com/wilcrichton/glen</a><br /><br />I\'ve also developed 2D applications using Paper.js, like a <a href="http://willcrichton.net/music/" target="_blank">music visualizer</a>.'
        },
        {
            x: 300, y: 220,
            title: 'Seven Wonders',
            body: 'As a fun side project, I implemented the popular Seven Wonders board game as a web application using PHP.\
<a target="_blank" href="http://github.com/willcrichton/sevenwonders"><img src="images/sevenwonders.png" style="margin: 10px auto; display: block"/></a>',
        },
        {
            x: 300, y: 70,
            title: 'Utilikilt',
            body: '<div style="float:left;width:220px;margin-right:10px;"><p>To learn iOS programming and to help the CMU community, I developed and published a free iPhone app called <a href="https://itunes.apple.com/us/app/utilikilt/id793591989" target="_blank">Utilikilt</a> which automates the retrieval of grades and course schedule into a simple mobile interface.</p></div><img src="http://a2.mzstatic.com/us/r30/Purple6/v4/5b/30/94/5b3094b1-4a4f-d0ff-a372-cb4924155947/screen568x568.jpeg" height="170">'
        }
    ];

    var objects = [
        {x1: 44, y1: 41, x2: 135, y2: 150},
        {x1: 40, y1: 225, x2: 144, y2: 272},
        {x1: 225, y1: 119, x2: 274, y2: 161},
        {x1: 207, y1: 4, x2: 291, y2: 31},
        {x1: 358, y1: 44, x2: 402, y2: 160}
    ]

    var MOVESPEED = 100;
    var CHEST_WIDTH = 32;
    var CHEST_HEIGHT = 24;

    return Backbone.View.extend({

        id: 'portfolio',

        instructions: 'Arrow keys to move, space to open chests',

        initialize: function() {
            this.template = _.template(template);
            this.sprite = new Sprite();
            this.lastFrame = 0;

            this.renderInit();

            $('#screen').click(function(e){
                console.log(e.offsetX, e.offsetY);
            });

            // create chests from projects list
            _.forEach(projects, function(project) {
                var $chest= $('<div class="chest chest-0"></div>');
                $chest.css({
                    top: project.y, left: project.x
                });
                this.$el.append($chest);
                project.$sprite = $chest;
                $chest.click(_.bind(function() {
                    this.openProject(project);
                }, this));
            }, this);

            // rerender sprites on model change
            this.listenTo(this.sprite, 'change', this.render);

            // start animation loop
            requestAnimationFrame(_.bind(this.onFrame, this));
        },

        controlDown: function(key) {
            this.sprite.set('key', key);
        },

        controlUp: function() {
            this.sprite.set({
                state: 0,
                key: '',
                swording: false
            });
        },

        clamp: function(a, b, c) {
            if (a < b) return b;
            else if (a > c) return c;
            return a;
        },

        bounds: function(x, y, w, h) {
            return {
                x1: x,
                y1: y,
                x2: x + w,
                y2: y + h
            }
        },

        intersect: function(r1, r2) {
            return r1.x1 < r2.x2 && r1.x2 > r2.x1 &&
                r1.y1 < r2.y2 && r1.y2 > r2.y1;
        },

        move: function(x, y) {
            var pos = this.sprite.get('position');
            var dir = this.sprite.get('direction');
            var newX = pos[0] + x;
            var newY = pos[1] + y;

            var sBounds = this.bounds(newX, newY, this.$sprite.width(), this.$sprite.height());

            var colliders = [];
            _.forEach(projects, function(project) {
                colliders.push(this.bounds(project.x, project.y, CHEST_WIDTH, CHEST_HEIGHT));
            }, this);

            colliders = colliders.concat(objects);

            _.forEach(colliders, function(bounds) {
                if (this.intersect(sBounds, bounds)) {
                    if (x != 0) {
                        if (dir == C.RIGHT) {
                            newX = bounds.x1 - this.$sprite.width();
                        } else {
                            newX = bounds.x2;
                        }
                    } else {
                        if (dir == C.DOWN) {
                            newY = bounds.y1 - this.$sprite.height();
                        } else {
                            newY = bounds.y2;
                        }
                    }
                }
            }, this);

            pos[0] = this.clamp(newX, 0, this.$el.width() - this.$sprite.width());
            pos[1] = this.clamp(newY, 0, this.$el.height() - this.$sprite.height());

            this.sprite.set('position', pos);
        },

        onFrame: function(time) {
            var delta = (time - this.lastFrame) / 1000;

            var key = this.sprite.get('key'),
                pos = this.sprite.get('position');

            switch (key) {
            case C.LEFT:
                this.move(-MOVESPEED * delta, 0);
                break;
            case C.RIGHT:
                this.move(MOVESPEED * delta, 0);
                break;
            case C.UP:
                this.move(0, -MOVESPEED * delta);
                break;
            case C.DOWN:
                this.move(0, MOVESPEED * delta);
                break;
            case C.SPACE:
            case C.ENTER:
                this.sprite.set('swording', true);
                break;
            }

            if (key !== '' && key !== C.SPACE && key !== C.ENTER) {
                this.sprite.set('direction', key);

                if (time - this.sprite.get('stateChange') > 100) {
                    this.sprite.set('state', 1 + (this.sprite.get('state') % 2));
                    this.sprite.set('stateChange', time);
                }
            }

            this.render();

            this.lastFrame = time;
            requestAnimationFrame(_.bind(this.onFrame, this));
        },

        openProject: function(project) {
            if (project.opened) {
                this.sprite.set('chestOpen', true);
                this.$('#overlay').css('display', 'block');
                this.$('#overlay').html(_.template(projectTpl)(project));
                this.$('#back').click(_.bind(function(e){
                    e.preventDefault();
                    this.sprite.set('chestOpen', false);
                    this.$('#overlay').css('display', 'none');
                }, this));
                return;
            }

            var $sprite = project.$sprite;
            $sprite.addClass('chest-1');
            $sprite.css({top: '-=5'});

            setTimeout(function() {
                $sprite.addClass('chest-2');
                $sprite.css({top: '-=4'});
            }, 200);
            setTimeout(function() {
                $sprite.addClass('chest-3');
                $sprite.css({top: '-=5'});
            }, 400);
            setTimeout(_.bind(function() {
                this.$('#overlay').css('display', 'block');
                this.$('#overlay').html(_.template(projectTpl)(project));
                this.$('#back').click(_.bind(function(e){
                    e.preventDefault();
                    this.sprite.set('chestOpen', false);
                    this.$('#overlay').css('display', 'none');
                }, this));
            }, this), 800);

            this.sprite.set('chestOpen', true);
            project.opened = true;
        },

        renderInit: function() {
            this.$el.html(this.template());
            this.$sprite = this.$('#sprite');

            return this;
        },

        render: function() {
            var state;
            if (this.sprite.get('swording')) {
                state = 'sword' + this.sprite.get('direction');
            } else {
                state = this.sprite.get('direction') + this.sprite.get('state');
            }

            var pos = this.sprite.get('position');
            var x = pos[0] + (state == 'swordleft' ? -13 : 0);
            var y = pos[1] + (state == 'swordup' ? -10 : 0);
            this.$sprite.css({
                left: x + 'px',
                top: y + 'px'
            });

            var isIn = function(a, b, c) {
                return a[0] >= b[0] && a[0] <= c[0] &&
                    a[1] >= b[1] && a[1] <= c[1];
            };

            this.$sprite.removeClass().addClass('sprite-' + state);

            if (this.sprite.get('swording') && !this.sprite.get('chestOpen')) {
                _.forEach(projects, function(project) {
                    var b = [project.x - 5, project.y - 5], c = [project.x + 32 + 5, project.y + 24 + 5];
                    var w = this.$sprite.width(), h = this.$sprite.height();
                    if (isIn([x, y], b, c) ||
                        isIn([x + w, y], b, c) ||
                        isIn([x, y + h], b, c) ||
                        isIn([x + w, y + h], b, c))
                    {
                        this.openProject(project);
                    }
                }, this);
            }

            return this;
        }

    });

});