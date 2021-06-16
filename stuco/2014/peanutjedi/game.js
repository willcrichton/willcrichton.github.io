

paper.install(window);

/* How long the saber "trail" is */
var PATH_LENGTH = 4;

/* how far your saber can go in the timer interval before it plays
 * "swish" instead of "hummm" */
var THRESHOLD = 50;

/* amount of times a sound can be played over itself */
var CONCURRENT_SOUNDS = 5;

/* frames until another swing sound can be played */
var SWING_COOLDOWN = 12;
/* frames until another hum sound can be played */
var HUM_COOLDOWN = 20;

/* change of spawning a trainee every spawn */
var PADAWAN_CHANCE = 0.2;

/* how long the sub-peanuts are invicible after being released from the peanut shell */
/* otherwise, they'll imediately die */
var INV_COOLDOWN = 15;

var GRAVITY = 0.25;

var START_LIVES = 4;

var START_SPAWN = 20;

var gameOver = true;
var gameStarted = false;

/* the path of the lightsaber */
var myPath;

/* current position of the mouse */
var mousePoint;

var mouseClick;
var clicked;

/* Sounds */
/* Apparently you can't have a single Audio object playing over itself,
 * so create an array of sounds for each actual sound */
var hum = [];
var humIndex = 0;

var swing1 = [];
var swing1Index = 0;

var swing2 = [];
var swing2Index = 0;

var hit1 = [];
var hit1Index = 0;

var hit2 = [];
var hit2Index = 0;

var scream = [];
var screamIndex = 0;

var fail = [];
var failIndex = 0;

for (var i = 0; i < CONCURRENT_SOUNDS; i++)
{
    hum.push(new Audio('audio/hum.wav'));
    swing1.push(new Audio('audio/swing.wav'));
    swing2.push(new Audio('audio/swing2.wav'));
    var tempHit = new Audio('audio/hit1.wav');
    tempHit.volume = 0.5;
    hit1.push(tempHit);
    var tempHit2 = new Audio('audio/hit2.wav');
    tempHit2.volume = 0.5;
    hit2.push(tempHit2);
    scream.push(new Audio('audio/scream.wav'));
    fail.push(new Audio('audio/fail.mp3'));
}

/* sound cooldowns */
var swingTimer = 0;
var humTimer = 0;

/* how far your saber has moved since the last time step */
var sumDelta;

/* how long until the next spawn */
var nextSpawn = 10;

/* how fast things spawn */
var spawnRate = START_SPAWN;

var startButton;
var startButtonPath;
var titleText;
var startText;
var loseText;

/* whole peanuts (with shell) */
var peanutsWhole = [];
/* individual peanuts */
var peanutsInd = [];

/* trainees and their "parts" */
var padawans = [];
var padawanParts = [];

/* score and objects to the display the score */
var score = 0;
var scoreText;
var highScore = 0;
var highScoreText;

/* lives and images representing lives */
var lives;
var lifeImg = [];

