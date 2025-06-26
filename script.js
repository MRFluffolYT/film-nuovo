const apiKey = 'a3c17d492a24a9f77acb23626404edd1';
const searchInput = document.getElementById('searchInput');
const resultsContainer = document.getElementById('results');
const playerModal = document.getElementById('playerModal');
const playerFrame = document.getElementById('playerFrame');
const closeBtn = document.getElementById('closeBtn');

// Chiudi il player
closeBtn.addEventListener('click', () => {
  playerModal.classList.add('hidden');
  playerFrame.src = '';
});

// Ricerca su input
searchInput.addEventListener('input', async () => {
  const query = searchInput.value.trim();
  if (query.length > 2) {
    const url = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&language=it-IT&query=${encodeURIComponent(query)}`;
    const res = await fetch(url);
    const data = await res.json();
    displayResults(data.results);
  } else {
    resultsContainer.innerHTML = '';
  }
});

function displayResults(results) {
  resultsContainer.innerHTML = '';
  results
    .filter(item => item.media_type === 'movie' || item.media_type === 'tv')
    .sort((a, b) => b.popularity - a.popularity)
    .forEach(item => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <img src="https://image.tmdb.org/t/p/w500${item.poster_path}" />
        <div class="info">
          <h4>${item.title || item.name}</h4>
          <p>${item.media_type === 'movie' ? '🎬 Film' : '📺 Serie'}</p>
        </div>
      `;
      card.addEventListener('click', () => openPlayer(item));
      resultsContainer.appendChild(card);
    });
}

function openPlayer(item) {
  let url = '';
  if (item.media_type === 'movie') {
    url = `https://vixsrc.to/movie/${item.id}`;
  } else {
    url = `https://vixsrc.to/tv/${item.id}/1/1`; // Prima stagione, primo episodio
  }
  playerFrame.src = url;
  playerModal.classList.remove('hidden');
}
