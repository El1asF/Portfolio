// filmprojekteRenderer.js
// Modul zur dynamischen Generierung der Filmprojekte-Timeline

import { loadFilmprojekte, formatDate, formatAufgaben } from './dataLoader.js';

/**
 * Initialisiert die Filmprojekte-Timeline
 */

export async function initFilmprojekteTimeline() {

  try {
    // Filmprojekte laden
    const filmprojekte = await loadFilmprojekte();
    
    if (!filmprojekte || filmprojekte.length === 0) {
      console.error('Keine Filmprojekte gefunden');
      return;
    }
    
    // Container für die Timeline finden
    const timelineContainer = document.querySelector('#film-projects .vertical-timeline');
    if (!timelineContainer) {
      console.error('Timeline-Container nicht gefunden');
      return;
    }
    // Container leeren
    timelineContainer.innerHTML = '';
    
    // Filmprojekte sortieren (neueste zuerst)
    filmprojekte.sort((a, b) => {
      // Extrahiere das Jahr und den Monat für den Vergleich
      const dateA = a.datum.split('-');
      const dateB = b.datum.split('-');
      
      // Vergleiche zuerst das Jahr
      if (dateA[0] !== dateB[0]) {
        return dateB[0] - dateA[0];
      }
      
      // Bei gleichem Jahr vergleiche den Monat (falls vorhanden)
      if (dateA.length > 1 && dateB.length > 1) {
        return dateB[1] - dateA[1];
      }
      
      return 0;
    });
    
    // Filmprojekte rendern
    filmprojekte.forEach(projekt => {
      const timelineItem = createTimelineItem(projekt);
      timelineContainer.appendChild(timelineItem);
    });
    
  } catch (error) {
    console.error('Fehler beim Initialisieren der Filmprojekte-Timeline:', error);
  }
}

/**
 * Erstellt ein Timeline-Item für ein Filmprojekt
 * @param {Object} projekt - Das Filmprojekt-Objekt
 * @returns {HTMLElement} - Das erstellte Timeline-Item
 */
function createTimelineItem(projekt) {
  const timelineItem = document.createElement('div');
  timelineItem.className = 'timeline-item';
  
  // Datum formatieren
  const formattedDate = formatDate(projekt.datum);
  
  // Aufgaben formatieren
  const formattedAufgaben = formatAufgaben(projekt.aufgaben);
  
  // HTML für das Timeline-Item erstellen
  let timelineHTML = `
    <div class="timeline-date">${formattedDate}</div>
    <div class="timeline-content">
      <h4 class="timeline-title">"${projekt.titel}"${projekt.titel.includes('—') ? '' : ' —'} ${projekt.titel.includes('—') ? '' : 'Projekt'}</h4>
      <p>${projekt.beschreibung || ''}</p>
      ${formattedAufgaben ? `<p class="timeline-role">${formattedAufgaben}</p>` : ''}
    </div>
  `;
  
  // Video-Embed hinzufügen, falls vorhanden
  if (projekt.videolink && projekt.videolink.trim() !== '') {
    timelineHTML += `
      <div class="timeline-video">
        <iframe
          src="${projekt.videolink}"
          title="${projekt.titel}"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen>
        </iframe>
      </div>
    `;
  }
  
  timelineItem.innerHTML = timelineHTML;
  return timelineItem;
}
