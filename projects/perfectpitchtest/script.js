const pianoKeys = document.querySelectorAll(".piano-keys .key"),
volumeSlider = document.querySelector(".volume-slider input"),
keysCheckbox = document.querySelector(".keys-checkbox input"),
hearAgainButton = document.querySelector("#hear-again"),
startButton = document.querySelector("#start"),
scoreDisplay = document.querySelector("#score");

let allKeys = [];
let currentKey = null;
let gameStarted = false;
let currentAudio = null;
let score = 0;
let timer = 0;
let interval = null;

const playTune = (key, correct = true) => {
    let audio = new Audio(`tunes/${key}.wav`);
    audio.play();
    const clickedKey = document.querySelector(`[data-key="${key}"]`);
    clickedKey.classList.add(correct ? "active" : "wrong");
    setTimeout(() => {
        clickedKey.classList.remove("active");
        clickedKey.classList.remove("wrong");
    }, 150);
    return audio;
}

const handleVolume = (e) => {
    Array.from(document.querySelectorAll('audio')).forEach(audio => {
        audio.volume = e.target.value;
    });
}

const showHideNotes = () => {
    pianoKeys.forEach(key => key.classList.toggle("hide"));
}

const handleEndGame = () => {
    gameStarted = false;
    startButton.disabled = true; // disable the button when the game ends
    startButton.textContent = 'Time Left: 0'; // show 'Time Left: 0' when the game ends
    pianoKeys.forEach(key => {
        key.removeEventListener('click', handleKeyPress);
    });
    startButton.classList.add('flashing');
}


const randomKey = () => {
    currentKey = allKeys[Math.floor(Math.random() * allKeys.length)];
    currentAudio = playTune(currentKey);
}

const handleKeyPress = (e) => {
    if(!gameStarted) return;
    if(e.target.dataset.key === currentKey) {
        playTune(currentKey, false);
        score++; 
        scoreDisplay.textContent = `Score: ${score}`;
        e.target.classList.add("correct");
        setTimeout(() => {
            e.target.classList.remove("correct");
            randomKey();    
        }, 1000);
        
    } else {
        playTune(e.target.dataset.key, false);
        timer -= 5;
        startButton.textContent = `Time left: ${timer}`;
        if (timer <= 0) {
            clearInterval(interval);
            handleEndGame();
        }
        startButton.classList.add('flashing');
        setTimeout(() => {
            startButton.classList.remove('flashing');
        }, 500);
    }
}


pianoKeys.forEach(key => {
    allKeys.push(key.dataset.key);
    key.addEventListener("click", handleKeyPress);
})

hearAgainButton.addEventListener('click', () => {
    if(gameStarted && currentAudio) {
        currentAudio.currentTime = 0;
        currentAudio.play();
    }
});

startButton.addEventListener('click', () => {
    gameStarted = true;
    startButton.disabled = true;
    startButton.classList.remove('flashing');
    randomKey();
    score = 0;
    scoreDisplay.textContent = `Score: ${score}`;
    timer = 60;
    startButton.textContent = `Time left: ${timer}`;
    interval = setInterval(() => {
        timer--;
        startButton.textContent = `Time left: ${timer}`;
        if (timer <= 0) {
            clearInterval(interval);
            handleEndGame();
        }
    }, 1000);
});

volumeSlider.addEventListener("input", handleVolume);
keysCheckbox.addEventListener("change", showHideNotes);
