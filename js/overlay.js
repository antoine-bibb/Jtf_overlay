let STATE = {
  active: 1,
  topics: [],
  category: "HYBRID"
};

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
   ESPN SWIPE
========================= */

function triggerSwipe(box) {
  if (!box) return;

  box.classList.remove("swipe");
  void box.offsetWidth;
  box.classList.add("swipe");
}

/* =========================
   APPLY TOPICS
========================= */

function applyTopics() {
  const active = Number(STATE.active);

  const topicNum = document.getElementById("topicNum");
  if (topicNum) {
    topicNum.textContent =
      `TOPIC ${String(active).padStart(2, "0")}`;
  }

  for (let i = 1; i <= 6; i++) {
    const box = document.getElementById(`topic${i}`);
    const text = document.getElementById(`topic${i}Text`);

    if (text) {
      text.textContent =
        STATE.topics[i - 1] ? STATE.topics[i - 1] : "";
    }

    if (box) {
      box.classList.toggle("active", i === active);

      if (i === active && LAST_ACTIVE !== active) {
        triggerSwipe(box);
      }
    }
  }

  LAST_ACTIVE = active;
}

/* =========================
   MANUAL TOPIC SWITCH
========================= */

function setTopic(n) {
  if (STATE.active === n) return;

  STATE.active = n;
  applyTopics();
  burstLogo();
}

/* =========================
   LOAD DATA (TEXT ONLY)
========================= */

async function loadTopics() {
  try {
    const r = await fetch("data/topics.json", { cache: "no-store" });
    const data = await r.json();

    STATE.topics = data.topics || STATE.topics;
    STATE.category = data.category || STATE.category;

    applyTopics();
  } catch (err) {
    console.log("Topic load error:", err);
  }
}

async function loadConfig() {
  try {
    const r = await fetch("data/config.json", { cache: "no-store" });
    const cfg = await r.json();

    const hostName = document.getElementById("hostName");
    const hostSub = document.getElementById("hostSub");

    if (hostName) hostName.innerHTML = buildAnimatedName(cfg.hostName || "JAE CZAR");
    if (hostSub) hostSub.textContent = cfg.hostSub || "Host | Jus The Facts";

  } catch (err) {
    console.log("Config load error:", err);
  }
}

/* =========================
   RANDOM LETTER ANIMATION
========================= */

function buildAnimatedName(name) {
  return name
    .split("")
    .map(char => {
      if (char === " ") return "<span>&nbsp;</span>";
      return `<span>${char}</span>`;
    })
    .join("");
}

function randomLetterPulse() {
  const letters = document.querySelectorAll("#hostName span");
  if (!letters.length) return;

  const randomIndex = Math.floor(Math.random() * letters.length);
  const letter = letters[randomIndex];

  letter.style.animation = "redFlicker 0.4s ease";

  setTimeout(() => {
    letter.style.animation = "";
  }, 400);
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
    p.style.animationDuration =
      10 + Math.random() * 15 + "s";
    p.style.animationDelay =
      Math.random() * 20 + "s";
    container.appendChild(p);
  }
}

/* =========================
   AUDIO REACTIVE GLOW
========================= */

async function initAudioGlow() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioContext =
      new (window.AudioContext || window.webkitAudioContext)();
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

      document.documentElement.style.setProperty(
        "--mic",
        intensity
      );

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
   INIT
========================= */

window.addEventListener("DOMContentLoaded", async () => {
  await loadConfig();
  await loadTopics();

  generateParticles();
  initAudioGlow();

  setInterval(loadTopics, 5000);
  setInterval(randomLetterPulse, 1000 + Math.random() * 2000);
});
