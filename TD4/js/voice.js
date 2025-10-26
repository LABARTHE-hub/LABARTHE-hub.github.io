window.addEventListener("DOMContentLoaded", () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const stateEl = document.getElementById("voiceState");
  const transcriptEl = document.getElementById("lastTranscript").querySelector("em");
  const btnStart = document.getElementById("startVoice");
  const btnStop = document.getElementById("stopVoice");

  if (!SpeechRecognition) {
    stateEl.textContent = "non supportée ❌";
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "fr-FR";
  recognition.continuous = true;
  recognition.interimResults = false;

  const commands = {
    "soleil": "sun",
    "mercure": "mercure",
    "vénus": "venus",
    "venus": "venus",
    "terre": "earth",
    "mars": "mars",
    "jupiter": "jupiter",
    "saturne": "saturne",
    "uranus": "uranus",
    "neptune": "neptune",
    "zoom": "zoom_in",
    "dézoome": "zoom_out",
    "recule": "zoom_out",
    "avance": "zoom_in"
  };

  function handleCommand(cmd) {
    if (!window._solar) return;
    const { focusOn, zoomIn, zoomOut } = window._solar;

    if (["sun", "mercure", "venus", "earth", "mars", "jupiter", "saturne", "uranus", "neptune"].includes(cmd))
      focusOn(cmd);
    else if (cmd === "zoom_in") zoomIn();
    else if (cmd === "zoom_out") zoomOut();
  }

  recognition.onresult = e => {
    const text = e.results[e.results.length - 1][0].transcript.trim().toLowerCase();
    transcriptEl.textContent = text;
    for (const [word, cmd] of Object.entries(commands)) {
      if (text.includes(word)) {
        handleCommand(cmd);
        break;
      }
    }
  };

  recognition.onerror = e => {
    stateEl.textContent = "erreur ⚠️";
    console.error(e);
  };

  recognition.onstart = () => (stateEl.textContent = "active 🎤");
  recognition.onend = () => (stateEl.textContent = "arrêtée ⏹️");

  btnStart.onclick = () => recognition.start();
  btnStop.onclick = () => recognition.stop();

  // Démarrage automatique
  recognition.start();
});
