// socialsRenderer.js
// Modul zur dynamischen Generierung der Social-Media-Links

import { loadSocials } from './dataLoader.js';

/**
 * Initialisiert die Social-Media-Links
 */
export async function initSocialLinks() {
  try {
    // Social-Media-Daten laden
    const socials = await loadSocials();
    
    if (!socials || socials.length === 0) {
      console.error('Keine Social-Media-Daten gefunden');
      return;
    }
    
    // Container für die Social-Links finden
    const socialLinksContainer = document.getElementById('social-links');
    if (!socialLinksContainer) {
      console.error('Social-Links-Container nicht gefunden');
      return;
    }
    
    // Container leeren
    socialLinksContainer.innerHTML = '';
    
    // Social-Links rendern
    socials.forEach(social => {
      const socialLink = createSocialLink(social);
      socialLinksContainer.appendChild(socialLink);
    });
    
  } catch (error) {
    console.error('Fehler beim Initialisieren der Social-Media-Links:', error);
  }
}

/**
 * Erstellt einen Social-Media-Link
 * @param {Object} social - Das Social-Media-Objekt
 * @returns {HTMLElement} - Der erstellte Social-Media-Link
 */
function createSocialLink(social) {
  const link = document.createElement('a');
  link.className = 'social-link animated';
  link.href = social.url || '#';
  link.target = '_blank';
  
  // Icon basierend auf der Plattform bestimmen
  const iconClass = getSocialIconClass(social.platform);
  
  // HTML für den Social-Link erstellen
  link.innerHTML = `
    <i class="${iconClass} social-icon"></i>
    <div class="social-info">
      <span class="social-name">${social.username || ''}</span>
      <span class="follower-count">${social.followers || 0}</span>
    </div>
  `;
  
  return link;
}

/**
 * Gibt die CSS-Klasse für das Icon einer Social-Media-Plattform zurück
 * @param {string} platform - Name der Plattform
 * @returns {string} - CSS-Klasse für das Icon
 */
function getSocialIconClass(platform) {
  const iconMap = {
    'Instagram': 'fab fa-instagram',
    'TikTok': 'fab fa-tiktok',
    'Facebook': 'fab fa-facebook',
    'Twitter': 'fab fa-twitter',
    'LinkedIn': 'fab fa-linkedin',
    'YouTube': 'fab fa-youtube',
    'GitHub': 'fab fa-github'
  };
  
  return iconMap[platform] || 'fab fa-globe'; // Fallback-Icon
}
