// Three JS variables
var scene;
var camera;
var renderer;
var raycaster;
var lights = [];

// Actors in the game
var player;
var robots = [];
var evilOtto;
var bullets = [];
var powerups = [];

// Keyboard State
var keystate = {};

// Score
var score = 0;

// Flag to determine if the game is running
var animate = true;

// Board
var map_layout = [
  ['1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1'],
  ['1', ' ', ' ', ' ', ' ', ' ', ' ', '1', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '1', ' ', ' ', ' ', ' ', ' ', ' ', '1'],
  ['1', ' ', ' ', ' ', ' ', ' ', ' ', '1', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '1', ' ', ' ', ' ', ' ', ' ', ' ', '1'],
  ['1', ' ', ' ', ' ', 'S', ' ', ' ', '1', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '1', ' ', ' ', ' ', 'B', ' ', ' ', '1'],
  ['1', ' ', ' ', ' ', ' ', ' ', ' ', '1', ' ', ' ', ' ', 'X', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '1', ' ', ' ', ' ', ' ', ' ', ' ', '1'],
  ['1', ' ', ' ', ' ', ' ', ' ', ' ', '1', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '1', ' ', ' ', ' ', ' ', ' ', ' ', '1'],
  ['1', ' ', ' ', ' ', ' ', ' ', ' ', '1', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '1', ' ', ' ', ' ', 'X', ' ', ' ', '1'],
  ['1', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '1'],
  ['1', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '1'],
  ['1', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '1'],
  ['1', ' ', ' ', 'P', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '1'],
  ['1', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'E', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '1'],
  ['1', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '1'],
  ['1', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '1'],
  ['1', '1', '1', '1', '1', '1', '1', '1', '1', '1', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1'],
  ['1', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '1'],
  ['1', ' ', ' ', ' ', ' ', 'X', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'X', ' ', ' ', ' ', '1'],
  ['1', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '1'],
  ['1', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '1'],
  ['1', '1', '1', '1', '1', '1', '1', '1', '1', '1', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1'],
]

var map = {}
var mapWidth = map_layout[0].length;
var mapHeight = map_layout.length;
var MODEL_SCALE = 0.5;


class Player {
  constructor(model) {
    this.model = model;
    this.boundingbox = new THREE.Box3().setFromObject(this.model);
    this.xDirection = 0;
    this.yDirection = 0;
    this.id = 999;
    this.alive = true;
    this.movespeed = 0.1;
    this.bulletVelocity = 0.2;
  }
  act() {
    this.boundingbox = new THREE.Box3().setFromObject(this.model);
    this.checkCollision();
    if (this.alive) {
      this.move();
      this.shoot();
    } else {
      var sound = document.getElementById("death");
      sound.play();
    }
  }
  checkCollision() {
    var bot_col = checkBotCollision(this);
    var bullet_col = checkBulletCollision(this);
    this.alive = !(bot_col || bullet_col);

    // check powerup collision

    for (var i = 0; i < powerups.length; i++) { 
      var p = powerups[i];
      if (this.boundingbox.intersectsBox(p.boundingbox)) {
        // play sound
        var sound = document.getElementById("powerup");
        sound.play();

        p.alive = false;
        switch(p.type) {
          case 'bulletspeed':
            this.bulletVelocity = 0.4;
            break;
          case 'slowerenemies':
            for (var j = 0; j < robots.length; j++) {
              robots[j].movespeed = 0.02;
              robots[j].bulletVelocity = 0.1;
            }
            break;
        }
      }
    }

  }
  move() {
    if (keystate['w']) { 
      this.direction = 'TOP';
      if (!checkWallCollision(this)) {
        this.model.position.y += this.movespeed; 
      } else {
        this.alive = false;
      }
    }
    if (keystate['a']) { 
      this.direction = 'LEFT';
      if (!checkWallCollision(this)) {
        this.model.position.x -= this.movespeed;
      } else {
        this.alive = false;
      }
    }
    if (keystate['s']) { 
      this.direction = 'BOTTOM';
      if (!checkWallCollision(this)) {
        this.model.position.y -= this.movespeed;
      } else {
        this.alive = false;
      } 
    }
    if (keystate['d']) {  
      this.direction = 'RIGHT';
      if (!checkWallCollision(this)) {
        this.model.position.x += this.movespeed;
      } else {
        this.alive = false;
      }
    }

    if (keystate['a'] && keystate['w']) {
      this.xDirection = -1;
      this.yDirection = 1;
    } else if (keystate['a'] && keystate['s']) {
      this.xDirection = -1;
      this.yDirection = -1;
    } else if (keystate['s'] && keystate['d']) {
      this.xDirection = 1;
      this.yDirection = -1;
    } else if (keystate['w'] && keystate['d']) {
      this.xDirection = 1;
      this.yDirection = 1;
    } else if (keystate['a']) {
      this.xDirection = -1;
      this.yDirection = 0;
    } else if (keystate['d']) {
      this.xDirection = 1;
      this.yDirection = 0;
    } else if (keystate['w']) {
      this.yDirection = 1;
      this.xDirection = 0;
    } else if (keystate['s']) {
      this.yDirection = -1;
      this.xDirection = 0;
    }
  }
  shoot() {
    if (keystate['space'] && (this.xDirection != 0 || this.yDirection != 0)) {
      keystate['space'] = false;
      var bullet = new Bullet(this.bulletVelocity);
      bullet.origin = this.id;
      bullet.model.position.x = this.model.position.x;
      bullet.model.position.y = this.model.position.y;
      bullet.model.position.z = this.model.position.z;
      bullet.xDirection = this.xDirection;
      bullet.yDirection = this.yDirection;
    }
  }
}

class Robot {
  constructor(model, id) {
    this.model = model;
    this.boundingbox = new THREE.Box3().setFromObject(this.model);
    this.is_evil = false;
    // Handicap the robos
    this.bulletVelocity = 0.15;
    this.id = id;
    this.clock = new THREE.Clock();
    this.moveX = Math.random() >= 0.5;
    this.moveY = Math.random() >= 0.5;
    this.xDirection = Math.random() >= 0.5 ? 1 : -1;
    this.yDirection = Math.random() >= 0.5 ? 1 : -1;
    this.alive = true;
    this.movespeed = 0.05;
  }
  act() {
    this.boundingbox = new THREE.Box3().setFromObject(this.model);
    if (!this.is_evil && bullets.length != 0) {
      this.alive = !checkBulletCollision(this);
    }
    if (this.alive) {
      this.move();
      this.shoot();
    } else {
      score += 1000
    }
  }
  move() {
    // 99 percent chance of moving in the same direction
    var r = Math.random();
    if (r > 0.995) { 
      this.moveX = !this.moveX; 
      this.moveY = !this.moveY; 
    }
    
    var x = Math.floor(this.model.position.x);
    var y = Math.floor(this.model.position.y);
    if (x <= map.left || x >= map.right || y <= map.bottom || y >= map.top || checkBotCollision(this)) { 
      this.xDirection = -1 * this.xDirection; 
      this.yDirection = -1 * this.yDirection; 
    }

    if (this.moveX) {
      this.direction = this.xDirection == 1 ? 'RIGHT' : 'LEFT';
      if (!checkWallCollision(this)) {
        this.model.position.x += this.xDirection * this.movespeed;
      } else {
        this.xDirection *= -1;
      }
    }
    if (this.moveY) {
      this.direction = this.yDirection == 1 ? 'TOP' : 'BOTTOM';
      if (!checkWallCollision(this)) {
        this.model.position.y += this.yDirection * this.movespeed;
      } else {
        this.yDirection *= -1;
      }
    }
  }
  shoot() {
    var time_elapsed = this.clock.getElapsedTime() * 1000
    if (time_elapsed > 800) {
      this.clock.start();
      var player_x = Math.floor(player.model.position.x);
      var player_y = Math.floor(player.model.position.y);
      var this_x = Math.floor(this.model.position.x);
      var this_y = Math.floor(this.model.position.y);
      var bullet;
      if (player_x == this_x) {
        bullet = new Bullet(this.bulletVelocity);
        bullet.yDirection = player_y > this_y ? 1 : -1;
        bullet.xDirection = 0;
      } else if (player_y == this_y) {
        bullet = new Bullet(this.bulletVelocity);
        bullet.yDirection = 0;
        bullet.xDirection = player_x > this_x ? 1 : -1;
      }
      if (bullet) {
        bullet.origin = this.id;
        bullet.model.position.x = this.model.position.x;
        bullet.model.position.y = this.model.position.y;
        bullet.model.position.z = this.model.position.z;
      }
    }
  }
}

class Bullet {
  constructor(velocity) {
    // this.model = model;
    this.velocity = velocity;
    this.alive = true;
    
    var size = 0.2;
    var color = 0xffffff;
    var geometry = new THREE.SphereGeometry( 1, 1, 1 );
    var mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: color }));
    mesh.scale.set(size, size, size);
    scene.add(mesh);
    // Add the mesh to the model
    this.model = mesh
    // Update the bounding box
    this.boundingbox = new THREE.Box3().setFromObject(this.model).expandByScalar(0.25);
    
    // Play sound
    var sound = document.getElementById("shoot");
    sound.play();

    bullets.push(this);
  }
  move() {
    this.direction = this.xDirection == 1 ? 'RIGHT' : 'LEFT';
    this.alive = !checkWallCollision(this);
    this.direction = this.yDirection == 1 ? 'TOP' : 'BOTTOM'
    this.alive = !checkWallCollision(this);
    if (this.alive) {
      this.model.position.x += this.xDirection * this.velocity;
      this.model.position.y += this.yDirection * this.velocity;
      this.boundingbox = new THREE.Box3().setFromObject(this.model);
    }
  }
}

