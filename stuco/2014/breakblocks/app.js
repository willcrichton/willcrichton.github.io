var world;
var ctx;
var canvasWidth;
var canvasHeight;
var canvasTop;
var canvasLeft;
var ball;
var listener;

var paddle;
var paddle_constraints;
var paddle_mov;
var paddle_speed = 50.0;
var paddle_width = 30;

var start_speed = 80.0;
var offset = 150.0;

var numBricks;
var livesLost = 0;
var step_Interval;

var game_over = true;

function setupWorld() {
  $('myCanvas').setStyle({
    backgroundColor: '#87CEFA',
  });
/*
//Collision listener
  listener = new Box2D.Dynamics.b2ContactListener;
  listener.BeginContact = function(contact) {
      // console.log(contact.GetFixtureA().GetBody().GetUserData());
  }
  listener.EndContact = function(contact) {
    console.log(contact.GetFixtureA().GetBody().GetUserData());
    console.log(contact.GetFixtureB().GetBody().GetUserData());
  }
  world.SetContactListener(listener);
  */

  console.log('Setup world');
  world = createWorld();
  var blocks = [];
  bricks = [];

  var rows = 10;
  var cols = 10;
  numBricks = rows * cols;
  //numBricks = 0;

  for(var r = 0; r < rows; r++)
  {
    blocks[r] = [];
    bricks[r] = [];
    for(var c = 0; c < cols; c++)
    {
      blocks[r][c] = createBox(world, 50 * r + 25, 20 * c + 20, 10, 5, true);
      blocks[r][c].m_userData = {name: 'brick', row: r, col: c};
    }
  }
  /*
  blocks[0] = [];
  blocks[0][0] = createBox(world, 50 + 10, 40 + 20, 20, 10, true);
  blocks[0][0].m_userData = {name: 'brick', row: 0, col: 0};
  */

  ball = createBall(world, 250, 210);
  ball.m_userData = {name: 'ball'};
  ball.SetLinearVelocity(new b2Vec2 (paddle_speed, start_speed));
  //ball.ApplyForce(new b2Vec2 (0, -10), ball.GetCenterPosition());
  //ball.ApplyImpulse(new b2Vec2 (0, -10), ball.GetCenterPosition());

  paddle = createPaddle(world, 250, 300, 50, 5);
  paddle.SetLinearVelocity(new b2Vec2 (paddle_speed, 0));
  paddle_constraint = createPaddleConstraints(world, 250, 300, paddle, world.GetGroundBody());
  //paddle_mov = createPaddleMov(world, paddle);
}

function step() {
  //console.log("paddle is static:" + paddle.IsStatic());
  //console.log(paddle.GetCenterPosition());
  //console.log(paddle_constraint.GetJointSpeed());
	var timeStep = 1.0/60;
	var iteration = 1;
  for(var c = ball.GetContactList(); c !== null ; c = c.next)
  {
    //console.log ("first :"+c.contact.GetShape1().GetBody().GetUserData());
    //console.log ("second:"+c.contact.GetShape2().GetBody().GetUserData());
    var body1 = c.contact.GetShape1().GetBody();
    var body2 = c.contact.GetShape2().GetBody();
    var data1 = body1.GetUserData();
    var data2 = body2.GetUserData();

    if(data1 === null || data2 === null)
      continue;
    //console.log ("first name:"+c.contact.GetShape1().GetBody().GetUserData().name);
    //console.log ("secondname:"+c.contact.GetShape2().GetBody().GetUserData().name);
    if(data1.name == 'ball' && data2.name == 'brick')
    {
      console.log ("destroy");
      world.DestroyBody(body2);
      removeBrick(data2.row, data2.col);

      numBricks -= 1;
      if(numBricks <= 0){
        drawWinning();
        console.log('win');
        break;
      }

    }
    if(data1.name == 'brick' && data2.name == 'ball')
    {
      console.log ("destroy");
      world.DestroyBody(body1);
      removeBrick(data1.row, data1.col);

      numBricks -= 1;
      if(numBricks <= 0){
        drawWinning();
        console.log('win');
        break;
      }

    }
    if(data1.name == 'ground')
    {
      world.DestroyBody(body2);
      ball = createBall(world, paddle.GetCenterPosition().x, 230);
      ball.m_userData = {name: 'ball'};

      if((paddle.GetCenterPosition().x - paddle_width) <= 10 ||
        (paddle.GetCenterPosition().x + paddle_width) >= 490 )
        ball.SetLinearVelocity((new b2Vec2 (0, start_speed)));
      else
        ball.SetLinearVelocity((new b2Vec2 (paddle.GetLinearVelocity().x, start_speed)));
      console.log ("lose");

      livesLost++;

    }
    else if(data2.name == 'ground')
    {
      world.DestroyBody(body1);
      ball = createBall(world, paddle.GetCenterPosition().x, 230);
      ball.m_userData = {name: 'ball'};

      console.log(paddle.GetCenterPosition().x);
      if((paddle.GetCenterPosition().x - paddle_width) <= 10 ||
        (paddle.GetCenterPosition().x + paddle_width) >= 490 )
        ball.SetLinearVelocity((new b2Vec2 (0, start_speed)));
      else
        ball.SetLinearVelocity((new b2Vec2 (paddle.GetLinearVelocity().x, start_speed)));

      console.log ("lose");

      livesLost++;
    }
  }
  if(paddle.GetLinearVelocity().x != paddle_speed)
    paddle.SetLinearVelocity(new b2Vec2 (paddle_speed, 0));
  //paddle.ApplyForce(new b2Vec2(paddle_speed, 0), paddle.GetCenterPosition());
  //console.log("motor " +paddle_constraint.m_enableMotor + " speed " + paddle_constraint.m_motorSpeed + "joint :" + paddle_constraint.GetJointSpeed());
	world.Step(timeStep, iteration);
	ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  drawMovingObjects();

}

