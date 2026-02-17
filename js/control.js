// Control writes to topics.json-style state stored in localStorage for live pushes.
// Your overlays refresh topics.json from file, BUT we also push live events here
// (burst, breaking, mic, zoom) using localStorage storage events.

let breaking = false;

function burst(){ localStorage.setItem("JTF_BURST", String(Date.now())); }
function toggleBreaking(){
  breaking = !breaking;
  localStorage.setItem("JTF_BREAK", breaking ? "1" : "0");
}
function toggleZoom(){
  localStorage.setItem("JTF_EVIDENCE_ZOOM", String(Date.now()));
}

function setActive(n){
  // If you want topic switching purely via file, you can edit data/topics.json.
  // For live switching, we store ACTIVE in localStorage and let overlay.js detect via storage.
  localStorage.setItem("JTF_ACTIVE", String(n));
  // Also pulse burst so you feel it
  burst();
}

function applyCategory(){
  const cat = document.getElementById("cat").value;
  localStorage.setItem("JTF_CATEGORY", cat);
}

function applyTopics(){
  const topics = [];
  for(let i=1;i<=6;i++){
    topics.push(document.getElementById(`t${i}`).value || "");
  }
  localStorage.setItem("JTF_TOPICS", JSON.stringify(topics));
  burst();
}

function applyEvidence(){
  const path = document.getElementById("evidence").value.trim();
  if(path) localStorage.setItem("JTF_EVIDENCE", path);
  burst();
}

document.getElementById("burst").addEventListener("click", burst);
document.getElementById("break").addEventListener("click", toggleBreaking);
document.getElementById("zoom").addEventListener("click", toggleZoom);

document.getElementById("applyCat").addEventListener("click", applyCategory);
document.getElementById("applyTopics").addEventListener("click", applyTopics);
document.getElementById("applyEvidence").addEventListener("click", applyEvidence);

// Hotkeys (works when control page focused)
window.addEventListener("keydown", (e) => {
  if(e.target && ["INPUT","TEXTAREA","SELECT"].includes(e.target.tagName)) return;
  if(["1","2","3","4","5","6"].includes(e.key)) setActive(Number(e.key));
  if(e.key.toLowerCase()==="b") burst();
  if(e.key.toLowerCase()==="x") toggleBreaking();
  if(e.key.toLowerCase()==="z") toggleZoom();
});
