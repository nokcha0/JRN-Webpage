let audioContext = new (window.AudioContext || window.webkitAudioContext)();
let sourceNode;
let gainNode = audioContext.createGain();
let currentBuffer = null;

document.getElementById('audioFile').addEventListener('change', function(event) {
    let files = event.target.files;
    let file = files[0];
    if (file) {
        let reader = new FileReader();
        reader.onload = function(e) {
            audioContext.decodeAudioData(e.target.result, function(buffer) {
                currentBuffer = buffer; // 버퍼 저장
                if(sourceNode){
                    sourceNode.disconnect();
                }
                sourceNode = audioContext.createBufferSource();
                sourceNode.buffer = buffer;
                sourceNode.connect(gainNode);
                gainNode.connect(audioContext.destination);
            }, function(e){"Error with decoding audio data" + e.err});
        };
        reader.readAsArrayBuffer(file);
    }
});

document.getElementById('volumeControl').addEventListener('input', function() {
    let volume = this.value;
    gainNode.gain.value = volume;
    document.getElementById('volumePercentage').textContent = Math.round(volume * 100) + '%';
});

document.getElementById('playButton').addEventListener('click', function() {
    if (sourceNode) {
        sourceNode.start(0);
    }
});

