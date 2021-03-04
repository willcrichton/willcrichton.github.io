var ball_group;
var paddle_group;
var bricks;

function createPoint(x,y)
{
  return new Point(scaleX(x), scaleY(y));
}

function scaleX(num)
{
  return num * canvasWidth /510.0;
}

function scaleY(num)
{
  return num * canvasHeight /340.0;
}

function scaleRadius(num)
{
  return num * Math.sqrt(canvasWidth^2+ canvasHeight^2) /
    Math.sqrt(510.0^2 + 340.0^2);
}

function removeBrick(x,y)
{
  bricks[x][y].remove();
}

function drawMovingObjects()
{
  ball_group.children.forEach(function(child) {
        child.remove();
      });

  paddle_group.children.forEach(function(child) {
        child.remove();
      });

	drawShape(ball.GetShapeList());
	drawShape(paddle.GetShapeList());

  view.draw();
}

function drawWorld(world) {

  while(project.activeLayer.children.length > 0)
    project.activeLayer.children.forEach(function(child) {
          child.remove();
        });

  paddle_group = new Group();
  ball_group = new Group();

	for (var j = world.m_jointList; j; j = j.m_next) {
		drawJoint(j);
	}
	for (var b = world.m_bodyList; b; b = b.m_next) {
		for (var s = b.GetShapeList(); s != null; s = s.GetNext()) {
			drawShape(s);
		}
	}

/*
  var path = new Path();
  path.strokeColor = 'black';
  var start = new Point(200, 200);
  path.moveTo(start);
  path.lineTo(start.add([ 200, -50 ]));

  var p_circle = new Path.Circle(new Point(10, 10), 100);
  p_circle.fillColor = 'black';
*/
  view.draw();
}
function drawJoint(joint) {
  /*
	var b1 = joint.m_body1;
	var b2 = joint.m_body2;
	var x1 = b1.m_position;
	var x2 = b2.m_position;
	var p1 = joint.GetAnchor1();
	var p2 = joint.GetAnchor2();
	context.strokeStyle = '#00eeee';
	context.beginPath();
	switch (joint.m_type) {
	case b2Joint.e_distanceJoint:
		context.moveTo(p1.x, p1.y);
		context.lineTo(p2.x, p2.y);
		break;

	case b2Joint.e_pulleyJoint:
		// TODO
		break;

	default:
		if (b1 == world.m_groundBody) {
			context.moveTo(p1.x, p1.y);
			context.lineTo(x2.x, x2.y);
		}
		else if (b2 == world.m_groundBody) {
			context.moveTo(p1.x, p1.y);
			context.lineTo(x1.x, x1.y);
		}
		else {
			context.moveTo(x1.x, x1.y);
			context.lineTo(p1.x, p1.y);
			context.lineTo(x2.x, x2.y);
			context.lineTo(p2.x, p2.y);
		}
		break;
	}
	context.stroke();
  */
}
function drawShape(shape) {
	switch (shape.m_type) {
	case b2Shape.e_circleShape:
  {
    var circle = shape;
    var pos = circle.m_position;
    var r = circle.m_radius;
    var p_circle = new Path.Circle(createPoint(pos.x, pos.y), scaleRadius(r));
    p_circle.fillColor = 'black';

    ball_group.addChild(p_circle);

/*
    var segments = 16.0;
    var theta = 0.0;
    var dtheta = 2.0 * Math.PI / segments;
    // draw circle
    context.moveTo(pos.x + r, pos.y);
    for (var i = 0; i < segments; i++) {
      var d = new b2Vec2(r * Math.cos(theta), r * Math.sin(theta));
      var v = b2Math.AddVV(pos, d);
      context.lineTo(v.x, v.y);
      theta += dtheta;
    }
    context.lineTo(pos.x + r, pos.y);

    // draw radius
    context.moveTo(pos.x, pos.y);
    var ax = circle.m_R.col1;
    var pos2 = new b2Vec2(pos.x + r * ax.x, pos.y + r * ax.y);
    context.lineTo(pos2.x, pos2.y);
    */
  }
  break;
	case b2Shape.e_boxShape:
  {

    console.log('Rect');

  }
  break;
	case b2Shape.e_polyShape:
  {
    var poly = shape;
    if(poly.m_vertexCount == 4){
      var box = shape;

      var box_pos = shape.m_position;

      var tl = b2Math.AddVV(box_pos, b2Math.b2MulMV(box.m_R, box.m_vertices[0]));
      var br = b2Math.AddVV(box_pos, b2Math.b2MulMV(box.m_R, box.m_vertices[2]));
      var rect = Path.Rectangle(createPoint(tl.x, tl.y), createPoint(br.x, br.y));

      var bod = box.GetBody();
      var data = bod.GetUserData();
      if(data != null && data.name == 'brick')
      {
        bricks[data.row][data.col] = rect;
        rect.fillColor = 'red';
      }
      else
        rect.fillColor = 'silver';

      break;
    }

    var poly_pos = shape.m_position;
    var poly_path = new Path();

    poly_path.closed = true;

    //var prev_vert;

    for(var verts = 0; verts < poly.m_vertexCount; verts++)
    {
      /*
      if(prev_vert){
        var prev_vert = b2Math.AddVV(poly_pos, b2Math.b2MulMV(poly.m_R, poly.m_vertices[verts]));
      }
      else{
      */
      var vert = b2Math.AddVV(poly_pos, b2Math.b2MulMV(poly.m_R, poly.m_vertices[verts]));
      poly_path.add(createPoint(vert.x, vert.y));

    }
    poly_path.fillColor = 'purple';
    paddle_group.addChild(poly_path);

    /*
    var tV = b2Math.AddVV(poly.m_position, b2Math.b2MulMV(poly.m_R, poly.m_vertices[0]));
    context.moveTo(tV.x, tV.y);
    for (var i = 0; i < poly.m_vertexCount; i++) {
      var v = b2Math.AddVV(poly.m_position, b2Math.b2MulMV(poly.m_R, poly.m_vertices[i]));
      context.lineTo(v.x, v.y);
    }
    context.lineTo(tV.x, tV.y);
    */
  }
  break;
}
}

function drawWinning()
{
  clearInterval(step_Interval);

  while(project.activeLayer.children.length > 0)
    project.activeLayer.children.forEach(function(child) {
          child.remove();
        });

  var text = new PointText(new Point(canvasWidth/2, canvasHeight/2));
  text.justification = 'center';
  text.fillColor = 'black';
  text.fontSize = 30;
  text.content = 'You Win and managed to die ' + livesLost + ' times!';


  var text2 = new PointText(new Point(canvasWidth/2, canvasHeight/2 + 0.1 * canvasHeight));
  text2.style = text.style;
  text2.content = 'Better Luck Next time! Want to play again? (Hit enter)';

  view.draw();

  game_over = true;
}

