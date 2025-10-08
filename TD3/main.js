import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// création scène
const scene = new THREE.Scene();

const map_container = document.getElementById('map'); // carte
const container = document.getElementById('canvas-container'); // terre

// #####################################################################################################
// ## =============================================================================================== ##
// ## == ----------------------------------------- CARTE ----------------------------------------- == ##
// ## =============================================================================================== ##
// #####################################################################################################
// création map
const map = L.map('map');


// #####################################################################################################
// ## =============================================================================================== ##
// ## == ----------------------------------------- TERRE ----------------------------------------- == ##
// ## =============================================================================================== ##
// #####################################################################################################

// création renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

// création caméra
const camera = new THREE.PerspectiveCamera(
  75,
  container.clientWidth / container.clientHeight,
  0.1,
  1000
);

// positionnement caméra
camera.position.z = 5;

// rayon terrestre
const rayon = 2.7;

// Ajout du contrôle d'orbite (permet de tourner la caméra autour de la Terre)
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // effet d'inertie
controls.dampingFactor = 0.05;
controls.enableZoom = true; // permet de zoomer
controls.enablePan = false; // désactive le déplacement latéral

// récupération des coordonnées
navigator.geolocation.watchPosition(position => {
    const coords = position.coords;
    // coordonées sur la carte
    const currentPosMap = [coords.latitude, coords.longitude];
    const long_map = coords.longitude * Math.PI / 180; // conversion en radians
    const lat_map = coords.latitude * Math.PI / 180;
    const alt_map = coords.altitude || 0; // si null, on met 0

    // Centrage sur la carte
    map.setView(currentPosMap, 11);

    // Marqueur sur la carte
    const marker_map = L.marker(currentPosMap).addTo(map).bindPopup("Vous êtes ici").openPopup();

    // Marqueur sur la terre ???
    const markerGeometry = new THREE.SphereGeometry(0.05, 16, 16);
    const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);

    

    console.log("----- Coordonnées actuelles -----");
    console.log("latitude :", lat_map);
    console.log("longitude :", long_map);
    console.log("altitude :", alt_map);

    const { x, y, z } = conv_cart(lat_map, long_map, alt_map);

    console.log("\n----- Coordonnées cartésiennes -----");
    console.log("X :", x);
    console.log("Y :", y);
    console.log("Z :", z);

    // position sur la sphère
    marker.position.set(x,y,z);

    scene.add(marker);
});


// création texture
function create_texture(filepath){
  const texture_loader = new THREE.TextureLoader();
  const texture = texture_loader.load( filepath );
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// création lumière
function create_light(color, intensity){
  const light = new THREE.DirectionalLight(color, intensity);
  light.position.set(-1, 2, 4);
  return light;
}

// création sphère
function create_sphere(radius, color, map){
    const geometry = new THREE.SphereGeometry( radius, 32, 16 ); 
    const material = new THREE.MeshBasicMaterial( { color, map } ); 
    const sphere = new THREE.Mesh( geometry, material );
    return sphere;
}

function conv_cart(lat, long, h){
    const r = rayon + h; // rayon local de ta sphère THREE.js
    const x = r * Math.cos(lat) * Math.cos(long);
    const y = r * Math.sin(lat);
    const z = r * Math.cos(lat) * Math.sin(long);
    return { x, y, z };
}


// fonction sur latitude
function N(lat){
    const r = 6378; // rayon terrestre (km)
    const cosCarre = Math.pow(Math.cos(lat), 2);
    const sinCarre = Math.pow(Math.sin(lat), 2);
    return (r * r) / Math.sqrt(cosCarre + sinCarre);
}

function animate() {
  requestAnimationFrame(animate);
  controls.update(); 
  renderer.render(scene, camera);
}

// initialisation et ajout à la scene des objets
scene.add(create_light(0xffffff, 3));
const texture = create_texture('ressources/images/earth.jpg')
const earth = create_sphere(rayon, null, texture);
scene.add(earth);


animate();