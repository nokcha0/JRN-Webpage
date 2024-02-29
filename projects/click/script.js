
// https://console.firebase.google.com/u/1/project/clickrace-80bb8/firestore/data/~2Fleaderboard~2Ff0LQpD0cP8E5vPeEPDv0
// Duclos account

const firebaseConfig = {
    apiKey: "AIzaSyCLsaAz99-k1ZWDCHeOPsG7QlGvTlowSxE",
    authDomain: "clickrace-80bb8.firebaseapp.com",
    projectId: "clickrace-80bb8",
    storageBucket: "clickrace-80bb8.appspot.com",
    messagingSenderId: "893994702970",
    appId: "1:893994702970:web:8c3ee0f9b995a8935703c3",
    measurementId: "G-R89QVQHTKP"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

// Initialize Firestore
const db = firebase.firestore();

let checkboxCount = 100; // Variable for number of checkboxes
let checkboxesLeft = checkboxCount;
let time = 0;
let timer;
let leaderboard = [];
let gameCompleted = false;
let scoreSubmitted = false; // Variable to check if score has been submitted

// Generate checkboxes
for(let i=0; i<checkboxCount; i++) {
    let checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'checkbox';
    checkbox.style.top = Math.random()*80 + 'vh';
    checkbox.style.left = Math.random()*80 + 'vw';
    checkbox.addEventListener('change', () => {
        checkbox.disabled = true; // Disable checkbox once clicked
        checkboxesLeft--;
        document.getElementById('counter').innerText = 'Left: ' + checkboxesLeft;
        if(checkboxesLeft === 0) {
            clearInterval(timer);
            gameCompleted = true;
            document.getElementById('completionMessage').innerText = "Done";
            document.getElementById('completionMessage').style.color = "green";
        }
    });
    document.getElementById('gameArea').appendChild(checkbox);
}

// Timer
timer = setInterval(() => {
    time++;
    document.getElementById('timer').innerText = 'Time: ' + (time / 100).toFixed(2);
}, 10);

function submitScore() {
    if (!gameCompleted) {
        alert("finish the fucking game first");
        return;
    }
    if(scoreSubmitted) {
        alert("already fking submitted");
        return;
    }
    let username = document.getElementById('username').value;
    let finalTime = (time / 100).toFixed(2); // Convert to seconds with two decimal places
    leaderboard.sort((a, b) => a.time - b.time);
    db.collection("leaderboard").add({
        name: username,
        time: finalTime
    })
    .then((docRef) => {
        console.log("Document written with ID: ", docRef.id);
        scoreSubmitted = true; // Mark the score as submitted
        updateLeaderboard(username, finalTime).then(() => {
            if (leaderboard.length > 20) { // If leaderboard is over the limit
                let worstRecord = leaderboard[leaderboard.length - 1]; // Get the worst record
                // Delete the worst record from Firestore
                db.collection("leaderboard").doc(worstRecord.id).delete().then(() => {
                    console.log("Document successfully deleted");
                    updateLeaderboard(); // Update leaderboard again after deletion
                }).catch((error) => {
                    console.error("Error removing document: ", error);
                });
            }
        });
    })
    .catch((error) => {
        console.error("Error adding document: ", error);
    });
}

// Update leaderboard
function updateLeaderboard(username, finalTime) {
    let leaderboardElement = document.getElementById('leaderboard');
    leaderboardElement.innerHTML = '';
    return db.collection("leaderboard").orderBy('time', 'asc').get().then((querySnapshot) => {
        leaderboard = querySnapshot.docs.map(doc => ({...doc.data(), id: doc.id}));
        leaderboard.sort((a, b) => a.time - b.time);
        for(let i=0; i<leaderboard.length; i++) {
            if(leaderboard[i].name && leaderboard[i].time) {
                let li = document.createElement('li');
                li.innerText = (i + 1) + '. ' + leaderboard[i].name + ': ' + leaderboard[i].time + ' seconds'; // Added the ranking number
                leaderboardElement.appendChild(li);
            }
        }
        if (username && finalTime) { // If a new score was submitted
            let position = leaderboard.findIndex(record => record.time === finalTime && record.name === username) + 1;
            if (position > 0) {
                alert(`top ${position}`);    
                if (position == 1) {
                    alert(`stop cheating. `);
                }
            } else {
                alert("Not even top 20, not worth listing it in the leaderboard.");
            }
        }
    });
}

// Load leaderboard when page loads
window.addEventListener('load', (event) => {
    updateLeaderboard();
});
