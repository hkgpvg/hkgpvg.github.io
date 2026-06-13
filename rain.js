/**
 * Rain Drops Effect — raindrops falling into a pond with ripple animation
 * Elegant, subtle, and non-distracting
 */
(function() {
    'use strict';

    const canvas = document.createElement('canvas');
    canvas.id = 'rainCanvas';
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;opacity:0.6;';
    document.body.insertBefore(canvas, document.body.firstChild);

    const ctx = canvas.getContext('2d');
    let width, height;
    let drops = [];
    let ripples = [];
    let animationId;

    // Configuration
    const CONFIG = {
        maxDrops: 4,           // Max simultaneous falling drops
        maxRipples: 10,        // Max simultaneous ripples
        dropSpeed: 3,          // Drop fall speed (pixels per frame)
        dropLength: 20,        // Length of raindrop streak
        dropColor: 'rgba(120, 150, 190, 0.8)',
        rippleMaxRadius: 50,   // Max ripple radius
        rippleSpeed: 0.6,      // Ripple expansion speed
        rippleColor: [120, 150, 190], // RGB for ripple
        spawnInterval: 1500,   // ms between new drop spawns
    };

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    // === Raindrop class ===
    function Drop() {
        this.reset();
    }

    Drop.prototype.reset = function() {
        this.x = Math.random() * width;
        this.y = -Math.random() * 100 - 20;
        this.speed = CONFIG.dropSpeed + Math.random() * 1.5;
        this.length = CONFIG.dropLength + Math.random() * 10;
        this.opacity = 0.3 + Math.random() * 0.4;
        this.active = true;
        // Where the drop will "land" and create a ripple
        this.landY = height * (0.3 + Math.random() * 0.5);
    };

    Drop.prototype.update = function() {
        this.y += this.speed;

        if (this.y >= this.landY) {
            // Create ripple at landing position
            ripples.push(new Ripple(this.x, this.landY));
            this.active = false;
        }
    };

    Drop.prototype.draw = function() {
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x, this.y + this.length);
        ctx.strokeStyle = CONFIG.dropColor;
        ctx.lineWidth = 1.2;
        ctx.globalAlpha = this.opacity;
        ctx.stroke();
        ctx.globalAlpha = 1;
    };

    // === Ripple class ===
    function Ripple(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 2;
        this.maxRadius = CONFIG.rippleMaxRadius + Math.random() * 15;
        this.opacity = 0.5 + Math.random() * 0.2;
        this.active = true;
        this.lineWidth = 1.5;
    }

    Ripple.prototype.update = function() {
        this.radius += CONFIG.rippleSpeed + (this.radius * 0.015);
        this.opacity -= 0.008;
        this.lineWidth = Math.max(0.3, this.lineWidth - 0.015);

        if (this.radius >= this.maxRadius || this.opacity <= 0) {
            this.active = false;
        }
    };

    Ripple.prototype.draw = function() {
        // Draw elliptical ripple (wider than tall, like a pond view)
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, this.radius, this.radius * 0.4, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${CONFIG.rippleColor[0]}, ${CONFIG.rippleColor[1]}, ${CONFIG.rippleColor[2]}, ${this.opacity})`;
        ctx.lineWidth = this.lineWidth;
        ctx.stroke();

        // Draw a second smaller ripple for depth
        if (this.radius > 8) {
            ctx.beginPath();
            ctx.ellipse(this.x, this.y, this.radius * 0.5, this.radius * 0.2, 0, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(${CONFIG.rippleColor[0]}, ${CONFIG.rippleColor[1]}, ${CONFIG.rippleColor[2]}, ${this.opacity * 0.5})`;
            ctx.lineWidth = this.lineWidth * 0.7;
            ctx.stroke();
        }
    };

    // === Animation loop ===
    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Update and draw drops
        for (let i = drops.length - 1; i >= 0; i--) {
            if (drops[i].active) {
                drops[i].update();
                drops[i].draw();
            } else {
                drops.splice(i, 1);
            }
        }

        // Update and draw ripples
        for (let i = ripples.length - 1; i >= 0; i--) {
            if (ripples[i].active) {
                ripples[i].update();
                ripples[i].draw();
            } else {
                ripples.splice(i, 1);
            }
        }

        animationId = requestAnimationFrame(animate);
    }

    // Spawn new drops periodically
    function spawnDrop() {
        if (drops.length < CONFIG.maxDrops) {
            drops.push(new Drop());
        }
        // Random interval for natural feel
        setTimeout(spawnDrop, CONFIG.spawnInterval + Math.random() * 2000);
    }

    // === Initialize ===
    function init() {
        resize();
        window.addEventListener('resize', resize);

        // Start with a couple of drops
        drops.push(new Drop());
        setTimeout(() => drops.push(new Drop()), 800);

        animate();
        setTimeout(spawnDrop, CONFIG.spawnInterval);
    }

    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
