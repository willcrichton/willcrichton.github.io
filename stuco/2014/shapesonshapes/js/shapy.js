/* 
    Basic Game Initalization 
*/

var shapy = {};

window.onload = initGame;

function initGame() {
    var canvas, context;
    canvas = canvas = document.getElementsByClassName('gameCanvas')[0];
    context = canvas.getContext('2d');
    canvas.style.webkitFontSmoothing = 'antialiased';
    shapy.canvas = canvas;
    shapy.canvas.width = 1024;
    shapy.canvas.height = 680;
    shapy.ctx = context;
    shapy.width = canvas.clientWidth;
    shapy.height = canvas.clientHeight;
    shapy.state = 'startScreen';
    shapy.levels = [];
    shapy.level = 0;

    var lvl1 = new Level();
    var b1 = new Floor(0,580,306,50);
    var b2 = new Floor(356,640,50,50);
    var b3 = new Floor(425,580,50,50);
    var b4 = new Floor(500,640,50,50);
    var b5 = new Floor(600,580,50,50);
    var p = new Character(20,500,25,25);


    var block1 = new Block(100,400,30,30);
    var block2 = new Block(100,500,30,30);

    lvl1.addElement(b1);
    lvl1.addElement(b2);
    lvl1.addElement(b3);
    lvl1.addElement(b4);
    lvl1.addElement(b5);
    lvl1.character = p;
    p.addToWorld(lvl1.world);
    lvl1.addElement(block1);
    lvl1.addElement(block2);
    shapy.levels[1] = lvl1;

    shapy.level = 1;
    
    document.addEventListener('keydown', function(event) {
        lvl1.handleKeyPress(event);
    });
    setInterval(handleTimerFired, 1000 / 60);
}

function handleTimerFired() {
    var currentLevel = shapy.levels[shapy.level];
    currentLevel.update();
    currentLevel.draw(shapy.ctx);
}

/*
    Start Screen
*/

function handleStartScreen() {
    drawStartScreen();
}

function drawStartScreen() {
    shapy.ctx.fillStyle = '#c8edff';
    shapy.ctx.fillRect(0, 0, shapy.width, shapy.height);
    shapy.ctx.font = '30px Helvetica, sans-serif';
    shapy.ctx.fillStyle = 'black';
    shapy.ctx.fillText('Shapes on Shapes', shapy.width / 2 - 125, shapy.height / 2);
}

/*
    Level Class
*/

var Level = function() {
    this.character = null
    this.elements = [];
    this.gravity = new Box2D.Common.Math.b2Vec2(0,100);
    this.world = new Box2D.Dynamics.b2World(this.gravity, false);

    var debugDraw = new Box2D.Dynamics.b2DebugDraw();
    debugDraw.SetSprite(shapy.ctx);
    debugDraw.SetDrawScale(1.0);
    debugDraw.SetFillAlpha(0.5);
    debugDraw.SetLineThickness(1.0);
    debugDraw.SetFlags(Box2D.Dynamics.b2DebugDraw.e_shapeBit | Box2D.Dynamics.b2DebugDraw.e_jointBit);
    this.world.SetDebugDraw(debugDraw);
};

Level.prototype.draw = function(ctx) {
    ctx.clearRect(0,0,shapy.width,shapy.height);
    this.world.DrawDebugData();
    for(var elem of this.elements) {
        elem.draw(ctx);
    }
    this.character.draw(ctx);
};

Level.prototype.update = function() {
    this.world.Step(1/60, 10, 10);
    for(var elem of this.elements) {
        elem.update();
    }
    this.character.update();
    this.world.ClearForces();
}

Level.prototype.addElement = function(elem) {
    elem.addToWorld(this.world);
    this.elements.push(elem);
}

Level.prototype.handleKeyPress = function(event) {
    console.log(event.keyCode);
    switch(event.keyCode) {
        // Left Arrow
        case 37:
            this.character.moveLeft();
            break;
        // Right Arrow
        case 39:
            this.character.moveRight();
            break;
        case 38:
            this.character.jump();
            break;
        case 80:
            this.checkPickup();
            break;
    }
}

Level.prototype.checkPickup = function() {
    var tolerance = 10;
    var shape = new Box2D.Collision.Shapes.b2PolygonShape.AsBox(this.character.width+tolerance, 
                                                                this.character.height+tolerance);
    var pos = this.character.body.GetPosition();
    var transform = new Box2D.Common.Math.b2Transform();
    transform.pos = pos;
    this.world.QueryShape(function(fixture) {
        console.log("got a shape!");
        var body = fixture.GetBody();
        this.character.pickUp(body);
        return false;
    }, shape, transform);
}

/* 
    Floor Class
*/

