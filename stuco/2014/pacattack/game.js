
// Constants
var FRAME_TIME = 25; // milliseconds
var HEIGHT_FULL, WIDTH_FULL;
var HEIGHT, WIDTH; // Set in index.html, do not change here
var numBoids = 50;
var numHunters = 3;

var layers;

var startScreenAssets;
var mainGameAssets;
var gameOverAssets;

var instructions = false;
var time = 0;
var player, boids, hunters, all, score, sprint, powerUps;
var isSprinting = false;

var gameState = 0;  // 0 = start screen, 1 = setup state, 2 = main game, 3 = game over

// Movement booleans
var left = false;
var right = false;
var up = false;
var down = false;

// Init
window.onload = function() {
  document.getElementById('background-track').volume = 0.3;
  var canvas = document.getElementById('canvas');
  paper.setup(canvas);
  HEIGHT_FULL = canvas.height;
  WIDTH_FULL = canvas.width;
  HEIGHT = (HEIGHT_FULL * 6) / 7;
  WIDTH = WIDTH_FULL;

  paper.project.activeLayer.remove()

  layers = { startScreenLayer: new paper.Layer(),
             mainGameLayer: new paper.Layer(),
             gameOverLayer: new paper.Layer() };
 
  layers.startScreenLayer.activate();
  startScreenAssets = createStartScreenAssets();

  layers.mainGameLayer.activate();
  mainGameAssets = createMainGameAssets();

  layers.gameOverLayer.activate();
  gameOverAssets = createGameOverAssets();

  layers.startScreenLayer.activate();
  layers.mainGameLayer.remove();
  layers.gameOverLayer.remove();
}

setInterval(loop, FRAME_TIME);
document.onkeydown = handleKey;
document.onkeyup = releaseKey;

function loop() {
  switch (gameState) {
    case 0:
      startScreenLoop();
      break;
    case 1:
      setupStateLoop();
      break;
    case 2:
      mainGameLoop();
      break;
    case 3:
      gameOverLoop();
      break;
  }
}

function startScreenLoop() {
  if (paper.project.activeLayer != layers.startScreenLayer) {
    paper.project.layers.push(layers.startScreenLayer);
    paper.project.activeLayer.remove();
    layers.startScreenLayer.activate();
  }
  if (instructions) {
    startScreenAssets.title1.visible = false;
    startScreenAssets.title2.visible = false;
    startScreenAssets.title3.visible = false;
    startScreenAssets.start.visible = false;

    if (Math.floor(time / 15) % 2 === 0) {
      startScreenAssets.instruction1.visible = true;
      startScreenAssets.instruction2.visible = false;
    }
    else {
      startScreenAssets.instruction2.visible = true;
      startScreenAssets.instruction1.visible = false;
    }
  }
  else {
    if (Math.floor(time / 18.88) % 3 === 0) {
      startScreenAssets.title3.visible = false;
      startScreenAssets.title1.visible = true;
    }
    else if (Math.floor(time / 18.88) % 3 === 1) {
      startScreenAssets.title1.visible = false;
      startScreenAssets.title2.visible = true;
    }
    else {
      startScreenAssets.title2.visible = false;
      startScreenAssets.title3.visible = true;
    }

    startScreenAssets.start.visible = true;
    startScreenAssets.instruction1.visible = false;
    startScreenAssets.instruction2.visible = false;
  }

  time += 1;
  paper.view.draw();
}

