var scene;
var camera;
var renderer;
var raycaster;



var init = function() {  
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
  renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  var light1 = new THREE.DirectionalLight( 0xffffff, 1 );
  light1.position.set( -10, 0, 5).normalize();
  scene.add( light1 );

  var light2 = new THREE.DirectionalLight( 0xffffff, 0.5 );
  light2.position.set( 10, 0, 5).normalize();
  scene.add( light2 );

  camera.position.z = 20;
}

var map = [
  ['1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1'],
  ['1', ' ', ' ', ' ', ' ', ' ', ' ', '1', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '1', ' ', ' ', ' ', ' ', ' ', ' ', '1'],
  ['1', ' ', ' ', ' ', ' ', ' ', ' ', '1', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '1', ' ', ' ', ' ', ' ', ' ', ' ', '1'],
  ['1', ' ', ' ', ' ', ' ', ' ', ' ', '1', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '1', ' ', ' ', ' ', ' ', ' ', ' ', '1'],
  ['1', ' ', ' ', ' ', ' ', ' ', ' ', '1', ' ', ' ', ' ', 'X', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '1', ' ', ' ', ' ', ' ', ' ', ' ', '1'],
  ['1', ' ', ' ', ' ', ' ', 'X', ' ', '1', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '1', ' ', ' ', ' ', ' ', ' ', ' ', '1'],
  ['1', ' ', ' ', ' ', ' ', ' ', ' ', '1', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '1', ' ', ' ', ' ', ' ', ' ', ' ', '1'],
  ['1', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '1'],
  ['1', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '1'],
  ['1', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '1'],
  ['1', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'X', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '1'],
  ['1', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '1'],
  ['1', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '1'],
  ['1', 'P', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '1'],
  ['1', '1', '1', '1', '1', '1', '1', '1', '1', '1', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1'],
  ['1', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '1'],
  ['1', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '1'],
  ['1', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'X', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '1'],
  ['1', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '1'],
  ['1', '1', '1', '1', '1', '1', '1', '1', '1', '1', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1'],
]

var mapX = map[0].length;
var mapY = map.length;
var MODEL_SCALE = 0.5;

var setupScene = function() {

  

  for (var i = 0; i < map.length; i++) {
    for (var j = 0; j < map[0].length; j++) {
      var object;
      if (map[i][j] == '1') {
        object = spawnWall();
      } else if (map[i][j] == 'P') {
        object = spawnPlayer();
      } else if (map[i][j] == 'X') {
        object = spawnRobot();
      } else {
        object = null;
      }

      if (object != null) {
        object.position.x = j - mapX / 2;
        object.position.y = mapY / 2 - i;
        object.position.z = 0;
        scene.add(object);
      }
    }
  }
  renderer.render( scene, camera );
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

var spawnRobot = function() {
  var color = 0xff0000;
  var geometry = new THREE.OctahedronGeometry();
  var mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: color }));
  mesh.scale.set(MODEL_SCALE, MODEL_SCALE, MODEL_SCALE);
  return mesh
}


init();
setupScene();