class Powerup {
  constructor(type, color) {
    this.alive = true;
    this.beat_count = 0;
    this.type = type;
 
    var geometry = new THREE.IcosahedronBufferGeometry(0.3);
    var mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: color }));
    scene.add(mesh);

    // Add the mesh to the model
    this.model = mesh
    // Update the bounding box
    this.boundingbox = new THREE.Box3().setFromObject(this.model);
    powerups.push(this);
  }
  beat() {
    if (this.beat_count < 30) {
      this.model.scale.x += 0.02;
      this.model.scale.y += 0.02;
      this.model.scale.z += 0.02;
    } else {
      this.model.scale.x -= 0.02;
      this.model.scale.y -= 0.02;
      this.model.scale.z -= 0.02;
    }
    this.beat_count += 1
    this.boundingbox =  new THREE.Box3().setFromObject(this.model);
    this.beat_count = this.beat_count % 60;
  }
}

var init = function() {  
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
  renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  var light1 = new THREE.DirectionalLight( 0xffffff, 1 );
  light1.position.set( -10, 0, 5).normalize();
  scene.add( light1 );
  lights.push(light1);

  var light2 = new THREE.DirectionalLight( 0xffffff, 0.5 );
  light2.position.set( 10, 0, 5).normalize();
  scene.add( light2 );
  lights.push(light2);


  camera.position.z = 20;
  
  // Add Event Handler
  document.body.addEventListener('keydown', function (e) {
    keystate[e.key] = true;
    if (e.key == ' ') {
      keystate['space'] = true;
    }
  });
  document.body.addEventListener('keyup', (e) => {
    keystate[e.key] = false;
    if (e.key == ' ') {
      keystate['space'] = false;
    }
  });
  setupScene();
}


