
var embox2dTest_musicwings = function() {
    //constructor
    this.edgeCount = 0;
    this.edges = []
    this.lastEdgeVerts = [];
    this.playerBodyDef = null;
    this.playerFixDef = null;
    this.playerBody = null;
    this.terrainBody = null;
    this.tfd = null;

    this.EDGE_X = 2.0;
    this.NUM_EDGES = 10;

    // speed diffs
    this.INITIAL_VELOCITY = new b2Vec2(5,-1);
    this.TERMINAL_VELOCITY_X = 50; // maximum going right
    this.TERMINAL_VELOCITY_Y = -50; // maximum going down
    this.FALLING_ACCEL = -3;

    // boost
    this.onGround = false;
    this.currentBoostFuel = 100.0; // a percentage
    this.MAX_BOOST_FUEL = 100.0;
    this.BOOST_DRAINAGE_RATE = 1.0;
    this.BOOST_REGENERATION_RATE = 1.0 / 24.0;
    this.BOOST_ACCEL = new b2Vec2(0.5,3);

    // animation
    this.MAX_ANIMATION_PARTICLES = 10;
    this.MAX_INITIAL_PARTICLE_VELOCITY_X = 1;
    this.MAX_INITIAL_PARTICLE_VELOCITY_Y = 1;
    this.ANIMATION_CIRCLE = null;
    this.ANIMATION_SQUARE = null;

    this.boosting = false;
    this.falling = false;

    // music
    this.visualizer = null;
    this.initialized = false;
    this.previousY = 0;

    this.stepCount = 0;
}

embox2dTest_musicwings.prototype.setNiceViewCenter = function() {
    //called once when the user changes to this test from another test
    PTM = 32;
    setViewCenterWorld( new b2Vec2(0,1), true );
}

embox2dTest_musicwings.prototype.setup = function() {
    //set up the Box2D scene here - the world is already created

    // music choice
    this.visualizer = new Visualizer();
    this.visualizer.ini();

    // create the player body
    var circleShape = new b2CircleShape();
    circleShape.set_m_radius(0.4);
    this.playerFixDef = new b2FixtureDef();
    this.playerFixDef.set_shape(circleShape);
    this.playerFixDef.set_density(1.0);
    this.playerFixDef.set_friction(0.9);
    this.playerBodyDef = new b2BodyDef();
    this.playerBodyDef.set_type(b2_dynamicBody);
    this.playerBodyDef.set_position( new b2Vec2(0, 100) );

    // set collision detection for boosts
    /*
    var listener = new Box2D.JSContactListener();
    listener.BeginContact = function (contact) {
        this.currentBoostFuel += this.BOOST_REGENERATION_RATE;
        //this.playerBody.set_position(new b2Vec2(3,10));
        this.onGround = true;
        console.log("Contact detected");
        console.log(this.onGround);
    }
    listener.EndContact = function (contact) {
        this.onGround = false;
        console.log("Contact removed");
        console.log(this.onGround);
    }
    listener.PostSolve = function (contact, impulse) {
        // TODO Auto-generated method stub
    }
    listener.PreSolve = function (contact, oldManifold) {
        // TODO Auto-generated method stub
    }
    world.SetContactListener(listener);
    var tttt = world.GetContactList();
    console.log(tttt);
    */

    /*
    // animation parts
    // circle
    var animCircle = new b2CircleShape();
    animCircle.set_m_radius(0.4);
    var fdac = new b2FixtureDef();
    fdac.set_shape(animCircle);
    fdac.set_density(1.0);
    fdac.set_friction(0.9);
    var bdac = new b2BodyDef();
    bdac.set_type(b2_dynamicBody);
    bdac.set_position( new b2Vec2(3,10) );
    // square
    var animSquare = new b2();
    animCircle.set_m_radius(0.4);
    var fdac = new b2FixtureDef();
    fdac.set_shape(animCircle);
    fdac.set_density(1.0);
    fdac.set_friction(0.9);
    var bdac = new b2BodyDef();
    bdac.set_type(b2_dynamicBody);
    bdac.set_position( new b2Vec2(3,10) );
    */

    var edgeVerts = [];
    for (var i = -1; i < 12; i++)
    {
        edgeVerts.push(new b2Vec2(i * this.EDGE_X, 100 - (i+1) * (i+1) * 0.5));
    }

    var ebd = new b2BodyDef();
    ebd.set_type(b2_staticBody);
    ebd.set_position( new b2Vec2(0, 0));
    this.terrainBody = world.CreateBody(ebd);

    var edgeShape = new b2EdgeShape();
    this.tfd = new b2FixtureDef();
    this.tfd.set_shape(edgeShape);
    this.tfd.set_density(0.0);
    this.tfd.set_friction(0.6);
    for ( var i = 0; i < 10; i++ )
    {
        edgeShape.Set(edgeVerts[i+1], edgeVerts[i+2]);
        edgeShape.set_m_hasVertex0(true);
        edgeShape.set_m_hasVertex3(true);
        edgeShape.set_m_vertex0(edgeVerts[i]);
        edgeShape.set_m_vertex3(edgeVerts[i+3]);

        this.edges.push(this.terrainBody.CreateFixture(this.tfd));
    }

    this.lastEdgeVerts.push(edgeVerts[10]);
    this.lastEdgeVerts.push(edgeVerts[11]);
    this.lastEdgeVerts.push(edgeVerts[12]);

    this.edgeCount = 9;
}

