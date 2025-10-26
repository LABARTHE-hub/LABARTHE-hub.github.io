import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import "./voice.js";

// === CONFIGURATION ===
// Échelles ajustées pour une meilleure visualisation
const SCALE_DISTANCE = 1; // Distances simplifiées
const SCALE_SIZE = 0.5; // Tailles visibles

// === DONNÉES ASTRONOMIQUES SIMPLIFIÉES ===
const solarSystemData = {
  sun: {
    name: 'Soleil',
    radius: 109, // Taille relative
    distance: 0,
    orbitalPeriod: 0,
    rotationPeriod: 25.05,
    color: 0xFDB813,
    modelPath: './ressources/3dmodels/sun/'
  },
  mercure: {
    name: 'Mercure',
    radius: 4,
    distance: 400,
    orbitalPeriod: 87.97,
    rotationPeriod: 58.65,
    color: 0x8C7853,
    modelPath: './ressources/3dmodels/mercure/'
  },
  venus: {
    name: 'Vénus',
    radius: 9,
    distance: 720,
    orbitalPeriod: 224.7,
    rotationPeriod: -243,
    color: 0xFFC649,
    modelPath: './ressources/3dmodels/venus/'
  },
  earth: {
    name: 'Terre',
    radius: 10,
    distance: 1000,
    orbitalPeriod: 365.26,
    rotationPeriod: 1,
    color: 0x4169E1,
    modelPath: './ressources/3dmodels/earth/'
  },
  mars: {
    name: 'Mars',
    radius: 5,
    distance: 1520,
    orbitalPeriod: 686.98,
    rotationPeriod: 1.03,
    color: 0xCD5C5C,
    modelPath: './ressources/3dmodels/mars/'
  },
  jupiter: {
    name: 'Jupiter',
    radius: 40,
    distance: 2600,
    orbitalPeriod: 4332.59,
    rotationPeriod: 0.41,
    color: 0xDAA520,
    modelPath: './ressources/3dmodels/jupiter/'
  },
  saturne: {
    name: 'Saturne',
    radius: 35,
    distance: 3400,
    orbitalPeriod: 10759.22,
    rotationPeriod: 0.45,
    color: 0xF4A460,
    modelPath: './ressources/3dmodels/saturne/'
  },
  uranus: {
    name: 'Uranus',
    radius: 18,
    distance: 4200,
    orbitalPeriod: 30688.5,
    rotationPeriod: -0.72,
    color: 0x4FD0E4,
    modelPath: './ressources/3dmodels/uranus/'
  },
  neptune: {
    name: 'Neptune',
    radius: 17,
    distance: 4900,
    orbitalPeriod: 60182,
    rotationPeriod: 0.67,
    color: 0x4169E1,
    modelPath: './ressources/3dmodels/neptune/'
  }
};

// === RENDU ===
const canvas = document.getElementById("three-canvas");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth * 0.75, window.innerHeight - 100);
renderer.setPixelRatio(window.devicePixelRatio);

// === SCÈNE ===
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// === CAMÉRA ===
const camera = new THREE.PerspectiveCamera(
  60,
  (window.innerWidth * 0.75) / (window.innerHeight - 100),
  0.1,
  20000
);
scene.add(camera);

// === LUMIÈRES ===
scene.add(new THREE.AmbientLight(0x666666));
const sunLight = new THREE.PointLight(0xffffff, 4, 0);
sunLight.position.set(0, 0, 0);
scene.add(sunLight);

// === CIEL ÉTOILÉ ===
const starCount = 3000;
const starGeo = new THREE.BufferGeometry();
const starPos = new Float32Array(starCount * 3);
for (let i = 0; i < starCount * 3; i++)
  starPos[i] = (Math.random() - 0.5) * 15000;
starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 8 })));

// === PLANÈTES ===
const loader = new GLTFLoader();
const planets = {};
let simDays = 0;
const timeScale = 1;

