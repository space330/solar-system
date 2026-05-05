// Compatibility Fallbacks for Legacy Browsers

// Detect and patch missing features
if (!window.requestAnimationFrame) {
  window.requestAnimationFrame = (function() {
    return window.webkitRequestAnimationFrame ||
           window.mozRequestAnimationFrame ||
           window.oRequestAnimationFrame ||
           window.msRequestAnimationFrame ||
           function(callback) {
             return setTimeout(callback, 1000 / 60);
           };
  })();
}

// Patch Canvas getImageData for iOS Safari CORS
if (typeof HTMLCanvasElement !== 'undefined' && !HTMLCanvasElement.prototype.toBlob) {
  HTMLCanvasElement.prototype.toBlob = function(callback, type, quality) {
    if (this.toDataURL) {
      const dataUrl = this.toDataURL(type, quality);
      const blob = dataUrlToBlob(dataUrl);
      callback(blob);
    }
  };
}

function dataUrlToBlob(dataUrl) {
  const parts = dataUrl.split(';base64,');
  const contentType = parts[0].split(':')[1].split(';')[0];
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);
  
  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }
  
  return new Blob([uInt8Array], { type: contentType });
}

// CSS :has() fallback for older browsers
if (!CSS.supports('selector(:has(*))')) {
  document.querySelectorAll('.scene-ai-annotation').forEach(el => {
    el.style.display = 'none';
  });
}

// Add crossOrigin to video elements for iOS Safari
if (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad')) {
  document.querySelectorAll('video').forEach(video => {
    if (video.src && !video.crossOrigin) {
      video.crossOrigin = 'anonymous';
    }
  });
}

export {};