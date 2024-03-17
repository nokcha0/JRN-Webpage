const firebaseConfig = {
    apiKey: "AIzaSyCTiCooEYFDC73puWpUK3b5unAO3IK-wys",
    authDomain: "perfectpitchtest-50f59.firebaseapp.com",
    projectId: "perfectpitchtest-50f59",
    storageBucket: "perfectpitchtest-50f59.appspot.com",
    messagingSenderId: "52491167272",
    appId: "1:52491167272:web:b1481b283ebb97e545f71d"
  };

firebase.initializeApp(firebaseConfig);
firebase.analytics();
const db = firebase.firestore();

const checkbox = document.getElementById('hardmodeCheckbox');
const pianoKeys = document.querySelectorAll(".piano-keys .key"),
keysCheckbox = document.querySelector(".keys-checkbox input"),
hearAgainButton = document.querySelector("#hear-again"),
startButton = document.querySelector("#start"),
scoreDisplay = document.querySelector("#score");

let notes = ['c', 'c-', 'd', 'd-', 'e', 'f', 'f-', 'g', 'g-', 'a', 'a-', 'b'];
let octaves = [3, 4, 5];  

let allKeys = [];
let currentKey = null;
let gameStarted = false;
let currentAudio = null;
let score = 0;
let timer = 0;
let interval = null;
let isGameOver = false; 
let isScoreSubmitted = false;
let randomOctave = 4;
let hardmode = false;

const playTune = (noteWithOctave, correct = true) => {
    let audioFileName = `tunes/${noteWithOctave}.mp3`; 
    let audio = new Audio(audioFileName);
    audio.volume = 1;
    audio.play();
    dataKey = noteWithOctave.slice(0, -1);
    console.log("dataKey octave false: " + dataKey);

    if (firstKeyPlay){
        firstKeyPlay = false;
        return audio;
    }

    const clickedKey = document.querySelector(`[data-key="${dataKey}"]`);
    if (clickedKey) {
        clickedKey.classList.add(correct ? "correct" : "wrong");
        setTimeout(() => {
            clickedKey.classList.remove("correct", "wrong");
        }, 150);
    }
    return audio;
}

const showHideNotes = () => {
    pianoKeys.forEach(key => key.classList.toggle("hide"));
}

const handleEndGame = () => {
    gameStarted = false;
    startButton.disabled = true; 
    startButton.textContent = 'Time Left: 0'; 
    startButton.classList.add('flashing'); 
    pianoKeys.forEach(key => {
        key.removeEventListener('click', handleKeyPress);
    });
    isGameOver = true
    displayLeaderboard();
    leaderboard.classList.add('active');

}

const randomKey = () => {
    const randomNote = notes[Math.floor(Math.random() * notes.length)];
    if(hardmode) {
        randomOctave = octaves[Math.floor(Math.random() * octaves.length)];
    }
    currentKey = `${randomNote}${randomOctave}`;
    console.log("Random Key octave true: " + currentKey);
    firstKeyPlay = true;
    currentAudio = playTune(currentKey, true);
}

const handleKeyPress = (e) => {
    if(!gameStarted) return;
    keyPressed = e.target.dataset.key + currentKey.slice(-1);
    console.log("pressedKey octave true: " + keyPressed);
    console.log("currentKey octave true: " + currentKey);
    if(keyPressed === currentKey) {
        playTune(currentKey, true);
        score++; 
        scoreDisplay.textContent = `Score: ${score}`;
        scoreDisplay.classList.add("green-flash"); 
        setTimeout(() => {
            scoreDisplay.classList.remove("green-flash"); 
            randomKey();    
        }, 1000);
    } else {
        playTune(keyPressed, false);
        timer -= 5;
        startButton.textContent = `Time left: ${timer}`;
        if (timer <= 0) {
            clearInterval(interval);
            handleEndGame();
        }
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
    checkbox.disabled = true;
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
            handleEndGame();
            clearInterval(interval);
        }
    }, 1000);

});

checkbox.addEventListener('change', function() {
    if (this.checked) {
        hardmode = true;
    } else {
        hardmode = false;
    }
    console.log('Hard Mode:', hardmode);
});

function updateLeaderboard() {

    if (!isGameOver) {
        alert("Finish the game first");
        return;
    }

    if (isScoreSubmitted) {
        alert("Already submitted");
        return;
    }

    const leaderboardCollection = db.collection("leaderboard");
    
    const usernameInput = document.getElementById("username");
    const username = usernameInput.value.trim(); 

    if (username === "") {
        alert("Enter username");
        return;
    }

    leaderboardCollection.orderBy("score", "desc").limit(20).get().then((snapshot) => {
        const leaderboard = snapshot.docs.map(doc => doc.data());
        if (leaderboard.length < 20 || score > leaderboard[19].score) {
            // Check if the username already exists in the leaderboard
            const existingUser = leaderboard.find(user => user.username === username);

            if (existingUser) {
                // If the new score is better, update the record
                if (score > existingUser.score) {
                    // Retrieve the document ID of the existing user
                    const docId = snapshot.docs.find(doc => doc.data().username === username).id;

                    leaderboardCollection.doc(docId).update({ score });
                    alert("Your record has been updated");
                    displayLeaderboard();
                } else {
                    alert("You already have a better record");
                }
            } else {
                leaderboardCollection.add({ username, score }).then(() => {
                    // After the new score has been added, fetch the updated leaderboard
                    leaderboardCollection.orderBy("score", "desc").limit(20).get().then((updatedSnapshot) => {
                        const updatedLeaderboard = updatedSnapshot.docs.map(doc => doc.data());
                        // After the leaderboard has been updated, find the user's rank
                        const rank = updatedLeaderboard.findIndex(user => user.username === username) + 1;
                        alert(`Score submitted, Rank: ${rank}`);
                        // Update the leaderboard on the page
                        displayLeaderboard();
                    });
                });
            }

            usernameInput.value = '';
            isScoreSubmitted = true;
        } else {
            alert("Not worth listing on the leaderboard");
        }
    });
}

function displayLeaderboard() {
    const leaderboardCollection = db.collection("leaderboard");
    const leaderboardList = document.getElementById("leaderboard-list"); 
    const leaderboard = document.getElementById('leaderboard');
    const leaderboardButton = document.getElementById('open-leaderboard'); 

    leaderboardButton.style.visibility = 'hidden';
    leaderboard.classList.add('active');

    leaderboardCollection.orderBy("score", "desc").limit(20).get().then((snapshot) => {
      const leaderboard = snapshot.docs.map(doc => doc.data());
      leaderboardList.innerHTML = "";
  
      leaderboard.forEach((entry, index) => {
        leaderboardList.innerHTML += `<li>${index + 1}. ${entry.username}: ${entry.score}</li>`; 
      });
    });
}

window.onload = function() {
    
    displayLeaderboard(); 

    const leaderboard = document.getElementById('leaderboard');
    const leaderboardButton = document.getElementById('open-leaderboard'); 
    const closeLeaderboard = document.getElementsByClassName('close-btn')[0];
    const submitButton = document.getElementById('submit-username');

    leaderboard.classList.remove('active');
    leaderboardButton.style.visibility = 'visible';

    leaderboardButton.addEventListener('click', function() {
        leaderboard.classList.add('active');
        leaderboardButton.style.visibility = 'hidden';
    });

    closeLeaderboard.addEventListener('click', function() {
        leaderboard.classList.remove('active');
        leaderboardButton.style.visibility = 'visible';
    });

    submitButton.addEventListener('click', function() {
        updateLeaderboard();
    });
};