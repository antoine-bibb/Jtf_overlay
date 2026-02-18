let STATE = null;

/* ======================================
   UTILITY FUNCTIONS
====================================== */

function burstLogo() {
  const logo = document.getElementById("logoMark");
  if (!logo) return;
  logo.classList.remove("burst");
  void logo.offsetWidth;
  logo.classList.add("burst");
}

function flashBreaking() {
  const f = document.getElementById("breakFlash");
  if (!f) return;
  f.classList.remove("flash");
  void f.offsetWidth;
  f.classList.add("flash");
}

function setBreaking(on) {
  const bar = document.getElementById("tickerBar");
  if (!bar) return;
  bar.classList.toggle("breaking", !!on);
}

/* ======================================
   TOPIC SYSTEM
====================================== */

function applyTopics(data) {
  const badgeCategory = document.getElementById("badgeCategory");
  const badgeEpisode = document.getElementById("badgeEpisode");

  if (badgeCategory && data.category)
    badgeCategory.textContent = data.category;

  if (badgeEpisode && data.episodeTitle)
    badgeEpisode.textContent = data.episodeTitle;

  const active = Number(data.active || 1);

  const num = document.getElementById("topicNum");
  if (num)
    num.textContent = `TOPIC ${String(active).padStart(2, "0")}`;

  for (let i = 1; i <= 6; i++) {
    const topicBox = document.getElementById(`topic${i}`);
    if (topicBox)
      topicBox.classList.toggle("active", i === active);

    const text = document.getElementById(`topic${i}Text`);
    if (text)
      text.textContent =
        data.topics && data.topics[i - 1]
          ? data.topics[i - 1]
          : "";
  }

  const evLabel = document.getElementById("evidenceLabel");
  if (evLabel && data.evidenceLabel)
    evLabel.textContent = data.evidenceLabel;

  const evImage = document.getElementById("evidenceImage");
  if (evImage && data.evidenceImage)
    evImage.src = data.evidenceImage;

  const startSub = document.getElementById("startSub");
  if (startSub && data.episodeTitle)
    startSub.textContent = `${data.episodeTitle} • LIVE`;

  const lowerThird = document.getElementById("lowerThird");
  if (lowerThird)
    lowerThird.classList.toggle("hidden", data.lowerThirdOn === false);
}

/* ======================================
   FETCH CONFIG
====================================== */

async function loadConfig() {
  const r = await fetch("data/config.json", { cache: "no-store" });
  return r.json();
}

async function loadTopics() {
  const r = await fetch("data/topics.json", { cache: "no-store" });
  return r.json();
}

/* ======================================
   PARTICLES
====================================== */

function generateParticles() {
  const container = document.querySelector(".particles");
  if (!container) return;

  for (let i = 0; i < 40; i++) {
    const p = document.createElement("span");
    p.style.left = Math.random() * 100 + "vw";
    p.style.animationDuration = 10 + Math.random() * 15 + "s";
    p.style.animationDelay = Math.random() * 20 + "s";
    container.appendChild(p);
  }
}

/* ======================================
   FACT MODE
====================================== */

function toggleFactMode() {
  document.body.classList.toggle("fact-mode");
}

/* ======================================
   HOTKEYS
====================================== */

function setupHotkeys() {
  window.addEventListener("keydown", (e) => {
    if (!STATE) return;

    if (e.key >= "1" && e.key <= "6") {
      STATE.active = Number(e.key);
      applyTopics(STATE);
      burstLogo();
    }

    if (e.key === "f") {
      toggleFactMode();
    }

    if (e.key === "b") {
      setBreaking(true);
      flashBreaking();
      burstLogo();
    }
  });
}

/* ======================================
   FREQUENCY REACTIVE CAMERA GLOW
====================================== */

async function initAudioReactiveGlow() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();

    analyser.fftSize = 512;
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const camera = document.querySelector(".camera-frame");

    function animate() {
      analyser.getByteFrequencyData(dataArray);

      let low = 0, mid = 0, high = 0;

      for (let i = 0; i < dataArray.length; i++) {
        let freq = i * audioContext.sampleRate / analyser.fftSize;

        if (freq < 250) low += dataArray[i];
        else if (freq < 2000) mid += dataArray[i];
        else high += dataArray[i];
      }

      low = low / 50;
      mid = mid / 200;
      high = high / 300;

      let lowGlow = Math.min(low / 255, 1);
      let midGlow = Math.min(mid / 255, 1);
      let highGlow = Math.min(high / 255, 1);

      if (camera) {
        camera.style.boxShadow = `
          0 ${10 + lowGlow * 30}px ${20 + lowGlow * 40}px rgba(160,0,0,${0.3 + lowGlow * 0.6}),
          ${midGlow * 20}px 0 ${30 + midGlow * 30}px rgba(160,0,0,${0.2 + midGlow * 0.5}),
          0 -${highGlow * 20}px ${30 + highGlow * 30}px rgba(255,50,50,${0.2 + highGlow * 0.6}),
          inset 0 0 40px rgba(0,0,0,0.8)
        `;
      }

      document.documentElement.style.setProperty("--mic", lowGlow);

      requestAnimationFrame(animate);
    }

    animate();
  } catch (err) {
    console.log("Mic permission denied or unavailable.");
  }
}

/* ======================================
   OVERLAY INIT
====================================== */

async function initOverlay() {
  const cfg = await loadConfig();
  const topics = await loadTopics();
  STATE = topics;

  const hn = document.getElementById("hostName");
  const hs = document.getElementById("hostSub");

  if (hn) hn.textContent = cfg.hostName || "JAE CZAR";
  if (hs) hs.textContent = cfg.hostSub || "Host | Jus The Facts";

  applyTopics(topics);

  setInterval(async () => {
    try {
      const next = await loadTopics();
      const changed =
        STATE && next &&
        Number(next.active) !== Number(STATE.active);

      STATE = next;
      applyTopics(next);

      if (changed) burstLogo();
    } catch {}
  }, (cfg.topicsRefreshSeconds || 5) * 1000);

  window.addEventListener("storage", (e) => {
    if (!STATE) return;

    if (e.key === "JTF_ACTIVE") {
      STATE.active = Number(e.newValue || 1);
      applyTopics(STATE);
      burstLogo();
    }

    if (e.key === "JTF_CATEGORY") {
      STATE.category = e.newValue || "HYBRID";
      applyTopics(STATE);
    }

    if (e.key === "JTF_TOPICS") {
      try {
        STATE.topics = JSON.parse(e.newValue || "[]");
        applyTopics(STATE);
      } catch {}
    }

    if (e.key === "JTF_EVIDENCE") {
      STATE.evidenceImage = e.newValue || STATE.evidenceImage;
      applyTopics(STATE);
      burstLogo();
    }

    if (e.key === "JTF_BREAK") {
      const on = e.newValue === "1";
      setBreaking(on);
      flashBreaking();
      burstLogo();
    }
  });

  generateParticles();
  setupHotkeys();
  initAudioReactiveGlow();
}

window.addEventListener("DOMContentLoaded", initOverlay);