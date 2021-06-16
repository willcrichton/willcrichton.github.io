function GUI(initialReqs, initialKeys) {

	this.fingerNames = ['thumb', 'pointer', 'middle', 'ring', 'pinkie'];
	this.colorNames = ['red', 'blue', 'green', 'yellow'];

	this.reqButtons = [null, null, null, null, null]; //one button per finger

	this.key2div = {};

	this.drawKeys($('#keyboard'));
	this.createReqs(initialReqs);
	this.showInitialKeys(initialKeys);

	this.correctNoise = new Audio('audio/correct.mp3');
	this.wrongNoise = new Audio('audio/wrong.mp3');

	this.hideTimer();
}


GUI.prototype.drawKeys = function (keyboard) {
	keyboard.html('');
	for (var i = 0; i < KEYS.length; i++) {
		var row = $("<div class='keyboard-row'></div>");
		row.addClass('row-' + i); // add special class per row
		keyboard.append(row);
		for (var j = 0; j < KEYS[0].length; j++) {
			var button = $("<div class='keyboard-button'></div>");
			button.text(KEYS[i][j]); // set button text
			button.addClass('color-' + KEY_COLORS[i][j]) // set class based on color

			row.append(button);
			this.key2div[KEYS[i][j]] = button; // update internal map of keys to buttons
		}
	}
}

// state is a boolean
GUI.prototype.setKey = function (key, state) {
	var el = this.key2div[key];

	if (!el) return;
	
	if (state) {
		var cx = el.width()/2;
		var cy = el.height()/2

		// animate
		el.addClass('pressed');
		el.find("svg").remove();
  		el.append('<svg><circle cx="'+cx+'" cy="'+cy+'" r="'+0+'"></circle></svg>');
	  	var c = el.find("circle");
	  	c.animate(
		    {
		      "r" : el.outerWidth()
		    },
		    {
		      easing: "easeInQuad",
		      duration: 300,
		        step : function(val){
		                c.attr("r", val);
		            }
		    }
	    );
	} else {
		el.removeClass('pressed')
		el.find("svg").remove();
	}
}


GUI.prototype.createReqs = function(reqs) {
	var container = $('#requirements');
	container.html('');

	for (var finger = 0; finger < FINGERS; finger++) {
		var el = $("<div class='finger-req'>" + 
						"<div class='finger-name'>" +
						"</div>" +
						"<div class='finger-req-button'>" +
						"</div>" +
					"</div>");
		el.find(".finger-name").text(this.fingerNames[finger]);
		el.find('.finger-req-button').addClass('color-'+reqs[finger]);
		container.append(el);

		this.reqButtons[finger] = el;
	}
}


GUI.prototype.showText = function (text) {
	$("#text-output").removeClass('instr-text')
					 .addClass('general-text').text(text);
}


GUI.prototype.newInstruction = function(finger, color) {
	var output = $("#text-output");
	output.removeClass('general-text');
	output.addClass('instr-text').text('');

	var fingerName = this.fingerNames[finger];
	var colorName = this.colorNames[color];
	output.html("<span class='instr'>Instruction</span>:   " +
				" <span class='finger-name'></span> finger on" +
				" <span class='color-name'></span>");

	output.find('.finger-name').text(fingerName);
	output.find('.color-name').text(colorName).addClass('text-color-'+color);

	// clear req button animations
	$('.finger-req').removeClass('active');

	// set new instr
	var el = this.reqButtons[finger];
	el.addClass('active');
	el.find('.finger-req-button').removeClass('color-0 color-1 color-2 color-3')
								 .addClass('color-'+color);
}


GUI.prototype.hideTimer = function () {
	var timer = $("#timer").removeClass('orange red');
	timer.hide();
}

// time in seconds
GUI.prototype.setTimer = function(time) {
	var timer = $("#timer").removeClass('orange red');
	timer.show();

	timer.find(".time").text(time);

	if (time <= 1.0) {
		timer.addClass('red');
	} else if (time <= 2.0) {
		timer.addClass('orange');
	}
}


GUI.prototype.playCorrectNoise = function() {
	this.correctNoise.play();
}


GUI.prototype.playWrongNoise = function (){
	this.wrongNoise.play();
}


GUI.prototype.showGameOver = function() {
	console.log('gameOver');
	window.alert("Game Over");
}


GUI.prototype.showInitialKeys = function(initialKeys) {
	this.hideInitialKeys();
	
	var container = $('#requirements');	
	var reqs = container.find('.finger-req-button');

	for (var i = 0; i < FINGERS; i++) {
		var text = $("<div class='initial-req-key'></div>");
		text.html(initialKeys[i]);
		$(reqs[i]).append(text);
	}

}


GUI.prototype.hideInitialKeys = function () {
	var container = $('#requirements');	
	var texts = container.find('.initial-req-key');
	texts.remove();
}








