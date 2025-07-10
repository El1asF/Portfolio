// main.js
// Hauptdatei für die Initialisierung aller Komponenten

import {
  getChannelData,
  getAllVideos,
  getMostViewedVideo,
  getMostViewedShort,
  getLatestVideos,
  getLatestShorts,
  formatNumber,
  formatTimeAgo,
  formatDuration
} from './api.js';

import { initFilmprojekteTimeline } from './filmprojekteRenderer.js';
import { initLebenslaufTimeline } from './lebenslaufRenderer.js';
import { initSkillsOverview } from './skillsRenderer.js';
import { initSocialLinks } from './socialsRenderer.js';
import { observeTimelineItems } from './animations.js';


// DOM-Elemente
const channelTitle = document.getElementById('channel-title');
const channelAvatar = document.getElementById('channel-avatar');
const subscriberCount = document.getElementById('subscriber-count');
const mostViewedVideosContainer = document.getElementById('most-viewed-videos');
const latestVideosContainer = document.getElementById('latest-videos');
const latestShortsContainer = document.getElementById('latest-shorts');

// Initialisierung
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // 1. Kanaldaten
    await initChannelInfo();

    // 2. YouTube-Sektionen
    await initMostViewedVideos();
    await initLatestVideos();
    await initLatestShorts();

    // 3. Portfolio-Timelines & Skills & Socials
    await initFilmprojekteTimeline();
    await initLebenslaufTimeline();
    await initSkillsOverview();
    await initSocialLinks();

    // 4. Animationen für Timeline
    observeTimelineItems();
  } catch (err) {
    console.error('Fehler in main.js beim Initialisieren:', err);
  }
});

// Kanaldaten initialisieren
async function initChannelInfo() {
  try {
    const channelData = await getChannelData();
    
    if (channelData) {
      // Kanaltitel setzen
      if (channelTitle) {
        channelTitle.textContent = channelData.title;
      }
      
      // Kanalprofilbild setzen
      if (channelAvatar && channelData.thumbnails && channelData.thumbnails.default) {
        channelAvatar.src = channelData.thumbnails.default.url;
      }
      
      // Abonnentenzahl setzen und Animation starten
      if (subscriberCount) {
        initSubscriberCounter(channelData.subscriberCount);
      }
    }
  } catch (error) {
    console.error('Fehler beim Initialisieren der Kanaldaten:', error);
  }
}

// Abonnentenzähler mit Animation
function initSubscriberCounter(count) {
  if (!subscriberCount) return;
  
  const duration = 2000; // Animation in ms
  const frameDuration = 1000 / 60; // 60fps
  const totalFrames = Math.round(duration / frameDuration);
  const countPerFrame = count / totalFrames;
  
  let currentCount = 0;
  let frame = 0;
  
  const counter = setInterval(() => {
    frame++;
    currentCount += countPerFrame;
    
    if (frame === totalFrames) {
      clearInterval(counter);
      currentCount = count;
    }
    
    subscriberCount.textContent = `${formatNumber(Math.floor(currentCount))} Abonnenten`;
  }, frameDuration);
}

// Meistgesehene Videos initialisieren
async function initMostViewedVideos() {
  if (!mostViewedVideosContainer) return;
  
  try {
    // Meistgesehenes Longform-Video laden
    const mostViewedVideo = await getMostViewedVideo();
    
    // Meistgesehenes Short laden
    const mostViewedShort = await getMostViewedShort();
    
    // Container leeren
    mostViewedVideosContainer.innerHTML = '';
    
    // Meistgesehenes Longform-Video rendern
    if (mostViewedVideo) {
      const videoElement = createMostViewedVideoElement(mostViewedVideo, false);
      mostViewedVideosContainer.appendChild(videoElement);
    } else {
      const placeholder = document.createElement('div');
      placeholder.className = 'card video-card longform most-viewed-longform';
      placeholder.innerHTML = `
        <div class="longform-thumbnail-container">
          <div class="video-placeholder">Kein Video gefunden</div>
        </div>
      `;
      mostViewedVideosContainer.appendChild(placeholder);
    }
    
    // Meistgesehenes Short rendern
    if (mostViewedShort) {
      const shortElement = createMostViewedVideoElement(mostViewedShort, true);
      mostViewedVideosContainer.appendChild(shortElement);
    } else {
      const placeholder = document.createElement('div');
      placeholder.className = 'card video-card short most-viewed-short';
      placeholder.innerHTML = `
        <div class="video-placeholder">Kein Short gefunden</div>
      `;
      mostViewedVideosContainer.appendChild(placeholder);
    }
  } catch (error) {
    console.error('Fehler beim Initialisieren der meistgesehenen Videos:', error);
  }
}

