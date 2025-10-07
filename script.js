const canvas = document.getElementById('waterCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Make canvas focusable and auto-focus for clicker
canvas.tabIndex = 1;
canvas.focus();
canvas.addEventListener('click', () => canvas.focus());

// Base water color
const baseColor = { r: 10, g: 61, b: 98 };
let waterColor = { ...baseColor };

// Ripple list
let rippleList = [];

// Stone counters
let negativeCount = 0;
let positiveCount = 0;
let turbulence = 0; // for storminess

// Ripple class
class Ripple {
    constructor(x, y, color, maxRadius = 200, speed = 3, waveNoise = 0.5) {
        this.x = x;
        this.y = y;
        this.radius = 0;
        this.maxRadius = maxRadius;
        this.alpha = 1;
        this.color = color;
        this.speed = speed;
        this.waveNoise = waveNoise;
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
        color = '255,50,50';
        negativeCount++;

        // First negative stone in center
        if (negativeCount === 1) {
            x = canvas.width / 2;
            y = canvas.height / 2;
        } else {
            x = Math.random() * canvas.width;
            y = Math.random() * canvas.height;
        }

        speed = 5;
        turbulence += 0.2; // more chaos

    } else if (type === 'positive') {
        color = '50,255,255';
        positiveCount++;

        // First positive stone in center if no negatives
        if (positiveCount === 1 && negativeCount === 0) {
            x = canvas.width / 2;
            y = canvas.height / 2;
        } else {
            x = Math.random() * canvas.width;
            y = Math.random() * canvas.height;
        }

        speed = 2;
        turbulence = Math.max(0, turbulence - 0.3); // calm the water
    }

    rippleList.push(new Ripple(x, y, color, maxRadius, speed, 0.5 + Math.random() * 0.5));
}

// Reset water
function resetWater() {
    rippleList = [];
    negativeCount = 0;
    positiveCount = 0;
    turbulence = 0;
    waterColor = { ...baseColor };
}

// Draw water background with gradient + shimmer
function drawWaterBackground() {
    const t = Date.now() / 1000;
    const waveHeight = 5 + turbulence * 10;

    // Base gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, `rgb(${waterColor.r + 30},${waterColor.g + 30},${waterColor.b + 30})`);
    gradient.addColorStop(1, `rgb(${waterColor.r - 30},${waterColor.g - 30},${waterColor.b - 30})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add dynamic shimmer lines for realism
    ctx.strokeStyle = `rgba(255,255,255,${0.08 + turbulence * 0.04})`; // brighter
ctx.lineWidth = 2 + turbulence * 1.5; // thicker lines
for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    let y = canvas.height * (i / 8) + Math.sin(t * 2 + i) * waveHeight;
    ctx.moveTo(0, y);
    for (let x = 0; x <= canvas.width; x += 50) {
        let offset = Math.sin(x / 50 + t * 3 + i) * waveHeight;
        ctx.lineTo(x, y + offset);
    }
    ctx.stroke();
}


}

// Update water color based on mood
function updateWaterColor() {
    const moodFactor = positiveCount - negativeCount;

    // Smoothly adjust RGB values
    waterColor.r += (baseColor.r + moodFactor * 4 - waterColor.r) * 0.02;
    waterColor.g += (baseColor.g + moodFactor * 6 - waterColor.g) * 0.02;
    waterColor.b += (baseColor.b + moodFactor * 8 - waterColor.b) * 0.02;
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

// Keyboard and clicker controls
window.addEventListener('keydown', (e) => {
    const key = e.code || e.key;

    // Prevent default scrolling for PageUp/PageDown
    if (key === 'PageUp' || key === 'PageDown') {
        e.preventDefault();
    }

    // Positive ripple
    if (key === 'PageDown' || key === 'ArrowRight' || key === 'Enter' || key === 'KeyN') {
        addRipple(0, 0, 'positive');
    }
    // Negative ripple
    else if (key === 'PageUp' || key === 'ArrowLeft' || key === 'Backspace' || key === 'KeyP') {
        addRipple(0, 0, 'negative');
    }
    // Reset water
    else if (key === 'KeyR' || key === 'Space') {
        resetWater();
    }
});

// Button controls (optional UI)
document.getElementById('negativeBtn')?.addEventListener('click', () => addRipple(0, 0, 'negative'));
document.getElementById('positiveBtn')?.addEventListener('click', () => addRipple(0, 0, 'positive'));
document.getElementById('resetBtn')?.addEventListener('click', resetWater);

// Click interaction
canvas.addEventListener('click', (e) => addRipple(e.clientX, e.clientY, 'negative'));

// Resize canvas
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
