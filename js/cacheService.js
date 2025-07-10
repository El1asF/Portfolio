/**
 * cacheService.js
 * Zentraler Cache-Service für YouTube API-Aufrufe
 * 
 * Dieser Service stellt sicher, dass:
 * - API-Aufrufe nur einmal alle 24 Stunden erfolgen
 * - Daten lokal in Dateien gespeichert werden
 * - Bei lokalem Laden keine unnötigen API-Aufrufe erfolgen
 * - Abgelaufene Daten automatisch aktualisiert werden
 */

// Cache-Dauer in Millisekunden (24 Stunden)
const CACHE_DURATION = 24 * 60 * 60 * 1000;

// Prüfen, ob wir in einer Node.js-Umgebung sind
const isNode = typeof window === 'undefined';

/**
 * Zentraler Cache-Service
 */
class CacheService {
  constructor() {
    this.cacheDir = isNode ? './data' : null;
    this.memoryCache = {};
  }

  /**
   * Daten aus dem Cache abrufen oder über die Fetch-Funktion laden
   * @param {string} key - Eindeutiger Schlüssel für die Daten
   * @param {Function} fetcher - Async-Funktion zum Abrufen der Daten
   * @returns {Promise<any>} - Die gecachten oder frisch abgerufenen Daten
   */
  async getOrFetch(key, fetcher) {
    // Zuerst versuchen, Daten aus dem Cache zu laden
    const cachedData = await this.getCachedData(key);
    
    // Wenn gültige Daten im Cache sind, diese zurückgeben
    if (cachedData && !this.isExpired(cachedData.timestamp)) {
      console.log(`[Cache] Verwende Cache-Daten für: ${key}`);
      return cachedData.data;
    }
    
    // Ansonsten neue Daten abrufen
    console.log(`[Cache] Hole frische Daten für: ${key}`);
    try {
      const freshData = await fetcher();
      
      // Neue Daten im Cache speichern
      await this.setCachedData(key, freshData);
      
      return freshData;
    } catch (error) {
      console.error(`[Cache] Fehler beim Abrufen der Daten für ${key}:`, error);
      
      // Im Fehlerfall versuchen, abgelaufene Daten zurückzugeben
      if (cachedData) {
        console.warn(`[Cache] Verwende abgelaufene Cache-Daten für: ${key}`);
        return cachedData.data;
      }
      
      // Wenn keine Cache-Daten vorhanden sind, Fehler werfen
      throw error;
    }
  }

  /**
   * Prüft, ob ein Zeitstempel abgelaufen ist
   * @param {number} timestamp - Der zu prüfende Zeitstempel
   * @returns {boolean} - true, wenn abgelaufen, sonst false
   */
  isExpired(timestamp) {
    return Date.now() - timestamp > CACHE_DURATION;
  }

  /**
   * Daten aus dem Cache laden
   * @param {string} key - Eindeutiger Schlüssel für die Daten
   * @returns {Promise<{data: any, timestamp: number} | null>} - Die gecachten Daten oder null
   */
  async getCachedData(key) {
    // In Node.js-Umgebung: Aus Datei laden
    if (isNode) {
      return this.getFromFile(key);
    }
    
    // Im Browser: Aus localStorage laden
    return this.getFromLocalStorage(key);
  }

  /**
   * Daten im Cache speichern
   * @param {string} key - Eindeutiger Schlüssel für die Daten
   * @param {any} data - Die zu speichernden Daten
   * @returns {Promise<void>}
   */
  async setCachedData(key, data) {
    const cacheItem = {
      data,
      timestamp: Date.now(),
      source: 'cache'
    };
    
    // In Node.js-Umgebung: In Datei speichern
    if (isNode) {
      await this.saveToFile(key, cacheItem);
    }
    
    // Im Browser: In localStorage speichern
    this.saveToLocalStorage(key, cacheItem);
    
    // Auch im Memory-Cache speichern
    this.memoryCache[key] = cacheItem;
  }

  /**
   * Daten aus einer Datei laden (Node.js)
   * @param {string} key - Eindeutiger Schlüssel für die Daten
   * @returns {Promise<{data: any, timestamp: number} | null>} - Die gecachten Daten oder null
   */
  async getFromFile(key) {
    if (!isNode) return null;
    
    try {
      // Node.js-Module dynamisch importieren
      const fs = await import('fs/promises');
      const path = await import('path');
      
      const filePath = path.default.join(this.cacheDir, `${key}.json`);
      
      // Prüfen, ob die Datei existiert
      try {
        await fs.default.access(filePath);
      } catch (e) {
        return null; // Datei existiert nicht
      }
      
      // Datei lesen und parsen
      const fileContent = await fs.default.readFile(filePath, 'utf-8');
      return JSON.parse(fileContent);
    } catch (error) {
      console.error(`[Cache] Fehler beim Lesen der Cache-Datei für ${key}:`, error);
      return null;
    }
  }

