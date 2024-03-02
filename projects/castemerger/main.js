const {
  Bodies, Body, Engine, Events, Render, Runner, World, Mouse, MouseConstraint
} = Matter;

import { FRUITS_BASE } from "./fruits.js";

let FRUITS = FRUITS_BASE;

const firebaseConfig = {
  apiKey: "AIzaSyBE6HxPaVPvRwXEuPiWB4UZ3Y934yMxmHc",
  authDomain: "castemerger.firebaseapp.com",
  projectId: "castemerger",
  storageBucket: "castemerger.appspot.com",
  messagingSenderId: "762085725168",
  appId: "1:762085725168:web:87ad7c7d4cda5ba110c335",
  measurementId: "G-N3GPLJXTKN"
};

firebase.initializeApp(firebaseConfig);
firebase.analytics();
const db = firebase.firestore();

const engine = Engine.create();
const render = Render.create({
  engine,
  element: document.body,
  options: {
      wireframes: false,
      background: "#F7F4C8",
      width: 500,
      height: 550,
  }
});

const world = engine.world;

const leftWall = Bodies.rectangle(15, 375, 50, 750, {  
  isStatic: true,
  render: { fillStyle: "#E6B143" }
});

const rightWall = Bodies.rectangle(485, 375, 50, 750, { 
  isStatic: true,
  render: { fillStyle: "#E6B143" }
});

const ground = Bodies.rectangle(250, 540, 500, 60, { 
  isStatic: true,
  render: { fillStyle: "#E6B143" }
});

const topLine = Bodies.rectangle(250, 150, 500, 2, { 
  name: "topLine",
  isStatic: true,
  isSensor: true,
  render: { fillStyle: "#E6B143" }
})

World.add(world, [leftWall, rightWall, ground, topLine]);

Render.run(render);
Runner.run(engine);

let currentBody = null;
let currentFruit = null;

let previewFruit = null;

let canDrop = true;
let gameOver = false;
let score = 0;
const loseHeight = 150;
let isScoreSubmitted = false;

const clickSound = new Audio('sounds/click.mp3');

let nextFruitIndex = Math.floor(Math.random() * 5); 
let nextNextFruitIndex = Math.floor(Math.random() * 5);

function addNextFruitPreview() {
  const fruit = FRUITS[nextNextFruitIndex]; 
  const nextFruitImg = document.getElementById('nextFruit');

  nextFruitImg.src = `${fruit.name}.png`;
}

function addFruit(positionX) {
  if (!canDrop) {
      return;
  }

  const fruit = FRUITS[nextFruitIndex];

  positionX = Math.max(positionX, 40 + fruit.radius);
  positionX = Math.min(positionX, 460 - fruit.radius);

  const body = Bodies.circle(positionX, 50, fruit.radius, {
      index: nextFruitIndex,
      isSleeping: false,
      render: {
          sprite: { texture: `${fruit.name}.png` }
      },
      restitution: 0.2,
  });

  currentBody = body;
  currentFruit = fruit;

  World.add(world, body);

  nextFruitIndex = nextNextFruitIndex;  
  nextNextFruitIndex = Math.floor(Math.random() * 5);  

  addNextFruitPreview();

  canDrop = false; 

  setTimeout(function() {
      canDrop = true; 
  }, 500);

  clickSound.play(); 
}


function addPreviewFruit(positionX) {
  const fruit = FRUITS[nextFruitIndex];

  positionX = Math.max(positionX, 40 + fruit.radius);
  positionX = Math.min(positionX, 460 - fruit.radius);

  const body = Bodies.circle(positionX, 50, fruit.radius, {
      index: nextFruitIndex,
      isSleeping: true,
      render: {
          sprite: { texture: `${fruit.name}.png`, opacity: 0.5 }
      },
      restitution: 0.2,
  });

  previewFruit = body;

  World.add(world, body);
}

const mouse = Mouse.create(render.canvas);
const mouseConstraint = MouseConstraint.create(engine, {
  mouse: mouse,
  constraint: {
      stiffness: 0.2,
      render: {
          visible: false,
      },
  },
});
render.mouse = mouse;

Events.on(mouseConstraint, 'mousedown', function (e) {
  if (!canDrop || gameOver) {
    return;
}
  if (previewFruit) {
      World.remove(world, previewFruit);
  }
  addFruit(e.mouse.position.x);
  clickSound.play();
});

Events.on(mouseConstraint, 'mousemove', function (e) {
  if (!canDrop || gameOver) {
    return;
}

  if (previewFruit) {
      World.remove(world, previewFruit);
  }
  addPreviewFruit(e.mouse.position.x);
});

Events.on(engine, "collisionStart", (event) => {
  event.pairs.forEach((collision) => {
      if (collision.bodyA.index === collision.bodyB.index) {
          const index = collision.bodyA.index;

          if (index === FRUITS.length - 1) {
              return;
          }

          World.remove(world, [collision.bodyA, collision.bodyB]);
          new Audio('sounds/pop0.mp3').play();

          score += Math.pow(2, index);
          document.getElementById('score').innerText = score;     

          const newFruit = FRUITS[index + 1];

          const newBody = Bodies.circle(
              collision.collision.supports[0].x,
              collision.collision.supports[0].y,
              newFruit.radius,
              {
                  render: {
                      sprite: { texture: `${newFruit.name}.png` }
                  },
                  index: index + 1,
              }
          );

          World.add(world, newBody);
      }
      setTimeout(function() {
        const aY = collision.bodyA.position.y + collision.bodyA.circleRadius;
        const bY = collision.bodyB.position.y + collision.bodyB.circleRadius;
          if (aY < loseHeight || bY < loseHeight) {
            gameOver = true; 
            canDrop = false;  
            scoreText.classList.add("flash-infinite");  
            engine.world.gravity.y = 0;
            for (var i = 0; i < world.bodies.length; i += 1) {
              const body = world.bodies[i];
              Body.setVelocity(body, {x: 0, y: 0});
              Body.setAngularVelocity(body, 0);
            }
            displayLeaderboard();
            leaderboard.classList.add('active');
            return;
          }
      }, 2000);
  });
});

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




addPreviewFruit(310);
addNextFruitPreview();