import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


//import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

// création scène
const scene = new THREE.Scene();

// création caméra
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

// création renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );

document.body.appendChild( renderer.domElement );

// création texture
const texture_loader = new THREE.TextureLoader();
const texture = texture_loader.load( 'ressources/images/meowl.jpg' );
const texture_bg = texture_loader.load('ressources/images/background_gravier.jpg');
texture.colorSpace = THREE.SRGBColorSpace;


scene.background = texture_bg;


// création cube
const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshStandardMaterial( { /*color: 0x1f801f,*/ map: texture } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );

// création lumière
const color = 0xffffff;
const intensity = 3;
const light = new THREE.DirectionalLight(color, intensity);
light.position.set(-1, 2, 4);
scene.add(light);

// positionnement caméra
camera.position.z = 5;

let loadedModel = null;
let clock = new THREE.Clock();

// Modèle 3d
const model_loader = new GLTFLoader();
model_loader.load( 'ressources/3d_models/ooiia_cat/scene.gltf', function ( gltf ) {
    gltf.scene.position.x = -5;
    gltf.scene.scale.set(3,3,3);

    loadedModel = gltf.scene;

    scene.add( gltf.scene );
}, undefined, function ( error ) {
  console.error( error );
} );


// animations
function animate() {

  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  const elapsedTime = clock.getElapsedTime();
  if (loadedModel){
    loadedModel.rotation.y += 0.05;
    loadedModel.position.y = Math.sin(elapsedTime * 4) * 0.8;
  }
  

  renderer.render( scene, camera );
}

renderer.setAnimationLoop( animate );