const API_KEY = 'bf39cbff'; // Replace with your OMDB API key
const YOUTUBE_API_KEY = 'AIzaSyCvcpgu5WUIyFQJf6bkSF1oegakqBkZP-A'; // Replace with your YouTube API key
const BASE_URL = `https://www.omdbapi.com/?apikey=${API_KEY}`;
const YOUTUBE_SEARCH_URL = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&type=video&key=${YOUTUBE_API_KEY}`;

const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const suggestionsContainer = document.getElementById('suggestions');
const recommendationsContainer = document.getElementById('recommendations');
const contentContainer = document.getElementById('content');
const streamContentContainer = document.getElementById('stream-content');
const imdbCodeInput = document.getElementById('imdb-code');
const streamButton = document.getElementById('stream-button');
const searchResultsSection = document.getElementById('search-results');
const movieDetailsSection = document.getElementById('movie-details');

// Debounce function to limit API calls
function debounce(func, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

// Fetch data from OMDB API
async function fetchData(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

// Fetch YouTube trailer
async function fetchTrailer(title) {
  const url = `${YOUTUBE_SEARCH_URL}&q=${encodeURIComponent(title + ' trailer')}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.items && data.items.length > 0) {
      return data.items[0].id.videoId; // Return the first video ID
    }
  } catch (error) {
    console.error('Error fetching trailer:', error);
  }
  return null;
}

// Display search suggestions
async function showSuggestions(query) {
  const url = `${BASE_URL}&s=${query}`;
  const data = await fetchData(url);

  if (data && data.Search) {
    suggestionsContainer.innerHTML = data.Search.map(movie => `
      <div class="suggestion-item" data-id="${movie.imdbID}">
        <img src="${movie.Poster}" alt="${movie.Title}">
        <p>${movie.Title}</p>
      </div>
    `).join('');

    searchResultsSection.hidden = false;
    movieDetailsSection.hidden = true;

    // Add click event to suggestions
    document.querySelectorAll('.suggestion-item').forEach(item => {
      item.addEventListener('click', () => showMovieDetails(item.dataset.id));
    });
  } else {
    suggestionsContainer.innerHTML = '<p>No results found.</p>';
  }
}

// Display movie details with trailer
async function showMovieDetails(id) {
  const url = `${BASE_URL}&i=${id}`;
  const data = await fetchData(url);

  if (data) {
    // Fetch trailer
    const trailerId = await fetchTrailer(data.Title);

    if (trailerId) {
      document.getElementById('background-container').innerHTML = `
        <iframe src="https://www.youtube.com/embed/${trailerId}?autoplay=1&loop=1&playlist=${trailerId}&mute=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      `;
    }

    contentContainer.innerHTML = `
      <div class="movie-details">
        <img src="${data.Poster}" alt="${data.Title}">
        <div class="movie-info">
          <h2>${data.Title}</h2>
          <p>${data.Plot}</p>
          <p><strong>Year:</strong> ${data.Year}</p>
          <p><strong>Genre:</strong> ${data.Genre}</p>
          <p><strong>Director:</strong> ${data.Director}</p>
          <p><strong>Actors:</strong> ${data.Actors}</p>
          <p><strong>IMDb Rating:</strong> ${data.imdbRating}</p>
        </div>
      </div>
    `;

    movieDetailsSection.hidden = false;
    searchResultsSection.hidden = true;
  }
}

// Display recommendations by genre
async function showRecommendations(genre) {
  const url = `${BASE_URL}&s=${genre}`;
  const data = await fetchData(url);

  if (data && data.Search) {
    recommendationsContainer.innerHTML = data.Search.map(movie => `
      <div class="recommendation-item" data-id="${movie.imdbID}">
        <img src="${movie.Poster}" alt="${movie.Title}">
        <p>${movie.Title}</p>
      </div>
    `).join('');

    // Add click event to recommendations
    document.querySelectorAll('.recommendation-item').forEach(item => {
      item.addEventListener('click', () => showMovieDetails(item.dataset.id));
    });
  } else {
    recommendationsContainer.innerHTML = '<p>No recommendations found.</p>';
  }
}

// Function to load initial recommendations for specific movies
async function loadInitialRecommendations() {
  const movies = ['Dark', 'From', 'Incantation', 'Alice in Borderland', 'The Prestige', 'Oldboy', 'Squid Game' ,'Forrest Gump' ,'Parasite' ,'La la land']; // List of movies to load initially
  const recommendations = [];

  // Fetch details for each movie
  for (const movie of movies) {
    const url = `${BASE_URL}&t=${encodeURIComponent(movie)}`;
    const data = await fetchData(url);
    if (data && data.Title) {
      recommendations.push(data);
    }
  }

  // Display recommendations
  if (recommendations.length > 0) {
    recommendationsContainer.innerHTML = recommendations.map(movie => `
      <div class="recommendation-item" data-id="${movie.imdbID}">
        <img src="${movie.Poster}" alt="${movie.Title}">
        <p>${movie.Title}</p>
      </div>
    `).join('');

    // Add click event to recommendations
    document.querySelectorAll('.recommendation-item').forEach(item => {
      item.addEventListener('click', () => showMovieDetails(item.dataset.id));
    });
  } else {
    recommendationsContainer.innerHTML = '<p>No recommendations found.</p>';
  }
}

// Simulate streaming functionality
function streamContent(imdbCode) {
  streamContentContainer.innerHTML = `
    <p>Streaming content for IMDb Code: ${imdbCode}</p>
    <p>(This is a placeholder. Actual streaming requires a proper API.)</p>
  `;
}

// Event listeners
searchInput.addEventListener('input', debounce(() => {
  const query = searchInput.value.trim();
  if (query) showSuggestions(query);
}, 300));

searchButton.addEventListener('click', () => {
  const query = searchInput.value.trim();
  if (query) showSuggestions(query);
});

document.querySelectorAll('.genre-button').forEach(button => {
  button.addEventListener('click', () => showRecommendations(button.dataset.genre));
});

streamButton.addEventListener('click', () => {
  const imdbCode = imdbCodeInput.value.trim();
  if (imdbCode) streamContent(imdbCode);
});

// Load initial recommendations when the page loads
window.addEventListener('load', () => {
  loadInitialRecommendations();
});