var setupScene = function() {
  map.left = -mapWidth / 2;
  map.right = mapWidth / 2;
  map.bottom = -mapHeight / 2;
  map.top = mapHeight/ 2;

  var robo_id = 0;
  
  for (var i = 0; i < mapHeight; i++) {
    var y = mapHeight / 2 - i;
    map[y] = {}
    for (var j = 0; j < mapWidth; j++) {
      var x = j - mapWidth / 2;
      var object;
      switch(map_layout[i][j]) {
        case '1':
          object = spawnWall();
          break;
        case 'P':
          object = spawnPlayer();
          player = new Player(object);
          break;
        case 'X':
          var color = 0xff0000;
          object = spawnRobot(color);
          robots.push(new Robot(object, robo_id));
          robo_id++;
          break;
        case 'E':
          var color = 0x00ff00;
          object = spawnRobot(color);
          evilOtto = new Robot(object, robo_id);
          evilOtto.is_evil = true;
          break;
        case 'B':
          var color = 0x808080;
          var p = new Powerup('bulletspeed', color);
          object = p.model;
          break;
        case 'S':
          var color = 0xffa500;
          var p = new Powerup('slowerenemies', color);
          object = p.model;
          break;
        default:
          object = null;
          break;
      }
      if (object != null) {
        object.position.x = x;
        object.position.y = y;
        object.position.z = 0;
        map[y][x] = map_layout[i][j];
        scene.add(object);
      }
    }
  }
  main();
}

