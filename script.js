const canvas = document.getElementById('waterCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Base water color
const baseColor = { r: 10, g: 61, b: 98 };
let waterColor = { ...baseColor };

// Ripple list
let rippleList = [];

// Stone counters
let negativeCount = 0;
let positiveCount = 0;

// Ripple class
class Ripple {
    constructor(x, y, color, maxRadius = 200, speed = 3) {
        this.x = x;
        this.y = y;
        this.radius = 0;
        this.maxRadius = maxRadius;
        this.alpha = 1;
        this.color = color;
        this.speed = speed;
        this.waveNoise = Math.random() * 0.5; // uneven edges for realism
    }

    update() {
        this.radius += this.speed;
        this.alpha -= 0.008;
    }

    draw() {
        ctx.beginPath();
        const segments = 100;
        for (let i = 0; i <= segments; i++) {
            let angle = (i / segments) * Math.PI * 2;
            let r = this.radius + Math.sin(i / 10) * 5 * this.waveNoise;
            let px = this.x + Math.cos(angle) * r;
            let py = this.y + Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle = `rgba(${this.color},${this.alpha})`;
        ctx.lineWidth = 2 + this.waveNoise * 2;
        ctx.stroke();
    }
}

// Add ripple function
function addRipple(x, y, type) {
    let color;
    let maxRadius = 200;
    let speed = 3;

    if (type === 'negative') {
        color = '255,0,0';
        negativeCount++;

        // First negative stone in center
        if (negativeCount === 1) {
            x = canvas.width / 2;
            y = canvas.height / 2;
        } else {
            x = Math.random() * canvas.width;
            y = Math.random() * canvas.height;
        }
        speed = 5; // faster for negative

    } else if (type === 'positive') {
        color = '0,255,255';
        x = Math.random() * canvas.width;
        y = Math.random() * canvas.height;
        speed = 2; // slower for positive
        positiveCount++;
    }

    rippleList.push(new Ripple(x, y, color, maxRadius, speed));
}

// Reset water
function resetWater() {
    rippleList = [];
    negativeCount = 0;
    positiveCount = 0;
    waterColor = { ...baseColor };
}

// Draw water background with gradient + subtle highlights
function drawWaterBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, `rgb(${waterColor.r + 20},${waterColor.g + 20},${waterColor.b + 20})`);
    gradient.addColorStop(1, `rgb(${waterColor.r - 20},${waterColor.g - 20},${waterColor.b - 20})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle moving highlight lines for shimmer
    const t = Date.now() / 1000;
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(0, canvas.height * (i / 5) + Math.sin(t + i) * 10);
        ctx.lineTo(canvas.width, canvas.height * (i / 5) + Math.sin(t + i) * 10);
        ctx.stroke();
    }
}

// Update water color based on stone counts
function updateWaterColor() {
    // Darken for negative stones
    if (negativeCount > 0) {
        waterColor.r = Math.max(0, baseColor.r - negativeCount * 5);
        waterColor.g = Math.max(0, baseColor.g - negativeCount * 5);
        waterColor.b = Math.max(0, baseColor.b - negativeCount * 5);
    }

    // Lighten for positive stones
    if (positiveCount > 0) {
        waterColor.r = Math.min(200, baseColor.r + positiveCount * 3);
        waterColor.g = Math.min(255, baseColor.g + positiveCount * 3);
        waterColor.b = Math.min(255, baseColor.b + positiveCount * 3);
    }
}

// Animation loop
function animate() {
    updateWaterColor();
    drawWaterBackground();

    rippleList.forEach((r, i) => {
        r.update();
        r.draw();
        if (r.alpha <= 0) rippleList.splice(i, 1);
    });

    requestAnimationFrame(animate);
}

animate();

window.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowRight') { // or any key your clicker sends
        addRipple(Math.random() * canvas.width, Math.random() * canvas.height, 'positive');
    } else if (e.code === 'ArrowLeft') {
        addRipple(Math.random() * canvas.width, Math.random() * canvas.height, 'negative');
    } else if (e.code === 'Space') {
        resetWater();
    }
});


// Button events
document.getElementById('negativeBtn').addEventListener('click', () => addRipple(0, 0, 'negative'));
document.getElementById('positiveBtn').addEventListener('click', () => addRipple(0, 0, 'positive'));
document.getElementById('resetBtn').addEventListener('click', resetWater);

// Click canvas: default mode negative
canvas.addEventListener('click', (e) => addRipple(e.clientX, e.clientY, 'negative'));

// Resize canvas
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
