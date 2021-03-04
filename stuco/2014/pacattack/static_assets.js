function createStartScreenAssets() {
  var startScreenAssets = {};

  startScreenAssets.background = new paper.Path.Rectangle(
    { from: [0, 0],
      to: [WIDTH_FULL, HEIGHT_FULL],
      strokeColor: 'black',
      fillColor: 'black'
    });

  startScreenAssets.title1 = new paper.Raster(
    { source: 'pacman/title1.png',
      position: new paper.Point(WIDTH_FULL / 2, HEIGHT_FULL / 3)
    });
  startScreenAssets.title1.visible = false;
  startScreenAssets.title1.scale(1.5);

  startScreenAssets.title2 = new paper.Raster(
    { source: 'pacman/title2.png',
      position: new paper.Point(WIDTH_FULL / 2, HEIGHT_FULL / 3)
    });
  startScreenAssets.title2.visible = false;
  startScreenAssets.title2.scale(1.5);

  startScreenAssets.title3 = new paper.Raster(
    { source: 'pacman/title3.png',
      position: new paper.Point(WIDTH_FULL / 2, HEIGHT_FULL / 3)
    });
  startScreenAssets.title3.visible = false;
  startScreenAssets.title3.scale(1.5);

  startScreenAssets.start = new paper.Raster(
    { source: 'pacman/start.png',
      position: new paper.Point(WIDTH_FULL / 2, HEIGHT_FULL * 2 / 3)
    });

  startScreenAssets.instruction1 = new paper.Raster(
    { source: 'pacman/rules1.png',
      position: new paper.Point(WIDTH_FULL / 2, HEIGHT_FULL / 2)
    });
  startScreenAssets.instruction1.visible = false;
  startScreenAssets.instruction1.scale(1.5);

  startScreenAssets.instruction2 = new paper.Raster(
    { source: 'pacman/rules2.png',
      position: new paper.Point(WIDTH_FULL / 2, HEIGHT_FULL / 2)
    });
  startScreenAssets.instruction2.visible = false;
  startScreenAssets.instruction2.scale(1.5);

  return startScreenAssets;
}