function start_game() {
  console.log('Setup');

	var canvasElm = $('myCanvas');

  var path = new Path();
  path.strokeColor = 'black';
  var start = new Point(100, 100);
  path.moveTo(start);
  path.lineTo(start.add([ 200, -50 ]));
  view.draw();

	setupWorld();
	drawWorld(world);

	ctx = $('myCanvas').getContext('2d');
	canvasWidth = parseInt(canvasElm.width);
	canvasHeight = parseInt(canvasElm.height);
	canvasTop = parseInt(canvasElm.style.top);
	canvasLeft = parseInt(canvasElm.style.left);

  step_Interval = setInterval(step, 1.0);

  /*
  var tool = new Tool();
  var score = 0;
  tool.onMouseUp = function(event) {
    var mole = event.getItem();
    if(mole === null) return;

    mole.remove();
    score++;

    document.getElementById('score').innerText = score;
  }


  view.onFrame = function() {

  }
  */
}

//Start Game on load
Event.observe(window, 'load', function(){
	var canvasElm = $('myCanvas');

  paper.install(window);
  paper.setup(canvasElm);

	canvasWidth = parseInt(canvasElm.width);
	canvasHeight = parseInt(canvasElm.height);
	canvasTop = parseInt(canvasElm.style.top);
	canvasLeft = parseInt(canvasElm.style.left);

  var text = new PointText(new Point(canvasWidth/2, canvasHeight/2 ));
  text.justification = 'center';
  text.fillColor = 'black';
  text.fontSize = 30;
  text.content = 'Press Enter to start Playing!';

  var text2 = new PointText(new Point(canvasWidth/2, canvasHeight/2 - 0.1 * canvasHeight));
  text2.style = text.style;
  text2.content = 'Welcome to Break Blocks';


  var Name = new PointText(new Point(canvasWidth/2, canvasHeight/2 + 0.3 * canvasHeight));
  Name.style = text.style;
  Name.content = 'Created by Evans Hauser';

  view.draw();
});

$(document).observe('keydown', function (e) {
  switch (e.keyCode) {
    case 37: //left arrow
      e.stop(); // prevent the default action, like horizontal scroll

      /* Jerky movement
      if(paddle.GetCenterPosition())
      {
        paddle.SetCenterPosition(paddle.GetCenterPosition().Add(
          new b2Vec2(-offset,0)),0);
      }
      */

      //paddle.ApplyImpulse(new b2Vec2(0,-offset), paddle.GetCenterPosition());
      paddle_speed = -offset;
      //paddle.SetLinearVelocity(new b2Vec2 (-offset, 0));

      //paddle_constraint.m_linearImpluse = -offset;
      //paddle.SetLinearVelocity(new b2Vec2(0,-offset));
      break;
    case 39: //right arrow
      e.stop();
      //paddle_mov.SetTarget(paddle.GetWorldPoint().Add(new b2Vec2(offset,0)))
      paddle_speed = offset;
      //paddle.SetLinearVelocity(new b2Vec2 (offset, 0));

      /*
      console.log(paddle.GetCenterPosition());

      if(paddle.GetCenterPosition())
      {
        paddle.SetCenterPosition(paddle.GetCenterPosition().Add(
          new b2Vec2(offset,0)),0);
      }
      */
      //paddle.ApplyImpulse(new b2Vec2(0,offset), paddle.GetCenterPosition());
      //paddle.SetLinearVelocity(new b2Vec2(0,offset));
      break;
    case 38: //up arrow
      e.stop();
      break;
    case 40: //down arrow
      e.stop();
      break;
    case 13: //enter
      e.stop();
      if(game_over)
      {
        start_game();
        game_over = false;

      }

  }
});

$(document).observe('keyup', function (e) {
  switch (e.keyCode) {
    case 37: //left arrow
      e.stop(); // prevent the default action, like horizontal scroll

      setTimeout(function () {
        //paddle_speed = 0;
        //paddle.SetLinearVelocity(new b2Vec2 (0.01, 0));
      }, 1000);
      break;
    case 39: //right arrow
      e.stop();

      setTimeout(function () {
        //paddle_speed = 0;
        //paddle.SetLinearVelocity(new b2Vec2 (0.01, 0));
      }, 1000);
      break;
    case 38: //up arrow
      e.stop();
      break;
    case 40: //down arrow
      e.stop();
      break;
  }
});

Event.observe(window, "resize", function(){
	var canvasElm = $('myCanvas');

	canvasWidth = parseInt(canvasElm.width);
	canvasHeight = parseInt(canvasElm.height);
	canvasTop = parseInt(canvasElm.style.top);
	canvasLeft = parseInt(canvasElm.style.left);

  drawWorld(world);
});
