// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const factText = document.getElementById('spaceFactText');
const gallery = document.getElementById('gallery');
const button = document.getElementById('loadButton');
const modal = document.getElementById('modal');
const modalMedia = document.getElementById('modalMedia');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalDescription = document.getElementById('modalDescription');
const modalLink = document.getElementById('modalLink');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

const API_KEY = 'R5bsIIKr2gObFs3WEEJ6IvhL9TynyajyN1TK1p8E';
const loadingMarkup = '<div class="placeholder"><div class="placeholder-icon">🔄</div><p>Loading space photos…</p></div>';
const galleryData = new Map();

const facts = [
  'The Sun accounts for 99.86% of the mass in our solar system.',
  'A teaspoon of neutron star material would weigh about 6 billion tons.',
  'Mars has the largest volcano in the solar system, Olympus Mons.',
  'Jupiter’s Great Red Spot is a storm that has been raging for at least 350 years.',
  'Saturn could float in water because it is mostly made of gas.',
  'The Moon moves away from Earth about 1.5 inches each year.',
  'There are more trees on Earth than stars in the Milky Way galaxy.',
  'Venus spins backward, making its day longer than its year.',
  'A day on Venus is longer than a year on Venus.',
  'Astronauts in space can grow up to 2 inches taller in microgravity.'
];

function getRandomFact() {
  return facts[Math.floor(Math.random() * facts.length)];
}

function displayRandomFact() {
  factText.textContent = getRandomFact();
}

defaultDisplay();

function defaultDisplay() {
  displayRandomFact();
}

function getDatesInRange(start, end) {
  const dates = [];
  const current = new Date(start);
  const endDate = new Date(end);

  while (current <= endDate) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

function fetchWithTimeout(url, options = {}, timeout = 15000) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), timeout))
  ]);
}

async function fetchAPODRange(start, end) {
  const url = `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&start_date=${start}&end_date=${end}`;
  try {
    const response = await fetchWithTimeout(url);
    if (response.ok) {
      const data = await response.json();
      return Array.isArray(data) ? data : [data];
    }

    console.error('Failed to fetch APOD range:', response.statusText);
    return null;
  } catch (error) {
    console.error('Error fetching APOD range:', error);
    return null;
  }
}

function createGalleryItem(data) {
  const card = document.createElement('div');
  card.className = 'gallery-item';
  card.tabIndex = 0;
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', `${data.title} ${data.date}`);

  if (data.media_type === 'image') {
    const img = document.createElement('img');
    img.src = data.url;
    img.alt = data.title;
    card.appendChild(img);
  } else if (data.media_type === 'video') {
    const videoCard = document.createElement('div');
    videoCard.className = 'video-card';
    const icon = document.createElement('div');
    icon.className = 'video-icon';
    icon.textContent = '▶';
    const label = document.createElement('p');
    label.textContent = 'Video content available — click to open';
    videoCard.appendChild(icon);
    videoCard.appendChild(label);
    card.appendChild(videoCard);
  }

  const title = document.createElement('h3');
  title.textContent = data.title;
  card.appendChild(title);

  const meta = document.createElement('p');
  meta.className = 'gallery-meta';
  meta.textContent = data.date;
  card.appendChild(meta);

  const shortDesc = document.createElement('p');
  shortDesc.className = 'gallery-description';
  shortDesc.textContent = data.explanation.length > 120 ? `${data.explanation.slice(0, 120)}…` : data.explanation;
  card.appendChild(shortDesc);

  galleryData.set(card, data);
  card.addEventListener('click', () => openModal(data));
  card.addEventListener('keypress', event => {
    if (event.key === 'Enter') {
      openModal(data);
    }
  });

  return card;
}

function formatVideoUrl(url) {
  // Handle YouTube URLs
  const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]+)/);
  if (youtubeMatch && youtubeMatch[1]) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}?rel=0&autoplay=1`;
  }
  
  // Handle Vimeo URLs
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }
  
  // For other video URLs, return as-is (may not embed properly)
  return url;
}

function openModal(data) {
  modalMedia.innerHTML = '';
  modalTitle.textContent = data.title;
  modalDate.textContent = data.date;
  modalDescription.textContent = data.explanation;
  modalLink.href = data.url;

  if (data.media_type === 'image') {
    const img = document.createElement('img');
    img.src = data.url;
    img.alt = data.title;
    modalMedia.appendChild(img);
    modalLink.textContent = 'View original NASA entry';
  } else if (data.media_type === 'video') {
    // Try to embed the video
    const embedUrl = formatVideoUrl(data.url);
    
    // Create a container for the video
    const videoContainer = document.createElement('div');
    videoContainer.className = 'video-embed-container';
    
    const iframe = document.createElement('iframe');
    iframe.src = embedUrl;
    iframe.title = data.title;
    iframe.width = '100%';
    iframe.height = '450';
    iframe.frameBorder = '0';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.allowFullscreen = true;
    
    // Add error handling - if iframe fails to load, show a message
    iframe.onerror = function() {
      videoContainer.innerHTML = `
        <div class="video-fallback">
          <div class="video-icon">▶</div>
          <p>This video cannot be embedded.</p>
          <a href="${data.url}" target="_blank" rel="noopener" class="video-link-button">
            Watch on Nasa →
          </a>
        </div>
      `;
    };
    
    videoContainer.appendChild(iframe);
    modalMedia.appendChild(videoContainer);
    modalLink.textContent = 'Watch on Nasa';
  }

  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
}
function closeModal() {
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
  modalMedia.innerHTML = '';
  document.body.classList.remove('modal-open');
}

modal.addEventListener('click', event => {
  if (event.target.dataset.action === 'close') {
    closeModal();
  }
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !modal.classList.contains('hidden')) {
    closeModal();
  }
});

button.addEventListener('click', async () => {
  const start = startInput.value || startInput.min;
  const end = endInput.value || endInput.max;

   console.log('Start date:', start);  // ADD THIS
  console.log('End date:', end);      // ADD THIS
  

  gallery.innerHTML = loadingMarkup;
  button.disabled = true;
  button.textContent = 'Loading…';

  try {
    const results = await fetchAPODRange(start, end);
    gallery.innerHTML = '';

    if (!results || results.length === 0) {
      gallery.innerHTML = '<div class="placeholder"><div class="placeholder-icon">⚠️</div><p>No space photos were found for that date range. Try another range.</p></div>';
    } else {
      results.forEach(data => {
        const item = createGalleryItem(data);
        gallery.appendChild(item);
      });
    }
  } catch (error) {
    console.error('Unexpected error while loading images:', error);
    gallery.innerHTML = '<div class="placeholder"><div class="placeholder-icon">⚠️</div><p>There was a problem loading the NASA photos. Please try again.</p></div>';
  } finally {
    button.disabled = false;
    button.textContent = 'Get Space Images';
  }
});