function gameLoop() {
    /* update saber arc */
    myPath.add(mousePoint);
    myPath.removeSegment(0);
    
    /* play swoosh based on the speed */
    if (swingTimer <= 0)
    {
        if (sumDelta > THRESHOLD)
        {
            playSwing();
            swingTimer = SWING_COOLDOWN;
        }
    }
    else
    {
        swingTimer--;
    }
    
    /* play the hummm sound */
    if (humTimer <= 0)
    {
        playHum();
        humTimer = HUM_COOLDOWN;
    }
    else
    {
        humTimer--;
    }
    
    /* reset saber distance traveled */
    sumDelta = 0;
    
    if (nextSpawn <= 0)
    {
        /* spawn either trainee or peanut */
        if (Math.random() < PADAWAN_CHANCE)
        {
            var newPadawan = new Raster('img/youngling.png');
            newPadawan.position = new Point(Math.random()*(view.bounds.right-200) + 100, view.bounds.bottom);
            newPadawan.xVel = Math.random() * 10 - 5 - (newPadawan.position.x - view.bounds.right/2) / 200;
            newPadawan.yVel = -14;
            newPadawan.angVel = Math.random() * 4 - 2;
            newPadawan.hitBox = new Path.Rectangle(newPadawan.bounds);
            //debug
            //newPadawan.hitBox.fillColor = 'black';
            padawans.push(newPadawan);
        }
        else
        {
            var newPeanut = new Raster('img/whole_peanut_resized.png');
            newPeanut.position = new Point(Math.random()*(view.bounds.right-300) + 150, view.bounds.bottom);
            // make peanuts at the right go to the left and vice versa 
            newPeanut.xVel = Math.random() * 10 - 5 - (newPeanut.position.x - view.bounds.right/2) / 200;
            newPeanut.yVel = -14;
            newPeanut.angVel = Math.random() * 4 - 2;
            // Remember to remove() this 
            newPeanut.hitBox = new Path.Rectangle(newPeanut.bounds);
            //debug
            //newPeanut.hitBox.fillColor = 'black';
            peanutsWhole.push(newPeanut);
        }
        
        /* generate next spawn time and increase spawn rate */
        nextSpawn = Math.random() * 15 + 1000 / spawnRate;
        
        console.log(nextSpawn);
    }
    else
    {
        /* if not time to spawn, count down */
        nextSpawn--;
    }
    
    spawnRate = spawnRate + 0.025;

    /* Next loops are pretty much the same.
     * If the object is off the bottom of the screen, remove it.
     * Otherwise, update it's position and rotation based on physics */
    
    for (var i = 0; i < padawanParts.length; i++)
    {
        if (padawanParts[i].position.y > view.bounds.bottom)
        {
            padawanParts[i].remove();
            padawanParts.splice(i, 1);
        }
        else
        {
            padawanParts[i].position.x = padawanParts[i].position.x + padawanParts[i].xVel;
            padawanParts[i].position.y = padawanParts[i].position.y + padawanParts[i].yVel;
            padawanParts[i].rotate(padawanParts[i].angVel);
            padawanParts[i].yVel = padawanParts[i].yVel + GRAVITY;

        }
    }
    
    for (var i = 0; i < padawans.length; i++)
    {
        if (padawans[i].position.y > view.bounds.bottom)
        {
            padawans[i].hitBox.remove();
            padawans[i].remove();
            padawans.splice(i, 1);
        }
        else
        {
            if (padawans[i].contains(mousePoint) ||
                padawans[i].hitBox.getIntersections(myPath).length > 0)
            {
                /* cut him into 2 pieces!*/
                var padawanTop = new Raster('img/youngling_top.png');
                padawanTop.position = padawans[i].position;
                padawanTop.position.x = padawanTop.position.x + Math.random() * 4 - 2;
                padawanTop.xVel = padawans[i].xVel + Math.random() * 4;
                padawanTop.yVel = padawans[i].yVel;
                padawanTop.angVel = Math.random() * 4 - 2;
                padawanParts.push(padawanTop);
                
                var padawanBottom = new Raster('img/youngling_bottom.png');
                padawanBottom.position = padawans[i].position;
                padawanBottom.position.x = padawanBottom.position.x + Math.random() * 4 - 2;
                padawanBottom.xVel = padawans[i].xVel + Math.random() * (-4);
                padawanBottom.yVel = padawans[i].yVel;
                padawanBottom.angVel = Math.random() * 4 - 2;
                padawanParts.push(padawanBottom);
                
                padawans[i].hitBox.remove();
                padawans[i].remove();
                padawans.splice(i, 1);
                playHit();
                playScream();
                
                loseLife();
                // other padawans should get removed so end the loop
                break;
            }

            padawans[i].position.x = padawans[i].position.x + padawans[i].xVel;
            padawans[i].position.y = padawans[i].position.y + padawans[i].yVel;
            padawans[i].rotate(padawans[i].angVel);
            padawans[i].yVel = padawans[i].yVel + GRAVITY;
            padawans[i].hitBox.position = padawans[i].position;
            padawans[i].hitBox.rotate(padawans[i].angVel);
        }
    }
    
    for (var i = 0; i < peanutsInd.length; i++)
    {
        if (peanutsInd[i].position.y > view.bounds.bottom)
        {
            peanutsInd[i].hitBox.remove();
            peanutsInd[i].remove();
            peanutsInd.splice(i, 1);
        }
        else
        {
            if (peanutsInd[i].invTimer <= 0)
            {
                if (peanutsInd[i].contains(mousePoint) ||
                    peanutsInd[i].hitBox.getIntersections(myPath).length > 0)
                {
                    peanutsInd[i].hitBox.remove();
                    peanutsInd[i].remove();
                    peanutsInd.splice(i, 1);
                    playHit();
                    
                    addScore();
                    
                    /*
                    var newPeanut1 = new Raster('img/peanut_individual.png');
                    newPeanut1.position = peanutsWhole[i].position;
                    newPeanut1.position.x = newPeanut1.position.x + Math.random() * 4 - 2;
                    newPeanut1.xVel = peanutsWhole[i].xVel + Math.random() * 4;
                    newPeanut1.yVel = peanutsWhole[i].yVel;
                    newPeanut1.angVel = Math.random() * 4 - 2;
                    peanutsInd.push(newPeanut1);
                    
                    var newPeanut2 = new Raster('img/peanut_individual.png');
                    newPeanut2.position = peanutsWhole[i].position;
                    newPeanut2.position.x = newPeanut2.position.x + Math.random() * 4 - 2;
                    newPeanut2.xVel = peanutsWhole[i].xVel + Math.random() * (-4);
                    newPeanut2.yVel = peanutsWhole[i].yVel;
                    newPeanut2.angVel = Math.random() * 4 - 2;
                    peanutsInd.push(newPeanut2);
                    
                    */
                    continue;
                }
            }
            else
            {
                peanutsInd[i].invTimer--;
            }

            peanutsInd[i].position.x = peanutsInd[i].position.x + peanutsInd[i].xVel;
            peanutsInd[i].position.y = peanutsInd[i].position.y + peanutsInd[i].yVel;
            peanutsInd[i].rotate(peanutsInd[i].angVel);
            peanutsInd[i].yVel = peanutsInd[i].yVel + GRAVITY;
            peanutsInd[i].hitBox.position = peanutsInd[i].position;
            peanutsInd[i].hitBox.rotate(peanutsInd[i].angVel);
        }
    }
    
    for (var i = 0; i < peanutsWhole.length; i++)
    {
        if (peanutsWhole[i].position.y > view.bounds.bottom)
        {
            peanutsWhole[i].hitBox.remove();
            peanutsWhole[i].remove();
            peanutsWhole.splice(i, 1);
            
            playFail();
            
            /* lose a life when you miss a whole peanut */
            loseLife();
            
            // other peanuts should get removed so end the loop
            break;
        }
        else
        {
            if (peanutsWhole[i].contains(mousePoint) ||
                peanutsWhole[i].hitBox.getIntersections(myPath).length > 0)
            {
                /* spawn 2 individual peanuts */
                var newPeanut1 = new Raster('img/peanut_kernel_resized.png');
                newPeanut1.position = peanutsWhole[i].position;
                newPeanut1.position.x = newPeanut1.position.x + Math.random() * 4 - 2;
                newPeanut1.xVel = peanutsWhole[i].xVel + Math.random() * 4;
                newPeanut1.yVel = peanutsWhole[i].yVel - Math.random() * 4;
                newPeanut1.angVel = Math.random() * 4 - 2;
                newPeanut1.invTimer = INV_COOLDOWN;
                newPeanut1.hitBox = new Path.Rectangle(newPeanut1.bounds);
                /* debug hitbox */
                //newPeanut1.hitBox.fillColor = 'black';
                peanutsInd.push(newPeanut1);
                
                var newPeanut2 = new Raster('img/peanut_kernel_resized.png');
                newPeanut2.position = peanutsWhole[i].position;
                newPeanut2.position.x = newPeanut2.position.x + Math.random() * 4 - 2;
                newPeanut2.xVel = peanutsWhole[i].xVel + Math.random() * (-4);
                newPeanut2.yVel = peanutsWhole[i].yVel - Math.random() * 4;
                newPeanut2.angVel = Math.random() * 4 - 2;
                newPeanut2.invTimer = INV_COOLDOWN;
                newPeanut2.hitBox = new Path.Rectangle(newPeanut2.bounds);
                //debug
                //newPeanut2.hitBox.fillColor = 'black';
                peanutsInd.push(newPeanut2);
                
                peanutsWhole[i].hitBox.remove();
                peanutsWhole[i].remove();
                peanutsWhole.splice(i, 1);
                playHit();
                
                addScore();
            }
            else
            {
                peanutsWhole[i].position.x = peanutsWhole[i].position.x + peanutsWhole[i].xVel;
                peanutsWhole[i].position.y = peanutsWhole[i].position.y + peanutsWhole[i].yVel;
                peanutsWhole[i].rotate(peanutsWhole[i].angVel);
                peanutsWhole[i].yVel = peanutsWhole[i].yVel + GRAVITY;
                peanutsWhole[i].hitBox.position = peanutsWhole[i].position;
                peanutsWhole[i].hitBox.rotate(peanutsWhole[i].angVel);
            }
        }
    }
    
    paper.view.draw();
}

