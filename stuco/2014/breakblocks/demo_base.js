function createWorld() {
	var worldAABB = new b2AABB();
	worldAABB.minVertex.Set(-1000, -1000);
	worldAABB.maxVertex.Set(1000, 1000);
	var gravity = new b2Vec2(0, 0);
	var doSleep = true;
	var world = new b2World(worldAABB, gravity, doSleep);
	var ground = createGround(world);
	var sky = createTop(world);
  ground.m_userData = {name: "ground"};
	createBox(world, 0, 125, 10, 250, true, 0.01);
	createBox(world, 500, 125, 10, 250, true, -0.01);
	return world;
}

function createTop(world) {
	var groundSd = new b2BoxDef();
	groundSd.extents.Set(1000, 5);
	groundSd.restitution = 1.0;
  groundSd.m_type = b2Shape.e_boxShape;
	var groundBd = new b2BodyDef();
	groundBd.AddShape(groundSd);
	groundBd.position.Set(-500, 0);
  groundBd.type = b2Shape.e_boxShape;
	return world.CreateBody(groundBd)
}

function createGround(world) {
	var groundSd = new b2BoxDef();
	groundSd.extents.Set(1000, 5);
	groundSd.restitution = 0.0;
  groundSd.m_type = b2Shape.e_boxShape;
	var groundBd = new b2BodyDef();
	groundBd.AddShape(groundSd);
	groundBd.position.Set(-500, 340);
	return world.CreateBody(groundBd)
}

function createBall(world, x, y) {
	var ballSd = new b2CircleDef();
	ballSd.density = 0.01;
	ballSd.radius = 5;
	ballSd.restitution = 1.02;
	var ballBd = new b2BodyDef();
	ballBd.AddShape(ballSd);
	ballBd.position.Set(x,y);
	return world.CreateBody(ballBd);
}

function createBox(world, x, y, width, height, fixed, angle) {
	if (typeof(fixed) == 'undefined') fixed = true;
	var boxSd = new b2BoxDef();
	if (!fixed) boxSd.density = 1.0;
	boxSd.extents.Set(width, height);
	boxSd.restitution = 1.00;
  if(angle != 0)
  {
    if(angle < 0)
    {
      boxSd.localRotation = Math.PI + angle;
    }
    else
      boxSd.localRotation = angle;
    //console.log(boxSd.localRotation);
  }
  boxSd.m_type = b2Shape.e_boxShape;

	var boxBd = new b2BodyDef();
	boxBd.AddShape(boxSd);
	boxBd.position.Set(x,y);
	return world.CreateBody(boxBd)
}

function createPaddle(world, x,y,width,height)
{
  var points = [[-30, 0], [30, 0], [0, 15]];
  var polySd1 = new b2PolyDef();
  polySd1.vertexCount = points.length;
  for (var i = 0; i < points.length; i++) {
    polySd1.vertices[i].Set(points[i][0], points[i][1]);
    //console.log("vertices["+i+"]"+polySd1.vertices[i]);
  }

  var points = [
    [-5.0,15.0],
    [-15.0,10.0],
    [-25.0,5.0],
    [-30.0, 0.0],
    [30.0, 0.0],
    [25.0,5.0],
    [15.0,10.0],
    [5.0,15.0]];
    //[0.0, 15.0]];
  var polySd = new b2PolyDef();
  polySd.vertexCount = points.length;
  for (var i = 0; i < points.length; i++) {
    //console.log("vertices["+i+"]"+polySd.vertices[i]);
    polySd.vertices[i].Set(points[i][0], points[i][1]);
  }
  polySd.localRotation = Math.PI;

  polySd.density = 1.0;
  polySd.restitution = 1.0;
  polySd.friction = 0.0;

  var polyBd = new b2BodyDef();
  polyBd.AddShape(polySd);
  polyBd.position.Set(x,y);
  polyBd.type = b2Shape.e_polyShape;
  return world.CreateBody(polyBd)


 /*
	var boxBd = new b2BodyDef();

  for(var i = 1.0; i > 0; i -= 0.1)
  {
    var boxSd = new b2BoxDef();
    boxSd.density = 0.01;
    boxSd.restitution = 1.0;
    boxSd.friction = 0.0;
    boxSd.extents.Set(width - (width * i),(height * i));

    boxBd.AddShape(boxSd);
  }

	var boxSd = new b2BoxDef();
	boxSd.density = 10.0;
	boxSd.restitution = 0.0;
	boxSd.friction = 0.0;
	boxSd.extents.Set(width, height);
  */

	boxBd.position.Set(x,y);

	return world.CreateBody(boxBd)
}

function createPaddleConstraints(world, x, y, paddle, ground)
{
  var pjd = new b2PrismaticJointDef()
  pjd.anchorPoint.Set(x, y);
  pjd.body1 = ground;
  pjd.body2 = paddle;
  pjd.axis.Set(1.0, 0.0);
  pjd.motorSpeed = 5.0; // joint friction
  pjd.motorForce = 100000.0;
  pjd.enableMotor = false;
  pjd.enableLimit = false;
  pjd.collideConnected = false;
  return world.CreateJoint(pjd);
}

function createPaddleMov(world, paddle)
{
  var md = new b2MouseJointDef();
  md.body1 = world.GetGroundBody();
  md.body2 = paddle;
  md.target.Set(paddle.GetWorldPoint());
  md.collideConnected = true;
  md.maxForce = 300.0 * paddle.GetMass();
  return world.CreateJoint(md);
}


var demos = {};
demos.InitWorlds = [];
