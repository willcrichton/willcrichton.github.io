
window.onload = function(){
 
    var canvas = document.getElementById("falldown");
    var ctx = canvas.getContext("2d");
    

    var W = window.innerWidth;
    var H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;
 
    var mp = 50; 
    var particles = [];
    for(var i = 0; i < mp; i++)
    {
        particles.push({
            x: Math.random()*W, 
            y: Math.random()*H,
            r: Math.random()*4+1, 
            d: Math.random()*mp 
        })
    }
    

    function draw()
    {
        ctx.clearRect(0, 0, W, H);
        
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.beginPath();
        for(var i = 0; i < mp; i++)
        {
            var p = particles[i];
            ctx.moveTo(p.x, p.y);
            ctx.arc(p.x, p.y, p.r, 0, Math.PI*2, true);
        }
        ctx.fill();
        update();
    }

    var angle = 0;
    function update()
    {
        angle += 0.01;
        for(var i = 0; i < mp; i++)
        {
            var p = particles[i];
    
            p.y += Math.cos(angle+p.d) + 1 + p.r/2;
            p.x += Math.sin(angle) * 2;
            
        
            if(p.x > W+5 || p.x < -5 || p.y > H)
            {
                if(i%3 > 0) //66.67% of the flakes
                {
                    particles[i] = {x: Math.random()*W, y: -10, r: p.r, d: p.d};
                }
                else
                {
                    //If the flake is exitting from the right
                    if(Math.sin(angle) > 0)
                    {
                        //Enter from the left
                        particles[i] = {x: -5, y: Math.random()*H, r: p.r, d: p.d};
                    }
                    else
                    {
                        //Enter from the right
                        particles[i] = {x: W+5, y: Math.random()*H, r: p.r, d: p.d};
                    }
                }
            }
        }
    }



    //animation loop
    setInterval(draw, 33);
}



function flash() {
    var text = document.getElementById('SpeedUp');
    text.style.color = (text.style.color=='green') ? 'yellow':'green';
}
var clr = setInterval(flash, 1000);



    var level=1;
    var win = false;



window.requestAnimFrame = (function(callback) {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame  ||
        window.mozRequestAnimationFrame     ||
        function( callback ){
            window.setTimeout(callback, 1000 / 60);
        };
})();

function newGame () {

   //initialize variables
    var canvas = document.getElementById("falldown");
    var context = canvas.getContext( '2d' );
    var ball = new Ball();
    var board = new Board();
    var lines = [new Line()];
    var key; 
    var acceleration = 6; 
    var fallDownSpeed = 1;
    var lineUpSpeed= 1;
    var newLineCreation = 100;
    var count = 1;
    var speed = 500 +(300 * level);
    var gameOver = false;
    var win = false;

    //start the loop
    animate();

    function animate() {
        if (!gameOver) {
            requestAnimFrame( animate );
            draw();
        } else {
            //// update the scoreboard
            alert("GAME OVER!! Your Score was:" + count)
            var score=document.createElement("LI");
            var scoreText=document.createTextNode('Score: ' + count);
            score.appendChild(scoreText);
            document.getElementById('scoreboard').appendChild(score);

            level = (win) ? level + 1 : level - 1

            levelDiv = document.getElementById('level')
            var div=document.createElement("DIV");
            var levelText=document.createTextNode('Level: ' + level);
            levelDiv.removeChild(levelDiv.childNodes[0]);
            div.appendChild(levelText);
            levelDiv.appendChild(div);



        }
    }


    ///my Objects
    function Ball () {
        this.x = 300;
        this.y = 300;
        this.draw = function (x, y) {
            context.fillStyle = "white";
            context.beginPath();
            context.arc(x, y, 5, 0, Math.PI * 2, true);
            context.closePath();
            context.fill();
        }
    }

    function Board () {
        this.width = 600;
        this.height = 600;
        this.draw = function (width, height) {
            context.fillStyle = "black";
            context.beginPath();
            context.rect(0, 0, width, height);
            context.closePath();
            context.fill();
        }
    }


    function Line() {
        this.y = 600;
        this.line = []; 
        this.makeLine = function () {
            var randomHole = Math.round(Math.random()*600);
            this.line = [randomHole-this.space, randomHole];
            this.hole = randomHole
        }
        this.hole = null;
        this.space = 40;
        this.makeLine(); //make the line
        this.isBallOnLine = function() {
            if ((ball.y -1 < this.y) && (ball.y + 7 > this.y)) {
                return true
            } else {
                return false
            }
        }
        this.isBallOverHole= function () {
            if ((line.hole > ball.x) && (ball.x > line.hole - line.space)){
                return true
            } else {
                return false
            }
        }
        this.draw = function () {
            context.beginPath();
            context.moveTo(0,this.y);
            context.lineTo(this.line[0], this.y);
            context.lineWidth = 5;
            context.strokeStyle = '#ffffff';
            context.stroke();

            context.beginPath();
            context.moveTo(this.line[1],this.y);
            context.lineTo(600, this.y);
            context.lineWidth = 5;
            context.strokeStyle = '#ffffff';
            context.stroke();
        };


    }



        function draw() {


            for (var i = 0; i<lines.length+1;i++){
               /// if the ball wasn't moved at all
                 if (i==lines.length){
                    ball.y = ball.y + fallDownSpeed
                    break;
                }
                line = lines[i];
                ///if the ball is on top of the line
                if (line.isBallOnLine() ) {
                    //then if the ball is between the hole
                    if (line.isBallOverHole() ) {
                        ball.y = ball.y + fallDownSpeed;
                        break;
                    } else {
                        ball.y = ball.y - lineUpSpeed;
                        break;
                    }
                }
            }
            if (ball.y > 600) {
                ball.y =600
            }


            for (var i = 0;i<lines.length;i++){
                line = lines[i];
                line.y -= lineUpSpeed;
            }


            //add new lines depending on count
            if (count % newLineCreation == 0){
                lines.push(new Line())
            }


            ///draw the board first
            board.draw(board.width, board.height);

            /// then the lines
            for (var i = 0; i<lines.length; i++) {
                lines[i].draw();
            }

            //and the ball
            ball.draw(ball.x, ball.y);

            //increase the speed of the game
            if (count%100 == 0 && count < speed){
                fallDownSpeed = lineUpSpeed = fallDownSpeed*1.15
                newLineCreation = Math.round(newLineCreation*0.9)
            } else if (count%100 == 0) {
                fallDownSpeed = lineUpSpeed = fallDownSpeed*1.1;
                newLineCreation = Math.round(newLineCreation*0.9)
                win = true;
            }

            count = count + 1;

            if (ball.y <=0)   {
                gameOver = true
            }

        }


    ///resond to mousemove
    document.addEventListener('mousemove', function (e) {
        if (e.pageX > 0) {
            if (e.pageX < 600) {
                ball.x = e.pageX
            }else {
                ball.x = 600}
        }else {
            ball.x = 0}

    }, false);
}
