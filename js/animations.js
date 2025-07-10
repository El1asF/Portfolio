// Initialize skill cards hover effect
document.addEventListener('DOMContentLoaded', function() {
  // Mobile menu toggle
  const burgerMenu = document.querySelector('.burger-menu');
  const navLinks = document.querySelector('.nav-links');
  
  if (burgerMenu) {
    burgerMenu.addEventListener('click', function() {
      navLinks.classList.toggle('active');
    });
  }
  
  // Smooth scroll for navigation links
  const navItems = document.querySelectorAll('.nav-link');
  navItems.forEach(item => {
    item.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      const targetSection = document.querySelector(targetId);
      
      if (targetSection) {
        e.preventDefault();
        window.scrollTo({
          top: targetSection.offsetTop - 80,
          behavior: 'smooth'
        });
        
        // Update active link
        navItems.forEach(link => link.classList.remove('active'));
        this.classList.add('active');
        
        // Close mobile menu if open
        if (navLinks.classList.contains('active')) {
          navLinks.classList.remove('active');
        }
      }
    });
  });
  
  // Scroll animations
  const fadeElements      = document.querySelectorAll('.fade-in');
  const slideLeftElements = document.querySelectorAll('.slide-in-left');
  const slideRightElements= document.querySelectorAll('.slide-in-right');
  // Funktion, die alle Timeline-Items beobachtet
  function observeTimelineItems() {
    document.querySelectorAll('.timeline-item').forEach(el => observer.observe(el));
  }
  
  // Intersection Observer for animations
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });
  
  // Observe elements
  fadeElements.forEach(el => observer.observe(el));
  slideLeftElements.forEach(el => observer.observe(el));
  slideRightElements.forEach(el => observer.observe(el));
  observeTimelineItems();
  
  // Initialize skill cards
  const skillCards = document.querySelectorAll('.skill-card');
  skillCards.forEach(card => {
    const skillLevel = card.getAttribute('data-skill-level');
    if (skillLevel) {
      card.style.setProperty('--skill-level', skillLevel);
    }
  });
  
  // Praktikum section tabs
  const tabInputs = document.querySelectorAll('.tabs input[type="radio"]');
  tabInputs.forEach(input => {
    input.addEventListener('change', function() {
      const tabId = this.id;
      const tabContent = document.querySelector(`label[for="${tabId}"] + .tab-content`);
      
      // Hide all tab contents
      document.querySelectorAll('.tab-content').forEach(content => {
        content.style.display = 'none';
      });
      
      // Show selected tab content
      if (tabContent) {
        tabContent.style.display = 'block';
      }
    });
  });
});

// Ganz unten in animations.js
export function observeTimelineItems() {
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.timeline-item').forEach(el => {
    observer.observe(el);
  });
}

