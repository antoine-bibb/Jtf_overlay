let micOn = false;
let audioCtx, analyser, src, data;

async function startMic(){
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 1024;

  src = audioCtx.createMediaStreamSource(stream);
  src.connect(analyser);

  data = new Uint8Array(analyser.fftSize);

  micOn = true;
  loop();
}

function stopMic(){
  micOn = false;
  localStorage.setItem("JTF_MIC", "0");
}

function loop(){
  if(!micOn) return;

  analyser.getByteTimeDomainData(data);

  // RMS amplitude 0..1
  let sum = 0;
  for(let i=0;i<data.length;i++){
    const v = (data[i] - 128) / 128;
    sum += v*v;
  }
  const rms = Math.sqrt(sum / data.length);

  // Strength B: tuned to feel alive but not cheesy
  const scaled = Math.max(0, Math.min(1, (rms - 0.02) * 6.5));

  localStorage.setItem("JTF_MIC", String(scaled));

  requestAnimationFrame(loop);
}

async function toggleMic(){
  if(!micOn){
    try{ await startMic(); }
    catch{
      alert("Mic permission blocked. Allow microphone access in your browser for audio-reactive glow.");
    }
  }else{
    stopMic();
  }
}

const btn = document.getElementById("micToggle");
if(btn) btn.addEventListener("click", toggleMic);

window.addEventListener("keydown", (e) => {
  if(e.target && ["INPUT","TEXTAREA","SELECT"].includes(e.target.tagName)) return;
  if(e.key.toLowerCase()==="m") toggleMic();
});