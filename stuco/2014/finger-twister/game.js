
function GAME() {
    //this.colors = {RED:0, BLUE:1, GREEN:2, YELLOW:3};
    //this.fingers = {THUMB:0, POINTER:1, MIDDLE:2, RING:3, PINKIE:4};
    this.colorReqs = {}; // finger -> color
    this.movingFinger = null; 
    this.movingColor = null; 
    this.timer = null; 
    this.timer = new Timer();

    this.initKeyDownListener = debounceCharDown(this.initKeyDown.bind(this));
    this.initKeyUpListener = debounceCharUp(this.initKeyUp.bind(this));
    this.keyDownListener = debounceCharDown(this.onKeyDown.bind(this));
    this.keyUpListener = debounceCharUp(this.onKeyUp.bind(this));

}


GAME.prototype.startGame = function () {
    // these are hardcoded... -.-
    if (FINGERS == 5) {
        // TODO fix these...
        this.initPositions = {'1':4,'W':3,'E':2,'R':1,'C':0,'9':4,'8':3,'U':2,'H':1,'M':0};
        this.colorReqs = {4: 0, 3: 3, 2: 0, 1: 1, 0: 0}
        this.gui = new GUI([0, 1, 0, 3, 0], ['C/M', 'R/H', 'E/U', 'W/8', '1/9']);
        this.gui.showText("To start the game, place fingers on 1WERC / MHU89 as shown above.");
    } else {
        this.initPositions = {'Q':1,'W':0, 'K':0,'O':1};
        this.colorReqs = {0: 3, 1: 2};
        this.gui = new GUI([3, 2], ['W/K', 'Q/O']);
        this.gui.showText("To start the game, place fingers on QW/ KO as shown above.");
    }

    this.pressedKeys = {}; 
    this.successfulRounds = 0;
    this.interval = 10000;

    window.removeEventListener("keydown", this.keyDownListener);
    window.removeEventListener("keyup", this.keyUpListener);

    window.addEventListener("keydown", this.initKeyDownListener);
    window.addEventListener("keyup", this.initKeyUpListener);
}


GAME.prototype.startCountdown = function() {
    this.gui.showText("Keep your fingers in place. Get ready to start!");

    this.timer.setIntervalCallback((function(time) {
        if (!this.equalKeys(this.initPositions, this.pressedKeys)) {
            this.timer.stopTimer();
            this.startGame();
        }

        this.gui.setTimer(time/1000);
    }).bind(this), 1000)

    this.timer.startTimer(3000, (function() {
        if (!this.equalKeys(this.initPositions, this.pressedKeys)) {
            this.timer.stopTimer();
            this.startGame();
        } else {
            window.setTimeout((function() {
                this.continueGame();
            }).bind(this), 0);
        }
    }).bind(this));

}


GAME.prototype.continueGame = function() {
    this.gui.playCorrectNoise();

    // remove initial setup event listeners
    window.removeEventListener("keydown", this.initKeyDownListener);
    window.removeEventListener("keyup", this.initKeyUpListener);

    this.gui.hideInitialKeys();
    this.hands = new Hands(this.initPositions);
    window.addEventListener("keydown", this.keyDownListener);
    window.addEventListener("keyup", this.keyUpListener);
    this.newRound();
}

GAME.prototype.equalKeys = function(pos1, pos2) {
    var x;
    for (x in pos1) {
        if (!(x in pos2)) {
            return false
        }
    }

    for (x in pos2) {
        if (!(x in pos1)) {
            return false
        }
    }
    return true;
}

GAME.prototype.initKeyDown = function(event) {
    var key = getChar(event.which);
    if (!(key in this.pressedKeys)) {
        this.gui.setKey(key, true);

        this.pressedKeys[key] = 0;
        if (this.equalKeys(this.initPositions, this.pressedKeys)) {
            this.startCountdown(); 
        }
    }
}

GAME.prototype.initKeyUp = function(event) {
    var key = getChar(event.which); 
    this.gui.setKey(key, false);

    delete this.pressedKeys[key]; 
}


GAME.prototype.timerFired = function() {
    var status = this.hands.verify(this.colorReqs);
    if (status) {
        console.log(this.hands.pressedKeys);
        this.gui.playCorrectNoise();
        window.setTimeout((function() {
            this.newRound();
        }).bind(this), 0);
    } else {
        this.gui.playWrongNoise();

        this.gameOver();
    }
}

GAME.prototype.newRound = function () {
    this.movingFinger = Math.floor(Math.random() * FINGERS);
    this.movingColor = Math.floor(Math.random() * COLORS);

    var oldColor = this.colorReqs[this.movingFinger];
    if (this.movingColor == oldColor) {
        this.movingColor = (oldColor + 1) % COLORS; 
    }

    this.colorReqs[this.movingFinger] = this.movingColor;
    this.hands.setInMotion(this.movingFinger, this.movingColor);
    this.successfulRounds++;

    if (this.successfulRounds % 3 == 0 && this.interval > 3000) {
        this.interval -= 1000;
        // TODO do a GUI animation for this
    }

    // gui stuff
    this.gui.newInstruction(this.movingFinger, this.movingColor);
    this.timer.setIntervalCallback(this.updateTimer.bind(this), 100);

    this.timer.startTimer(this.interval, this.timerFired.bind(this));
}

GAME.prototype.onKeyDown = function (event) {
    var key = getChar(event.which);
    if (!this.hands.isKeyPressed(key)) {
        this.gui.setKey(key, true);

        var status = this.hands.fingerPressed(key);
        if (!status) {
            this.gui.playWrongNoise();

            this.gameOver();
        }
    }
}

GAME.prototype.onKeyUp = function (event) {
    var key = getChar(event.which); 
    if (this.hands.isKeyPressed(key)) {
        this.gui.setKey(key, false);

        var status = this.hands.fingerReleased(key);
        if (!status) {
            this.gui.playWrongNoise();

            this.gameOver();
        }
    } else {
    }
}


GAME.prototype.updateTimer = function(time) {
    var rounded = Math.round(time/1000 * 10) / 10;
    this.gui.setTimer(rounded);
}


GAME.prototype.gameOver = function() {
    // some action to end game and potentially restart?
    // do something in the gui
    this.timer.stopTimer();

    this.gui.showGameOver();
    this.startGame();
}

