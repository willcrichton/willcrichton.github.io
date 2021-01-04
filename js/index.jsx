import React from 'react';
import $ from 'jquery';

$(() => {

  var camera, scene, renderer;
  var geometry, material, mesh;

  Physijs.scripts.worker ='js/vendor/physijs_worker.js';

  var initialized = false;

  var z = -2;

  let borders = $('.border');
  let get_pos = (idx, pos) => {
    let border = $(borders[idx]);
    let parts = pos.split(' ');
    let border_size = 40;
    let margin_left = 40;
    let x = parts[1] == 'left'
          ? border.offset().left - border_size / 2
          : border.offset().left + border.outerWidth() - border_size / 2;
    let y = parts[0] == 'top'
          ? border.offset().top + border_size / 3
          : border.offset().top + border.outerHeight() - border_size / 2;
    return [x, y];
  };

  let path = [
    get_pos(0, 'top right'),
    get_pos(0, 'bottom right'),
    get_pos(0, 'bottom left'),
    get_pos(2, 'top left'),
    get_pos(2, 'top right'),
    get_pos(2, 'bottom right')
  ];

  path[0][1] -= 100;
  path[path.length - 1][1] += 100;

  let objects = [];

  let make_object = (cls) => {
    let obj = {
      el: $(`<div class="mover ${cls}" />`),
      pos: path[0].slice(),
      target: 1,
      velocity: Math.random() * 200 + 300
    };
    obj.el.removeClass('shape-btn inline');
    $('body').append(obj.el);
    set_pos(obj);
    objects.push(obj);
  };

  let set_pos = (obj) => {
    obj.el.css({left: obj.pos[0] - obj.el.width()/2,
                top: obj.pos[1] - obj.el.height()/2});
  };

  let dirclamp = (target, current, vector) => {
    if (vector < 0) {
      return Math.max(current + vector, target)
    } else {
      return Math.min(current + vector, target);
    }
  };

  let float_eq = (x, y) => {
    return Math.abs(x - y) < 0.00001;
  }

  let last_time = null;
  let anim_el = (time) => {
    if (last_time == null) {
      last_time = time;
      requestAnimationFrame(anim_el);
      return;
    }

    objects.forEach((obj) => {
      let pos = obj.pos;
      let target_pos = path[obj.target];
      let vector = [target_pos[0] - pos[0], target_pos[1] - pos[1]];
      let norm = Math.sqrt(Math.pow(vector[0], 2) + Math.pow(vector[1], 2));
      let tdelta = (time - last_time) / 1000;
      vector[0] = vector[0] / norm * obj.velocity * tdelta;
      vector[1] = vector[1] / norm * obj.velocity * tdelta;

      obj.pos = [dirclamp(target_pos[0], pos[0], vector[0]),
                 dirclamp(target_pos[1], pos[1], vector[1])];

      set_pos(obj);

      if (float_eq(obj.pos[0], target_pos[0]) &&
          float_eq(obj.pos[1], target_pos[1])) {
        obj.target += 1;
      }

      if (obj.target == path.length) {
        obj.pos = path[0].slice();
        obj.target = 1;
        set_pos(obj);
      }
    });

    last_time = time;
    requestAnimationFrame(anim_el);
  };

  requestAnimationFrame(anim_el);

  $('.shape-btn').click(function() {
    make_object(this.className);
  });


  let add_shape = () => {
    if (!initialized) {
      initialized = true;
      init();
      animate();
    }

    let mesh;
    if ($(this).hasClass('square')) {
      mesh = new Physijs.BoxMesh(
        new THREE.BoxGeometry( 0.2, 0.2, 0.2 ),
        new THREE.MeshNormalMaterial());
    } else if ($(this).hasClass('circle')) {
      mesh = new Physijs.SphereMesh(
        new THREE.SphereGeometry(0.1, 32, 32),
        new THREE.MeshNormalMaterial());
    } else if ($(this).hasClass('triangle')) {
      mesh = new Physijs.ConeMesh(
        new THREE.CylinderGeometry(0, 0.2, 0.4, 32),
        new THREE.MeshNormalMaterial());
    } else {
      throw "Invalid button"
    }

    mesh.position.set(0, 0, z);
    mesh.rotation.set(Math.random(), Math.random(), Math.random());
    scene.add(mesh);
  };

  function init() {

    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 10 );
    camera.position.z = 1;

    scene = new Physijs.Scene();
    scene.setGravity(new THREE.Vector3(0, -1, 0));
	  scene.addEventListener(
		  'update',
		  function() {
			  //applyForce();
			  scene.simulate( undefined, 1 );
		  }
	  );

    let ground = new Physijs.BoxMesh(
      new THREE.BoxGeometry(1, 0.1, 1),
      new THREE.MeshNormalMaterial(),
      0);
    ground.position.set(0, -2, z);

    scene.add(ground);

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor(0xffffff, 1);
    $(document.body).append( renderer.domElement );
    scene.simulate();
  }

  function animate() {
    requestAnimationFrame( animate );
    renderer.render( scene, camera );
  }

});
