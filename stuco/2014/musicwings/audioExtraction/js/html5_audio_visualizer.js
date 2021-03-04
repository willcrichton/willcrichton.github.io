/*
 * An audio spectrum visualizer built with HTML5 Audio API
 * Author:Wayou
 * License:feel free to use but keep refer pls!
 * Feb 15, 2014
 * For more infomation or support you can :
 * view the project page:https://github.com/Wayou/HTML5_Audio_Visualizer/
 * view online demo:http://wayouliu.duapp.com/mess/audio_visualizer.html
 */


window.onload = function() {
    new Visualizer().ini();
};
var Visualizer = function() {
    this.file = null; //the current file
    this.fileName = null; //the current file name
    this.audioContext = null;
    this.source = null; //the audio source
    this.info = document.getElementById('info').innerHTML; //this used to upgrade the UI information
    this.infoUpdateId = null; //to sotore the setTimeout ID and clear the interval
    this.animationId = null;
    this.status = 0; //flag for sound is playing 1 or stopped 0
    this.forceStop = false;
    this.allCapsReachBottom = false;
    this.terrainData = [];
    this.oldY = 0;
    this.inputRec = new Array(audio.width);
    this.active = false;
};
Visualizer.prototype = {
    ini: function() {
        this._prepareAPI();
        this._addEventListener();
    },
    _prepareAPI: function() {
        //fix browser vender for AudioContext and requestAnimationFrame
        window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;
        window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame;
        window.cancelAnimationFrame = window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || window.msCancelAnimationFrame;
        try {
            this.audioContext = new AudioContext();
        } catch (e) {
            this._updateInfo('!Your browser does not support AudioContext', false);
            console.log(e);
        }
    },
    _addEventListener: function() {
        var that = this,
            audioInput = document.getElementById('uploadedFile'),
            dropContainer = document.getElementsByTagName("canvas")[0];
        //listen the file upload
        audioInput.onchange = function() {
            if (that.audioContext===null) {return;};

            //the if statement fixes the file selection cancel, because the onchange will trigger even the file selection been canceled
            if (audioInput.files.length !== 0) {
                //only process the first file
                that.file = audioInput.files[0];
                that.fileName = that.file.name;
                if (that.status === 1) {
                    //the sound is still playing but we upload another file, so set the forceStop flag to true
                    that.forceStop = true;
                };
                document.getElementById('fileWrapper').style.opacity = 1;
                that._updateInfo('Uploading', true);
                // once the file is ready,start the visualizer
                // lock the choice
                audioInput.disabled = true;
                that._start();
            };
        };
        //listen the drag & drop
        dropContainer.addEventListener("dragenter", function() {
            document.getElementById('fileWrapper').style.opacity = 1;
            that._updateInfo('Drop it on the page', true);
        }, false);
        dropContainer.addEventListener("dragover", function(e) {
            e.stopPropagation();
            e.preventDefault();
            //set the drop mode
            e.dataTransfer.dropEffect = 'copy';
        }, false);
        dropContainer.addEventListener("dragleave", function() {
            document.getElementById('fileWrapper').style.opacity = 0.2;
            that._updateInfo(that.info, false);
        }, false);
        dropContainer.addEventListener("drop", function(e) {
            e.stopPropagation();
            e.preventDefault();
            if (that.audioContext===null) {return;};
            document.getElementById('fileWrapper').style.opacity = 1;
            that._updateInfo('Uploading', true);
            //get the dropped file
            that.file = e.dataTransfer.files[0];
            if (that.status === 1) {
                document.getElementById('fileWrapper').style.opacity = 1;
                that.forceStop = true;
            };
            that.fileName = that.file.name;
            //once the file is ready,start the visualizer
            QueueConsumer._eat();
            that._start();
        }, false);
    },
    _start: function() {
        //read and decode the file into audio array buffer 
        var that = this,
            file = this.file,
            fr = new FileReader();
        fr.onload = function(e) {
            var fileResult = e.target.result;
            var audioContext = that.audioContext;
            if (audioContext === null) {
                return;
            };
            that._updateInfo('Decoding the audio...', true);
            audioContext.decodeAudioData(fileResult, function(buffer) {
                that._updateInfo('Decoded successfully', true);
                that._visualize(audioContext, buffer);
            }, function(e) {
                that._updateInfo('!Fail to decode the file', false);
                console.log(e);
            });
        };
        fr.onerror = function(e) {
            that._updateInfo('!Fail to read the file', false);
            console.log(e);
        };
        //assign the file to the reader
        this._updateInfo('Starting read the file', true);
        fr.readAsArrayBuffer(file);
    },
    _visualize: function(audioContext, buffer) {
        this.setActive();
        var audioBufferSouceNode = audioContext.createBufferSource(),
            analyser = audioContext.createAnalyser(),
            firstDelay = audioContext.createDelay(),
            secondDelay = audioContext.createDelay(),
            thirdDelay = audioContext.createDelay(),
            fourthDelay = audioContext.createDelay(),
            fifthDelay = audioContext.createDelay(),
            that = this;
        firstDelay.delayTime.value = 100.0;
        secondDelay.delayTime.value = 100.0;
        thirdDelay.delayTime.value = 100.0;
        fourthDelay.delayTime.value = 100.0;
        fifthDelay.delayTime.value = 100.0;
        
        //connect the source to the analyser
        //audioBufferSouceNode.connect(analyser);
        //audioBufferSouceNode.connect(delay);
        
        //delay the sound from the delay to the output
        //analyser.connect(delay);
        //delay.connect(audioContext.destination);
        
        //connect the analyser to the destination(the speaker), or we won't hear the sound
        //analyser.connect(audioContext.destination);
        //then assign the buffer to the buffer source node
        audioBufferSouceNode.buffer = buffer;
        //play the source
        if (!audioBufferSouceNode.start) {
            audioBufferSouceNode.start = audioBufferSouceNode.noteOn //in old browsers use noteOn method
            audioBufferSouceNode.stop = audioBufferSouceNode.noteOff //in old browsers use noteOn method
        };
        //stop the previous sound if any
        if (this.animationId !== null) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.source !== null) {
            this.source.stop(0);
        }

        audioBufferSouceNode.start();
        // Start streaming to the analyser
        audioBufferSouceNode.connect(analyser);
        // Delay the actual sound output
        audioBufferSouceNode.connect(firstDelay);
        firstDelay.connect(secondDelay);
        secondDelay.connect(thirdDelay);
        thirdDelay.connect(fourthDelay);
        fourthDelay.connect(fifthDelay);
        //audioBufferSouceNode.connect(audioContext.destination); // Purely for sound calibration - disable when actually using
        fifthDelay.connect(audioContext.destination);
        this.status = 1;
        this.source = audioBufferSouceNode;
        audioBufferSouceNode.onended = function() { /** WARNING: song immediately stops playing due to delay time **/
            that._audioEnd(that);
        };
        this._updateInfo('Playing ' + this.fileName, false);
        this.info = 'Playing ' + this.fileName;
        document.getElementById('fileWrapper').style.opacity = 1;
        this.propogateQueue(analyser);
        //this._drawSpectrum(analyser);
    },
    propogateQueue: function (analyser) {
        var that = this,
            canvas = document.getElementById('audio'),
            cwidth = canvas.width,
            cheight = canvas.height - 2,
            meterWidth = 10, //width of the meters in the spectrum
            gap = 2, //gap between meters
            capHeight = 2,
            capStyle = '#fff',
            meterNum = 800 / (10 + 40), //count of the meters
            capYPositionArray = []; ////store the vertical position of the caps for the preivous frame

        var calcHeights = function () {
            var array = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(array);
            if (that.status === 0) {
                //fix when some sounds end the value still not back to zero
                for (var i = array.length - 1; i >= 0; i--) {
                    array[i] = 0;
                };
                allCapsReachBottom = true;
                for (var i = capYPositionArray.length - 1; i >= 0; i--) {
                    allCapsReachBottom = allCapsReachBottom && (capYPositionArray[i] === 0);
                };
                if (allCapsReachBottom) {
                    cancelAnimationFrame(that.animationId); //since the sound is stoped and animation finished, stop the requestAnimation to prevent potential memory leak,THIS IS VERY IMPORTANT!
                    return;
                };
            };
            var step = Math.round(array.length / meterNum); //sample limited data from the total array
            
            // Begin height calculations:
            var yVal = 0,
                avgY = 0,
                bassAvg = 0,
                midAvg = 0,
                uprAvg = 0;

            for (var i = 0; i < meterNum; i++) {
                var value = array[i * step];

                // Calculating our averages
                if(i <= 2) {
                    bassAvg = bassAvg + value;
                    if (i === 2) {
                        bassAvg = bassAvg / 3;
                    }
                }
                else if (i <= 11){
                    midAvg = midAvg + value;
                    if (i === 11) {
                        midAvg = midAvg / 9;
                    }
                }
                else {
                    uprAvg = uprAvg + value;
                    if (i === meterNum - 1) {
                        uprAvg = uprAvg / 4;
                    }
                }
            }
            that.oldY = yVal;
            //yVal = bassAvg * 0.3 + midAvg * 0.10 + uprAvg * 0.35;
            yVal = bassAvg * 0.325 + midAvg * 0.175 + uprAvg * 0.10;
            avgY = (that.oldY === 0) ? yVal : ((that.oldY + yVal) / 2);
            if(avgY < 0.0) {
                avgY = 0.0;
            }
            else if (avgY > 100.0) {
                avgY = 100.0;
            }
            //avgY = yVal;

            that.inputRec.shift();
            that.inputRec.push(avgY);
            // Add this to the member queue
            that.terrainData.push(avgY);

            //console.log(that.terrainData[that.terrainData.length-1]);
        }
        setInterval(calcHeights, 60);
    },
    _drawSpectrum: function(analyser) {
        var that = this,
            canvas = document.getElementById('canvas'),
            cwidth = canvas.width,
            cheight = canvas.height - 2,
            meterWidth = 10, //width of the meters in the spectrum
            gap = 2, //gap between meters
            capHeight = 2,
            capStyle = '#fff',
            meterNum = 800 / (10 + 40), //count of the meters
            capYPositionArray = []; ////store the vertical position of the caps for the preivous frame
        ctx = canvas.getContext('2d'),
        gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(1, '#00f');
        gradient.addColorStop(0.5, '#0ff');
        gradient.addColorStop(0, '#0f0');
        var drawMeter = function() {
            var array = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(array);
            if (that.status === 0) {
                //fix when some sounds end the value still not back to zero
                for (var i = array.length - 1; i >= 0; i--) {
                    array[i] = 0;
                };
                allCapsReachBottom = true;
                for (var i = capYPositionArray.length - 1; i >= 0; i--) {
                    allCapsReachBottom = allCapsReachBottom && (capYPositionArray[i] === 0);
                };
                if (allCapsReachBottom) {
                    cancelAnimationFrame(that.animationId); //since the sound is stopped and animation finished, stop the requestAnimation to prevent potential memory leak,THIS IS VERY IMPORTANT!
                    return;
                };
            };
            var step = Math.round(array.length / meterNum); //sample limited data from the total array
            ctx.clearRect(0, 0, cwidth, cheight);
            
            // Begin height calculations:
            var yVal = 0,
                avgY = 0,
                bassAvg = 0,
                midAvg = 0,
                uprAvg = 0;

            for (var i = 0; i < meterNum; i++) {
                var value = array[i * step];

                // Calculating our averages
                if(i <= 2) {
                    bassAvg = bassAvg + value;
                    if (i === 2) {
                        bassAvg = bassAvg / 3;
                    }
                }
                else if (i <= 11){
                    midAvg = midAvg + value;
                    if (i === 11) {
                        midAvg = midAvg / 9;
                    }
                }
                else {
                    uprAvg = uprAvg + value;
                    if (i === meterNum - 1) {
                        uprAvg = uprAvg / 4;
                    }
                }
            }
            that.oldY = yVal;
            //yVal = bassAvg * 0.3 + midAvg * 0.10 + uprAvg * 0.35;
            yVal = bassAvg * 0.325 + midAvg * 0.175 + uprAvg * 0.10;
            avgY = (that.oldY === 0) ? yVal : ((that.oldY + yVal) / 2);
            //avgY = yVal;

            that.inputRec.shift();
            that.inputRec.push(avgY);
            // Add this to the member queue
            that.terrainData.push(avgY);

            for (var i = 0; i < that.inputRec.length; i++) {
                ctx.fillStyle = (i % 2 === 0) ? "#FF0000" : "#0000FF";
                ctx.fillRect(i, cheight - that.inputRec[i], i, cheight);
            }

            //console.log (avgY);

            that.animationId = requestAnimationFrame(drawMeter);
        }
        this.animationId = requestAnimationFrame(drawMeter);
    },
    _audioEnd: function(instance) {
        if (this.forceStop) {
            this.forceStop = false;
            this.status = 1;
            return;
        };
        this.status = 0;
        var text = 'HTML5 Audio API showcase | An Audio Viusalizer';
        document.getElementById('fileWrapper').style.opacity = 1;
        document.getElementById('info').innerHTML = text;
        instance.info = text;
        document.getElementById('uploadedFile').value = '';
    },
    _updateInfo: function(text, processing) {
        var infoBar = document.getElementById('info'),
            dots = '...',
            i = 0,
            that = this;
        infoBar.innerHTML = text + dots.substring(0, i++);
        if (this.infoUpdateId !== null) {
            clearTimeout(this.infoUpdateId);
        };
        if (processing) {
            //animate dots at the end of the info text
            var animateDot = function() {
                if (i > 3) {
                    i = 0
                };
                infoBar.innerHTML = text + dots.substring(0, i++);
                that.infoUpdateId = setTimeout(animateDot, 250);
            }
            this.infoUpdateId = setTimeout(animateDot, 250);
        };
    },
    getTerrainData: function () {
        return this.terrainData;
    },
    setActive: function () {
        this.active = true;
    },
    getActive: function () {
        return this.active;
    }
}