function playHum() {
    hum[humIndex].play();
    humIndex = (humIndex + 1) % CONCURRENT_SOUNDS;
}

function playScream() {
    scream[screamIndex].play();
    screamIndex = (screamIndex + 1) % CONCURRENT_SOUNDS;
}

function playFail() {
    fail[failIndex].play();
    failIndex = (failIndex + 1) % CONCURRENT_SOUNDS;
}

function playSwing() {
    /* 2 possible swish sounds */
    if (Math.random() < 0.5)
    {
        swing1[swing1Index].play();
        swing1Index = (swing1Index + 1) % CONCURRENT_SOUNDS;
    }
    else
    {
        swing2[swing2Index].play();
        swing2Index = (swing2Index + 1) % CONCURRENT_SOUNDS;
    }
}

function playHit() {
    /* 2 possible hit sounds */
    if (Math.random() < 0.5)
    {
        hit1[hit1Index].play();
        hit1Index = (hit1Index + 1) % CONCURRENT_SOUNDS;
    }
    else
    {
        hit2[hit2Index].play();
        hit2Index = (hit2Index + 1) % CONCURRENT_SOUNDS;
    }
}

function addScore() {
    score++;
    if (score > highScore)
    {
        highScore = score;
        highScoreText.content = 'High Score: ' + highScore;
    }
    scoreText.content = 'Score: ' + score;
}

