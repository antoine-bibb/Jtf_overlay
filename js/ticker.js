let _tickerLines = [];
let _tickerIdx = 0;

async function loadConfig() {
  const r = await fetch("data/config.json", { cache: "no-store" });
  return r.json();
}

async function loadTickerFile() {
  const r = await fetch("data/ticker.txt", { cache: "no-store" });
  const txt = await r.text();
  _tickerLines = txt
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean);
  if (_tickerLines.length === 0) _tickerLines = ["JUS THE FACTS • LIVE"];
}

function setTickerText(line) {
  const el = document.getElementById("tickerText");
  if (!el) return;

  // Reset animation cleanly
  el.style.animation = "none";
  el.offsetHeight; // reflow
  el.textContent = line;
  el.style.animation = "";
}

async function initTicker() {
  const cfg = await loadConfig();
  await loadTickerFile();

  // set immediately
  setTickerText(_tickerLines[0]);

  // rotate lines
  setInterval(() => {
    if (_tickerLines.length === 0) return;
    _tickerIdx = (_tickerIdx + 1) % _tickerLines.length;
    setTickerText(_tickerLines[_tickerIdx]);
  }, (cfg.tickerRotateSeconds || 8) * 1000);

  // refresh from file
  setInterval(async () => {
    try { await loadTickerFile(); }
    catch {}
  }, (cfg.tickerRefreshSeconds || 5) * 1000);
}

window.addEventListener("DOMContentLoaded", initTicker);