  /**
   * Daten in eine Datei speichern (Node.js)
   * @param {string} key - Eindeutiger Schlüssel für die Daten
   * @param {Object} cacheItem - Das zu speichernde Cache-Item
   * @returns {Promise<void>}
   */
  async saveToFile(key, cacheItem) {
    if (!isNode) return;
    
    try {
      // Node.js-Module dynamisch importieren
      const fs = await import('fs/promises');
      const path = await import('path');
      
      const filePath = path.default.join(this.cacheDir, `${key}.json`);
      
      // Sicherstellen, dass das Verzeichnis existiert
      try {
        await fs.default.mkdir(this.cacheDir, { recursive: true });
      } catch (e) {
        // Verzeichnis existiert bereits
      }
      
      // Daten in Datei schreiben
      await fs.default.writeFile(
        filePath,
        JSON.stringify(cacheItem, null, 2),
        'utf-8'
      );
    } catch (error) {
      console.error(`[Cache] Fehler beim Schreiben der Cache-Datei für ${key}:`, error);
    }
  }

  /**
   * Daten aus dem localStorage laden (Browser)
   * @param {string} key - Eindeutiger Schlüssel für die Daten
   * @returns {{data: any, timestamp: number} | null} - Die gecachten Daten oder null
   */
  getFromLocalStorage(key) {
    if (isNode) return null;
    
    try {
      const cacheKey = `yt_cache_${key}`;
      const raw = localStorage.getItem(cacheKey);
      
      if (!raw) return null;
      
      return JSON.parse(raw);
    } catch (error) {
      console.warn(`[Cache] Fehler beim Lesen aus localStorage für ${key}:`, error);
      return null;
    }
  }

  /**
   * Daten im localStorage speichern (Browser)
   * @param {string} key - Eindeutiger Schlüssel für die Daten
   * @param {Object} cacheItem - Das zu speichernde Cache-Item
   */
  saveToLocalStorage(key, cacheItem) {
    if (isNode) return;
    
    try {
      const cacheKey = `yt_cache_${key}`;
      localStorage.setItem(cacheKey, JSON.stringify(cacheItem));
    } catch (error) {
      console.warn(`[Cache] Fehler beim Schreiben in localStorage für ${key}:`, error);
    }
  }

  /**
   * Cache für einen bestimmten Schlüssel löschen
   * @param {string} key - Eindeutiger Schlüssel für die Daten
   * @returns {Promise<void>}
   */
  async invalidateCache(key) {
    // Aus Memory-Cache entfernen
    delete this.memoryCache[key];
    
    // Aus localStorage entfernen (Browser)
    if (!isNode) {
      try {
        localStorage.removeItem(`yt_cache_${key}`);
      } catch (e) {
        // Ignorieren
      }
    }
    
    // Aus Datei entfernen (Node.js)
    if (isNode) {
      try {
        const fs = await import('fs/promises');
        const path = await import('path');
        
        const filePath = path.default.join(this.cacheDir, `${key}.json`);
        await fs.default.unlink(filePath).catch(() => {});
      } catch (e) {
        // Ignorieren
      }
    }
  }

  /**
   * Gesamten Cache löschen
   * @returns {Promise<void>}
   */
  async clearCache() {
    // Memory-Cache leeren
    this.memoryCache = {};
    
    // localStorage leeren (Browser)
    if (!isNode) {
      try {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('yt_cache_')) {
            keysToRemove.push(key);
          }
        }
        
        keysToRemove.forEach(key => localStorage.removeItem(key));
      } catch (e) {
        // Ignorieren
      }
    }
    
    // Cache-Dateien löschen (Node.js)
    if (isNode) {
      try {
        const fs = await import('fs/promises');
        const path = await import('path');
        
        const files = await fs.default.readdir(this.cacheDir);
        for (const file of files) {
          if (file.endsWith('.json')) {
            await fs.default.unlink(path.default.join(this.cacheDir, file)).catch(() => {});
          }
        }
      } catch (e) {
        // Ignorieren
      }
    }
  }
}

// Singleton-Instanz exportieren
const cacheService = new CacheService();
export default cacheService;
