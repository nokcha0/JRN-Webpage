const firebaseConfig = {
    apiKey: "AIzaSyD6S_GuVYGfJ19spSj2KG7DMWeANdlrS3s",
    authDomain: "precisiontest-16808.firebaseapp.com",
    projectId: "precisiontest-16808",
    storageBucket: "precisiontest-16808.appspot.com",
    messagingSenderId: "551111638716",
    appId: "1:551111638716:web:48deb9ca0b6fada7969ab9"
};

firebase.initializeApp(firebaseConfig);
firebase.analytics();
const db = firebase.firestore();

let isScoreSubmitted = false;

function updateLeaderboard() {

    if (!gameOver) {
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
            const existingUser = leaderboard.find(user => user.username === username);
  
            if (existingUser) {
                if (score > existingUser.score) {
                    const docId = snapshot.docs.find(doc => doc.data().username === username).id;
  
                    leaderboardCollection.doc(docId).update({ score });
                    alert("Your record has been updated");
                    displayLeaderboard();
                } else {
                    alert("You already have a better record");
                }
            } else {
                leaderboardCollection.add({ username, score }).then(() => {
                    leaderboardCollection.orderBy("score", "desc").limit(20).get().then((updatedSnapshot) => {
                        const updatedLeaderboard = updatedSnapshot.docs.map(doc => doc.data());
                        const rank = updatedLeaderboard.findIndex(user => user.username === username) + 1;
                        alert(`Score submitted, Rank: ${rank}`);
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

  function closeLeaderboard() {
    const leaderboard = document.getElementById('leaderboard');
    const leaderboardButton = document.getElementById('open-leaderboard'); 
    leaderboard.classList.remove('active');
    leaderboardButton.style.visibility = 'visible';
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