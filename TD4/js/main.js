// main.js
const p = planets[id];
if(!p) return;
// target becomes planet world position
p.group.getWorldPosition(targetPosition);
// desiredDistance set according to planet size (closer for small planets)
const size = Math.max(20, Math.log10(p.meta.radius) * 30);
desiredDistance = Math.min(1200, size * 8 + 150);
}


// gestures -> actions mapping
let pinchLast = null;
function handleGesture({decoded, gesture}){
gestureNameEl.textContent = gesture.name;


switch(gesture.name){
case 'right_fist': focusOn('sun'); break;
case 'right_1': focusOn('mercure'); break;
case 'right_2': focusOn('venus'); break;
case 'right_3': focusOn('earth'); break;
case 'right_4': focusOn('mars'); break;
case 'right_5': focusOn('jupiter'); break;
case 'right5_left1': focusOn('saturne'); break;
case 'right5_left2': focusOn('uranus'); break;
case 'right5_left3': focusOn('neptune'); break;
case 'two_hands_open': desiredDistance = Math.max(100, desiredDistance - 10); break; // zoom in
case 'two_fists': desiredDistance = Math.min(2500, desiredDistance + 30); break; // zoom out
case 'right_pinch':
// if pinch, enable dragging: track movement of pinch center between frames
const right = decoded.hands.find(h=>h.handedness==='right');
if(right && right.landmarks){
const p = right.landmarks[8]; // index tip
// Convert normalized camera coords to scene offset
const x = (p.x - 0.5) * renderer.domElement.clientWidth;
const z = (p.y - 0.5) * renderer.domElement.clientHeight;
if(pinchLast){
const dx = x - pinchLast.x;
const dz = z - pinchLast.z;
// apply small pan to targetPosition
const pan = new THREE.Vector3(-dx*0.5,0,dz*0.5);
targetPosition.add(pan);
}
pinchLast = {x,z};
}
break;
default:
pinchLast = null;
}
}


// initial view: top, showing whole system
targetPosition.set(0,0,0); desiredDistance = 1200;


// basic click-to-focus (fallback to select by name)
window.focusOn = focusOn;


// expose some debug helpers to window for quick testing
window._planets = planets;
})();

