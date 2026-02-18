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
   LOAD DATA
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

    if (hostName) {
      hostName.innerHTML = buildAnimatedName(cfg.hostName || "JAE CZAR");
    }

    if (hostSub) {
      hostSub.textContent = cfg.hostSub || "Host | Jus The Facts";
    }

  } catch (err) {
    console.log("Config load error:", err);
  }
}

/* =========================
   JAE CZAR RANDOM RED LETTER
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

  letter.style.animation = "redFlicker 0.5s ease";

  setTimeout(() => {
    letter.style.animation = "";
  }, 500);
}

/* =========================
   OBS MIC LEVEL LISTENER
========================= */

window.addEventListener("storage", (e) => {
  if (e.key === "JTF_MIC") {
    const level = Math.max(0, Math.min(1, Number(e.newValue)));
    document.documentElement.style.setProperty("--mic", level);
  }
});

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

  setInterval(loadTopics, 5000);
  setInterval(randomLetterPulse, 1200);
});
/* =========================
   RANDOM CTA CLICK
========================= */

function randomCTAClick() {
  const buttons = [
    document.getElementById("ctaLike"),
    document.getElementById("ctaComment"),
    document.getElementById("ctaSubscribe")
  ];

  const randomBtn = buttons[Math.floor(Math.random() * buttons.length)];
  if (!randomBtn) return;

  randomBtn.classList.add("clicked");

  setTimeout(() => {
    randomBtn.classList.remove("clicked");
  }, 900);
}

// Trigger every 5 minutes
setInterval(randomCTAClick, 300000);

// Trigger once after 10 seconds
setTimeout(randomCTAClick, 10000);