var Floor = function(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.shape = new Box2D.Collision.Shapes.b2PolygonShape.AsBox(width, height);
    this.fixtureDef = new Box2D.Dynamics.b2FixtureDef();
    this.fixtureDef.shape = this.shape;
    this.fixtureDef.friction = 0.4;
    this.fixtureDef.density = 1;
    this.fixtureDef.restitution = 0;

    this.bodyDef = new Box2D.Dynamics.b2BodyDef();
    this.bodyDef.type = Box2D.Dynamics.b2Body.b2_staticBody;
}

Floor.prototype.draw = function(ctx) {
    ctx.fillStyle = 'white';
    ctx.fillRect(this.x-this.width, this.y-this.height, this.width*2, this.height*2);
}

Floor.prototype.update = function() {
    var pos = this.body.GetPosition();
    this.x = pos.x;
    this.y = pos.y;
}

Floor.prototype.addToWorld = function(world) {
    this.body = world.CreateBody(this.bodyDef);
    this.fixture = this.body.CreateFixture(this.fixtureDef);
    this.body.SetPosition(new Box2D.Common.Math.b2Vec2(this.x,this.y));
}

var Block = function(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.mass = 10;

    this.shape = new Box2D.Collision.Shapes.b2PolygonShape.AsBox(width, height);
    this.fixtureDef = new Box2D.Dynamics.b2FixtureDef();
    this.fixtureDef.shape = this.shape;
    this.fixtureDef.friction = 0.3;
    this.fixtureDef.density = 1;
    this.fixtureDef.restitution = 0;

    this.bodyDef = new Box2D.Dynamics.b2BodyDef();
    this.bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
}

Block.prototype.addToWorld = function(world) {
    this.body = world.CreateBody(this.bodyDef);
    this.fixture = this.body.CreateFixture(this.fixtureDef);
    this.body.SetPosition(new Box2D.Common.Math.b2Vec2(this.x,this.y));

    var massData = new Box2D.Collision.Shapes.b2MassData();
    massData.center = this.body.GetLocalCenter();
    massData.mass = this.mass;
    this.body.SetMassData(massData);
}

Block.prototype.draw = function(ctx) {
    ctx.fillStyle = 'gray';
    ctx.fillRect(this.x-this.width, this.y-this.height, this.width*2, this.height*2);
}

Block.prototype.update = function() {
    var pos = this.body.GetPosition();
    this.x = pos.x;
    this.y = pos.y;
}

/*
    Character Class
*/

var Character = function(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.mass = 10;

    this.shape = new Box2D.Collision.Shapes.b2PolygonShape.AsBox(width, height);
    this.fixtureDef = new Box2D.Dynamics.b2FixtureDef();
    this.fixtureDef.shape = this.shape;
    this.fixtureDef.friction = 0.1;
    this.fixtureDef.density = 1;
    this.fixtureDef.restitution = 0;

    this.bodyDef = new Box2D.Dynamics.b2BodyDef();
    this.bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;

    this.carriedObj = null;
}

Character.prototype.draw = function(ctx) {
    ctx.fillStyle = 'white';
    ctx.fillRect(this.x-this.width, this.y-this.height, this.width*2, this.height*2);
}

Character.prototype.update = function() {
    var pos = this.body.GetPosition();
    this.x = pos.x;
    this.y = pos.y;

    if(this.carriedObj) {
        var newPos = new Box2D.Common.Math.b2Vec2(this.x,this.y-this.height-10);
        this.carriedObj.SetPosition(newPos);
    }
}

Character.prototype.addToWorld = function(world) {
    this.body = world.CreateBody(this.bodyDef);
    this.fixture = this.body.CreateFixture(this.fixtureDef);
    this.body.SetPosition(new Box2D.Common.Math.b2Vec2(this.x,this.y));

    var massData = new Box2D.Collision.Shapes.b2MassData();
    massData.center = this.body.GetLocalCenter();
    massData.mass = this.mass;
    this.body.SetMassData(massData);
}

Character.prototype.moveLeft = function() {
    var force = new Box2D.Common.Math.b2Vec2(-100000,0);
    if(this.body.GetLinearVelocity().x > -500) {
        this.body.ApplyForce(force, this.body.GetLocalCenter());
    }
}

Character.prototype.moveRight = function() {
    var force = new Box2D.Common.Math.b2Vec2(100000,0);
    if(this.body.GetLinearVelocity().x < 500) {
        this.body.ApplyForce(force, this.body.GetLocalCenter());
    }
}

Character.prototype.jump = function() {
    var force = new Box2D.Common.Math.b2Vec2(0,-1000000);
    this.body.ApplyForce(force, this.body.GetLocalCenter());
}

Character.prototype.pickUp = function(body) {
    console.log("Pick up!");
    body.SetAwake(false);
    this.carriedObj = body;
}

Character.prototype.putDown = function() {
    body.SetAwake(true);
    this.carriedObj.ApplyForce(new Box2D.Common.Math.b2Vec2(1000,0));
    this.carriedObj = null;
}