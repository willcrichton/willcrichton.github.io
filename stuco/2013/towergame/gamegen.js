/*
 * Tower game
 * rvalle
 * written using https://github.com/straker/galaxian-canvas-game for keycode stuff
 */

/*
 * 2do:
 * =============================
 * =============================
 * =============================
 * =============================
 * =============================
 * -more shit
 * -prettyness
 *
 * done:
 * -player movement
 * -platforms w/ gravity
 * -spawning platforms properly
 * -scrolling + height + death...
 * -enemies?
 * -prices and vaules
 * -art
 */

var game = new Game();

//maybe move elsewhere
var fieldheight = 650;
var fieldwidth = 1330;

function init() {
  if(game.init()) {
    game.start();
  }
}

var images = new function() {
  this.pc = new Image();
  this.pc.src = "images/demochar.png";
  this.oilrig = new Image();
  this.oilrig.src = "images/oilrig.png";
  this.onebyone = new Image();
  this.onebyone.src = "images/onebyone.png";
  this.twobysix = new Image();
  this.twobysix.src = "images/twobysix.png";
  this.threebyfour = new Image();
  this.threebyfour.src = "images/threebyfour.png";
  this.fivebytwo= new Image();
  this.fivebytwo.src = "images/fivebytwo.png";
  this.twobythree= new Image();
  this.twobythree.src = "images/twobythree.png";
  this.turretactive = new Image();
  this.turretactive.src = "images/turretactive.png";
  this.turretreload = new Image();
  this.turretreload.src = "images/turretreload.png";
  this.trampoline = new Image();
  this.trampoline.src = "images/trampoline.png";
  this.generator = new Image();
  this.generator.src = "images/generator.png";
  this.enemy = new Image();
  this.enemy.src = "images/enemy.png";
  this.cloud = new Image();
  this.cloud.src = "images/cloudlayer.png";
}

function screeny(y) {
  return fieldheight - y + game.bheight;
}

