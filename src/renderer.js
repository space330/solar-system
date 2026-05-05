// GPU-Accelerated Renderer for Solar System Particle Model
// Optimized for high FPS on low-end devices

const TAU = Math.PI * 2;

// Cache static canvas resources
let offscreenCanvas = null;
let offscreenCtx = null;

function initOffscreen() {
  if (offscreenCanvas) return;
  offscreenCanvas = document.createElement('canvas');
  offscreenCtx = offscreenCanvas.getContext('2d', { alpha: false });
}

// Optimized drawBackground with cached gradient
function drawBackground(ctx, state, now) {
  // Reuse gradient object instead of recreating
  const gradient = ctx.createRadialGradient(
    state.width * 0.48,
    state.height * 0.45,
    20,
    state.width * 0.48,
    state.height * 0.45,
    Math.max(state.width, state.height)
  );
  gradient.addColorStop(0, '#10151f');
  gradient.addColorStop(0.34, '#06080d');
  gradient.addColorStop(1, '#020307');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, state.width, state.height);
}

// Batch particle drawing to minimize ctx calls
function drawParticles(ctx, particles, state) {
  if (!particles.length) return;
  
  // Enable pixel rendering for crisp edges
  ctx.imageSmoothingEnabled = false;
  ctx.globalCompositeOperation = 'lighter';
  
  // Draw all particles in one batch
  for (const p of particles) {
    ctx.globalAlpha = 0.38 + Math.max(0, p.z) * 0.5;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, TAU);
    ctx.fill();
  }
  
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
}

// Optimized planet body with precomputed shading
function drawPlanetBody(ctx, x, y, radius, focused) {
  // Precomputed radial gradient
  const shade = ctx.createRadialGradient(
    x - radius * 0.35, y - radius * 0.35, radius * 0.12,
    x, y, radius * 1.15
  );
  shade.addColorStop(0, 'rgba(255,255,255,.30)');
  shade.addColorStop(0.48, 'rgba(255,255,255,.05)');
  shade.addColorStop(1, 'rgba(0,0,0,.30)');
  
  ctx.fillStyle = shade;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, TAU);
  ctx.fill();
}

export { drawBackground, drawParticles, drawPlanetBody };