function setupStateLoop() {
  paper.project.layers.push(layers.mainGameLayer);
  paper.project.activeLayer.remove();
  layers.mainGameLayer.activate();
  paper.project.activeLayer.removeChildren();

  var keys = Object.keys(mainGameAssets);
  var objects = keys.map(function (key) { return mainGameAssets[key]; });
  paper.project.activeLayer.addChildren(objects);
  mainGameAssets.score.content = 'Score: 0';
  mainGameAssets.time.content = 'Time: 0';

  boids = [];
  hunters = [];
  all = [];

  // Player (boid[0] always the player)
  player = new Boid(new paper.Point(WIDTH/2, HEIGHT/2),
                    new paper.Point(0, 0),
                    1,
                    0);
  boids.push(player);
  all.push(player);

  // Boids
  for (var i = 0; i < numBoids; i++) {
    var angle = Math.random() * 2 * Math.PI;
    var boid = new Boid(new paper.Point(Math.random() * WIDTH,
                                        Math.random() * HEIGHT),
                        new paper.Point(Math.cos(angle),
                                        Math.sin(angle)),
                        1,  // maxspeed
                        1); // type
    boids.push(boid);
    all.push(boid);
  }

  // Hunters
  for (var i = 0; i < numHunters; i++) {
    var position;

    switch (Math.floor(Math.random() * 4)) {
      case 0:
        position = new paper.Point(Math.random() * WIDTH / 3,
                                   Math.random() * HEIGHT / 3);
        break;
      case 1:
        position = new paper.Point(WIDTH * 2 / 3 + Math.random() * WIDTH / 3,
                                   Math.random() * HEIGHT / 3);
        break;
      case 2:
        position = new paper.Point(Math.random() * WIDTH / 3,
                                   HEIGHT * 2 / 3 + Math.random() * HEIGHT / 3);
        break;
      case 3:
        position = new paper.Point(WIDTH * 2 / 3 + Math.random() * WIDTH / 3,
                                   HEIGHT * 2 / 3 + Math.random() * HEIGHT / 3);
        break;
    }

    var hunter = new Boid(position,
                          new paper.Point(0, 0),
                          2,  // maxspeed
                          2); // type
    hunters.push(hunter);
    all.push(hunter);
  }

  score = 0;
  time = 0;
  sprint = 1;
  powerUps = [
    { instances: [],
      nextSpawn: Math.floor(250 + Math.floor(250 * Math.random())),
      maxSize: 3 },
    { instances: [],
      nextSpawn: Math.floor(500 + Math.floor(500 * Math.random())),
      maxSize: 2 },
    { instances: [],
      nextSpawn: Math.floor(1000 + Math.floor(500 * Math.random())),
      maxSize: 2 }
  ];

  document.getElementById('game-track').load();
  document.getElementById('game-track').volume = 0.02;
  document.getElementById('game-track').play();

  gameState = 2;
}

