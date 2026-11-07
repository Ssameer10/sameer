// --- 1. AMBIENT PARTICLE BACKGROUND CANVAS ---
const pCanvas = document.getElementById('particleCanvas');
const pCtx = pCanvas.getContext('2d');
let particles = [];

function resizeParticleCanvas() {
    pCanvas.width = window.innerWidth;
    pCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeParticleCanvas);
resizeParticleCanvas();

class Particle {
    constructor() {
        this.reset();
    }
    reset() {
        this.x = Math.random() * pCanvas.width;
        this.y = Math.random() * pCanvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.4;
        this.speedY = (Math.random() - 0.5) * 0.4;
        this.alpha = Math.random() * 0.5 + 0.2;
        const colors = ['#00f3ff', '#ff007f', '#ffd700', '#ffffff'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > pCanvas.width || this.y < 0 || this.y > pCanvas.height) {
            this.reset();
        }
    }
    draw() {
        pCtx.save();
        pCtx.globalAlpha = this.alpha;
        pCtx.fillStyle = this.color;
        pCtx.shadowBlur = 8;
        pCtx.shadowColor = this.color;
        pCtx.beginPath();
        pCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        pCtx.fill();
        pCtx.restore();
    }
}

for (let i = 0; i < 50; i++) {
    particles.push(new Particle());
}

function animateParticles() {
    pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    requestAnimationFrame(animateParticles);
}
animateParticles();


// --- 2. ORBITING TECH CHIPS LOGIC ---
const chips = document.querySelectorAll('.orbit-chip');
let orbitAngle = 0;

function animateOrbit() {
    orbitAngle += 0.015;
    const radius = 95;
    
    chips.forEach((chip, index) => {
        const angle = orbitAngle + (index * (Math.PI * 2 / chips.length));
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        chip.style.transform = `translate(${96 + x - 20}px, ${96 + y - 20}px)`;
    });

    requestAnimationFrame(animateOrbit);
}
animateOrbit();


// --- 3. TOAST NOTIFICATION UTILITY ---
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMsg');
    toastMsg.textContent = message;
    toast.classList.remove('translate-y-20', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
    setTimeout(() => {
        toast.classList.remove('translate-y-0', 'opacity-100');
        toast.classList.add('translate-y-20', 'opacity-0');
    }, 3000);
}


// --- 4. INTERACTIVE 3D TILT CARDS & MAGNETIC BUTTONS ---
document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 12;
        const rotateY = (centerX - x) / 12;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    });
});

document.querySelectorAll('.magnetic-btn').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
    });

    btn.addEventListener('mouseleave', () => {
        btn.style.transform = `translate(0px, 0px)`;
    });
});


// --- 5. CODE CATCHER MINI-GAME ENGINE ---
const gCanvas = document.getElementById('gameCanvas');
const gCtx = gCanvas.getContext('2d');
const startGameBtn = document.getElementById('startGameBtn');
const gameOverlay = document.getElementById('gameOverlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlayDesc = document.getElementById('overlayDesc');
const gameScoreEl = document.getElementById('gameScore');
const gameHighScoreEl = document.getElementById('gameHighScore');
const gameLivesEl = document.getElementById('gameLives');

let gameState = 'START';
let score = 0;
let highScore = localStorage.getItem('sameer_portfolio_highscore') || 0;
let lives = 3;
let gameLoopId = null;

gameHighScoreEl.textContent = highScore;

const paddle = {
    width: 80,
    height: 12,
    x: 0,
    y: 0,
    speed: 7,
    dx: 0
};

let fallingItems = [];

function resizeGameCanvas() {
    const rect = gCanvas.parentElement.getBoundingClientRect();
    gCanvas.width = rect.width;
    gCanvas.height = rect.height;
    paddle.y = gCanvas.height - 25;
    if (gameState !== 'PLAYING') {
        paddle.x = gCanvas.width / 2 - paddle.width / 2;
    }
}
window.addEventListener('resize', resizeGameCanvas);
resizeGameCanvas();

let keys = {};
window.addEventListener('keydown', (e) => { keys[e.key] = true; });
window.addEventListener('keyup', (e) => { keys[e.key] = false; });

gCanvas.addEventListener('mousemove', (e) => {
    const rect = gCanvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    paddle.x = mouseX - paddle.width / 2;
});

gCanvas.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
        const rect = gCanvas.getBoundingClientRect();
        const touchX = e.touches[0].clientX - rect.left;
        paddle.x = touchX - paddle.width / 2;
    }
});

function spawnItem() {
    const isBug = Math.random() < 0.3;
    fallingItems.push({
        x: Math.random() * (gCanvas.width - 30) + 15,
        y: -20,
        speed: Math.random() * 2 + 2 + (score * 0.1),
        type: isBug ? 'BUG' : 'CODE',
        text: isBug ? '🐛' : '</>'
    });
}

