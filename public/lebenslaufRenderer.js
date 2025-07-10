// lebenslaufRenderer.js
// Modul zur dynamischen Generierung der Lebenslauf-Timeline

import { loadLebenslauf, formatDate } from './dataLoader.js';

/**
 * Initialisiert die Lebenslauf-Timeline
 */
export async function initLebenslaufTimeline() {
  try {
    // Lebenslaufdaten laden
    const lebenslaufDaten = await loadLebenslauf();
    
    if (!lebenslaufDaten || lebenslaufDaten.length === 0) {
      console.error('Keine Lebenslaufdaten gefunden');
      return;
    }
    
    // Container für die Timeline finden
    const lebenslaufContainer = document.querySelector('#lebenslauf .container');
    if (!lebenslaufContainer) {
      console.error('Lebenslauf-Container nicht gefunden');
      return;
    }
    
    // Bestehenden Inhalt entfernen, aber Titel behalten
    const sectionTitle = lebenslaufContainer.querySelector('.section-title');
    lebenslaufContainer.innerHTML = '';
    lebenslaufContainer.appendChild(sectionTitle);
    
    // Daten nach Typ gruppieren
    const berufsDaten = lebenslaufDaten.filter(item => item.typ === 'Beruf');
    const bildungsDaten = lebenslaufDaten.filter(item => item.typ === 'Bildung');
    
    // Daten sortieren (neueste zuerst)
    const sortByDate = (a, b) => {
      // Extrahiere das Jahr für den Vergleich
      const getYear = date => {
        if (!date) return 0;
        if (date.includes('heute')) return 9999; // "heute" ist immer am neuesten
        return parseInt(date.split('-')[0]);
      };
      
      const yearA = getYear(a.datum);
      const yearB = getYear(b.datum);
      
      return yearB - yearA;
    };
    
    berufsDaten.sort(sortByDate);
    bildungsDaten.sort(sortByDate);
    
    // Timeline-Container erstellen
    const cvTimeline = document.createElement('div');
    cvTimeline.className = 'cv-timeline';
    
    // Berufserfahrung-Sektion erstellen
    const berufsSektion = createTimelineSection('Berufserfahrung', berufsDaten);
    cvTimeline.appendChild(berufsSektion);
    
    // Bildungsweg-Sektion erstellen
    const bildungsSektion = createTimelineSection('Bildungsweg', bildungsDaten);
    cvTimeline.appendChild(bildungsSektion);
    
    // Timeline zum Container hinzufügen
    lebenslaufContainer.appendChild(cvTimeline);
    
  } catch (error) {
    console.error('Fehler beim Initialisieren der Lebenslauf-Timeline:', error);
  }
}

/**
 * Erstellt eine Timeline-Sektion für einen bestimmten Typ (Beruf oder Bildung)
 * @param {string} title - Titel der Sektion
 * @param {Array} items - Array mit den Daten für die Sektion
 * @returns {HTMLElement} - Die erstellte Sektion
 */
function createTimelineSection(title, items) {
  const section = document.createElement('div');
  section.className = 'timeline-section';
  
  // Titel hinzufügen
  const heading = document.createElement('h3');
  heading.classList.add('untertitel');
  heading.textContent = title;
  section.appendChild(heading);
  
  // Vertikale Timeline erstellen
  const timeline = document.createElement('div');
  timeline.className = 'vertical-timeline';
  
  // Items zur Timeline hinzufügen
  items.forEach(item => {
    const timelineItem = createTimelineItem(item);
    timeline.appendChild(timelineItem);
  });
  
  section.appendChild(timeline);
  return section;
}

/**
 * Erstellt ein Timeline-Item für einen Lebenslaufeintrag
 * @param {Object} item - Der Lebenslaufeintrag
 * @returns {HTMLElement} - Das erstellte Timeline-Item
 */
function createTimelineItem(item) {
  const timelineItem = document.createElement('div');
  timelineItem.className = 'timeline-item';
  
  // Datum formatieren
  const formattedDate = formatDate(item.datum);
  
  // HTML für das Timeline-Item erstellen
  timelineItem.innerHTML = `
    <div class="timeline-date">${formattedDate}</div>
    <div class="timeline-content">
      <h3 class="timeline-title">${item.titel}</h3>
      <p>${item.beschreibung || ''}</p>
    </div>
  `;
  
  return timelineItem;
}
