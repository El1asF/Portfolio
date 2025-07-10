// skillsRenderer.js
// Modul zur dynamischen Generierung der Skills-Übersicht

import { loadSkills } from './dataLoader.js';

/**
 * Initialisiert die Skills-Übersicht
 */
export async function initSkillsOverview() {
  try {
    // Skills laden
    const skills = await loadSkills();
    
    if (!skills || skills.length === 0) {
      console.error('Keine Skills gefunden');
      return;
    }
    
    // Container für die Skills finden
    const skillsContainer = document.querySelector(
  '#skills .skills-grid'
);
    if (!skillsContainer) {
      console.error('Skills-Container nicht gefunden');
      return;
    }
    
    // Container leeren
    skillsContainer.innerHTML = '';
    
    // Skills sortieren (höchstes Level zuerst)
    skills.sort((a, b) => b.level - a.level);
    
    // Skills rendern
    skills.forEach(skill => {
      const skillCard = createSkillCard(skill);
      skillsContainer.appendChild(skillCard);
    });
    
    // Hover-Effekte initialisieren
    initSkillHoverEffects();
    
  } catch (error) {
    console.error('Fehler beim Initialisieren der Skills-Übersicht:', error);
  }
}

/**
 * Erstellt eine Skill-Karte
 * @param {Object} skill - Das Skill-Objekt
 * @returns {HTMLElement} - Die erstellte Skill-Karte
 */
function createSkillCard(skill) {
  const skillCard = document.createElement('div');
  skillCard.className = 'skill-card';
  skillCard.setAttribute('data-skill-level', skill.level);
  
  // HTML für die Skill-Karte erstellen
  skillCard.innerHTML = `
    <h4>${skill.name}</h4>
  `;
  
  return skillCard;
}

/**
 * Initialisiert die Hover-Effekte für die Skill-Karten
 */
function initSkillHoverEffects() {
  const skillCards = document.querySelectorAll('.skill-card');

  skillCards.forEach(card => {
    const skillLevel = parseInt(card.dataset.skillLevel) || 5;
    const percentage = (skillLevel / 10) * 100;
    const transitionDuration = (percentage / 100).toFixed(2); // z. B. 0.3 bis 1.0 Sekunden

    // Setze CSS-Variablen direkt auf der Karte
    card.style.setProperty('--skill-fill', `${percentage}%`);
    card.style.setProperty('--transition-speed', `${transitionDuration}s`);

    card.addEventListener('mouseenter', () => {
      card.classList.add('show-skill-level');
    });

    card.addEventListener('mouseleave', () => {
      card.classList.remove('show-skill-level');
    });
  });
}

