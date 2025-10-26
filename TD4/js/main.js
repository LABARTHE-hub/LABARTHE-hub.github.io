import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import "./voice.js";

// === Initialisation de la scène ===
const canvas = document.getElementById("three-canvas");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth * 0.75, window.innerHeight - 100);
renderer.setPixelRatio(window.devicePixelRatio);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// Caméra
const camera = new THREE.PerspectiveCamera(60, (window.innerWidth * 0.75) / (window.innerHeight - 100), 1, 10000);
camera.position.set(0, 800, 1500);

// Lumières
const light = new THREE.PointLight(0xffffff, 2, 0);
scene.add(light);
scene.add(new THREE.AmbientLight(0x222222));

// === Données planètes ===
const loader = new GLTFLoader();
const planetData = [
  { id: "sun", dist: 0, speed: 0.0, scale: 25 },
  { id: "mercure", dist: 160, speed: 0.24, scale: 4 },
  { id: "venus", dist: 240, speed: 0.16, scale: 6 },
  { id: "earth", dist: 320, speed: 0.1, scale: 6 },
  { id: "mars", dist: 400, speed: 0.08, scale: 5 },
  { id: "jupiter", dist: 600, speed: 0.04, scale: 12 },
  { id: "saturne", dist: 820, speed: 0.03, scale: 10 },
  { id: "uranus", dist: 1020, speed: 0.02, scale: 9 },
  { id: "neptune", dist: 1220, speed: 0.018, scale: 9 }
];

const planets = {};
const orbitRings = [];

// === Chargement des planètes ===
planetData.forEach(p => {
  const group = new THREE.Group();
  scene.add(group);
  planets[p.id] = { group, data: p };

  loader.load(
    `./ressources/3dmodels/${p.id}/scene.gltf`,
    gltf => {
      gltf.scene.scale.set(p.scale, p.scale, p.scale);
      group.add(gltf.scene);
    },
    undefined,
    err => console.warn(`⚠️ Modèle non trouvé pour ${p.id}`, err)
  );

  if (p.dist > 0) {
    const ringGeo = new THREE.RingGeometry(p.dist - 1, p.dist + 1, 128);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x333344, side: THREE.DoubleSide });
    const orbit = new THREE.Mesh(ringGeo, ringMat);
    orbit.rotation.x = Math.PI / 2;
    scene.add(orbit);
    orbitRings.push(orbit);
  }
});

// === Caméra et interactions vocales ===
const target = new THREE.Vector3(0, 0, 0);
let desiredDistance = 1500;

function focusOn(id) {
  const planet = planets[id];
  if (!planet) return;
  planet.group.getWorldPosition(target);
  desiredDistance = Math.max(200, planet.data.dist + 400);
}

function zoomIn() {
  desiredDistance = Math.max(200, desiredDistance - 100);
}

function zoomOut() {
  desiredDistance = Math.min(3000, desiredDistance + 100);
}

// On expose les fonctions au module voice.js
window._solar = { focusOn, zoomIn, zoomOut };

// === Animation ===
let last = performance.now();
let simDays = 0;
let timeScale = 1;

function animate(now) {
  requestAnimationFrame(animate);
  const dt = (now - last) / 1000;
  last = now;
  simDays += dt * timeScale;

  planetData.forEach(p => {
    if (p.dist > 0) {
      const angle = simDays * p.speed;
      const x = Math.cos(angle) * p.dist;
      const z = Math.sin(angle) * p.dist;
      planets[p.id].group.position.set(x, 0, z);
    }
  });

  const desiredPos = new THREE.Vector3(target.x, 800, target.z + desiredDistance);
  camera.position.lerp(desiredPos, 0.05);
  camera.lookAt(target);

  renderer.render(scene, camera);
}
animate();

// === Ajustement fenêtre ===
window.addEventListener("resize", () => {
  camera.aspect = (window.innerWidth * 0.75) / (window.innerHeight - 100);
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth * 0.75, window.innerHeight - 100);
});