function createMainGameAssets() {
  var mainGameAssets = {};

  mainGameAssets.background = new paper.Path.Rectangle(
    { from: [0, 0],
      to: [WIDTH, HEIGHT + 10],
      strokeColor: 'black',
      fillColor: 'black'
    });

  /*mainGameAssets.divider = new paper.Path.Line(
    { from: [0, HEIGHT + 10],
      to: [WIDTH_FULL, HEIGHT + 10],
      strokeColor: 'black'
    });*/

  mainGameAssets.border1 = new paper.Path.Rectangle(
    { from: [10, HEIGHT + 15],
      to: [WIDTH - 10, HEIGHT_FULL - 5],
      strokeColor: 'white',
      strokeWidth: 5
    });

  mainGameAssets.border2 = new paper.Path.Rectangle(
    { from: [0, HEIGHT + 25],
      to: [WIDTH, HEIGHT_FULL - 15],
      strokeColor: 'white',
      strokeWidth: 5
    });

  mainGameAssets.score = new paper.PointText(
    { point: [WIDTH_FULL * 2 / 64, (HEIGHT * 2 + HEIGHT_FULL) / 3 + 15],
      justification: 'left',
      fillColor: 'white',
      fontSize: 20,
      content: 'Score: 0'
    });

  mainGameAssets.time = new paper.PointText(
    { point: [WIDTH_FULL * 2 / 64, (HEIGHT + HEIGHT_FULL * 2) / 3 + 10],
      justification: 'left',
      fillColor: 'white',
      fontSize: 20,
      content: 'Time: 0'
    });

  mainGameAssets.sprint = new paper.PointText(
    { point: [WIDTH_FULL * 12 / 64, (HEIGHT + HEIGHT_FULL) / 2 + 10],
      justification: 'left',
      fillColor: 'white',
      fontSize: 20,
      content: 'Sprint: '
    });
  /*mainGameAssets.characterStyle = {
      fontSize: 20,
      font: '8-BIT WONDER',
      fillColor: 'white',
    };*/

  mainGameAssets.sprintBarContainer = new paper.Path.Rectangle({
    from: [WIDTH_FULL * 16 / 64, (HEIGHT + HEIGHT_FULL) / 2 - 15],
    to: [WIDTH_FULL * 44 / 64, (HEIGHT + HEIGHT_FULL) / 2 + 25],
    strokeColor: 'white',
    strokeWidth: 3,
    radius: 5
  });

  mainGameAssets.sprintBar = new paper.Path.Rectangle({
    from: [WIDTH_FULL * 16 / 64, (HEIGHT + HEIGHT_FULL) / 2 - 15],
    to: [WIDTH_FULL * 45 / 64, (HEIGHT + HEIGHT_FULL) / 2 + 25],
    fillColor: {
        gradient: {
            stops: ['red', 'blue']
        },
        origin: [WIDTH_FULL * 16 / 64, (HEIGHT + HEIGHT_FULL) / 2 - 15],
        destination: [WIDTH_FULL * 45 / 64, (HEIGHT + HEIGHT_FULL) / 2 + 25]
    },
    strokeColor: 'white',
    strokeWidth: 3,
    radius: 5
  });

  mainGameAssets.powerUps = new paper.PointText(
    { point: [WIDTH_FULL * 93 / 128, (HEIGHT + HEIGHT_FULL) / 2 + 10],
      justification: 'left',
      fillColor: 'white',
      fontSize: 20,
      content: 'Power ups: '
    });

  mainGameAssets.powerUpsBox1 = new paper.Path.Rectangle({
    from: [WIDTH_FULL * 53 / 64, (HEIGHT + HEIGHT_FULL) / 2 - 30],
    to: [WIDTH_FULL * 57 / 64, (HEIGHT + HEIGHT_FULL) / 2 + 40],
    strokeColor: 'white',
    fillColor: 'white',
    radius: 15
  });

  mainGameAssets.powerUpsBox2 = new paper.Path.Rectangle({
    from: [WIDTH_FULL * 58 / 64, (HEIGHT + HEIGHT_FULL) / 2 - 30],
    to: [WIDTH_FULL * 62 / 64, (HEIGHT + HEIGHT_FULL) / 2 + 40],
    strokeColor: 'white',
    fillColor: 'white',
    radius: 15
  });

  return mainGameAssets;
}

function createGameOverAssets() {
  var gameOverAssets = {};

  gameOverAssets.background = new paper.Path.Rectangle(
    { from: [0, 0],
      to: [WIDTH_FULL, HEIGHT_FULL],
      strokeColor: 'black',
      fillColor: 'black'
    });

  gameOverAssets.message = new paper.Raster(
    { source: 'pacman/gameOver.png',
      position: new paper.Point(WIDTH_FULL / 2, HEIGHT_FULL / 3)
    });

  gameOverAssets.score = new paper.PointText(
    { point: [WIDTH_FULL / 2, HEIGHT_FULL / 2],
      justification: 'center',
      fillColor: 'white',
      fontSize: 50,
      content: 'Your score was 0.'
    });

  gameOverAssets.time = new paper.PointText(
    { point: [WIDTH_FULL / 2, HEIGHT_FULL * 7 / 12],
      justification: 'center',
      fillColor: 'white',
      fontSize: 50,
      content: 'You survived for 0 seconds.'
    });

  gameOverAssets.start = new paper.Raster(
    { source: 'pacman/gameOverStart.png',
      position: new paper.Point(WIDTH_FULL / 2 + 10, HEIGHT_FULL * 2 / 3)
    });

  return gameOverAssets;
}

function powerUp(position, type, spawnTime) {
  this.type = type;
  this.position = position;
  this.spawnTime = spawnTime;

  switch (this.type) {
    case 0:
      this.raster = new paper.Raster('pacman/cherry.png');
      this.raster.position = this.position;
      break;
    case 1:
      this.raster = new paper.Raster('pacman/orange.png');
      this.raster.position = this.position;
      break;
    case 2:
      this.raster = new paper.Raster('pacman/melon.png');
      this.raster.position = this.position;
      break
  }

  this.draw = function () {
    this.raster.position = this.position;
  }
}