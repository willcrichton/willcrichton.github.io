/***************************************
 * FINAL GAME for 98232 Web Games Stuco
 * written by Brianna Pritchett, bpritche
 * Joseph Choi, jchoi1
 * Fall 2013
 * Audio visualizer
 ***************************************/
 
/** Partial starter code taken from multiple tutorial websites, including:
 * http://slid.es/willcrichton/week6
 * http://www.html5rocks.com/en/tutorials/webaudio/intro/
 * http://www.w3.org/TR/webaudio/
 * http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
 * http://ianreah.com/js/Real-time-frequency-analysis-of-streaming-audio-data/main.js
 * http://ianreah.com/2013/02/28/Real-time-analysis-of-streaming-audio-data-with-Web-Audio-API.html
 * http://creativejs.com/resources/web-audio-api-getting-started/
 **/
 
//OPEN NEW CONTEXT //
/* context.destination is assumed to be the speakers
 *  - maxChannelCount and channelCount will remain at their default 
 *    values.
 */ 
var context;

function init() {
    if(typeof AudioContext !== "undefined") {
	context = new AudioContext();
    } else if(typeof webkitAudioContext !== "undefined") {
	context = new webkitAudioContext();
    } else {
	$(".hideIfNoApi").hide();
	$(".showIfNoApi").show();
	return;
    }
    
}

// REQUEST ANIMATION FRAME //
/* To completely and totally honest, I have no idea how to break this 
 *  apart.  I know what the overall thing does but for the moment I don't
 *  know what I'm doing.
 * http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
 */
var lastTime = 0;
var vendors = ['webkit', 'moz', 'ms', 'o'];
for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x] + 
					  'RequestAnimationFrame'];
    window.cancelAnimationFrame = 
	window[vendors[x] + 'CancelAnimationFrame'] ||
	window[vendors[x] + 'CancelRequestAnimationFrame'];
}

if(!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback, element) {
	var currTime = new Date().getTime();
	var timeToCall = Math.max(0, 16 - (currTime - lastTime));
	var id = window.setTimeout(function() {
		callback(currTime + timeToCall);
	    }, timeToCall);
	lastTime = currTime + timeToCall;
	return id;
    };
}

if(!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function(id) {
	clearTimeout(id);
    };
}


// LOADING SOUNDS //
/* We want to create a MediaElementAudioSourceNode, since that does a 
 *  nice job of dealing with the longer audio files.  Presumably that's
 *  what we'll be dealing with.
 */

/* requestSound
 * 
 * This function takes a url and makes an HTTP request to get the sound, 
 *  loading it in
 */
function requestSound(url) {
    //Open up a new sound
    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responsetype = "arraybuffer";

    //Make an asynchronous callback
    request.onload = function() {
	var audioData = request.response;
	createSoundSource(audioData);
    }
    request.send();
}

/* createSoundSource
 * 
 * This takes the response body from the HTTP request made below and
 *  creates a buffer, adds it to our object, and connects the new source to
 *  the destination.
 */
function createSoundSource(audioData) {
    soundSource = context.createBufferSource();

    //Create source buffer
    soundBuffer = context.createBuffer(audioData, true);

    //Add buffered data to the soundBuffer object
    soundSource.buffer = soundBuffer;

    //Connect source to destination, which we assume to be the speakers.
    soundSource.connect(context.destination;);
}


var mediaElement = document.getElementById('mediaElementID');
var sourceNode = context.createMediaElementSource(mediaElement);
sourceNode.connect(filterNode);
    
// PLAY SOUNDS //
function playSound(buffer) {
    //create an AudioBufferSourceNode
    var source = context.createBufferSource();
    //Tell them we want to play the song we just gave them
    source.buffer = buffer;
    //connect the source to the context's destination
    source.connect(context.destination);
    //PLAY source now
    source.noteOn(0);
}