function Player() {
  this.walkspeed = 3;
  this.jumpspeed = 4;
  this.standing = false;
  this.init = function(x, y, width, height) {
    this.vx = 0;
    this.vy = 0;
    this.x = x;
    this.y = y;
    this.g = 0.1;
    this.width = width;
    this.height = height;
    this.alive = true;
  }

  this.move = function() {
    if(KEY_STATUS.left || KEY_STATUS.right || KEY_STATUS.down || KEY_STATUS.up || !(this.standing)) {
      this.context.clearRect(this.x-4, screeny(this.y)-4, this.width+8, this.height+8);
      this.vx = 0;
      if(this.standing) {
        this.vy = 0;
      } else {
        this.vy -= this.g;
      }
      if(KEY_STATUS.left) {
        this.vx = -this.walkspeed;
      }
      if(KEY_STATUS.right) {
        this.vx = this.walkspeed;
      }
      // jump
      if(KEY_STATUS.up) {
        if(this.standing) {
          this.vy = this.jumpspeed;
          this.standing = false;
        }
      }
      // fall through
      else if(KEY_STATUS.down) {
        this.vy = -this.walkspeed;
        this.y -= 2;
        this.standing = false;
      }
      this.x += this.vx;
    }
    // with y: detect if landing on a platform
    var hitplatform = false;
    for(i=0; i<game.buildings.length; i++) {
      if(this.y - this.height >= game.buildings[i].y && (this.y + this.vy - this.height) <= game.buildings[i].y
          && (this.x + this.width >= game.buildings[i].x && this.x < game.buildings[i].x + game.buildings[i].width)) {
            hitplatform = true;
            this.y = game.buildings[i].y + this.height;
            this.vy = 0;
            this.standing = true;
            if(game.buildings[i].type == 'trampoline') {
              this.vy += 6.5;
            }
            break;
          }
    }
    if(!hitplatform) {
      this.y += this.vy;
      this.standing = false;
    }

    // scroll the screen
    if(screeny(this.y) < 144) {
      game.bheight += 1;
      game.buildings[0].context.clearRect(0, 0, fieldwidth, fieldheight);
    }
    this.draw();

    // death
    if(this.y < game.cheight) {
      console.log('u died...');
      this.alive = false;
    }

    // Spawning buildings
    if(KEY_STATUS.q || KEY_STATUS.w || KEY_STATUS.e || KEY_STATUS.r || KEY_STATUS.a || KEY_STATUS.s || KEY_STATUS.d || KEY_STATUS.f) {
      newbuild = new Building;
      
      var bx=100;
      var by=100;
      var bwidth=32;
      var bheight=32;
      var btype='onebyone';
      if(KEY_STATUS.a && game.refreshBar[4]==1.0) { bx=this.x; by=this.y; bwidth=32; bheight=32; btype='onebyone'; }
      else if(KEY_STATUS.s && game.refreshBar[5]==1.0) { bx=this.x - 80; by=this.y + 32; bwidth=192; bheight=64; btype='twobysix'; }
      else if(KEY_STATUS.d && game.refreshBar[6]==1.0) { bx=this.x - 48; by=this.y + 64; bwidth=128; bheight=96; btype='threebyfour'; }
      else if(KEY_STATUS.f && game.refreshBar[7]==1.0) { bx=this.x - 32; by=this.y + 32; bwidth=96; bheight=64; btype='twobythree'; }
      else if(KEY_STATUS.q && game.refreshBar[0]==1.0) { bx=this.x - 16; by=this.y + 128; bwidth=64; bheight=160; btype='fivebytwo'; }
      else if(KEY_STATUS.w && game.refreshBar[1]==1.0) { bx=this.x - 16; by=this.y + 64; bwidth=64; bheight=96; btype='turret'; }
      else if(KEY_STATUS.e && game.refreshBar[2]==1.0) { bx=this.x - 16; by=this.y + 32; bwidth=64; bheight=64; btype='trampoline'; }
      else if(KEY_STATUS.r && game.refreshBar[3]==1.0) { bx=this.x - 64; by=this.y + 128; bwidth=160; bheight=160; btype='generator'; }

      // detect if building can be placed
      // collide: is building bumping into other buildings?
      // lsupport, rsupport: is building supported on both sides of center of mass?
      var lsupport = false;
      var rsupport = false;
      var collide = false;

      if(game.buildingSafe(bx, by, bheight, bwidth, true)) {
        newbuild.init(bx, by, bwidth, bheight, btype);
        game.buildings.push(newbuild);

        if(btype=='onebyone') { game.refreshBar[4] = 0.0; }
        if(btype=='twobysix') { game.refreshBar[5] = 0.0; }
        if(btype=='threebyfour') { game.refreshBar[6] = 0.0; }
        if(btype=='twobythree') { game.refreshBar[7] = 0.0; }
        if(btype=='fivebytwo') { game.refreshBar[0] = 0.0; }
        if(btype=='turret') { game.refreshBar[1] = 0.0; }
        if(btype=='trampoline') { game.refreshBar[2] = 0.0; }
        if(btype=='generator') { game.refreshBar[3] = 0.0; }
      }

    }
  }

  this.draw = function() {
    this.context.clearRect(this.x-4, screeny(this.y)-4, screeny(this.y) + 8, this.height + 8);
    this.context.drawImage(images.pc, this.x, screeny(this.y));
  }
}


function Building() {
  this.init = function(x, y, width, height, type) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.type = type;
    game.sheight = Math.max(y, game.sheight);
    if(this.type == 'turret') { this.reload = 200; this.radius = 300;}
  }

  this.move = function() {
    if(this.type == 'turret') {
      if(this.reload > 0) { this.reload -= 1; }
      // target enemies
      else {
        for(i=0; i<game.enemies.length; i++) {
          if(Math.sqrt(Math.pow(game.enemies[i].x - this.x, 2) + Math.pow(game.enemies[i].y - this.y, 2)) <= this.radius) {
            console.log('BANG!');
            this.reload = 300;
            game.killEnemy(i);
            break;
          }
        }
      }
    }
  }

  this.draw = function() {
    this.context.clearRect(this.x, screeny(this.y)-1, this.width, this.height);
    if(this.type == 'oilrig') { this.context.drawImage(images.oilrig, this.x, screeny(this.y)); }
    if(this.type == 'onebyone') { this.context.drawImage(images.onebyone, this.x, screeny(this.y)); }
    if(this.type == 'twobysix') { this.context.drawImage(images.twobysix, this.x, screeny(this.y)); }
    if(this.type == 'threebyfour') { this.context.drawImage(images.threebyfour, this.x, screeny(this.y)); }
    if(this.type == 'fivebytwo') { this.context.drawImage(images.fivebytwo, this.x, screeny(this.y)); }
    if(this.type == 'twobythree') { this.context.drawImage(images.twobythree, this.x, screeny(this.y)); }

    if(this.type == 'trampoline') { this.context.drawImage(images.trampoline, this.x, screeny(this.y)); }
    if(this.type == 'generator') {
      this.context.drawImage(images.generator, this.x, screeny(this.y));
      if(this.y < game.cheight && this.y+5 > game.cheight) { game.magic = 0; }
    }
    if(this.type == 'turret') { 
      if(this.reload == 0) { this.context.drawImage(images.turretactive, this.x, screeny(this.y)); }
      else { this.context.drawImage(images.turretreload, this.x, screeny(this.y)); }
    }
  }
}