function resetScore() {
    score = 0;
    scoreText.content = 'Score: ' + score;
}

function loseLife() {
    lives--;
    var lifeImage = lifeImg.pop();
    lifeImage.remove();
    if (lives == 0)
    {
        loseGame();
    }
    else
    {
        // clear the screen of stuff
        while (padawans.length > 0)
        {
            var tempPadawan = padawans.pop();
            tempPadawan.hitBox.remove();
            tempPadawan.remove();
        }
        while (peanutsWhole.length > 0)
        {
            var tempPeanut = peanutsWhole.pop();
            tempPeanut.hitBox.remove();
            tempPeanut.remove();
        }
        
        //reset the spawn rate
        spawnRate = spawnRate - 20;
        if (spawnRate < START_SPAWN)
        {
            spawnRate = START_SPAWN;
        }
        nextSpawn = 100;
    }
}

function resetLives() {
    lives = START_LIVES;
    for (var i = 0; i < lives; i++)
    {
        var lifeImage = new Raster('img/jedi_symbol.jpg');
        lifeImage.position = new Point(view.bounds.right - 150 + i * 35, view.bounds.bottom - 20);
        lifeImg.push(lifeImage);
    }
}

function loseGame()
{
    loseText = new PointText(new Point(view.bounds.right / 2, view.bounds.bottom / 2));
    loseText.fillColor = 'red';
    loseText.justification = 'center';
    loseText.fontFamily = 'Courier New';
    loseText.fontWeight = 'bold';
    loseText.content = 'YOU LOSE. WELCOME TO THE DARK SIDE.';
    loseText.fontSize = 40;

    // remove everything
    for (var i=0; i<peanutsWhole.length; i++) {
        peanutsWhole[i].remove();
    }
    for (var i=0; i<peanutsInd.length; i++) {
        peanutsInd[i].remove();
    }
    for (var i=0; i<padawans.length; i++) {
        padawans[i].remove();
    }
    for (var i=0; i<padawanParts.length; i++) {
        padawanParts[i].remove();
    }
    peanutsWhole = [];
    peanutsInd = [];
    padawans = [];
    padawanParts = [];

    gameOver = true;
}

