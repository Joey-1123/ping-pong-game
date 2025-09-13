const canvas = document.getElementById('pong-canvas');
const ctx = canvas.getContext('2d');

// Game constants
const PADDLE_WIDTH = 14;
const PADDLE_HEIGHT = 90;
const PADDLE_MARGIN = 18;
const BALL_RADIUS = 10;
const BALL_SPEED = 6;
const AI_SPEED = 4;
const SCORE_TO_WIN = 7;

// State
let playerY = canvas.height / 2 - PADDLE_HEIGHT / 2;
let aiY = canvas.height / 2 - PADDLE_HEIGHT / 2;
let ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    vx: BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
    vy: BALL_SPEED * (Math.random() * 2 - 1)
};
let playerScore = 0;
let aiScore = 0;
let isGameOver = false;

// DOM
const playerScoreElem = document.getElementById('player-score');
const aiScoreElem = document.getElementById('ai-score');
const restartBtn = document.getElementById('restart-btn');

// Utility
function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}

function resetBall(direction = 1) {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.vx = BALL_SPEED * direction * (Math.random() > 0.5 ? 1 : -1);
    ball.vy = BALL_SPEED * (Math.random() * 2 - 1);
}

function drawPaddle(x, y) {
    ctx.beginPath();
    ctx.roundRect(x, y, PADDLE_WIDTH, PADDLE_HEIGHT, 8);
    ctx.fillStyle = "#43c6ac";
    ctx.shadowColor = "#191654";
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;
}

function drawBall(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.shadowColor = "#43c6ac";
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;
}

function drawMidLine() {
    ctx.save();
    ctx.strokeStyle = "#fff";
    ctx.globalAlpha = 0.25;
    ctx.setLineDash([16, 14]);
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.restore();
}

function drawWinner(text) {
    ctx.save();
    ctx.font = "bold 48px 'Segoe UI', Arial, sans-serif";
    ctx.fillStyle = "#43c6ac";
    ctx.textAlign = "center";
    ctx.shadowColor = "#191654";
    ctx.shadowBlur = 12;
    ctx.fillText(text, canvas.width / 2, canvas.height / 2 - 20);
    ctx.restore();
}

function update() {
    if (isGameOver) return;

    // Move ball
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Wall collision (top/bottom)
    if (ball.y - BALL_RADIUS < 0) {
        ball.y = BALL_RADIUS;
        ball.vy = -ball.vy;
    }
    if (ball.y + BALL_RADIUS > canvas.height) {
        ball.y = canvas.height - BALL_RADIUS;
        ball.vy = -ball.vy;
    }

    // Left paddle collision
    if (
        ball.x - BALL_RADIUS < PADDLE_MARGIN + PADDLE_WIDTH &&
        ball.y > playerY &&
        ball.y < playerY + PADDLE_HEIGHT
    ) {
        ball.x = PADDLE_MARGIN + PADDLE_WIDTH + BALL_RADIUS;
        ball.vx = Math.abs(ball.vx) + 0.2; // Speed up
        ball.vy += ((ball.y - (playerY + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2)) * 2;
    }

    // Right paddle collision
    if (
        ball.x + BALL_RADIUS > canvas.width - PADDLE_MARGIN - PADDLE_WIDTH &&
        ball.y > aiY &&
        ball.y < aiY + PADDLE_HEIGHT
    ) {
        ball.x = canvas.width - PADDLE_MARGIN - PADDLE_WIDTH - BALL_RADIUS;
        ball.vx = -Math.abs(ball.vx) - 0.2; // Speed up
        ball.vy += ((ball.y - (aiY + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2)) * 2;
    }

    // Score check
    if (ball.x < 0) {
        aiScore++;
        aiScoreElem.textContent = aiScore;
        if (aiScore >= SCORE_TO_WIN) {
            isGameOver = true;
        }
        resetBall(1);
    }
    if (ball.x > canvas.width) {
        playerScore++;
        playerScoreElem.textContent = playerScore;
        if (playerScore >= SCORE_TO_WIN) {
            isGameOver = true;
        }
        resetBall(-1);
    }

    // AI Paddle movement: track ball, but not too perfectly
    let target = ball.y - PADDLE_HEIGHT / 2;
    if (aiY + PADDLE_HEIGHT / 2 < ball.y - 10) {
        aiY += AI_SPEED;
    } else if (aiY + PADDLE_HEIGHT / 2 > ball.y + 10) {
        aiY -= AI_SPEED;
    }
    // Add a small random error to AI movement
    aiY += (Math.random() - 0.5) * 2;
    aiY = clamp(aiY, 0, canvas.height - PADDLE_HEIGHT);
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMidLine();
    drawPaddle(PADDLE_MARGIN, playerY);
    drawPaddle(canvas.width - PADDLE_MARGIN - PADDLE_WIDTH, aiY);
    drawBall(ball.x, ball.y);

    if (isGameOver) {
        drawWinner(playerScore > aiScore ? "You Win!" : "AI Wins!");
    }
}

function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

// Mouse controls for player paddle
canvas.addEventListener('mousemove', (e) => {
    // Get mouse position relative to canvas
    const rect = canvas.getBoundingClientRect();
    let mouseY = e.clientY - rect.top;
    playerY = clamp(mouseY - PADDLE_HEIGHT / 2, 0, canvas.height - PADDLE_HEIGHT);
});

// Touch controls for mobile
canvas.addEventListener('touchmove', (e) => {
    const rect = canvas.getBoundingClientRect();
    let touchY = e.touches[0].clientY - rect.top;
    playerY = clamp(touchY - PADDLE_HEIGHT / 2, 0, canvas.height - PADDLE_HEIGHT);
});

// Restart button
restartBtn.addEventListener('click', () => {
    playerScore = 0;
    aiScore = 0;
    playerScoreElem.textContent = playerScore;
    aiScoreElem.textContent = aiScore;
    playerY = canvas.height / 2 - PADDLE_HEIGHT / 2;
    aiY = canvas.height / 2 - PADDLE_HEIGHT / 2;
    isGameOver = false;
    resetBall(Math.random() > 0.5 ? 1 : -1);
});

// Polyfill for roundRect (for older browsers)
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
        if (typeof r === 'undefined') r = 5;
        this.beginPath();
        this.moveTo(x + r, y);
        this.lineTo(x + w - r, y);
        this.quadraticCurveTo(x + w, y, x + w, y + r);
        this.lineTo(x + w, y + h - r);
        this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        this.lineTo(x + r, y + h);
        this.quadraticCurveTo(x, y + h, x, y + h - r);
        this.lineTo(x, y + r);
        this.quadraticCurveTo(x, y, x + r, y);
        this.closePath();
    };
}

// Start game
gameLoop();