const apiKey = 'a3c17d492a24a9f77acb23626404edd1';
const searchInput = document.getElementById('searchInput');
const resultsContainer = document.getElementById('results');
const playerModal = document.getElementById('playerModal');
const playerFrame = document.getElementById('playerFrame');
const closeBtn = document.getElementById('closeBtn');

// Chiudi il player con la X
closeBtn.addEventListener('click', () => {
  playerModal.classList.add('hidden');
  playerFrame.src = '';
});

// Cerca dopo aver digitato
searchInput.addEventListener('input', async () => {
  const query = searchInput.value.trim();
  if (query.length > 2) {
    const results = await searchTMDb(query);
    displayResults(results);
  } else {
    resultsContainer.innerHTML = '';
  }
});

// API TMDb
async function searchTMDb(query) {
  const url = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&language=it-IT&query=${encodeURIComponent(query)}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.results.sort((a, b) => b.popularity - a.popularity);
}

// Mostra i risultati nella griglia
function displayResults(results) {
  resultsContainer.innerHTML = '';
  results.forEach(item => {
    if (item.media_type === 'movie' || item.media_type === 'tv') {
      const card = document.createElement('div');
      card.classList.add('card');
      card.innerHTML = `
        <img src="https://image.tmdb.org/t/p/w500${item.poster_path}" alt="${item.title || item.name}">
        <div class="info">
          <h3>${item.title || item.name}</h3>
          <p>${item.media_type === 'movie' ? '🎥 Film' : '📺 Serie TV'}</p>
        </div>
      `;
      card.addEventListener('click', () => {
        openPlayer(item);
      });
      resultsContainer.appendChild(card);
    }
  });
}

// Apre il player in base al tipo
function openPlayer(item) {
  let url;

  if (item.media_type === 'movie') {
    url = `https://vixsrc.to/movie/${item.id}`;
  } else if (item.media_type === 'tv') {
    const season = 1;
    const episode = 1;
    url = `https://vixsrc.to/tv/${item.id}/${season}/${episode}`;
  }

  playerFrame.src = url;
  playerModal.classList.remove('hidden');
}
