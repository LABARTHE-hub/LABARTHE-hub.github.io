// gestures.js


decoded.hands.push({handedness, fingerStates, thumbUp, landmarks: lm});
}


// Now map to gestures specified in the project
const gesture = this._mapToGesture(decoded);
if(this.onGesture) this.onGesture({decoded, gesture});
}


_mapToGesture(decoded){
// counts for right/left
const right = decoded.hands.find(h=>h.handedness==='right');
const left = decoded.hands.find(h=>h.handedness==='left');


const countExtended = (h)=>{ if(!h) return 0; const arr = h.fingerStates; let c = arr.reduce((s,v)=>s+(v?1:0),0); if(h.thumbUp) c+=1; return c; };
const rCount = countExtended(right);
const lCount = countExtended(left);


// two hands open detection
if(decoded.hands.length>=2 && rCount>=4 && lCount>=4) return {name:'two_hands_open'};


// two fists detection (0 fingers each)
if(decoded.hands.length>=2 && rCount===0 && lCount===0) return {name:'two_fists'};


// right hand gestures prioritized
if(right){
if(rCount===0) return {name:'right_fist'}; // center sun
if(rCount===1 && right.fingerStates[0]) return {name:'right_1'}; // mercury
if(rCount===2 && right.fingerStates[0] && right.fingerStates[1]) return {name:'right_2'}; // venus
if(rCount===3 && right.fingerStates[0] && right.fingerStates[1] && right.fingerStates[2]) return {name:'right_3'}; // earth
if(rCount===4 && right.fingerStates[0] && right.fingerStates[1] && right.fingerStates[2] && right.fingerStates[3]) return {name:'right_4'}; // mars
if(rCount>=5) {
// check additional left fingers for outer planets
if(left){
if(lCount===0) return {name:'right_5'}; // jupiter
if(lCount===1 && left.fingerStates[0]) return {name:'right5_left1'}; // saturn
if(lCount===2 && left.fingerStates[0] && left.fingerStates[1]) return {name:'right5_left2'}; // uranus
if(lCount===3 && left.fingerStates[0] && left.fingerStates[1] && left.fingerStates[2]) return {name:'right5_left3'}; // neptune
}
return {name:'right_5'};
}


// pinch detection (thumb + index close)
const lm = right.landmarks;
if(lm){
const d = Math.hypot((lm[4].x-lm[8].x), (lm[4].y-lm[8].y));
if(d < 0.03) return {name:'right_pinch', distance:d};
}
}


// fallback: return none
return {name:'none'};
}
}


// export for main.js
window.GestureController = GestureController;