function startView(clicked)
{
    if (startButton.contains(mousePoint) && (!gameStarted || gameOver)) {
        startButtonPath.strokeColor = '#0066FF';
        startButtonPath.fillColor = 'white';
    }
    else if (!startButton.contains(mousePoint) && (!gameStarted || gameOver)) {
        startButtonPath.strokeColor = '#9D9DFF';
        startButtonPath.fillColor = '#9D9DFF';
    }
    if (clicked && startButton.contains(mousePoint) && (!gameStarted || gameOver)) {
        titleText.fontSize = 0;
        startText.fontSize = 0;
        startButtonPath.fillColor = 'white';
        startButtonPath.strokeColor = 'white';
        mousePoint = mouseClick;
        
        if (!gameStarted) {
            gameStarted = true;
        }
        else if (gameOver) {
            resetLives();
            resetScore();

            loseText.remove();
            
            gameOver = false;
            gameStarted = true;
        }
        clicked = false;
    }
}

function endScreen() 
{
    startText.fontSize = 30;
    startView(false);
    paper.view.draw();
}

function startScreen()
{
    titleText.fontSize = 60;
    startText.fontSize = 30;
    startView(false);
    paper.view.draw();
}

function runGame() 
{
    if (!gameStarted) {
        scoreText.fillColor = 'white';
        highScoreText.fillColor = 'white';
    }
    else {
        scoreText.fillColor = 'black';
        highScoreText.fillColor = 'black';
    }

    if (!gameStarted) {
        // not gameStarted
        startScreen();
    }
    else if (!gameOver) {
        // gameStarted and not gameOver
        gameLoop();
    }
    else {
        // gameStarted and gameOver
        endScreen();
    }
}

window.addEventListener('load', function() {
    paper.setup('canvas');
    
    /* pre-load the images into the brower cache so we don't lag later */
    var temp1 = new Raster('img/peanut_full.png');
    temp1.remove();
    var temp2 = new Raster('img/peanut_individual.png');
    temp2.remove();
    var temp3 = new Raster('img/youngling.png');
    temp3.remove();
    
    myPath = new Path();
    mousePoint = new Point(0,0);
    sumDelta = 0;

    for (var i = 0; i < PATH_LENGTH; i++)
    {
        myPath.add(new Point(10,10));
    }
    myPath.closed = true;
    myPath.strokeColor = 'blue';
    myPath.fillColor = 'blue';
    
    scoreText = new PointText(new Point(10, 30));
    scoreText.fillColor = 'black';
    scoreText.fontSize = 25;
    
    highScoreText = new PointText(new Point(view.bounds.right - 200, 30));
    highScoreText.fillColor = 'black';
    highScoreText.fontSize = 25;
    highScoreText.content = 'High Score: 0';


    var topleft = new Point(view.bounds.right/2-200,view.bounds.bottom/2+100);
    var bottomright = new Point(view.bounds.right/2+200,view.bounds.bottom/2+200);
    startButton = new Rectangle(topleft,bottomright);
    startButtonPath = new Path.Rectangle(startButton);    
    startButtonPath.selected = false;

    startText = new PointText(new Point(view.bounds.right / 2, view.bounds.bottom / 2+150));
    startText.fillColor = 'blue';
    startText.justification = 'center';
    startText.fontFamily = 'Courier New';
    startText.fontWeight = 'bold';
    startText.content = 'Start Game';
    startText.fontSize = 30;

    titleText = new PointText(new Point(view.bounds.right / 2, view.bounds.bottom / 2-100));
    titleText.fillColor = 'brown';
    titleText.justification = 'center';
    titleText.fontFamily = 'Courier New';
    titleText.fontWeight = 'bold';
    titleText.content = 'Peanut     \n      Jedi';
    titleText.fontSize = 60;
    
    resetScore();
    resetLives();
    
    var mouseTool = new Tool();
    
    console.log(view.bounds.right);
    console.log(view.bounds.left);
    console.log(view.bounds.bottom);
    console.log(view.bounds.top);

    mouseClick = new Point(0,0);
    clicked = false;
  
    mouseTool.onMouseMove = function(event) {
        /* update mouse position */
        mousePoint = event.point;
        /* add to the length traveled */
        sumDelta = sumDelta + event.delta.length;
    }
    mouseTool.onMouseUp = function(event) {
        startView(true);
    }
    
    gameOver = false;
    gameStarted = false;

    /* time step for the game loop */
    setInterval(runGame, 15);

});