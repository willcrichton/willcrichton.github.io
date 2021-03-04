$(function() {    
    var animating = false;
    $('.profile').click(function() {
	if (animating) { return; }
	animating = true;
	var t = 0;
	var intvl = setInterval(function() {
	    $('.profile').css('transform', 'rotate(' + rot + 'deg)');
	    t += 5 / 60;
	    rot = 360 / (1 + Math.exp(-t));
	    if (t == 2) { 
		animating = false;
		clearInterval(intvl); 
	    }
	}, 5);
    });

});
