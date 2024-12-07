// Create that canvas that the game will be played on
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Load in the images of our different fish
const images = {
    playerFish: new Image(),
    smallFish: new Image(),
    largeFish: new Image(),
    background: new Image(),
    youWin: new Image()
};

images.playerFish.src = "images/player-fish.png";
images.smallFish.src = "images/fish-small.png";
images.largeFish.src = "images/fish-large.png";
images.background.src = "images/background.png";
images.youWin.src = "images/There's Always a Bigger Fish.png";

// looping the game
function gameLoop() {
    if (!playerFish.alive) {
        gameOver();
        return;
    }
    if (smallerFish.length === 0 && largerFish.length === 0) {
        youWin();
        return;
    }
    updateGame();
    drawGame();
    requestAnimationFrame(gameLoop);
}

// a screen for when the player wins
function youWin() {
    //clear any hanging fish
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // opacity of picture for winner
    ctx.globalAlpha = 0.9; // %opacity at 90
    ctx.drawImage(images.youWin, 0, 0, canvas.width, canvas.height);

    ctx.globalAlpha = 1.0;

    // yyou win text
    ctx.font = "bold 80px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText("You Win!", canvas.width / 2, canvas.height / 2);
}

// Initial Game state set to score of 0
let playerFish = { x: 400, y: 300, size: 30, alive: true };
let smallerFish = [];
let largerFish = [];
let score = 0;

// Mouse controls for player fish
canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    playerFish.x = e.clientX - rect.left;
    playerFish.y = e.clientY - rect.top;
});

// Generate opponent fish
function spawnFish(type) {
    const size = type === "small" ? 40 : 80;
    const speed = type === "small" ? 1 + Math.random() : 0.5 + Math.random();

    return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: size,
        speedX: speed * (Math.random() < 0.5 ? 1 : -1), // Random X direction
        speedY: speed * (Math.random() < 0.5 ? 1 : -1), // Random Y direction
        type: type
    };
}

// Set amount of spawned fish
function initializeGame() {
    smallerFish = Array.from({ length: 25 }, () => spawnFish("small"));
    largerFish = Array.from({ length: 3 }, () => spawnFish("large"));
    score = 0;
    playerFish.size = 30;
    playerFish.alive = true;
    gameLoop();
}

// Detect if the smaller fish touches a bigger fish and kill it if it was smaller
function checkCollision(fish) {
    const dist = Math.hypot(playerFish.x - fish.x, playerFish.y - fish.y);
    return dist < playerFish.size / 2 + fish.size / 2;
}

// Update after reset or death
function updateGame() {
    // If smaller fish is touched, eat it and add size
    smallerFish = smallerFish.filter((fish) => {
        if (checkCollision(fish)) {
            score += 10;
            playerFish.size += 8; // actual growing part
            largerFish.push(spawnFish("large"));
            return false; // kill smaller fish
        }
        return true;
    });

    // what if larger fish is hit?
    largerFish = largerFish.filter((fish) => {
        if (checkCollision(fish)) {
            if (playerFish.size > fish.size) {
                // Player fish eats larger fish if bigger
                score += 40;
                playerFish.size += 10; // Grow more for eating large fish
                return false; // Remove large fish
            } else {
                // Player fish is smaller and dies
                playerFish.alive = false;
            }
        }
        return true;
    });

    // Moving the fish
[smallerFish, largerFish].forEach((fishArray) => {
    fishArray.forEach((fish) => {
        // for a more complex game have them move in all directions not just frnt to back
        fish.x += fish.speedX;
        fish.y += fish.speedY;

        // fish direction change
        if (fish.x < 0 || fish.x > canvas.width) fish.speedX *= -1;

        // another direction change
        if (fish.y < 0 || fish.y > canvas.height) fish.speedY *= -1;
    });
});
}

// draw inital state
function drawGame() {
    // Background image
    ctx.drawImage(images.background, 0, 0, canvas.width, canvas.height);

    // Draw player's fish
    drawFish(images.playerFish, playerFish.x, playerFish.y, playerFish.size, playerFish.speedX);

    // Draw smaller fish
    smallerFish.forEach((fish) => {
        drawFish(images.smallFish, fish.x, fish.y, fish.size, fish.speedX);
    });

    // Draw larger fish
    largerFish.forEach((fish) => {
        drawFish(images.largeFish, fish.x, fish.y, fish.size, fish.speedX);
    });

    // Draw Score
    ctx.font = "30px Arial";
    ctx.fillStyle = "blue";
    ctx.textAlign = "left";
    ctx.fillText(`Score: ${score}`, 20, 50);
}

// for fish directional swimming instead of bs one way
function drawFish(image, x, y, size, speedX) {
    ctx.save(); //save canvas state to let us flip

    if (speedX < 0) {
        // horizontal flip if swimming left
        ctx.scale(-1, 1);
        ctx.drawImage(image, -x - size / 2, y - size / 2, size, size);
    } else {
        // normal for right swimming
        ctx.drawImage(image, x - size / 2, y - size / 2, size, size);
    }

    ctx.restore(); // restore the canvas as it was
}

// Game Over
function gameOver() {
    ctx.font = "60px Arial";
    ctx.fillStyle = "red";
    ctx.fillText("Game Over! Press 'R' to restart.", 150, canvas.height / 2);
}

// restart canvas with R
document.addEventListener("keydown", (e) => {
    if (e.key === "r") initializeGame();
});

//initialize game and begin
initializeGame();
