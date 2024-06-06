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
render.canvas.id = 'canvas';

const world = engine.world;

const leftWall = Bodies.rectangle(15, 375, 30, 750, {  
  isStatic: true,
  render: { fillStyle: "#9b9b9b" }
});

const rightWall = Bodies.rectangle(485, 375, 30, 750, { 
  isStatic: true,
  render: { fillStyle: "#9b9b9b" }
});

const ground = Bodies.rectangle(250, 540, 500, 40, {  //540
  isStatic: true,
  render: { fillStyle: "#9b9b9b" }
});

const topLine = Bodies.rectangle(250, 150, 500, 2, { 
  name: "topLine",
  isStatic: true,
  isSensor: true,
  render: { fillStyle: "#9b9b9b" }
})

World.add(world, [leftWall, rightWall, ground, topLine]);

Render.run(render);


(function run() {
  const fixedDeltaTime = 1000 / 60; 
  
  Engine.update(engine, fixedDeltaTime); 
  
  requestAnimationFrame(run); 
})();

  
  let currentBody = null;
  let currentFruit = null;
  
  let previewFruit = null;
  
  let canDrop = true;
  let gameOver = false;
  let score = 0;
  const loseHeight = 150;
  let isScoreSubmitted = false;
  let disableGameOver = false;
  
  let holdFruitIndex = null;
  let originalPosition = null;

  let isMobileDevice;
  if (screen.width <= 1366) {
    isMobileDevice = true;
  } else {
    isMobileDevice = false;
  }


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
  
    positionX = Math.max(positionX, 30 + fruit.radius);
    positionX = Math.min(positionX, 470 - fruit.radius);
  
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
    }, 1000);
  
    clickSound.play(); 
  }
  
  
  function addPreviewFruit(positionX) {
    const fruit = FRUITS[nextFruitIndex];
  
    positionX = Math.max(positionX, 30 + fruit.radius);
    positionX = Math.min(positionX, 470 - fruit.radius);
  
    const body = Bodies.circle(positionX, 50, fruit.radius, {
        preview: true,
        index: nextFruitIndex,
        isSleeping: true,
        isSensor: true,
        render: {
            sprite: { texture: `${fruit.name}.png`, opacity: 0.5 }
        },
        restitution: 0.2,
    });
  
    previewFruit = body;
  
    World.add(world, body);
  }
  
  function holdFruit() {
    if (!canDrop || gameOver) {
      return;
    }
  
    if (holdFruitIndex === null) {
      holdFruitIndex = nextFruitIndex;
      nextFruitIndex = nextNextFruitIndex;
      nextNextFruitIndex = Math.floor(Math.random() * 5);
    } else {
      [nextFruitIndex, holdFruitIndex] = [holdFruitIndex, nextFruitIndex];
    }
  
    addNextFruitPreview();
    updateHoldFruitPreview();
  
    if (previewFruit) {
      World.remove(world, previewFruit); 
    }
    addPreviewFruit(originalPosition);
  }
  
  document.getElementById('holdBox').addEventListener('click', function() {
    holdFruit();
  });
  
  document.addEventListener('keydown', function(event) {
    if (gameOver) {
      return;
    }
    if (event.code === 'Space') {
      holdFruit(); 
      event.preventDefault();
    }
  });
  
  function updateHoldFruitPreview() {
    const holdFruitImg = document.getElementById('holdFruit'); 
    if (holdFruitIndex !== null) {
      const fruit = FRUITS[holdFruitIndex];
      holdFruitImg.src = `${fruit.name}.png`;
    } else {
      holdFruitImg.src = 'base/null.jpg';
    }
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
  
  console.log(render.canvas);
  
  console.log("MobileDevice", isMobileDevice);

  if(isMobileDevice){
    Events.on(mouseConstraint, 'mousedown', function (e) {
      if (!canDrop || gameOver) {
        return;
      }
      if (previewFruit) {
          World.remove(world, previewFruit);
      }
      addFruit(e.mouse.position.x);
      clickSound.play();
      if (previewFruit) {
        World.remove(world, previewFruit);
      }
      setTimeout(function(){
        addPreviewFruit(250);
      },800);
      disableGameOver = true;
    
      setTimeout(() => {
        disableGameOver = false;
      }, 1000);
    });
  } else {
    canvas.addEventListener('mousedown', function(event) {
      if (!canDrop || gameOver) {
        return;
      }
    
      if (event.button === 0) {
        
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
    
        if (previewFruit) {
            World.remove(world, previewFruit);
        }
        
        addFruit(mouseX);
        clickSound.play();
    
        if (previewFruit) {
            World.remove(world, previewFruit);
        }
        disableGameOver = true;
    
        setTimeout(() => {
          disableGameOver = false;
        }, 1000);
      } else if (event.button === 2) {
        holdFruit()
        event.preventDefault();
      }
    });
  }
  
  
  document.addEventListener('contextmenu', function(event) {
    event.preventDefault();
  }, false);
  
  
  Events.on(mouseConstraint, 'mousemove', function (e) {
  
    if (!canDrop || gameOver) {
      return;
    }
  
    if (e.button === 2) {
      holdFruit();
      return; 
    }
  
    if (previewFruit) {
        World.remove(world, previewFruit);
    }
    addPreviewFruit(e.mouse.position.x);
    originalPosition = e.mouse.position.x;
  });
  
  Events.on(engine, "collisionStart", (event) => {
    event.pairs.forEach((collision) => {
        if (collision.bodyA.preview || collision.bodyB.preview) {
          return;
        }
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
    });
  });
  
  Events.on(engine, 'beforeUpdate', function(event) {
    if(!disableGameOver){
      for (let body of world.bodies) {
        let yPOS = (body.position.y + body.circleRadius)
        if (!body.preview && (yPOS < loseHeight)) {
          console.log(("Over Line: "+ yPOS))
          disableGameOver = true;
          gameOver = true; 
          canDrop = false;  
          scoreText.classList.add("flash-infinite");  
          Runner.stop(engine);
          Render.stop(render);
          displayLeaderboard();
          leaderboard.classList.add('active');
          return;
        }
      }
    }
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
  
  
  
  
  addPreviewFruit(250);
  addNextFruitPreview();
  updateHoldFruitPreview(); 
  