embox2dTest_musicwings.prototype.step = function() {
    //this function will be called at the beginning of every time step

    // if not initialized yet, then the game hasn't started and a song needs to be chosen
    if(!this.initialized) {
        if(this.visualizer.getActive()) {
            this.initialized = true;
            this.playerBody = world.CreateBody(this.playerBodyDef);
            this.playerBody.CreateFixture(this.playerFixDef);
            this.playerBody.SetLinearVelocity(this.INITIAL_VELOCITY);
        }
        return;
    }

    // update player velocity for falling/boosting
    if(this.falling)
    {
        var vel = this.playerBody.GetLinearVelocity();
        this.playerBody.SetLinearVelocity(new b2Vec2(vel.get_x(), vel.get_y() + 0.15 * this.FALLING_ACCEL));    // update fuel
    }
    else if(this.boosting)
    {
        var vel = this.playerBody.GetLinearVelocity();
        this.playerBody.SetLinearVelocity(new b2Vec2(vel.get_x() + 0.15 * this.BOOST_ACCEL.get_x(),
                                                     vel.get_y() + 0.15 * this.BOOST_ACCEL.get_y() ));

        this.currentBoostFuel -= this.BOOST_DRAINAGE_RATE;
    }

    if(!this.boosting) {
        this.currentBoostFuel += this.BOOST_REGENERATION_RATE;
    }
    this.currentBoostFuel = Math.max(Math.min(this.currentBoostFuel, 100.0), 0.0);
    //console.log(this.currentBoostFuel);

    //move camera to follow player
    var pos = this.playerBody.GetPosition();
    var vel = this.playerBody.GetLinearVelocity();
    var futurePos = new b2Vec2( pos.get_x() + 0.15 * vel.get_x(), Math.min(pos.get_y() + 0.15 * vel.get_y(), 100.0) );
    setViewCenterWorld( futurePos );

    // if player has travelled far enough, spawn a new edge
    //if ( (pos.get_x() / this.EDGE_X) > this.edgeCount )
    {
        var array = this.visualizer.getTerrainData();
        var N = array.length;
        for (var i = 0; i < N; i++)
        {
            var nextY = array.shift();
            this.edgeCount += 1;

            var v0 = this.lastEdgeVerts[0];
            var v1 = this.lastEdgeVerts[1];
            var v2 = this.lastEdgeVerts[2];
            var v3 = new b2Vec2( v2.get_x() + this.EDGE_X, nextY );

            var edge = new b2EdgeShape();
            edge.Set(v1, v2);
            edge.set_m_hasVertex0(true);
            edge.set_m_hasVertex3(true);
            edge.set_m_vertex0(v0);
            edge.set_m_vertex3(v3);

            this.tfd.set_shape(edge);
            this.edges.push(this.terrainBody.CreateFixture(this.tfd));

            this.lastEdgeVerts.shift();
            this.lastEdgeVerts.push(v3);

            this.previousY = nextY;
        }
        /*
        if(array.length > 0) {
            this.terrainBody.DestroyFixture(this.edges[0]);
            this.edges.shift();
        }*/
    }

    this.stepCount += 1;
    if (this.stepCount == 45)
    {
        this.stepCount = 0;
        this.terrainBody.DestroyFixture(this.edges[0]);
        this.edges.shift();   
    }

    var vel = this.playerBody.GetLinearVelocity();
    //this.playerBody.SetLinearVelocity( Math.min(vel.get_x(), this.TERMINAL_VELOCITY_X), vel.get_y() );
    //                                   Math.max(vel.get_y(), this.TERMINAL_VELOCITY_Y));
}

/*
embox2dTest_musicwings.prototype.animatePlayer = function() {
    for(var i = 0; i < Math.random()*this.MAX_ANIMATION_PARTICLES; i++) {
        // create particle

        this.particleBody.SetLinearVelocity(new b2Vec2(Math.random() * this.MAX_INITIAL_PARTICLE_VELOCITY_X,
            Math.random() * this.MAX_INITIAL_PARTICLE_VELOCITY_Y));
    }
}
*/

embox2dTest_musicwings.prototype.onKeyDown = function(canvas, evt) {
    evt.preventDefault();
    if ( evt.keyCode == 32 ) { // space
        this.falling = true;
/*
        var currVel = this.playerBody.GetLinearVelocity();
        var newVel = new b2Vec2(currVel.get_x(), currVel.get_y()+this.VELOCITY_Y);
        this.playerBody.SetLinearVelocity(newVel);
        */
    } else if ( evt.keyCode == 87 ) { // 'w'
        if(this.currentBoostFuel > this.BOOST_DRAINAGE_RATE) {
            this.boosting = true;
        } else {
            this.boosting = false;
        }
        /*
        if(this.currentBoostFuel > this.BOOST_DRAINAGE_RATE) {
            this.currentBoostFuel -= this.BOOST_DRAINAGE_RATE;
            var currVel = this.playerBody.GetLinearVelocity();
            this.playerBody.SetLinearVelocity(new b2Vec2(currVel.get_x() + this.BOOST_VELOCITY.get_x(),
                currVel.get_y() + this.BOOST_VELOCITY.get_y()));
        }*/
    }
}

embox2dTest_musicwings.prototype.onKeyUp = function(canvas, evt) {
    evt.preventDefault();
    if ( evt.keyCode == 87 ) { // 'w'
        this.boosting = false;
    }
    else if ( evt.keyCode == 32 )
    {
        this.falling = false;
    }
}
