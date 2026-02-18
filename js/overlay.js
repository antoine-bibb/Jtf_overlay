let STATE = null;
let LAST_ACTIVE = null;

/* =========================
   LOGO BURST
========================= */

function burstLogo() {
  const logo = document.getElementById("logoMark");
  if (!logo) return;

  logo.classList.remove("burst");
  void logo.offsetWidth;
  logo.classList.add("burst");
}

/* =========================
   APPLY TOPICS
========================= */

function applyTopics(data) {
  if (!data) return;

  const active = Number(data.active || 1);

  const topicNum = document.getElementById("topicNum");
  if (topicNum) {
    topicNum.textContent = `TOPIC ${String(active).padStart(2, "0")}`;
  }

  for (let i = 1; i <= 6; i++) {
    const box = document.getElementById(`topic${i}`);
    const text = document.getElementById(`topic${i}Text`);

    if (text) {
      text.textContent =
        data.topics && data.topics[i - 1]
          ? data.topics[i - 1]
          : "";
    }

    if (box) {
      box.classList.toggle("active", i === active);

      // ESPN swipe trigger
      if (i === active && LAST_ACTIVE !== active) {
        box.classList.remove("swipe");
        void box.offsetWidth;
        box.classList.add("swipe");
      }
    }
  }

  LAST_ACTIVE = active;
}

/* =========================
   MANUAL TOPIC SWITCH
========================= */

function setTopic(n) {
  if (!STATE) return;

  if (STATE.active === n) return;

  STATE.active = n;
  applyTopics(STATE);
  burstLogo();
}

/* =========================
   LOAD FILES
========================= */

async function loadConfig() {
  const r = await fetch("data/config.json", { cache: "no-store" });
  return r.json();
}

async function loadTopics() {
  const r = await fetch("data/topics.json", { cache: "no-store" });
  return r.json();
}

/* =========================
   INIT
========================= */

async function initOverlay() {
  const cfg = await loadConfig();
  const topics = await loadTopics();

  STATE = topics;

  const hostName = document.getElementById("hostName");
  const hostSub = document.getElementById("hostSub");

  if (hostName) hostName.textContent = cfg.hostName || "JAE CZAR";
  if (hostSub) hostSub.textContent = cfg.hostSub || "Host | Jus The Facts";

  applyTopics(STATE);

  /* SAFE AUTO REFRESH
     Will NOT override active topic
  */
  setInterval(async () => {
    try {
      const next = await loadTopics();
      if (!next) return;

      // Only update text — NOT active topic
      STATE.topics = next.topics || STATE.topics;
      STATE.category = next.category || STATE.category;

      applyTopics(STATE);
    } catch (err) {
      console.log("Refresh error:", err);
    }
  }, (cfg.topicsRefreshSeconds || 5) * 1000);
}

/* =========================
   PARTICLES
========================= */

function generateParticles() {
  const container = document.querySelector(".particles");
  if (!container) return;

  container.innerHTML = "";

  for (let i = 0; i < 40; i++) {
    const p = document.createElement("span");
    p.style.left = Math.random() * 100 + "vw";
    p.style.animationDuration = 10 + Math.random() * 15 + "s";
    p.style.animationDelay = Math.random() * 20 + "s";
    container.appendChild(p);
  }
}

/* =========================
   AUDIO REACTIVE GLOW
========================= */

async function initAudioGlow() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();

    analyser.fftSize = 256;
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    function animate() {
      analyser.getByteFrequencyData(dataArray);

      let total = 0;
      for (let i = 0; i < dataArray.length; i++) {
        total += dataArray[i];
      }

      const average = total / dataArray.length;
      const intensity = average / 255;

      document.documentElement.style.setProperty("--mic", intensity);

      requestAnimationFrame(animate);
    }

    animate();
  } catch (err) {
    console.log("Mic permission not granted.");
  }
}

/* =========================
   HOTKEYS
========================= */

window.addEventListener("keydown", (e) => {
  if (e.key >= "1" && e.key <= "6") {
    setTopic(Number(e.key));
  }
});

/* =========================
   START
========================= */

window.addEventListener("DOMContentLoaded", () => {
  initOverlay();
  generateParticles();
  initAudioGlow();
});
