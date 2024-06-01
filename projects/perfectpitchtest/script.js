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
  
  const checkbox = document.getElementById("cb5");
  const pianoKeys = document.querySelectorAll(".piano-keys .key"),
      keysCheckbox = document.querySelector(".keys-checkbox input"),
      hearAgainButton = document.querySelector("#hear-again"),
      startButton = document.querySelector("#start"),
      scoreDisplay = document.querySelector("#score");
  
  let notes = ['c', 'cs', 'd', 'ds', 'e', 'f', 'fs', 'g', 'gs', 'a', 'as', 'b'];
  let octaves = [3, 4, 5];  
  
  let currentKey = null;
  let gameStarted = false;
  let score = 0;
  let timer = 0;
  let interval = null;
  let isGameOver = false; 
  let isScoreSubmitted = false;
  let randomOctave = 4;
  let hardmode = false;
  let firstKeyPlay = false;

  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  let currentAudio = null;
  
  const resetAudioContext = () => {
      if (currentAudio) {
          currentAudio.stop();
          currentAudio.disconnect();
      }
  };
  
  const playTune = async (noteWithOctave, correct = true, highlight = false) => {
      resetAudioContext();
  
      const dataKey = noteWithOctave.slice(0, -1);
      const octave = noteWithOctave.slice(-1);
      const audioFileName = `tunes/${dataKey}.mp3`;
  
      const response = await fetch(audioFileName);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
  
      const playbackRate = Math.pow(2, (octave - 4)); // Calculate playback rate for different octaves
      source.playbackRate.value = playbackRate;
  
      source.connect(audioContext.destination);
      source.start(0);
      currentAudio = source;
      console.log("Playing note: " + dataKey + octave);
  
      if (firstKeyPlay) {
          firstKeyPlay = false;
          return source;
      }
  
      if (highlight) {
          highlightKey(dataKey, correct);
      }
      return source;
  };
  
  const highlightKey = (dataKey, correct) => {
      const clickedKey = document.querySelector(`[data-key="${dataKey}"]`);
      if (clickedKey) {
          clickedKey.classList.add(correct ? "correct" : "wrong");
          setTimeout(() => {
              clickedKey.classList.remove("correct", "wrong");
          }, 150);
      }
  };
  
  const randomKey = () => {
      const randomNote = notes[Math.floor(Math.random() * notes.length)];
      if (hardmode) {
          randomOctave = octaves[Math.floor(Math.random() * octaves.length)];
      }
      currentKey = `${randomNote}${randomOctave}`;
      console.log("Random Key: " + currentKey);
      firstKeyPlay = true; // Initialize only here
      playTune(currentKey, true, false); // Play the generated key
  };
  
  const handleKeyPress = (e) => {
      if (!gameStarted) return;
      const keyPressed = e.target.dataset.key + currentKey.slice(-1);
      console.log("pressedKey: " + keyPressed);
      console.log("currentKey: " + currentKey);
      if (keyPressed === currentKey) {
          playTune(currentKey, true, true);
          score++;
          scoreDisplay.textContent = `Score: ${score}`;
          scoreDisplay.classList.add("green-flash");
          setTimeout(() => {
              scoreDisplay.classList.remove("green-flash");
              randomKey();
          }, 1000);
      } else {
          playTune(keyPressed, false, true);
          timer -= 5;
          startButton.textContent = `Time left: ${timer}`;
          if (timer <= 0) {
              clearInterval(interval);
              handleEndGame();
          }
      }
  };
  
  document.addEventListener('click', function(e) {
      if (e.target.matches('.piano-keys .key')) {
          handleKeyPress(e);
      }
  });
  
  const showHideNotes = () => {
      pianoKeys.forEach(key => {
          key.querySelector("span").classList.toggle("hide");
      });
  };
  
  keysCheckbox.addEventListener("change", showHideNotes);
  
  hearAgainButton.addEventListener('click', () => {
      if (gameStarted && currentAudio) {
          currentAudio.stop(0);
          playTune(currentKey, true, false);
      }
  });
  
  startButton.addEventListener('click', () => {
      checkbox.disabled = true;
      gameStarted = true;
      startButton.disabled = true;
      startButton.classList.remove('flashing');
      score = 0;
      scoreDisplay.textContent = `Score: ${score}`;
      timer = 60;
      startButton.textContent = `Time left: ${timer}`;
      interval = setInterval(() => {
          timer--;  // Decrement by 1
          startButton.textContent = `Time left: ${timer}`;
          if (timer <= 0) {
              handleEndGame();
              clearInterval(interval);
          }
      }, 1000);  // Interval set to 1000ms or 1 second
      randomKey(); // Generate random key only once here
  });
  
  checkbox.addEventListener('change', function(event) {
      hardmode = !event.target.checked;
      console.log('Hard Mode:', hardmode);
      if (hardmode) {
          displayLeaderboard(true);
          const leaderboard = document.getElementById('leaderboard');
          leaderboard.classList.remove('active');
      } else {
          displayLeaderboard(false);
          const leaderboard = document.getElementById('leaderboard');
          leaderboard.classList.remove('active');
      }
  });
  
  const handleEndGame = () => {
      gameStarted = false;
      startButton.disabled = true;
      startButton.textContent = 'Time Left: 0';
      startButton.classList.add('flashing');
      pianoKeys.forEach(key => {
          key.removeEventListener('click', handleKeyPress);
      });
      isGameOver = true;
      displayLeaderboard(hardmode);
      leaderboard.classList.add('active');
      const leaderboardButton = document.getElementById('open-leaderboard');
      leaderboardButton.style.visibility = 'hidden';
  };
  