function updateGame() {
    if (gameState !== 'PLAYING') return;

    if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
        paddle.x -= paddle.speed;
    }
    if (keys['ArrowRight'] || keys['d'] || keys['D']) {
        paddle.x += paddle.speed;
    }

    if (paddle.x < 0) paddle.x = 0;
    if (paddle.x + paddle.width > gCanvas.width) paddle.x = gCanvas.width - paddle.width;

    if (Math.random() < 0.035) {
        spawnItem();
    }

    for (let i = fallingItems.length - 1; i >= 0; i--) {
        const item = fallingItems[i];
        item.y += item.speed;

        if (
            item.y + 10 >= paddle.y &&
            item.y - 10 <= paddle.y + paddle.height &&
            item.x >= paddle.x &&
            item.x <= paddle.x + paddle.width
        ) {
            if (item.type === 'CODE') {
                score += 10;
                gameScoreEl.textContent = score;
                if (score > highScore) {
                    highScore = score;
                    localStorage.setItem('sameer_portfolio_highscore', highScore);
                    gameHighScoreEl.textContent = highScore;
                }
            } else if (item.type === 'BUG') {
                lives--;
                updateLivesUI();
                if (lives <= 0) {
                    endGame();
                }
            }
            fallingItems.splice(i, 1);
            continue;
        }

        if (item.y > gCanvas.height + 20) {
            fallingItems.splice(i, 1);
        }
    }
}

function renderGame() {
    gCtx.clearRect(0, 0, gCanvas.width, gCanvas.height);

    gCtx.save();
    gCtx.fillStyle = '#00f3ff';
    gCtx.shadowBlur = 12;
    gCtx.shadowColor = '#00f3ff';
    gCtx.beginPath();
    gCtx.roundRect(paddle.x, paddle.y, paddle.width, paddle.height, 6);
    gCtx.fill();
    gCtx.restore();

    fallingItems.forEach(item => {
        gCtx.save();
        if (item.type === 'CODE') {
            gCtx.fillStyle = '#00f3ff';
            gCtx.font = 'bold 16px Space Grotesk';
            gCtx.shadowBlur = 10;
            gCtx.shadowColor = '#00f3ff';
            gCtx.fillText(item.text, item.x - 10, item.y);
        } else {
            gCtx.font = '18px sans-serif';
            gCtx.fillText(item.text, item.x - 10, item.y);
        }
        gCtx.restore();
    });
}

function gameLoop() {
    updateGame();
    renderGame();
    if (gameState === 'PLAYING') {
        gameLoopId = requestAnimationFrame(gameLoop);
    }
}

function updateLivesUI() {
    let heartsHTML = '';
    for (let i = 0; i < 3; i++) {
        if (i < lives) {
            heartsHTML += '<i class="fa-solid fa-heart"></i>';
        } else {
            heartsHTML += '<i class="fa-regular fa-heart opacity-30"></i>';
        }
    }
    gameLivesEl.innerHTML = heartsHTML;
}

function startGame() {
    score = 0;
    lives = 3;
    fallingItems = [];
    gameScoreEl.textContent = score;
    updateLivesUI();
    gameState = 'PLAYING';
    gameOverlay.classList.add('opacity-0', 'pointer-events-none');
    resizeGameCanvas();
    gameLoop();
}

function endGame() {
    gameState = 'GAMEOVER';
    cancelAnimationFrame(gameLoopId);
    overlayTitle.textContent = 'Game Over!';
    overlayDesc.innerHTML = `Final Score: <span class="text-neonCyan font-bold">${score}</span> | Best Score: <span class="text-neonGold font-bold">${highScore}</span>`;
    startGameBtn.innerHTML = 'Play Again <i class="fa-solid fa-rotate-right ml-2"></i>';
    gameOverlay.classList.remove('opacity-0', 'pointer-events-none');
}

startGameBtn.addEventListener('click', startGame);


// --- 6. NAV & BUTTON ACTION LISTENERS ---
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');
mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
});

document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
    });
});

document.getElementById('copyEmailBtn').addEventListener('click', () => {
    const email = 'sapkota.sameer11@gmail.com';
    const tempInput = document.createElement('input');
    tempInput.value = email;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    showToast('Email address copied to clipboard!');
});

document.getElementById('shareBtn').addEventListener('click', () => {
    if (navigator.share) {
        navigator.share({
            title: 'Sameer Sapkota | Portfolio',
            text: 'Check out Sameer Sapkota\'s interactive portfolio website!',
            url: window.location.href,
        }).catch(() => {});
    } else {
        const tempInput = document.createElement('input');
        tempInput.value = window.location.href;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        showToast('Portfolio link copied to clipboard!');
    }
});