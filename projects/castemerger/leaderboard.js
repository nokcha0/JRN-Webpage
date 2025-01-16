//LEADERBOARD -------------------------------------------------------------------

// Helper to sanitize user input
function sanitizeInput(input) {
  const div = document.createElement("div");
  div.innerText = input.trim(); // Encode HTML entities and trim whitespace
  return div.innerHTML;
}

// Helper to escape dynamic content
function escapeHTML(content) {
  return content.replace(/[&<>"'/]/g, (match) => {
    const escapeMap = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
      "/": "&#x2F;",
    };
    return escapeMap[match];
  });
}

function updateLeaderboard(gameOver, isScoreSubmitted, score) {
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
  const rawUsername = usernameInput.value;

  // Sanitize username input
  const username = sanitizeInput(rawUsername);

  if (!username) {
    alert("Enter a valid username.");
    return;
  }

  leaderboardCollection
    .orderBy("score", "desc")
    .limit(20)
    .get()
    .then((snapshot) => {
      const leaderboard = snapshot.docs.map((doc) => doc.data());
      if (leaderboard.length < 20 || score > leaderboard[19].score) {
        const existingUser = leaderboard.find(
          (user) => user.username === username
        );

        if (existingUser) {
          if (score > existingUser.score) {
            const docId = snapshot.docs.find(
              (doc) => doc.data().username === username
            ).id;

            leaderboardCollection.doc(docId).update({ score });
            alert("Your record has been updated.");
            displayLeaderboard();
          } else {
            alert("You already have a better record.");
          }
        } else {
          leaderboardCollection.add({ username, score }).then(() => {
            leaderboardCollection
              .orderBy("score", "desc")
              .limit(20)
              .get()
              .then((updatedSnapshot) => {
                const updatedLeaderboard = updatedSnapshot.docs.map((doc) =>
                  doc.data()
                );
                const rank =
                  updatedLeaderboard.findIndex(
                    (user) => user.username === username
                  ) + 1;
                alert(`Score submitted! Your rank: ${rank}`);
                displayLeaderboard();
              });
          });
        }

        usernameInput.value = ""; // Clear input after submission
        isScoreSubmitted = true;
      } else {
        alert("Not worth listing on the leaderboard.");
      }
    });
}

function displayLeaderboard() {
  const leaderboardCollection = db.collection("leaderboard");
  const leaderboardList = document.getElementById("leaderboard-list");
  const leaderboard = document.getElementById("leaderboard");
  const leaderboardButton = document.getElementById("open-leaderboard");

  leaderboardButton.style.visibility = "hidden";
  leaderboard.classList.add("active");

  leaderboardCollection
    .orderBy("score", "desc")
    .limit(20)
    .get()
    .then((snapshot) => {
      const leaderboard = snapshot.docs.map((doc) => doc.data());
      leaderboardList.innerHTML = "";

      leaderboard.forEach((entry, index) => {
        // Escape dynamic content before inserting into the DOM
        leaderboardList.innerHTML += `<li>${index + 1}. ${escapeHTML(
          entry.username
        )}: ${escapeHTML(entry.score.toString())}</li>`;
      });
    });
}

export { updateLeaderboard, displayLeaderboard };
