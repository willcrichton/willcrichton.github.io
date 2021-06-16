define(function(require) {
    'use strict';

    var NUM_FRAGMENTS = 10;
    var EXPLOSION_RADIUS = 300;

    function rand() {
        return Math.random() * (2 * EXPLOSION_RADIUS) - EXPLOSION_RADIUS;
    }

    function explode(x, y) {
    	//I'm going to put this into a separate variable so that we 
    	// can find other ways of managing it.  Later, we may want to
    	// vary duration based on the tempo of the music
    	var duration = 'slow';
    	
        //Mod by 0xffffff;
        for (var i = 0; i < 20; i++) {
            var $div = $('<div id="frag1" class="fragment"></div>');
            $('body').append($div);

            $div.css({
                left: x,
                top: y,
            });

			var time = ((new Date()).getTime() * 50) % 16777215;
			var color = '#' + time.toString(16);
			//console.log(color);
            $div.css('background', color);
            
            $div.animate({
            	width: '-=10',
            	height: '-=10',
                left: '+=' + rand(),
                top: '+=' + rand(),
                opacity: '-=1'
            }, duration, function() {
                $(this).remove();
            });
        }
    }

    return explode;
});
