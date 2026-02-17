let STATE = null;

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

function applyTopics(data) {
  const badgeCategory = document.getElementById("badgeCategory");
  const badgeEpisode = document.getElementById("badgeEpisode");

  if (badgeCategory && data.category) badgeCategory.textContent = data.category;
  if (badgeEpisode && data.episodeTitle) badgeEpisode.textContent = data.episodeTitle;

  const active = Number(data.active || 1);

  const num = document.getElementById("topicNum");
  if (num) num.textContent = `TOPIC ${String(active).padStart(2, "0")}`;

  for (let i = 1; i <= 6; i++) {
    const topicBox = document.getElementById(`topic${i}`);
    if (topicBox) topicBox.classList.toggle("active", i === active);

    const text = document.getElementById(`topic${i}Text`);
    if (text) {
      text.textContent =
        (data.topics && data.topics[i - 1]) ? data.topics[i - 1] : "";
    }
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

async function loadConfig() {
  const r = await fetch("data/config.json", { cache: "no-store" });
  return r.json();
}

async function loadTopics() {
  const r = await fetch("data/topics.json", { cache: "no-store" });
  return r.json();
}

async function initOverlay() {
  const cfg = await loadConfig();
  const topics = await loadTopics();
  STATE = topics;

  const hn = document.getElementById("hostName");
  const hs = document.getElementById("hostSub");

  if (hn) hn.textContent = cfg.hostName || "JAE CZAR";
  if (hs) hs.textContent = cfg.hostSub || "Host | Jus The Facts";

  applyTopics(topics);

  // Auto refresh topics.json
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

  // 🔥 ALL storage listeners go HERE (outside applyTopics)

  window.addEventListener("storage", (e) => {

    // Topic switch live
    if (e.key === "JTF_ACTIVE" && STATE) {
      STATE.active = Number(e.newValue || 1);
      applyTopics(STATE);
      burstLogo();
    }

    // Category change
    if (e.key === "JTF_CATEGORY" && STATE) {
      STATE.category = e.newValue || "HYBRID";
      applyTopics(STATE);
    }

    // Topic text change
    if (e.key === "JTF_TOPICS" && STATE) {
      try {
        STATE.topics = JSON.parse(e.newValue || "[]");
        applyTopics(STATE);
      } catch {}
    }

    // Evidence image
    if (e.key === "JTF_EVIDENCE" && STATE) {
      STATE.evidenceImage = e.newValue || STATE.evidenceImage;
      applyTopics(STATE);
      burstLogo();
    }

    // Mic reactive glow
    if (e.key === "JTF_MIC") {
      const v = Math.max(0, Math.min(1, Number(e.newValue || 0)));
      document.documentElement.style.setProperty("--mic", String(v));
    }

    // Manual burst
    if (e.key === "JTF_BURST") {
      burstLogo();
    }

    // Breaking mode
    if (e.key === "JTF_BREAK") {
      const on = e.newValue === "1";
      setBreaking(on);
      flashBreaking();
      burstLogo();
    }

    // Evidence zoom
    if (e.key === "JTF_EVIDENCE_ZOOM") {
      const box = document.getElementById("evidenceBox");
      if (box) box.classList.toggle("zoom");
    }

  });
}

window.addEventListener("DOMContentLoaded", initOverlay);