window.addEventListener("DOMContentLoaded", () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const stateEl = document.getElementById("voiceState");
  const transcriptEl = document.getElementById("lastTranscript");
  const btnStart = document.getElementById("startVoice");
  const btnStop = document.getElementById("stopVoice");

  if (!SpeechRecognition) {
    stateEl.textContent = "non supportée ❌";
    btnStart.disabled = true;
    btnStop.disabled = true;
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "fr-FR";
  recognition.continuous = true;
  recognition.interimResults = false;

  let isRunning = false;

  // Mapping des commandes vocales
  const commands = {
    soleil: "sun",
    mercure: "mercure",
    vénus: "venus",
    venus: "venus",
    terre: "earth",
    mars: "mars",
    jupiter: "jupiter",
    saturne: "saturne",
    uranus: "uranus",
    neptune: "neptune",
    système: "systeme",
    systeme: "systeme",
    avance: "zoom_in",
    zoom: "zoom_in",
    dézoome: "zoom_out",
    recule: "zoom_out"
  };

  function handleCommand(cmd) {
    console.log(`Traitement commande: ${cmd}`);
    
    if (!window._solar) {
      console.error("window._solar n'est pas disponible");
      return;
    }
    
    const { focusOn, zoomIn, zoomOut } = window._solar;
    
    // Focus sur planète ou système
    if (["sun", "mercure", "venus", "earth", "mars", "jupiter", "saturne", "uranus", "neptune", "systeme"].includes(cmd)) {
      focusOn(cmd);
    }
    // Zoom
    else if (cmd === "zoom_in") {
      zoomIn();
    }
    else if (cmd === "zoom_out") {
      zoomOut();
    }
  }

  recognition.onresult = (event) => {
    const text = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
    transcriptEl.textContent = text;
    console.log(`Transcription: "${text}"`);
    
    // Chercher une correspondance dans les commandes
    for (const [keyword, cmd] of Object.entries(commands)) {
      if (text.includes(keyword)) {
        console.log(`✓ Commande reconnue: ${keyword} -> ${cmd}`);
        handleCommand(cmd);
        break;
      }
    }
  };

  recognition.onstart = () => {
    isRunning = true;
    stateEl.textContent = "🎤 active";
    stateEl.style.color = "#4f4";
    console.log("Reconnaissance vocale démarrée");
  };

  recognition.onend = () => {
    console.log("Reconnaissance vocale terminée");
    if (isRunning) {
      stateEl.textContent = "reconnexion…";
      setTimeout(() => {
        if (isRunning) {
          try {
            recognition.start();
          } catch (e) {
            console.warn("Impossible de redémarrer:", e);
          }
        }
      }, 500);
    } else {
      stateEl.textContent = "désactivée";
      stateEl.style.color = "#f44";
    }
  };

  recognition.onerror = (event) => {
    console.error("Erreur reconnaissance vocale:", event.error);
    
    // Ne pas tenter de redémarrer si l'erreur est "no-speech"
    if (event.error === "no-speech") {
      // C'est normal, on continue
      return;
    }
    
    if (event.error === "aborted") {
      console.log("Reconnaissance interrompue volontairement");
      return;
    }
    
    stateEl.textContent = `erreur: ${event.error}`;
  };

  btnStart.onclick = () => {
    if (!isRunning) {
      isRunning = true;
      try {
        recognition.start();
        console.log("Démarrage manuel de la reconnaissance");
      } catch (e) {
        console.error("Erreur au démarrage:", e);
        isRunning = false;
      }
    }
  };

  btnStop.onclick = () => {
    isRunning = false;
    try {
      recognition.stop();
      console.log("Arrêt manuel de la reconnaissance");
    } catch (e) {
      console.error("Erreur à l'arrêt:", e);
    }
    stateEl.textContent = "désactivée";
    stateEl.style.color = "#f44";
  };

  // Activation automatique au chargement
  setTimeout(() => {
    if (!isRunning) {
      btnStart.click();
    }
  }, 1000);
});