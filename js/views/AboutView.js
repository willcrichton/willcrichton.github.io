define(function(require) {
    'use strict';

    var 
    _        = require('Underscore'),
    Backbone = require('Backbone'),
    C        = require('constants'),
    template = require('text!templates/about.tpl');

    var AboutState = Backbone.Model.extend({
        defaults: {section: 0}
    });

    return Backbone.View.extend({

        id: 'about',

        instructions: 'Click the down arrow for more',

        initialize: function() {
            this.template = _.template(template);
            this.model = new AboutState();
            this.renderInit();
            this.render();
            this.listenTo(this.model, 'change', this.render);
        },

        controlDown: function(key) {
            switch(key) {
            case C.ACTION:
            case C.DOWN:
                this.increment();
                break;
            case C.UP:
                this.decrement();
                break;
            }
        },

        increment: function() {
            this.model.set('section', Math.min(this.model.get('section') + 1, this.$('.section').length - 1));
        },

        decrement: function() {
            this.model.set('section', Math.max(this.model.get('section') - 1, 0));
        },

        renderInit: function() {
            this.$el.html(this.template());

            this.$('#arrow-down').bind('click.about', _.bind(function(e) {
                e.preventDefault();
                this.increment();
            }, this));

            this.$('#arrow-up').bind('click.about', _.bind(function(e) {
                e.preventDefault();
                this.decrement();
            }, this));
        },

        render: function() {
            this.$('#text').animate({
                scrollTop: $(this.$('.section')[this.model.get('section')]).position().top + this.$('#text').scrollTop()
            }, 'fast');

            if (this.model.get('section') == 0) {
                this.$('#arrow-up').fadeOut(100);
            } else {
                this.$('#arrow-up').fadeIn(100);
            }

            if (this.model.get('section') == this.$('.section').length - 1) {
                this.$('#arrow-down').fadeOut(100);
            } else {
                this.$('#arrow-down').fadeIn(100);
            }

            return this;
        }

    });

});
