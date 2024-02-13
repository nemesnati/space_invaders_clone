// Board Settings
const tileSize = 32;
const rows = 16;
const columns = 16;
let board, context;
const boardWidth = tileSize * columns;
const boardHeight = tileSize * rows;

// Ship Settings
const shipWidth = tileSize * 2;
const shipHeight = tileSize;
const shipX = (tileSize * columns) / 2 - tileSize;
const shipY = tileSize * rows - tileSize * 2;
const ship = {
  x: shipX,
  y: shipY,
  width: shipWidth,
  height: shipHeight,
};
let shipImg,
  shipVelocityX = tileSize;

// Alien Settings
const alienArray = [];
const alienWidth = tileSize * 2;
const alienHeight = tileSize;
const alienX = tileSize;
const alienY = tileSize;
let alienRows = 2;
let alienColumns = 3;
let alienCount = 0;
let alienVelocityX = 1;
let alienImg;

// Bullet Settings
const bulletArray = [];
const bulletVelocityY = -10;

let score = 0;
let gameOver = false;

window.onload = function () {
  // Initialize Board
  board = document.getElementById("board");
  board.width = boardWidth;
  board.height = boardHeight;
  context = board.getContext("2d");

  // Load Ship Image
  shipImg = new Image();
  shipImg.src = "./ship.png";
  shipImg.onload = function () {
    context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);
  };

  // Load Alien Image
  const alienImages = [
    "alien.png",
    "alien-cyan.png",
    "alien-magenta.png",
    "alien-yellow.png",
  ];
  const randomIndex = Math.floor(Math.random() * alienImages.length);

  alienImg = new Image();
  alienImg.src = alienImages[randomIndex];
  createAliens();

  requestAnimationFrame(update);
  document.addEventListener("keydown", moveShip);
  document.addEventListener("keyup", shoot);
};

function update() {
  if (gameOver) {
    context.fillStyle = "white";
    context.font = "35px Sixtyfour";
    context.fillText("Game Over", boardWidth / 2 - 150, boardHeight / 2);

    return;
  }

  requestAnimationFrame(update);

  //   if (gameOver) {
  //     return;
  //   }

  context.clearRect(0, 0, board.width, board.height);

  // Draw Ship
  context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);

  // Move Aliens
  for (let i = 0; i < alienArray.length; i++) {
    const alien = alienArray[i];
    if (alien.alive) {
      alien.x += alienVelocityX;
      if (alien.x + alien.width >= board.width || alien.x <= 0) {
        alienVelocityX *= -1;
        alien.x += alienVelocityX * 2;
        for (let j = 0; j < alienArray.length; j++) {
          alienArray[j].y += alienHeight;
        }
      }
      context.drawImage(alienImg, alien.x, alien.y, alien.width, alien.height);
      if (alien.y >= ship.y) {
        gameOver = true;
      }
    }
  }

  // Move Bullets
  for (let i = 0; i < bulletArray.length; i++) {
    const bullet = bulletArray[i];
    bullet.y += bulletVelocityY;
    context.fillStyle = "white";
    context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    for (let j = 0; j < alienArray.length; j++) {
      const alien = alienArray[j];
      if (!bullet.used && alien.alive && detectHit(bullet, alien)) {
        bullet.used = true;
        alien.alive = false;
        alienCount--;
        score += 100;
      }
    }
  }

  // Clear Bullets
  while (
    bulletArray.length > 0 &&
    (bulletArray[0].used || bulletArray[0].y < 0)
  ) {
    bulletArray.shift();
  }

  // Next Level
  if (alienCount == 0) {
    score += alienColumns * alienRows * 100;
    alienColumns = Math.min(alienColumns + 1, columns / 2 - 2);
    alienRows = Math.min(alienRows + 1, rows - 4);
    alienVelocityX =
      Math.abs(alienVelocityX) + (alienVelocityX > 0 ? 0.2 : -0.2);
    alienArray.length = 0; // Empty the existing alien array
    bulletArray.length = 0;
    createAliens();
  }

  // Display Score
  context.fillStyle = "white";
  context.font = "16px 'Sixtyfour'";
  context.fillText(score, 5, 20);
}

function moveShip(e) {
  if (gameOver) {
    return;
  }
  if (e.code == "ArrowLeft" && ship.x - shipVelocityX >= 0) {
    ship.x -= shipVelocityX;
  } else if (
    e.code == "ArrowRight" &&
    ship.x + shipVelocityX + ship.width <= board.width
  ) {
    ship.x += shipVelocityX;
  }
}

function createAliens() {
  for (let c = 0; c < alienColumns; c++) {
    for (let r = 0; r < alienRows; r++) {
      const alien = {
        img: alienImg,
        x: alienX + c * alienWidth,
        y: alienY + r * alienHeight,
        width: alienWidth,
        height: alienHeight,
        alive: true,
      };
      alienArray.push(alien);
    }
  }
  alienCount = alienArray.length;
}

function shoot(e) {
  if (gameOver) {
    return;
  }
  if (e.code == "Space") {
    const bullet = {
      x: ship.x + (shipWidth * 15) / 32,
      y: ship.y,
      width: tileSize / 8,
      height: tileSize / 2,
      used: false,
    };
    bulletArray.push(bullet);
  }
}

function detectHit(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}