function Cloud() {
  this.init = function(x, y, width, height) {
    this.x = 0;
    this.y = y;
    this.width = width;
    this.height = height;
    this.vy = 0.01;
  }
  this.move = function() {
    this.x += 1;
    this.y = game.cheight + this.height;
    if(game.cheight > -256+1200) { game.vc = .4; }
    else if(game.cheight > -256+300) { game.vc = .3; }
    else if(game.cheight > -256+120) { game.vc = .2; }
    else if(game.cheight > -256+20) { game.vc = .1; }
  }
  this.draw = function() {
    this.context.clearRect(0, screeny(this.y), fieldwidth, this.height);
    this.context.clearRect(0, fieldheight-100, fieldwidth, this.height);

    // draw cloud
    this.context.drawImage(images.cloud, (this.x) % (3*this.width) - this.width, screeny(this.y));
    this.context.drawImage(images.cloud, (this.x + this.width) % (3*this.width) - this.width, screeny(this.y));
    this.context.drawImage(images.cloud, (this.x + 2*this.width) % (3*this.width) - this.width, screeny(this.y));
    this.context.fillStyle = "#e5e5e5";
    this.context.fillRect(0, (screeny(this.y)-4) + this.height, fieldwidth, fieldheight - (screeny(this.y)-4));
    
    // draw score
    this.context.fillStyle = "#a43115";
    this.context.fillText(Math.floor(game.sheight/16) + " m", fieldwidth/2-40, fieldheight-20);

    // draw datas
    this.context.fillStyle = "#a43115";
    this.context.fillRect(fieldwidth/2+40-4, fieldheight-55-10, 8, 20);
    this.context.fillStyle = "#19e6df";
    this.context.fillRect(fieldwidth/2+80-4, fieldheight-55-6, 8, 12);
    this.context.fillStyle = "#caaad1";
    this.context.fillRect(fieldwidth/2+120-4, fieldheight-55-4, 8, 8);
    this.context.fillStyle = "#ff55aa";
    this.context.fillRect(fieldwidth/2+160-10, fieldheight-55-10, 20, 20);
    this.context.fillStyle = "#07d4cd";
    this.context.fillRect(fieldwidth/2+40-2, fieldheight-25-2, 4, 4);
    this.context.fillStyle = "#f5d417";
    this.context.fillRect(fieldwidth/2+80-12, fieldheight-25-4, 24, 8);
    this.context.fillStyle = "#ea8017";
    this.context.fillRect(fieldwidth/2+120-8, fieldheight-25-6, 16, 12);
    this.context.fillStyle = "#cbcedb";
    this.context.fillRect(fieldwidth/2+160-6, fieldheight-25-4, 12, 8);

    this.context.fillStyle = "#000000";
    for(var i=0; i<8; i++) {
      this.context.fillRect(fieldwidth/2+(i%4)*40+30, fieldheight-44+25*Math.floor(i/4), Math.floor(game.refreshBar[i]*20), 8);
      game.refreshBar[i];
    }
  }
}

function Enemy() {
  this.init = function(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.faceright = (x < fieldwidth/2);
    this.vx = 0.4;
    this.count = Math.floor(Math.random() * 40);
  }

  this.move = function() {
    if(this.faceright) { this.x += this.vx; }
    else { this.x -= this.vx; }
    this.y += Math.sin(this.count/40);
    this.count += 1;

    if(this.count % 40 == 0) {
      for(var i=0; i<game.buildings.length; i++) {
        // detonate upon collision of center w/ building
        var cx = (this.x + this.width/2 >= game.buildings[i].x && this.x + this.width/2 <= game.buildings[i].x + game.buildings[i].width);
        var cy = (this.y - this.height/2 <= game.buildings[i].y && this.y - this.height/2 >= game.buildings[i].y - game.buildings[i].height);
        if(cx && cy) {
          console.log('explosion!!!');
          // building i is destroyed!
          game.killBuilding(i);
          break;
        }
      }
    }
  }

  this.draw = function() {
    this.context.clearRect(this.x-2, screeny(this.y)-2, this.width+4, this.height+4);
    this.context.drawImage(images.enemy, this.x, screeny(this.y));
  }
}


