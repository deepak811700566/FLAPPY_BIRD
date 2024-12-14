// Canvas Setup
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
canvas.width = 320;
canvas.height = 480;

// Game Variables
const gravity = 0.2;
let birdVelocity = 0;
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
let gameState = 0; // 0: Ready, 1: Playing, 2: Game Over
let frame = 0; // For animations

// Load Images
const birdFrames = [
  'b0.png',
  'b1.png',
  'b2.png',
  'b0,png',``
].map(src => {
  const img = new Image();
  img.src = src;
  return img;
});

const getReadyImage = new Image();
getReadyImage.src = 'getready.png';

const tapImages = [
  't0.png',
  't1.png',
  't0.png',
].map(src => {
  const img = new Image();
  img.src = src;
  return img;
});

const gameOverImage = new Image();
gameOverImage.src = 'go.png';

const pipeTopImage = new Image();
pipeTopImage.src = 'toppipe.png';

const pipeBottomImage = new Image();
pipeBottomImage.src = 'botpipe.png';

const groundImage = new Image();
groundImage.src = 'ground.png';

// Load Sounds
const flySound = new Audio('flap.wav');
const startSound = new Audio('start.wav');
const gameOverSound = new Audio('die.wav');
const hitPipeSound = new Audio('hit.wav'); // New sound for hitting a pipe
const scoreSound = new Audio('score.wav'); // New sound for scoring

// Bird Object
const bird = {
  x: 50,
  y: canvas.height / 2,
  width: 34,
  height: 24,
  frame: 0, // Current frame of animation
  draw() {
    ctx.drawImage(
      birdFrames[this.frame],
      this.x,
      this.y,
      this.width,
      this.height
    );
  },
  update() {

  
    if (gameState === 1) {
      birdVelocity += gravity;
      this.y += birdVelocity;
      this.frame = (frame % 20 === 0) ? (this.frame + 1) % 3 : this.frame; // Animate bird every 20 frames

      // Check collision with ground
      if (this.y + this.height >= canvas.height - 40) {
        gameState = 2;
        gameOverSound.play();
      }
    } else if (gameState === 2) {
      // Bird falls after hitting pipe
      this.y += birdVelocity;
    }
  },
  fly() {
    birdVelocity = -4.5;
    flySound.play();
  },
};

// Pipes
const pipes = [];
function spawnPipe() {
  const pipeGap = 100;
  const pipeHeight = Math.random() * (canvas.height / 2 - 50) + 50;
  pipes.push({
    x: canvas.width,
    top: pipeHeight,
    bottom: pipeHeight + pipeGap,
  });
}

function updatePipes() {
  if (frame % 120 === 0) spawnPipe(); // Spawn pipe every 120 frames
  pipes.forEach((pipe, i) => {
    pipe.x -= 2; // Move pipes to the left

    // Check collision with pipes
    if (
      bird.x < pipe.x + 50 &&
      bird.x + bird.width > pipe.x &&
      (bird.y < pipe.top || bird.y + bird.height > pipe.bottom)
    ) {
      gameState = 2; // Game Over
      hitPipeSound.play(); // Play hit pipe sound
      gameOverSound.play();
       // Update high score if current score is greater
       if (score > highScore) {
        highScore = score;
        localStorage.setItem("highScore", highScore);
      }

    }
  

    // Add score immediately after bird crosses the pipe
    if (!pipe.scored && bird.x > pipe.x + 50) {
      score++;
      pipe.scored = true; // Ensure the score is only added once per pipe
      scoreSound.play(); // Play the score sound
    }

    // Remove pipes that move off-screen
    if (pipe.x + 50 < 0) {
      pipes.splice(i, 1);
    }
  });
}

function drawPipes() {
  pipes.forEach(pipe => {
    ctx.drawImage(pipeTopImage, pipe.x, pipe.top - pipeTopImage.height);
    ctx.drawImage(pipeBottomImage, pipe.x, pipe.bottom);
  });
}

// Game Loop
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (gameState === 0) {
    // Ready Screen
    ctx.drawImage(getReadyImage, canvas.width / 2 - 90, 120);
    const tapFrame = Math.floor(frame / 30) % 2;
    ctx.drawImage(tapImages[tapFrame], canvas.width / 2 - 59, 240); // Adjust Y-position to move the tap animation
  } else if (gameState === 1) {
    // Game Playing
    drawPipes();
    bird.draw();

    // Draw Scoreboard
    ctx.fillStyle = "#fff";
    ctx.font = "16px Arial";
    ctx.fillText(`Score: ${score}`, canvas.width - 80, 20); // Scoreboard on top-right corner
  } else if (gameState === 2) {
    // Game Over Screen
    ctx.drawImage(gameOverImage, canvas.width / 2 - 90, 170);
    ctx.fillStyle = "#000";
    ctx.font = "16px Arial";
    ctx.fillText(`Score: ${score}`, canvas.width / 2 - 38, 230);
    ctx.fillText(`High Score: ${highScore}`, canvas.width / 2 - 55, 260);
    const tapFrame = Math.floor(frame / 30) % 2;
    ctx.drawImage(tapImages[tapFrame], canvas.width / 2 - 60, 280); // Adjust Y-position to move the tap animation
  }
  ctx.drawImage(groundImage, 0, canvas.height - 40);


}

function update() {
  frame++;
  bird.update();
  if (gameState === 1) updatePipes();
}

function loop() {
  draw();
  update();
  requestAnimationFrame(loop);
}

// Event Listeners
canvas.addEventListener("click", () => {
if (gameState === 0) {
    gameState = 1;
    startSound.play();
  } else if (gameState === 1) {
    bird.fly();
  } else if (gameState === 2) {
    // Reset Game
    gameState = 0;
    pipes.length = 0;
    score = 0;
    bird.y = canvas.height / 2;
    birdVelocity = 0;
  }
    
});
  

// Start Game Loop
loop();
