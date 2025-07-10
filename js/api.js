// YouTube API Integration
import cacheService from './cacheService.js';

const CHANNEL_ID = 'UC8VMlZ6CVj7g-f3MMUvyCJw'; // El1as.F channel ID
// const API_KEY = import.meta.env.VITE_YT_API_KEY; // Wird aus .env geladen
const API_KEY = 'AIzaSyBcdO9KBv5e0Q5LqwzHp9B9ZC0KYi4FsXU';


// API-Key aus .env-Datei laden
function getApiKey() {
  // Versuche, den API-Key aus der .env-Datei zu laden
  // Für Produktionsumgebung würde hier eine echte Implementierung stehen
  return API_KEY;
}

// Hilfsfunktion zum Formatieren von Zahlen (z.B. 1000 -> 1K)
function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + ' Mio.';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + ' Tsd.';
  }
  return num.toString();
}

// Hilfsfunktion zum Formatieren von Zeiträumen
function formatTimeAgo(publishedAt) {
  const now = new Date();
  const published = new Date(publishedAt);
  const diffInMs = now - published;
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays < 1) {
    return 'heute';
  } else if (diffInDays < 7) {
    return `vor ${diffInDays} ${diffInDays === 1 ? 'Tag' : 'Tagen'}`;
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `vor ${weeks} ${weeks === 1 ? 'Woche' : 'Wochen'}`;
  } else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return `vor ${months} ${months === 1 ? 'Monat' : 'Monaten'}`;
  } else {
    const years = Math.floor(diffInDays / 365);
    return `vor ${years} ${years === 1 ? 'Jahr' : 'Jahren'}`;
  }
}

// Hilfsfunktion zum Formatieren der Videodauer
function formatDuration(duration) {
  // ISO 8601 Dauer in Sekunden umwandeln
  if (!duration) return '0:00';
  
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  
  const hours = (match[1] && match[1].replace('H', '')) || 0;
  const minutes = (match[2] && match[2].replace('M', '')) || 0;
  const seconds = (match[3] && match[3].replace('S', '')) || 0;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}

// Prüfen, ob ein Video ein Short ist
function isShort(video) {
  // Shorts haben normalerweise ein Seitenverhältnis von 9:16 und sind kürzer als 60 Sekunden
  if (!video.contentDetails || !video.contentDetails.duration) return false;
  
  const duration = video.contentDetails.duration;
  const durationInSeconds = parseDuration(duration);
  
  // Wenn das Video kürzer als 60 Sekunden ist und "short" im Titel oder in den Tags vorkommt,
  // oder wenn es in der Shorts-Playlist ist, dann ist es wahrscheinlich ein Short
  return (
    durationInSeconds <= 60 || 
    (video.snippet.title && video.snippet.title.toLowerCase().includes('short')) ||
    (video.snippet.tags && video.snippet.tags.some(tag => tag.toLowerCase().includes('short')))
  );
}

// Hilfsfunktion zum Umwandeln der ISO 8601 Dauer in Sekunden
function parseDuration(duration) {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  
  const hours = (match[1] && parseInt(match[1].replace('H', ''))) || 0;
  const minutes = (match[2] && parseInt(match[2].replace('M', ''))) || 0;
  const seconds = (match[3] && parseInt(match[3].replace('S', ''))) || 0;
  
  return hours * 3600 + minutes * 60 + seconds;
}

// Kanaldaten abrufen
async function getChannelData() {
  return cacheService.getOrFetch('channelData', async () => {
    const apiKey = getApiKey();
    const resp = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${CHANNEL_ID}&key=${apiKey}`
    );
    const json = await resp.json();
    if (!json.items?.length) throw new Error('Keine Kanaldaten');
    const item = json.items[0];
    return {
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnails: item.snippet.thumbnails,
      subscriberCount: +item.statistics.subscriberCount,
      viewCount: +item.statistics.viewCount,
      videoCount: +item.statistics.videoCount
    };
  });
}

// Alle Videos abrufen (maximal 50)
async function getAllVideos() {
  return cacheService.getOrFetch('allVideos', async () => {
    const apiKey = getApiKey();
    const searchRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&maxResults=50&order=date&type=video&key=${apiKey}`
    );
    const searchJson = await searchRes.json();
    const ids = searchJson.items.map(i => i.id.videoId).join(',');
    const videoRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${ids}&key=${apiKey}`
    );
    const videoJson = await videoRes.json();
    return videoJson.items || [];
  });
}

// Meistgesehenes Video abrufen
async function getMostViewedVideo() {
  return cacheService.getOrFetch('mostViewedVideo', async () => {
    const apiKey = getApiKey();
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&maxResults=50&order=viewCount&type=video&videoDuration=any&key=${apiKey}`
    );
    const searchData = await res.json();
    const ids = searchData.items.map(i => i.id.videoId).join(',');
    const vidRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${ids}&key=${apiKey}`
    );
    const vidJson = await vidRes.json();
    const longform = vidJson.items.filter(v => !isShort(v));
    if (!longform.length) throw new Error('Kein meistgesehenes Video gefunden');
    return longform[0];
  });
}

// Meistgesehenes Short abrufen
async function getMostViewedShort() {
  return cacheService.getOrFetch('mostViewedShort', async () => {
    const apiKey = getApiKey();
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&maxResults=50&order=viewCount&type=video&videoDuration=short&key=${apiKey}`
    );
    const searchData = await res.json();
    const ids = searchData.items.map(i => i.id.videoId).join(',');
    const vidRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${ids}&key=${apiKey}`
    );
    const vidJson = await vidRes.json();
    const shorts = vidJson.items.filter(v => isShort(v));
    if (!shorts.length) throw new Error('Kein meistgesehenes Short gefunden');
    return shorts[0];
  });
}

// Neueste Videos abrufen (nur Longform)
async function getLatestVideos(count = 3) {
  try {
    const allVideos = await getAllVideos();
    
    // Filtern nach Nicht-Shorts
    const longformVideos = allVideos.filter(video => !isShort(video));
    
    // Die neuesten Videos zurückgeben
    return longformVideos.slice(0, count);
  } catch (error) {
    console.error('Fehler beim Abrufen der neuesten Videos:', error);
    return [];
  }
}

// Neueste Shorts abrufen
async function getLatestShorts(count = 5) {
  try {
    const allVideos = await getAllVideos();
    
    // Filtern nach Shorts
    const shorts = allVideos.filter(video => isShort(video));
    
    // Die neuesten Shorts zurückgeben
    return shorts.slice(0, count);
  } catch (error) {
    console.error('Fehler beim Abrufen der neuesten Shorts:', error);
    return [];
  }
}

// Exportieren der Funktionen
export {
  getChannelData,
  getAllVideos,
  getMostViewedVideo,
  getMostViewedShort,
  getLatestVideos,
  getLatestShorts,
  formatNumber,
  formatTimeAgo,
  formatDuration
};
