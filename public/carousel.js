// Karussell-Funktionalität für den Praktikum-Bereich
document.addEventListener('DOMContentLoaded', function() {
  // Alle Karussell-Container initialisieren
  initCarousels();
});

// Karussells initialisieren
function initCarousels() {
  // Alle Karussell-Tracks finden
  const carouselTracks = document.querySelectorAll('.carousel-track');
  
  // Für jedes Karussell die Navigation einrichten
  carouselTracks.forEach(track => {
    const id = track.id;
    const prevButton = document.querySelector(`.carousel-button.prev[data-carousel="${id}"]`);
    const nextButton = document.querySelector(`.carousel-button.next[data-carousel="${id}"]`);
    
    if (prevButton && nextButton) {
      // Event-Listener für die Navigationsbuttons
      prevButton.addEventListener('click', () => scrollCarousel(track, -1));
      nextButton.addEventListener('click', () => scrollCarousel(track, 1));
    }
  });
}

// Karussell scrollen
function scrollCarousel(track, direction) {
  // Breite eines Items plus Abstand berechnen
  const firstItem = track.querySelector('.carousel-item');
  if (!firstItem) return;
  
  const itemWidth = firstItem.offsetWidth;
  const gap = parseInt(window.getComputedStyle(track).columnGap || 16);
  const scrollAmount = (itemWidth + gap) * direction;
  
  // Scrollen
  track.scrollBy({
    left: scrollAmount,
    behavior: 'smooth'
  });
}
