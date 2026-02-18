let STATE = {
  active: 1,
  topics: [],
  category: "HYBRID"
};

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
   ESPN SWIPE ANIMATION
========================= */

function espnSwipe(element) {
  element.classList.remove("swipe");
  void element.offsetWidth;
  element.classList.add("swipe");
}

/* =========================
   APPLY TOPICS
========================= */

function applyTopics() {
  const active = Number(STATE.active);

  const topicNum = document.getElementById("topicNum");
  if (topicNum)
    topicNum.textContent = `TOPIC ${String(active).padStart(2, "0")}`;

  for (let i = 1; i <= 6; i++) {
    const box = document.getElementById(`topic${i}`);
    const text = document.getElementById(`topic${i}Text`);

    if (box) {
      box.classList.toggle("active", i === active);
      if (i === active) espnSwipe(box);
    }

    if (text)
      text.textContent =
        STATE.topics[i - 1] ? STATE.topics[i - 1] : "";
  }
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
   LOAD TOPICS TEXT ONLY
========================= */

async function loadTopics() {
  try {
    const r = await fetch("data/topics.json", { cache: "no-store" });
    const data = await r.json();

    // Only update text — NEVER active
    STATE.topics = data.topics || STATE.topics;
    STATE.category = data.category || STATE.category;

    applyTopics();
  } catch (err) {
    console.log("Topic load error:", err);
  }
}

/* =========================
   INIT
========================= */

async function initOverlay() {
  await loadTopics();

  // Refresh text only
  setInterval(loadTopics, 5000);
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

window.addEventListener("DOMContentLoaded", initOverlay);
