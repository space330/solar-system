// Particle Generation Worker
// Offloads heavy computation from main thread

self.onmessage = function(e) {
  const { planet, count } = e.data;
  
  // Generate particles in batches to avoid blocking
  const particles = [];
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / Math.max(1, count - 1)) * 2;
    const ring = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = i * Math.PI * (3 - Math.sqrt(5));
    
    particles.push({
      x: Math.cos(theta) * ring,
      y,
      z: Math.sin(theta) * ring,
      color: planet.colors[i % planet.colors.length],
      size: Math.random() * 0.7 + 0.65
    });
  }
  
  self.postMessage({
    type: 'particles-generated',
    planetId: planet.id,
    particles
  });
};