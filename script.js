const apiKey = 'a3c17d492a24a9f77acb23626404edd1';
const searchInput = document.getElementById('searchInput');
const resultsContainer = document.getElementById('results');
const playerModal = document.getElementById('playerModal');
const playerFrame = document.getElementById('playerFrame');
const closeBtn = document.getElementById('closeBtn');

searchInput.addEventListener('input', async () => {
  const query = searchInput.value.trim();
  if (query.length > 2) {
    const results = await searchTMDb(query);
    displayResults(results);
  }
});

closeBtn.addEventListener('click', () => {
  playerModal.classList.add('hidden');
  playerFrame.src = '';
});

async function searchTMDb(query) {
  const url = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&language=it-IT&query=${encodeURIComponent(query)}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.results.sort((a, b) => b.popularity - a.popularity);
}

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

function openPlayer(item) {
  if (item.media_type === 'movie') {
    playerFrame.src = `https://vixsrc.to/movie/${item.id}`;
  } else if (item.media_type === 'tv') {
    const season = item.first_air_date ? 1 : 1;
    const episode = 1;
    playerFrame.src = `https://vixsrc.to/tv/${item.id}/${season}/${episode}`;
  }
  playerModal.classList.remove('hidden');
}