function Game() {
  this.init = function() {
    this.playercanvas = document.getElementById('player');
    this.structurecanvas = document.getElementById('structure');
    this.fgcanvas = document.getElementById('foreground');
    this.enemycanvas = document.getElementById('enemies');

    if(this.playercanvas.getContext) {
      // base height
      this.bheight = -192;
      // cloud height
      this.cheight = -256;
      this.vc = 0.05;
      // max structure height
      this.sheight = 0;

      // idk if doing this right
      this.context = this.playercanvas.getContext('2d');
      Player.prototype.context = this.context;
      Player.prototype.canvasWidth = this.playercanvas.width;
      Player.prototype.canvasHeight = this.playercanvas.height;
        
      // spawn the player
      this.player = new Player();
      this.player.init(fieldwidth/2-16, 100, 32, 32);

      // create buildings
      Building.prototype.context = this.structurecanvas.getContext('2d');
      this.buildings = [];
      // spawn the base
      oilrig = new Building();
      oilrig.init(fieldwidth/2-192, 0, 384, 472, 'oilrig');
      this.buildings.push(oilrig);

      Cloud.prototype.context = this.fgcanvas.getContext('2d');
      this.cloud = new Cloud();
      this.cloud.init(0, -64, 1024, 192);
      this.cloud.context.font = '30pt Economica';
      this.cloud.context.fillText('test', -500, -500);

      // create enemies
      Enemy.prototype.context = this.enemycanvas.getContext('2d');
      this.enemies = [];
      this.enemyTimer = 900;
      /*testblob = new Enemy();
      testblob.init(0, 100, 64, 64);
      this.enemies.push(testblob);
      testblob2 = new Enemy();
      testblob2.init(0, 200, 64, 64);
      this.enemies.push(testblob2);*/

      // build stats
      this.refreshBar = [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0];
      this.refreshRate = [
                          1/(40*6),
                          1/(40*30),
                          1/(40*12),
                          1/(40*50),
                          1/(40*12),
                          1/(40*6),
                          1/(40*4),
                          1/(40*6),
                         ];
      this.magic = 0;

      return true;
    } else {
      return false;
    }
  }

  this.reset = function() {
    this.bheight = -192;
    this.cheight = -256;
    this.vc = 0.05;
    this.sheight = 0;

    this.player.context.clearRect(0, 0, fieldwidth, fieldheight);
    this.cloud.context.clearRect(0, 0, fieldwidth, fieldheight);
    
    this.player = new Player();
    this.player.init(fieldwidth/2-16, 100, 32, 32);

    this.buildings = [];
    oilrig = new Building();
    oilrig.init(fieldwidth/2-192, 0, 384, 472, 'oilrig');
    oilrig.context.clearRect(0, 0, fieldwidth, fieldheight);
    this.buildings.push(oilrig);

    this.cloud = new Cloud();
    this.cloud.init(0, -64, 1024, 192);
    
    this.enemycanvas.getContext('2d').clearRect(0, 0, fieldwidth, fieldheight);
    this.enemies = [];
  }

  // main loop
  this.start = function() {
    animate();
  }

  // functions that should probably go elsewhere...
  
  // updates bars
  this.updateBars = function() {
    for(var i=0; i<8; i++) {
      this.refreshBar[i] = Math.min(1.0, this.refreshBar[i]+this.refreshRate[i]*(1+this.magic));
    }
  }
  
  // kills enemy i, handling cleanup
  this.killEnemy = function(i) {
    var en = this.enemies[i];
    en.context.clearRect(en.x-2, screeny(en.y)-2, en.width+4, en.height+4);
    this.enemies.splice(i, 1);
  }

  // kills building i, handles cleanup, checks above buildings
  this.killBuilding = function(i) {
    var bd = this.buildings[i];
    bd.context.clearRect(bd.x, screeny(bd.y)-1, bd.width, bd.height+1);
    this.buildings.splice(i, 1);
    this.checkStability();
  }

  // checks structural stability for each building; kills any unstable buildings
  this.checkStability = function() {
    for(i=0; i<this.buildings.length; i++) {
      if(this.buildings[i].type != 'oilrig' && !this.buildingSafe(this.buildings[i].x, this.buildings[i].y, this.buildings[i].height, this.buildings[i].width, false)) {
        // break building, check stability again
        this.killBuilding(i);
        return true;
      }
    }
    return false;
  }

  this.buildingSafe = function(bx, by, bheight, bwidth, checkCollide) {
    var lsupport = false;
    var rsupport = false;
    var collide = false;
    for(i=0; i<this.buildings.length; i++) {
      // collide
      var xmiss = (bx + bwidth <= this.buildings[i].x || this.buildings[i].x + this.buildings[i].width <= bx);
      var ymiss = (by <= this.buildings[i].y - this.buildings[i].height || by - bheight >= this.buildings[i].y);
      if(!xmiss && !ymiss) {
        collide = true;
        break;
      }
      var sitting = (by - bheight >= this.buildings[i].y - 1 && by - bheight <= this.buildings[i].y + 1);
      // left side supported
      var lsmiss = (this.buildings[i].x + this.buildings[i].width < bx || bx + (bwidth/2) < this.buildings[i].x);
      var rsmiss = (this.buildings[i].x + this.buildings[i].width < bx + (bwidth/2) || bx + bwidth/2 < this.buildings[i].x);
      if(!lsmiss && sitting) { lsupport = true; }
      if(!rsmiss && sitting) { rsupport = true; }
    }
    if(checkCollide) { return (!collide && lsupport && rsupport); }
    else { return (lsupport && rsupport); }
  }

  this.enemyCheck = function() {
    if(this.enemyTimer > 0) {
      this.enemyTimer -= 1;
    } else {
      this.enemyTimer = 750 + Math.floor(1000*Math.random());

      var enemyY = this.bheight + fieldheight*Math.random();
      var enemyX = -128 + (Math.floor(2*Math.random()) * (fieldwidth + 256));

      for(var i=0; i<Math.floor(3*Math.random()+1+2*this.magic); i++) {
        blob = new Enemy();
        blob.init(enemyX - 32 + 64*Math.random(), enemyY - 32 + 64*Math.random() + 128*i, 64, 64);
        this.enemies.push(blob);

      }
      console.log('woo, i just spawned more SPOOKY GHOSTS');
    }
    for(var i=0; i<this.enemies.length; i++) {
      if(this.enemies[i].y < game.bheight) {
        this.killEnemy(i);
        break;
      }
    }
  }
}


