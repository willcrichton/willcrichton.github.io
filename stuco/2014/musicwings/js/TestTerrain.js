var b2Vec2 = Box2D.Common.Math.b2Vec2
    ,   b2AABB = Box2D.Collision.b2AABB
    ,   b2BodyDef = Box2D.Dynamics.b2BodyDef
    ,   b2Body = Box2D.Dynamics.b2Body
    ,   b2FixtureDef = Box2D.Dynamics.b2FixtureDef
    ,   b2Fixture = Box2D.Dynamics.b2Fixture
    ,   b2World = Box2D.Dynamics.b2World
    ,   b2MassData = Box2D.Collision.Shapes.b2MassData
    ,   b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
    ,   b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
    ,   b2DebugDraw = Box2D.Dynamics.b2DebugDraw
    ,   b2MouseJointDef =  Box2D.Dynamics.Joints.b2MouseJointDef
    ,   b2Transform = Box2D.Common.Math.b2Transform
    ;

var world = new b2World(new b2Vec2(0, 10), true);

/**
 * Everything after this can be commented out.
 * You probably want to keep anything after SETUP.
 */

// var canvas = document.getElementById('canvas'); // set through index.html
// array of added boxes
var boxes = [];
// how to draw the boxes
var beginX, beginY;
canvas.addEventListener('mousedown', function(event) {
    beginX = event.clientX/30, beginY = event.clientY/30;
});
canvas.addEventListener('mouseup', function(event) {
    var endX = event.clientX/30, endY = event.clientY/30;
    var width =  Math.sqrt(Math.pow(endX-beginX, 2) + Math.pow(endY-beginY, 2)) / 2;
    var angle = Math.atan2(endY - beginY, endX - beginX);

    var bodyDef = new b2BodyDef;
    bodyDef.type = b2Body.b2_staticBody;
    bodyDef.position.x = (beginX + endX) / 2;
    bodyDef.position.y = (beginY + endY) / 2;
    bodyDef.angle = angle;

    var fixDef = new b2FixtureDef;
    fixDef.density = 1;
    fixDef.friction = 0.5;
    fixDef.restitution = 0.2;
    fixDef.shape = new b2PolygonShape;
    fixDef.shape.SetAsBox(width, 0.2);

    var body = world.CreateBody(bodyDef);
    body.CreateFixture(fixDef);
    boxes.push(body);
});
canvas.addEventListener('contextmenu', function(ev) {
    ev.preventDefault();
    for(var i = 0; i < boxes.length; i++) {
        world.DestroyBody(boxes[i]);
    }
    return false;
}, false);

/************ SETUP ************/
fixDef = new b2FixtureDef;
fixDef.density = 1.0;
fixDef.friction = 0.5;
fixDef.restitution = 0.2;

bodyDef = new b2BodyDef;

//create ground
bodyDef.type = b2Body.b2_staticBody;
fixDef.shape = new b2PolygonShape;
fixDef.shape.SetAsBox(20, 2);
bodyDef.position.Set(10, 400 / 30 + 1.8);
world.CreateBody(bodyDef).CreateFixture(fixDef);
bodyDef.position.Set(10, -1.8);
world.CreateBody(bodyDef).CreateFixture(fixDef);
fixDef.shape.SetAsBox(2, 14);
bodyDef.position.Set(-1.8, 13);
world.CreateBody(bodyDef).CreateFixture(fixDef);
bodyDef.position.Set(21.8, 13);
world.CreateBody(bodyDef).CreateFixture(fixDef);

//setup debug draw
var debugDraw = new b2DebugDraw();
debugDraw.SetSprite(document.getElementById("canvas").getContext("2d"));
debugDraw.SetDrawScale(30.0);
debugDraw.SetFillAlpha(0.5);
debugDraw.SetLineThickness(1.0);
debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
world.SetDebugDraw(debugDraw);

function update() {
    world.Step(1 / 60, 10, 10);
    world.DrawDebugData();
    world.ClearForces();
}
window.setInterval(update, 1000 / 60);