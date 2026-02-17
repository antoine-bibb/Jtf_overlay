function setActiveTopic(topicId) {
    document.querySelectorAll('.topic').forEach(t => t.classList.remove('active'));
    document.getElementById(topicId).classList.add('active');
}

function updateTicker(text) {
    document.getElementById('tickerText').innerText = text;
}

function updateEvidence(imagePath) {
    document.getElementById('evidenceImage').src = imagePath;
}
