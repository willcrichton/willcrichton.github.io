define(function(require) {
    'use strict';

    var Backbone = require('Backbone'),
        $        = require('jQuery');

    return Backbone.Router.extend({

        routes: {
            ''          : 'home',
            'research'  : 'research',
            'about'     : 'about',
            'contact'   : 'contact'
        },

        initialize: function() {
            this.currentView = null;
        },

        swapViews: function(View) {
            if (this.currentView) {
                this.currentView.remove();
            }

            var view = new View();
            $('#screen').html(view.render().el);
            this.currentView = view;

            this.trigger('changeView');
        },

        home: function() {
            this.swapViews(require('views/HomeView'));
        },

        research: function() {
            this.swapViews(require('views/PortfolioView'));
        },

        about: function() {
            this.swapViews(require('views/AboutView'));
        },

        contact: function() {
            this.swapViews(require('views/ContactView'));
        }
    });
});