// Variables pour la caméra
let targetPlanet = null;
let targetPosition = new THREE.Vector3(0, 0, 0);
let cameraDistance = 6000;
const defaultCameraDistance = 6000;

// Fonction pour créer une sphère de fallback
function createFallbackSphere(data, scaledRadius) {
  const geometry = new THREE.SphereGeometry(scaledRadius, 32, 32);
  const material = new THREE.MeshPhongMaterial({ 
    color: 0xFFFFFF, // Blanc pour visibilité
    emissive: data.name === 'Soleil' ? data.color : 0x000000,
    emissiveIntensity: data.name === 'Soleil' ? 0.8 : 0
  });
  return new THREE.Mesh(geometry, material);
}

// Charger les planètes
Object.keys(solarSystemData).forEach((planetKey) => {
  const data = solarSystemData[planetKey];
  const scaledRadius = data.radius * SCALE_SIZE;
  const scaledDistance = data.distance * SCALE_DISTANCE;
  
  console.log(`Création ${planetKey}: rayon=${scaledRadius}, distance=${scaledDistance}`);
  
  // Groupe pour l'orbite (se déplace sur l'orbite)
  const planetGroup = new THREE.Group();
  scene.add(planetGroup);
  
  // Position initiale sur l'orbite
  const initialAngle = Math.random() * Math.PI * 2;
  planetGroup.position.x = Math.cos(initialAngle) * scaledDistance;
  planetGroup.position.z = Math.sin(initialAngle) * scaledDistance;
  
  // Créer l'orbite visuelle
  if (scaledDistance > 0) {
    const orbitGeometry = new THREE.BufferGeometry();
    const orbitPoints = [];
    const segments = 128;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      orbitPoints.push(
        Math.cos(theta) * scaledDistance,
        0,
        Math.sin(theta) * scaledDistance
      );
    }
    orbitGeometry.setAttribute('position', new THREE.Float32BufferAttribute(orbitPoints, 3));
    const orbitMaterial = new THREE.LineBasicMaterial({ 
      color: 0xFFFFFF, 
      opacity: 0.3, 
      transparent: true 
    });
    const orbit = new THREE.Line(orbitGeometry, orbitMaterial);
    scene.add(orbit);
  }
  
  // Créer la sphère de fallback (visible immédiatement)
  const fallbackMesh = createFallbackSphere(data, scaledRadius);
  // Position à l'origine du groupe (pas de décalage)
  fallbackMesh.position.set(0, 0, 0);
  planetGroup.add(fallbackMesh);
  
  console.log(`✓ Fallback créé pour ${planetKey} à position:`, planetGroup.position);
  
  // Stocker les informations
  planets[planetKey] = {
    group: planetGroup,
    mesh: fallbackMesh,
    data: data,
    angle: initialAngle,
    scaledDistance: scaledDistance,
    scaledRadius: scaledRadius,
    modelLoaded: false
  };
  
  // Charger le modèle GLTF
  loader.load(
    `${data.modelPath}scene.gltf`,
    (gltf) => {
      console.log(`✓ Modèle GLTF chargé: ${planetKey}`);
      const model = gltf.scene;
      
      // Centrer le modèle
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center);
      
      // Calculer l'échelle pour correspondre au rayon souhaité
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = (scaledRadius * 2) / maxDim;
      model.scale.set(scale, scale, scale);
      
      // Matériaux
      model.traverse((node) => {
        if (node.isMesh) {
          if (planetKey === 'sun') {
            node.material = new THREE.MeshStandardMaterial({
              emissive: data.color,
              emissiveIntensity: 1.2,
              color: data.color,
            });
          } else {
            // Garder les matériaux existants si possible
            if (!node.material) {
              node.material = new THREE.MeshStandardMaterial({
                color: 0xFFFFFF,
                roughness: 0.8,
                metalness: 0.1,
              });
            }
          }
        }
      });
      
      // Remplacer le fallback par le modèle
      planetGroup.remove(fallbackMesh);
      fallbackMesh.geometry.dispose();
      fallbackMesh.material.dispose();
      
      planetGroup.add(model);
      planets[planetKey].mesh = model;
      planets[planetKey].modelLoaded = true;
      
      console.log(`✓ ${planetKey} modèle remplacé, scale=${scale}`);
    },
    (progress) => {
      // Progression du chargement
      if (progress.lengthComputable) {
        const percent = (progress.loaded / progress.total * 100).toFixed(0);
        console.log(`Chargement ${planetKey}: ${percent}%`);
      }
    },
    (err) => {
      console.warn(`⚠ Erreur chargement ${planetKey}, utilisation du fallback:`, err);
      // Le fallback reste en place
    }
  );
});

