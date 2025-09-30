import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// création scène
const scene = new THREE.Scene();

// création caméra
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

// création renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// positionnement caméra
camera.position.z = 5;

// objets qui suivent l'orientation du téléphone
window.addEventListener('deviceorientation', handleOrientation);

// création de particules (ciel etoilé ici)
function ciel_etoile(){
  // Créer une géométrie de particules
  const particleCount = 1000;
  const positions = [];

  for (let i = 0; i < particleCount; i++) {
    const x = (Math.random() - 0.5) * 100;
    const y = (Math.random() - 0.5) * 100;
    const z = (Math.random() - 0.5) * 100;
    positions.push(x, y, z);
  }

  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

  // Créer un matériau pour les particules
  const particleMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.5,
    sizeAttenuation: true, // plus petites si éloignées
    transparent: true,
    opacity: 0.8
  });

  // Créer le système de particules
  const particles = new THREE.Points(particleGeometry, particleMaterial);

  return particles;
}

// création texture
function create_texture(filepath){
  const texture_loader = new THREE.TextureLoader();
  const texture = texture_loader.load( filepath );
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// création cube
function create_cube(color, map){
  const geometry = new THREE.BoxGeometry( 1, 1, 1 );
  const material = new THREE.MeshStandardMaterial( { color, map } );
  const cube = new THREE.Mesh( geometry, material );
  return cube;
}

// création lumière
function create_light(color, intensity){
  const light = new THREE.DirectionalLight(color, intensity);
  light.position.set(-1, 2, 4);
  return light;
}

let loadedModel = null;
let clock = new THREE.Clock();

// création d'un objet en 3d
function create_3d(model, pos, scale){
  const model_loader = new GLTFLoader();
  model_loader.load( model, function ( gltf ) {
      gltf.scene.position.x = pos;
      gltf.scene.scale.set(scale, scale, scale);

      loadedModel = gltf.scene;

      scene.add( gltf.scene );
  }, undefined, function ( error ) {
    console.error( error );
  } );
}

let alpha = 0, beta = 0, gamma = 0;

function handleOrientation(event) {
  alpha = event.alpha;
  beta = event.beta;
  gamma = event.gamma;
}

// animations
function animate() {

  //animate_cube();
  //animate_model();
  rotate_();

  renderer.render( scene, camera );
}

function animate_cube(){
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  renderer.render( scene, camera );
}

function animate_model(){
  const elapsedTime = clock.getElapsedTime();
  if (loadedModel){
    loadedModel.rotation.y += 0.05;
    loadedModel.position.y = Math.sin(elapsedTime * 4) * 0.8;
  }
  renderer.render( scene, camera );
}

function rotate_(){
  if (loadedModel) {
    // Rotation avec le téléphone
    loadedModel.rotation.x = THREE.MathUtils.degToRad(beta);  // inclinaison avant/arrière
    loadedModel.rotation.y = THREE.MathUtils.degToRad(gamma); // gauche/droite
    loadedModel.rotation.z = THREE.MathUtils.degToRad(alpha); // rotation compas
  }
  cube.rotation.x = THREE.MathUtils.degToRad(beta);
  cube.rotation.y = THREE.MathUtils.degToRad(gamma);  

  renderer.render(scene, camera);
}

// initialisation et ajout à la scene des objets
const texture = create_texture('ressources/images/meowl.jpg');
const cube = create_cube(null, texture);
scene.add(cube);
scene.add(create_light(0xffffff, 3));
const model_3d = create_3d('ressources/3d_models/ooiia_cat/scene.gltf', -5, 3);
scene.add(ciel_etoile());
renderer.setAnimationLoop( animate );