// TODO: possible pickups: score, speed, slow hunter, "invisible"
function mainGameLoop() {
  //mainGameAssets.sprint.fontFamily = 'qwe';
  //mainGameAssets.sprint.font = 'qwe';
  //console.log(mainGameAssets.sprint.font);
  // Player
  player.velocity = Pmul(player.velocity, 0.8);
  player.velocity = Padd(player.velocity, playerRule());
  player.velocity = dampen(player.velocity, player.maxspeed);

  if (isSprinting) {
    sprint = Math.max(sprint - 0.03, 0);
  }
  if (sprint === 0) {
    isSprinting = false;
    player.maxspeed = 1;
  }
  if (sprint < 1) {
    sprint = Math.min(sprint + 0.003, 1);
  }

  // Boids
  for (var i = 1; i < boids.length; i++) {
    var boid = boids[i];
    var rules = [];
    var sum_COM = calculate_COM(boids);
    var sum_VEL = calculate_VEL(boids);

    if (boids.length >= 2) {
      rules.push(rule1(boid, sum_COM, boids));
      rules.push(rule2(boid, boids));
      rules.push(rule3(boid, sum_VEL, boids));
    }
    rules.push(rule4(boid));
    rules.push(runRule(boid));
    for (var r = 0; r < rules.length; r++) {
      boid.velocity = Padd(boid.velocity, rules[r]);
    }

    boid.velocity = dampen(boid.velocity, boid.maxspeed);
    boid.velocity = Padd(boid.velocity, noise());
  }

  // Hunters
  for (var i = 0; i < numHunters; i++) {
    var hunter = hunters[i];
    var rules = [];

    var sum_COM = calculate_COM(hunters);
    var sum_VEL = calculate_VEL(hunters);

    if (hunters.length >= 2) {
      rules.push(rule1(hunter, sum_COM, hunters));
      rules.push(rule2(hunter, hunters));
      rules.push(rule3(hunter, sum_VEL, hunters));
    }
    rules.push(huntRule(hunter));
    rules.push(rule4(hunter));
    for (var r = 0; r < rules.length; r++) {
      hunter.velocity = Padd(hunter.velocity, rules[r]);
    }

    hunter.velocity = dampen(hunter.velocity, hunter.maxspeed);
  }

  //Power-ups
  //Check collisions
  for (var i = 0; i < powerUps.length; i++) {
    var powerUpGroup = powerUps[i];
    
    for (var j = 0; j < powerUpGroup.instances.length; j++) {
      if (Pdistsq(powerUpGroup.instances[j].position,
                  boids[0].position) < 250) {
        powerUpGroup.instances[j].raster.remove();
        powerUpGroup.instances[j] = null;

        switch (i) {
          case 0:
            score += 5000;
            break;
          case 1:
            for (var k = 0;
                 k < Math.min(Math.max(numBoids - boids.length + 1, 0), 
                              Math.floor(numBoids / 10));
                 k++) {
              var angle = Math.random() * 2 * Math.PI;
              var boid = new Boid(new paper.Point(Math.random() * WIDTH,
                                                  Math.random() * HEIGHT),
                                  new paper.Point(Math.cos(angle),
                                                  Math.sin(angle)),
                                  1,  // maxspeed
                                  1); // type
              boids.push(boid);
              all.push(boid);
            }
            break;
          case 2:
            for (var k = 0;
                 k < Math.floor(numBoids / 20);
                 k++) {
              var angle = Math.random() * 2 * Math.PI;
              var boid = new Boid(new paper.Point(Math.random() * WIDTH,
                                                  Math.random() * HEIGHT),
                                  new paper.Point(Math.cos(angle),
                                                  Math.sin(angle)),
                                  1.5,  // maxspeed
                                  5); // type
              boids.push(boid);
              all.push(boid);
            }
            break;
        }
      }
    }
  }
  powerUps = powerUps.map(
    function (element1) {
      element1.instances = element1.instances.filter(
        function (element2) {
          return (element2 ? true : false);
        });
      return element1;
    });

  //Spawn power ups
  for (var i = 0; i < powerUps.length; i++) {
    var powerUpGroup = powerUps[i];
    if (time === powerUpGroup.nextSpawn) {
      var instance = new powerUp(new paper.Point(50 + Math.random() * (WIDTH - 50),
                                                 50 + Math.random() * (HEIGHT - 50)),
                                 i,
                                 time);
      powerUpGroup.instances.push(instance);
      powerUpGroup.nextSpawn = -1;
    }
  }

  //Set next spawn if possible
  for (var i = 0; i < powerUps.length; i++) {
    var powerUpGroup = powerUps[i];
    if ((powerUpGroup.nextSpawn === -1) &&
        (powerUpGroup.instances.length < powerUpGroup.maxSize)) {
      switch (i) {
        case 0:
          powerUpGroup.nextSpawn = time + 250 + Math.floor(250 * Math.random());
          break;
        case 1:
          powerUpGroup.nextSpawn = time + 500 + Math.floor(500 * Math.random());
          break;
        case 2:
          powerUpGroup.nextSpawn = time + 1000 + Math.floor(500 * Math.random());
          break;
      }
    }
  }

  //Move spawned fruit if untouched for a while
  for (var i = 0; i < powerUps.length; i++) {
    var powerUpGroup = powerUps[i];

    for (var j = 0; j < powerUpGroup.instances.length; j++) {
      if (time >= powerUpGroup.instances[j].spawnTime + 250 + 125 * i) {
        powerUpGroup.instances[j].position = new paper.Point(50 + Math.random() * (WIDTH - 50),
                                                             50 + Math.random() * (HEIGHT - 50));
        powerUpGroup.instances[j].spawnTime = time;
        powerUpGroup.instances[j].draw();
      }
    }
  }

  //Score, Time
  score += changeInScore();
  time += 1;

  if (time % 40 === 0) {
    mainGameAssets.score.content = 'Score: ' + score.toString();
    mainGameAssets.time.content = 'Time: ' + (time / 40).toString();
  }

  mainGameAssets.sprintBar.bounds.width = (WIDTH_FULL * 7 / 16) * sprint;
  /*mainGameAssets.sprintBar.fillColor = new paper.Color(
    1 - sprint, 0, sprint
  );*/
  mainGameAssets.sprintBar.fillColor = {
        gradient: {
            stops: ['red', 'blue']
        },
        origin: [WIDTH_FULL * 16 / 64, (HEIGHT + HEIGHT_FULL) / 2 - 15],
        destination: [WIDTH_FULL * 45 / 64, (HEIGHT + HEIGHT_FULL) / 2 + 25]
    };

  // Draw/update loop
  for (var i = 0; i < all.length; i++) {
    boid = all[i];

    boid.position = boundary(Padd(boid.position, boid.velocity));
    // boid.position = Padd(boid.position, boid.velocity);
    boid.draw(time + i * 8);
  }

  paper.view.draw();
}

