define(function(require) {
    'use strict';

    var 
    _        = require('Underscore'),
    Backbone = require('Backbone'),
    template = require('text!templates/home.tpl');

    return Backbone.View.extend({

        id: 'home',

        initialize: function() {
            this.template = _.template(template);
            this.render();
        },

        render: function() {
            this.$el.html(this.template());
            return this;
        }

    });

});