// Element für meistgesehenes Video/Short erstellen
function createMostViewedVideoElement(video, isShort) {
  const element = document.createElement('div');
  element.className = isShort 
    ? 'card video-card short most-viewed-short' 
    : 'card video-card longform most-viewed-longform';
  
  const title = video.snippet.title;
  const viewCount = parseInt(video.statistics.viewCount);
  const publishedAt = video.snippet.publishedAt;
  const videoId = video.id;
  
  // Thumbnail-URL mit höchster Qualität auswählen
  let thumbnailUrl = video.snippet.thumbnails.maxres 
    ? video.snippet.thumbnails.maxres.url 
    : video.snippet.thumbnails.high 
      ? video.snippet.thumbnails.high.url 
      : video.snippet.thumbnails.default.url;
  
  // Videodauer formatieren
  const duration = video.contentDetails ? formatDuration(video.contentDetails.duration) : '';
  
  // HTML für das Element erstellen
  if (isShort) {
    element.innerHTML = `
      <div class="shorts-thumbnail">
        <a href="https://www.youtube.com/watch?v=${videoId}" target="_blank">
          <img src="${thumbnailUrl}" alt="${title}">
          <div class="video-duration">${duration}</div>
        </a>
      </div>
      <div class="video-info">
        <h4 class="video-title">${title}</h4>
        <div class="video-meta">
          <span>${formatNumber(viewCount)} Aufrufe</span>
        </div>
      </div>
    `;
  } else {
    element.innerHTML = `
      <div class="longform-thumbnail-container">
        <div class="video-thumbnail">
          <a href="https://www.youtube.com/watch?v=${videoId}" target="_blank">
            <img src="${thumbnailUrl}" alt="${title}">
            <div class="video-duration">${duration}</div>
          </a>
        </div>
        <div class="video-info">
          <h4 class="video-title">${title}</h4>
          <div class="video-meta">
            <span>${formatNumber(viewCount)} Aufrufe</span>
            <span>${formatTimeAgo(publishedAt)}</span>
          </div>
        </div>
      </div>
    `;
  }
  
  return element;
}

// Neueste Videos initialisieren
async function initLatestVideos() {
  if (!latestVideosContainer) return;
  
  try {
    // Neueste Longform-Videos laden (nur 3)
    const latestVideos = await getLatestVideos(3);
    
    // Container leeren
    latestVideosContainer.innerHTML = '';
    
    // Videos rendern
    if (latestVideos && latestVideos.length > 0) {
      latestVideos.forEach(video => {
        const videoElement = createVideoElement(video, false);
        latestVideosContainer.appendChild(videoElement);
      });
    } else {
      // Platzhalter anzeigen, wenn keine Videos gefunden wurden
      for (let i = 0; i < 3; i++) {
        const placeholder = document.createElement('div');
        placeholder.className = 'card video-card';
        placeholder.innerHTML = `<div class="video-placeholder">Kein Video gefunden</div>`;
        latestVideosContainer.appendChild(placeholder);
      }
    }
  } catch (error) {
    console.error('Fehler beim Initialisieren der neuesten Videos:', error);
  }
}

// Neueste Shorts initialisieren
async function initLatestShorts() {
  if (!latestShortsContainer) return;
  
  try {
    // Neueste Shorts laden (nur 5)
    const latestShorts = await getLatestShorts(5);
    
    // Container leeren
    latestShortsContainer.innerHTML = '';
    
    // Shorts rendern
    if (latestShorts && latestShorts.length > 0) {
      latestShorts.forEach(short => {
        const shortElement = createVideoElement(short, true);
        latestShortsContainer.appendChild(shortElement);
      });
    } else {
      // Platzhalter anzeigen, wenn keine Shorts gefunden wurden
      for (let i = 0; i < 5; i++) {
        const placeholder = document.createElement('div');
        placeholder.className = 'card shorts-card';
        placeholder.innerHTML = `<div class="video-placeholder">Kein Short gefunden</div>`;
        latestShortsContainer.appendChild(placeholder);
      }
    }
  } catch (error) {
    console.error('Fehler beim Initialisieren der neuesten Shorts:', error);
  }
}

// Element für Video/Short erstellen
function createVideoElement(video, isShort) {
  const element = document.createElement('div');
  element.className = isShort 
  ? 'card shorts-card' 
  : 'card video-card';

  const title = video.snippet.title;
  const viewCount = parseInt(video.statistics.viewCount);
  const publishedAt = video.snippet.publishedAt;
  const videoId = video.id;
  
  // Thumbnail-URL mit höchster Qualität auswählen
  let thumbnailUrl = video.snippet.thumbnails.maxres 
    ? video.snippet.thumbnails.maxres.url 
    : video.snippet.thumbnails.high 
      ? video.snippet.thumbnails.high.url 
      : video.snippet.thumbnails.default.url;
  
  // Videodauer formatieren
  const duration = video.contentDetails ? formatDuration(video.contentDetails.duration) : '';
  
  // HTML für das Element erstellen
  if (isShort) {
    element.innerHTML = `
      <div class="shorts-thumbnail">
        <a href="https://www.youtube.com/watch?v=${videoId}" target="_blank">
          <img src="${thumbnailUrl}" alt="${title}">
          <div class="video-duration">${duration}</div>
        </a>
      </div>
      <div class="video-info">
        <h4 class="video-title">${title}</h4>
        <div class="video-meta">
          <span>${formatNumber(viewCount)} Aufrufe</span>
        </div>
      </div>
    `;
  } else {
    element.innerHTML = `
      <div class="longform-thumbnail-container">
        <div class="video-thumbnail">
          <a href="https://www.youtube.com/watch?v=${videoId}" target="_blank">
            <img src="${thumbnailUrl}" alt="${title}">
            <div class="video-duration">${duration}</div>
          </a>
        </div>
        <div class="video-info">
          <h4 class="video-title">${title}</h4>
          <div class="video-meta">
            <span>${formatNumber(viewCount)} Aufrufe</span>
            <span>${formatTimeAgo(publishedAt)}</span>
          </div>
        </div>
      </div>
    `;
  }
  
  return element;
}