function updateLeaderboard(hardMode) {
    if (!isGameOver) {
        alert("Finish the game first");
        return;
    }

    if (isScoreSubmitted) {
        alert("Already submitted");
        return;
    }

    const mode = hardMode ? "Hard Mode" : "Easy Mode";
    const leaderboardCollection = db.collection(hardMode ? "hardModeLeaderboard" : "easyModeLeaderboard");
    
    const usernameInput = document.getElementById("username");
    const username = usernameInput.value.trim(); 

    if (username === "") {
        alert("Enter username");
        return;
    }

    leaderboardCollection.orderBy("score", "desc").limit(20).get().then((snapshot) => {
        const leaderboard = snapshot.docs.map(doc => doc.data());
        if (leaderboard.length < 20 || score > leaderboard[19].score) {
            const existingUser = leaderboard.find(user => user.username === username);

            if (existingUser) {
                if (score > existingUser.score) {
                    const docId = snapshot.docs.find(doc => doc.data().username === username).id;

                    leaderboardCollection.doc(docId).update({ score });
                    alert(`Your record has been updated in the ${mode} leaderboard.`);
                    // Ensure displayLeaderboard is called without making it visibly active
                    displayLeaderboard(hardMode);
                } else {
                    alert(`You already have a better record in the ${mode} leaderboard.`);
                }
            } else {
                leaderboardCollection.add({ username, score }).then(() => {
                    leaderboardCollection.orderBy("score", "desc").limit(20).get().then((updatedSnapshot) => {
                        const updatedLeaderboard = updatedSnapshot.docs.map(doc => doc.data());
                        const rank = updatedLeaderboard.findIndex(user => user.username === username) + 1;
                        alert(`Score submitted in the ${mode} leaderboard, Rank: ${rank}`);
                        // Ensure displayLeaderboard is called without making it visibly active
                        displayLeaderboard(hardMode);
                    });
                });
            }

            usernameInput.value = '';
            isScoreSubmitted = true;
        } else {
            alert(`Not worth listing on the ${mode} leaderboard.`);
        }
    });
}

function displayLeaderboard(hardMode = false) { // Default parameter added for initial call
    
    const mode = hardMode ? "Hard Mode" : "Easy Mode";
    const leaderboardCollection = db.collection(hardMode ? "hardModeLeaderboard" : "easyModeLeaderboard");
    const leaderboardList = document.getElementById("leaderboard-list"); 
    const leaderboardTitle = document.getElementById('leaderboard-title');

    leaderboardTitle.textContent = `${mode} Leaderboard`;

    leaderboardCollection.orderBy("score", "desc").limit(20).get().then((snapshot) => {
        const leaderboard = snapshot.docs.map(doc => doc.data());
        leaderboardList.innerHTML = "";
  
        leaderboard.forEach((entry, index) => {
            leaderboardList.innerHTML += `<li>${index + 1}. ${entry.username}: ${entry.score}</li>`; 
        });
    });
}



window.onload = function() {
    

    const leaderboard = document.getElementById('leaderboard');
    const leaderboardButton = document.getElementById('open-leaderboard'); 
    displayLeaderboard(); 

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