function gameOverLoop() {
  if (paper.project.activeLayer != layers.gameOverLayer) {
    paper.project.layers.push(layers.gameOverLayer);
    paper.project.activeLayer.remove();
    layers.gameOverLayer.activate();

    gameOverAssets.score.content = 'Your score was ' + score.toString() + '.';
    gameOverAssets.time.content = 'You survived for ' + Math.floor(time / 40).toString() + ' seconds.';
  }

  paper.view.draw();
}

function handleKey(e) {
  e = e || window.event;

  switch(e.keyCode) {
    case 13:  // enter
      if (gameState === 0) {
        if (instructions) {
          gameState = 1;
          instructions = false;
        }
        else {
          instructions = true;
        }
      }
      else if (gameState === 3) {
        gameState = 0;
        time = 0;
      }
      break;
    case 32:
      if (sprint > 0.5) {
        isSprinting = true;
        player.maxspeed = 2;
      }
      break;
    case 37:  // left
      left = true;
      break;
    case 38:  // up
      up = true;
      break;
    case 39:  // right
      right = true;
      break;
    case 40:  // down
      down = true;
      break;
  }
}

function releaseKey(e) {
  e = e || window.event;

  switch(e.keyCode) {
    case 32:
      isSprinting = false;
      player.maxspeed = 1;
      break;
    case 37:
      left = false;
      break;
    case 38:
      up = false;
      break;
    case 39:
      right = false;
      break;
    case 40:
      down = false;
      break;
  }
}

function playerRule() {
  var sum = new paper.Point(0, 0);
  if (left) { sum = Padd(sum, new paper.Point(-1, 0)); }
  if (right) { sum = Padd(sum, new paper.Point(1, 0)); }
  if (up) { sum = Padd(sum, new paper.Point(0, -1)); }
  if (down) { sum = Padd(sum, new paper.Point(0, 1)); }

  return Pscale(sum, 1);
}

function calculate_COM(group) {
  var sum = group[0].position;
  for (var i = 1; i < group.length; i++) {
    sum = Padd(sum, group[i].position);
  }
  return sum;
}

function calculate_VEL(group) {
  var sum = group[0].velocity;
  for (var i = 1; i < group.length; i++) {
    sum = Padd(sum, group[i].velocity);
  }
  return sum;
}

function dampen(vel, max) {
  // Soft
  // if (Pabs(vel) > max) {
  //   vel = Pmul(vel, 0.9); 
  // }
 
  // Hard
  if (Pabs(vel) > 2 * max) {
    vel = Pscale(vel, 2 * max);
  }
  return vel;
}

function noise() {
  var angle = Math.random() * 2 * Math.PI;
  var base = new paper.Point(Math.cos(angle), Math.sin(angle));
  return Pdiv(base, 10);
}

