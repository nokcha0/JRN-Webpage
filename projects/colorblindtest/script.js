// https://console.firebase.google.com/u/1/project/colorblindtest-3e417/firestore/data/~2F
// Duclos account

const firebaseConfig = {
    apiKey: "AIzaSyAkSMqbbafvpyqmrfx8M0rW_sZsiIMKBeQ",
    authDomain: "colorblindtest-3e417.firebaseapp.com",
    projectId: "colorblindtest-3e417",
    storageBucket: "colorblindtest-3e417.appspot.com",
    messagingSenderId: "227543882027",
    appId: "1:227543882027:web:33bff886a3f8f1d6290d6e",
    measurementId: "G-34V0JG327Q"
};

firebase.initializeApp(firebaseConfig);
firebase.analytics();
const db = firebase.firestore();

let score = 0;
let timeLeft = 60;
let intervalId = null;
let gridSize = 2; 
let colorDifference = 3000; 
let isGameOver = false; 
let isScoreSubmitted = false;

const startGame = () => {
    score = 0;
    timeLeft = 60;
    gridSize = 2;
    colorDifference = 3000;
    generatePalette(gridSize, colorDifference);
    document.querySelector(".timer").innerText = `Time Left: ${timeLeft}s`;
    document.querySelector(".score").innerText = `Score: ${score}`;
}


const disableGame = () => {
    const colors = document.querySelectorAll(".color");
    colors.forEach(color => {
        color.removeEventListener("click", correctColorClicked);
        color.removeEventListener("click", wrongColorClicked);
    });
}

const countdown = () => {
    timeLeft--;
    if (timeLeft <= 0) {
        timeLeft = 0;
        document.querySelector(".timer").innerText = `Time Left: ${timeLeft}s`;
        document.querySelector(".timer").classList.add("flash-infinite");
        clearInterval(intervalId);
        disableGame();
        isGameOver = true;
        displayLeaderboard();
        leaderboard.classList.add('active');
    }
    document.querySelector(".timer").innerText = `Time Left: ${timeLeft}s`;
}


const generatePalette = (gridSize, colorDifference) => {
    const container = document.querySelector(".container");
    container.innerHTML = "";
    container.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    container.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;
    let randomColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
    let oddIndex = Math.floor(Math.random() * gridSize * gridSize);

    for (let i = 0; i < gridSize * gridSize; i++) {
        const color = document.createElement("div");
        color.classList.add("color");
        let hsl = randomColor.replace(/[^\d,]/g, '').split(',');  
        if (i === oddIndex) {
            color.style.background = `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`;
            color.addEventListener("click", correctColorClicked);
        } else {
            let newL = Math.max(0, Math.min(100, parseInt(hsl[2]) - colorDifference / 100)); 
            color.style.background = `hsl(${hsl[0]}, ${hsl[1]}%, ${newL}%)`;
            color.addEventListener("click", wrongColorClicked);
        }
        container.appendChild(color);
    }
}

const correctColorClicked = () => {
    if (intervalId === null) {
        intervalId = setInterval(countdown, 1000); 
    }
    score++;
    document.querySelector(".score").innerText = `Score: ${score}`;
    if (score == 3) {
        gridSize = 3;
        colorDifference = 2000;
    }
    else if (score == 6) {
        gridSize = 4;
        colorDifference = 1000;
    }
    else if (score >= 10) {
        colorDifference = Math.max(10, colorDifference - 50); 
    }
    generatePalette(gridSize, colorDifference);
}

const wrongColorClicked = (event) => {
    if (intervalId === null) {
        intervalId = setInterval(countdown, 1000); 
    }
    timeLeft -= 5;

    let target = event.target;
    target.innerHTML = '<div class="wrong">X</div>'; 
    target.style.background = '#000000'; 
    target.removeEventListener("click", wrongColorClicked);
    
    let timer = document.querySelector(".timer");
    timer.classList.add("flash"); 

    timer.addEventListener('animationend', () => {
        timer.classList.remove('flash');
    });
}

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
    startGame();

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