function animate() {
  requestAnimFrame( animate );
  if(game.player.alive) {
    game.player.draw();
    game.player.move();
    for(var i=0; i<game.buildings.length; i++) {
      game.buildings[i].move();
      game.buildings[i].draw();
    }
    game.cheight += game.vc;
    game.updateBars();
    game.cloud.move();
    game.cloud.draw();
    game.enemyCheck();
    for(var i=0; i<game.enemies.length; i++) {
      game.enemies[i].move();
      game.enemies[i].draw();
    }
  } else {
    game.cloud.context.fillStyle = "#ffffff";
    game.cloud.context.fillText('press SPACE to play again', fieldwidth/2-160, 200);
    if(KEY_STATUS.space) { game.reset(); }
  }
}

  // i don't really understand this
  window.requestAnimFrame = (function(){
      return  window.requestAnimationFrame   ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          window.oRequestAnimationFrame      ||
          window.msRequestAnimationFrame     ||
          function(/* function */ callback, /* DOMElement */ element){
                    window.setTimeout(callback, 1000 / 60);
                          };
  })();

// keyboard info
KEY_CODES = {
  32: 'space',
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down',
  65: 'a',
  66: 'b',
  67: 'c',
  68: 'd',
  69: 'e',
  70: 'f',
  71: 'g',
  72: 'h',
  73: 'i',
  74: 'j',
  75: 'k',
  76: 'l',
  77: 'm',
  78: 'n',
  79: 'o',
  80: 'p',
  81: 'q',
  82: 'r',
  83: 's',
  84: 't',
  85: 'u',
  86: 'v',
  87: 'w',
  88: 'x',
  89: 'y',
  90: 'z',
}

KEY_STATUS = {};
for(code in KEY_CODES) {
  KEY_STATUS[KEY_CODES[code]] = false;
}
document.onkeydown = function(e) {
  var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
  if(KEY_CODES[keyCode]) {
    e.preventDefault();
    KEY_STATUS[KEY_CODES[keyCode]] = true;
  }
}
document.onkeyup = function(e) {
  var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
  if(KEY_CODES[keyCode]) {
    e.preventDefault();
    KEY_STATUS[KEY_CODES[keyCode]] = false;
  }
}
