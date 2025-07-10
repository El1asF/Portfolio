// dataLoader.js
// Zentrale Datei zum Laden und Verarbeiten der JSON-Daten

/**
 * Lädt JSON-Daten aus einer Datei
 * @param {string} path - Pfad zur JSON-Datei
 * @returns {Promise<Object>} - Promise mit den geladenen Daten
 */
async function loadJsonData(path) {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Fehler beim Laden der Daten von ${path}:`, error);
    return null;
  }
}

/**
 * Lädt die Filmprojekte-Daten
 * @returns {Promise<Array>} - Promise mit den Filmprojekten
 */
export async function loadFilmprojekte() {
  return await loadJsonData('/data/filmprojekte.json');
}

/**
 * Lädt die Lebenslauf-Daten
 * @returns {Promise<Array>} - Promise mit den Lebenslaufdaten
 */
export async function loadLebenslauf() {
  return await loadJsonData('/data/lebenslauf.json');
}

/**
 * Lädt die Skills-Daten
 * @returns {Promise<Array>} - Promise mit den Skills
 */
export async function loadSkills() {
  return await loadJsonData('/data/skills.json');
}

/**
 * Lädt die Social Media Daten
 * @returns {Promise<Array>} - Promise mit den Social Media Daten
 */
export async function loadSocials() {
  return await loadJsonData('/data/socials.json');
}

/**
 * Formatiert ein Datum in ein lesbares Format
 * @param {string} dateString - Datumsstring im Format YYYY-MM oder YYYY-MM-DD
 * @returns {string} - Formatiertes Datum
 */
export function formatDate(raw) {
  if (!raw) return '';

  // 1) Offenes Enddatum wie "heute"
  if (raw.includes('heute')) {
    const [from] = raw.split('-');
    return raw; // gib den kompletten String zurück
  }

  const parts = raw.split('-');

  // 2) YYYY-MM
  if (parts.length === 2 && parts[1].length === 2) {
    return raw;
  }

  // 3) YYYY-YYYY (Zeitraum in Jahren)
  if (parts.length === 2 && parts[1].length === 4) {
    return raw;
  }

  // 4) YYYY-MM-YYYY-MM
  if (parts.length === 4) {
    return raw;
  }

  // 5) Nur Jahr oder alles andere
  return raw;
}

/**
 * Gibt den Monatsnamen für eine Monatsnummer zurück
 * @param {string|number} monthNumber - Monatsnummer (1-12)
 * @returns {string} - Monatsname
 */
function getMonthName(monthNumber) {
  const months = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];
  
  const index = parseInt(monthNumber) - 1;
  return months[index] || '';
}

/**
 * Konvertiert ein Array von Aufgaben in einen HTML-String
 * @param {Array} aufgaben - Array mit Aufgaben
 * @returns {string} - HTML-String mit den Aufgaben
 */
export function formatAufgaben(aufgaben) {
  if (!aufgaben || !Array.isArray(aufgaben) || aufgaben.length === 0) {
    return '';
  }
  
  return aufgaben.join(', ') + '.';
}
