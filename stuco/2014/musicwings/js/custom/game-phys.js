using(Box2D);
// create world with gravity
var world = new b2World(new b2Vec2(0, 10));

var bodyDef = new b2BodyDef();
bodyDef.set_type( b2_dynamicBody );
var dynamicBody = world.CreateBody( bodyDef );
var circleShape = new b2CircleShape();
circleShape.set_m_radius( 0.5 );
body.CreateFixture( circleShape, 1.0 );

/*
var fixDef = new b2FixtureDef;
fixDef.density = 1.0;
fixDef.friction = 0.5;
fixDef.restitution = 0.2;

// create the 'player' circle body
var pbodyDef = new b2BodyDef;
pbodyDef.type = b2Body.b2_dynamicBody;
pbodyDef.position.x = 10;
pbodyDef.position.y = 30;
pbodyDef.linearVelocity = new b2Vec2( 10, 5 );

fixDef.shape = new b2CircleShape;
fixDef.shape.SetRadius(1);

// create dynamic player body
var playerBody = world.CreateBody(pbodyDef);
var playerFixture = playerBody.CreateFixture(fixDef);

// create static terrain body
var edge = new b2EdgeShape(new b2Vec2(10,10), new b2Vec2(20,10));
var edgeFixDef = new b2FixtureDef;
edgeFixDef.shape = new b2EdgeShape(new b2Vec2(10,10), new b2Vec2(20,10));
var bodyDef = new b2BodyDef;
bodyDef.type  = b2Body.b2_staticBody;
bodyDef.position.x = 0;
bodyDef.position.y = 0;
var terrainBody = world.CreateBody(bodyDef);
var edgeFixture = terrainBody.CreateFixture(edgeFixDef);
*/
// debug draw

var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");

var canvasOffset.x = 0;
var canvasOffset.y = 0;

var debugDraw = getCanvasDebugDraw();
debugDraw.SetFlags(e_shapeBit);
world.SetDebugDraw(debugDraw);

function update() {
    world.Step(1 / 60, 10, 10);
    world.DrawDebugData();
    world.ClearForces();
}
window.setInterval(update, 1000 / 60);