// === FONCTIONS DE CONTRÔLE ===
function focusOn(id) {
  console.log(`Focus sur: ${id}`);
  
  if (id === "systeme") {
    targetPlanet = null;
    targetPosition.set(0, 0, 0);
    cameraDistance = defaultCameraDistance;
    return;
  }
  
  if (planets[id]) {
    targetPlanet = id;
    // Distance adaptée à la taille de la planète
    cameraDistance = Math.max(200, planets[id].scaledRadius * 15);
    console.log(`Distance caméra pour ${id}: ${cameraDistance}`);
  } else {
    console.warn(`Planète non trouvée: ${id}`);
  }
}

function zoomIn() {
  cameraDistance = Math.max(100, cameraDistance * 0.7);
  console.log(`Zoom in: ${cameraDistance}`);
}

function zoomOut() {
  cameraDistance = Math.min(15000, cameraDistance * 1.4);
  console.log(`Zoom out: ${cameraDistance}`);
}

// Exposer les fonctions pour voice.js
window._solar = { focusOn, zoomIn, zoomOut };

// === POSITION INITIALE CAMÉRA ===
camera.position.set(0, 3000, 6000);
camera.lookAt(0, 0, 0);

// === ANIMATION ===
let last = performance.now();

function animate(now) {
  requestAnimationFrame(animate);
  const dt = (now - last) / 1000;
  last = now;
  simDays += dt * timeScale;
  
  // Mise à jour des planètes
  Object.keys(planets).forEach((key) => {
    const planet = planets[key];
    const data = planet.data;
    
    if (data.distance > 0) {
      // Mise à jour de la position sur l'orbite
      const angularVelocity = (2 * Math.PI) / data.orbitalPeriod;
      planet.angle += angularVelocity * dt * timeScale;
      
      // Déplacer le groupe sur l'orbite
      planet.group.position.x = Math.cos(planet.angle) * planet.scaledDistance;
      planet.group.position.z = Math.sin(planet.angle) * planet.scaledDistance;
    }
    
    // Rotation de la planète sur elle-même
    const rotationSpeed = (2 * Math.PI) / Math.abs(data.rotationPeriod);
    planet.mesh.rotation.y += rotationSpeed * dt * timeScale * Math.sign(data.rotationPeriod);
  });
  
  // Mise à jour de la caméra
  if (targetPlanet && planets[targetPlanet]) {
    const planet = planets[targetPlanet];
    targetPosition.copy(planet.group.position);
  }
  
  const desiredPos = new THREE.Vector3(
    targetPosition.x,
    cameraDistance * 0.4,
    targetPosition.z + cameraDistance
  );
  
  camera.position.lerp(desiredPos, 0.05);
  camera.lookAt(targetPosition);
  
  renderer.render(scene, camera);
}

animate();

// === RESIZE ===
window.addEventListener("resize", () => {
  camera.aspect = (window.innerWidth * 0.75) / (window.innerHeight - 100);
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth * 0.75, window.innerHeight - 100);
});

console.log("🌍 Système solaire initialisé - Les planètes devraient être visibles (sphères blanches)");