function boundary(pos) {
  if (pos.x < 0) { pos.x = 0; }
  if (pos.x > WIDTH) { pos.x = WIDTH; }
  if (pos.y < 0) { pos.y = 0; }
  if (pos.y > HEIGHT) { pos.y = HEIGHT; }
  return pos;
}

// Attraction to perceived center of mass
function rule1(boid, sum_COM, group) {
  var per_COM = Psub(sum_COM, boid.position);
  var per_COM = Pdiv(per_COM, group.length - 1);
  return Pdiv(Psub(per_COM, boid.position), 1000);
}

// Repulsion to nearby boids
// TODO: fix issue where boids overlap and never separate (dist = 0)
function rule2(boid, group) {
  var sum = new paper.Point(0, 0);
  for (var i = 0; i < group.length; i++) {
    if (group[i] !== boid) {
      if (Pdistsq(group[i].position, boid.position) < 1000) {
        var displace = Psub(group[i].position, boid.position);
        sum = Psub(sum, displace);
      }
    }
  }
  return Pdiv(sum, 100);
}

// Assimilate
function rule3(boid, sum_VEL, group) {
  var per_VEL = Psub(sum_VEL, boid.velocity);
  var per_VEL = Pdiv(per_VEL, group.length - 1);
  return Pdiv(Psub(per_VEL, boid.velocity), 100);
}

// Edge avoiding
function rule4(boid) {
  var SCALE = 0.1;
  var BOUND = 25;
  var sum = new paper.Point(0, 0); 
  var mag = Pabs(boid.velocity);
  if (boid.position.x < BOUND) { sum = Padd(sum, new paper.Point(SCALE * mag, 0)); }
  if (boid.position.x > WIDTH - BOUND) { sum = Psub(sum, new paper.Point(SCALE * mag, 0)); }
  if (boid.position.y < BOUND) { sum = Padd(sum, new paper.Point(0, SCALE * mag)); }
  if (boid.position.y > HEIGHT - BOUND) { sum = Psub(sum, new paper.Point(0, SCALE * mag)); }
  return sum;
}

function runRule(boid) {
  var sum = new paper.Point(0, 0);
  for (var i = 0; i < numHunters; i++) {
    if (Pdistsq(hunters[i].position, boid.position) < 20000) {
      var displace = Psub(hunters[i].position, boid.position);
      sum = Psub(sum, displace);
    }
  }
  return Pdiv(sum, 50);
}

// Hunt closest boid
function huntRule(hunter) {
  var SCALE = 0.1;
  var minD = Pdistsq(hunter.position, boids[0].position);
  var ind = 0;
  var closest = boids[0];

  for (var i = 1; i < boids.length; i++) {
    var d = Pdistsq(hunter.position, boids[i].position);
    if (d < minD) {
      minD = d;
      ind = i;
      closest = boids[i];
    }
  }
 
  // Try to avoid orbit 
  if (minD < 10000) {
    SCALE = SCALE * 10;
  }

  // Eat
  if (minD < 250) {
    if (ind == 0) {
      gameState = 3;
      document.getElementById('game-track').pause();
    }
    
    boids.splice(ind, 1);
    closest.velocity = new paper.Point(0, 0);
    closest.type = 3;
    closest.removeRasters();
    closest.rasters = null;  // Redraw dead boid

    hunter.type = 4;
    hunter.removeRasters();
    hunter.rasters = null;   // Redraws hunter
    hunter.maxspeed = 0;
  }

  if (hunter.maxspeed < 0.2) {
    hunter.maxspeed += 0.005;
  } else if (hunter.maxspeed < 2) {
    hunter.maxspeed += 0.05;
    hunter.type = 2;
    hunter.removeRasters();
    hunter.rasters = null;
  }

  var vel = Psub(closest.position, hunter.position);
  return Pscale(vel, SCALE);
}

function changeInScore() {
  var change = 10 * hunters.length;

  if (boids.length > 2) {
    for (var i = 2; i < boids.length; i++) {
      change += 100 / (0.1 + Math.sqrt(Pdistsq(boids[0].position, boids[i].position)));
    }
  }

  return Math.floor(change);
}