var spawnWall = function() { 
  var color = 0x6042f5;
  var geometry = new THREE.CubeGeometry( 1, 1, 1 );
  var mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: color }));
  return mesh;
}

var spawnPlayer = function() {
  var color = 0xffff00; // Yellow
  var geometry = new THREE.OctahedronGeometry();
  var mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: color}));
  mesh.scale.set(MODEL_SCALE, MODEL_SCALE, MODEL_SCALE);
  return mesh;
}

var spawnRobot = (color) => {
  var geometry = new THREE.OctahedronGeometry();
  var mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: color }));
  mesh.scale.set(MODEL_SCALE, MODEL_SCALE, MODEL_SCALE);
  return mesh
}

var main = () => {
  score -= 1;
  // Call act for player
  player.act()
  evilOtto.act()

  if (!player.alive) {
    animate = false;
  }

  // Call Act for all the robots
  for (var i = 0; i < robots.length; i++) {
    if (robots[i].alive) {
      robots[i].act();
    } else {
      scene.remove(robots[i].model);
      robots.splice(i, 1);
    }
  }

  // Move the bullets
  for (var i = 0; i < bullets.length; i++) { 
    if (bullets[i].alive) {
      bullets[i].move();
    } else {
      scene.remove(bullets[i].model);
      bullets.splice(i, 1);
    }
  }

  // Animate the powerups
  for (var i = 0; i < powerups.length; i++) {
    if (powerups[i].alive) {
      powerups[i].beat();
    } else {
      scene.remove(powerups[i].model);
      powerups.splice(i, 1);
    }
  }

  if (robots.length == 0) {
    animate = false;
  }
  document.getElementById('score').innerHTML = score;
  renderer.render( scene, camera );

  if (animate) {
    requestAnimationFrame(main);
  } else {
    endgame();
  }
}

var light_switch = true;
var endgame = () => {
  var intervalID = window.setInterval(changeLightIntensity, 200);
  setTimeout(() => {
    clearInterval(intervalID);
    showEndGameScreen();
  }, 2000);
}

var changeLightIntensity = () => {
  light_switch = !light_switch;
  lights[0].intensity = light_switch ? 1: 0;
  lights[1].intensity = light_switch ? 0.5: 0;
  renderer.render(scene, camera);
}

// Vectors denoting the direction of movement of an object
var DIRECTION_VEC = {
  TOP: new THREE.Vector3(0, 1, 0),
  BOTTOM: new THREE.Vector3(0, -1, 0),
  RIGHT: new THREE.Vector3(1, 0, 0),
  LEFT: new THREE.Vector3(-1, 0, 0)
}

// How to scale the points when looking for collision with objects.
var SCALE = {
  TOP: 1,
  BOTTOM: 0.1,
  RIGHT: 1,
  LEFT: 0.1
}

// Checks wall collision based on the direction in which the object is moving.
var checkWallCollision = (object) => {
  var pos = object.model.position.clone().addScaledVector(DIRECTION_VEC[object.direction], SCALE[object.direction]);
  var x = Math.floor(pos.x);
  var y = Math.floor(pos.y);
  return map[y] && map[y][x] && map[y][x] == '1';
}

var checkBulletCollision = (obj) => {
  var flag = false;
  for (var i = 0; i < bullets.length; i++) {
    if (bullets[i].origin == obj.id) continue;
    flag = obj.boundingbox.intersectsBox(bullets[i].boundingbox);
    if (flag) return flag;
  }
  return flag;
}

var checkBotCollision = (obj) => {
  var flag = false;
  for (var i = 0; i < robots.length; i++) {
    if (obj.id == robots[i].id) continue;
    flag = obj.boundingbox.intersectsBox(robots[i].boundingbox);
    if (flag) return flag;
  }
  return flag;
}