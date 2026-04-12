const tmdbApiKey = "a3c17d492a24a9f77acb23626404edd1";
const tmdbBaseUrl = "https://api.themoviedb.org/3";
const imageBase = {
  poster: "https://image.tmdb.org/t/p/w500",
  backdrop: "https://image.tmdb.org/t/p/original",
};

const whitelist = [
  "youngestmoonsta",
  "admin",
  "annapanna07",
  "giuseppe",
  "fabio",
  "barbie",
  "cirillo",
  "crama",
  "carlobarba1",
  "benedetta",
  "sonia",
];

const genreLookup = {
  movie: {
    12: "Avventura",
    14: "Fantasy",
    16: "Animazione",
    18: "Dramma",
    27: "Horror",
    28: "Azione",
    35: "Commedia",
    53: "Thriller",
    80: "Crime",
    878: "Sci-Fi",
    9648: "Mistero",
    10749: "Romance",
  },
  tv: {
    16: "Animazione",
    18: "Dramma",
    35: "Commedia",
    80: "Crime",
    99: "Documentario",
    9648: "Mistero",
    10759: "Avventura",
    10762: "Kids",
    10765: "Fantasy",
    10766: "Soap",
    10768: "War",
  },
};

const state = {
  featuredItem: null,
  popularItems: [],
  searchResults: [],
  activeDetailItem: null,
  detailRequestId: 0,
};

const elements = {};

if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

window.addEventListener("load", () => {
  window.scrollTo(0, 0);
});

window.addEventListener("pageshow", () => {
  window.scrollTo(0, 0);
});

document.addEventListener("DOMContentLoaded", () => {
  cacheElements();
  bindEvents();
  setupAccessModal();
  loadHomepage();
});

function cacheElements() {
  elements.homeLink = document.getElementById("homeLink");
  elements.modal = document.getElementById("username-modal");
  elements.usernameInput = document.getElementById("username-input");
  elements.usernameSubmit = document.getElementById("username-submit");
  elements.browserTip = document.getElementById("browser-tip");
  elements.detailsPanel = document.getElementById("details-panel");
  elements.detailsBackdrop = document.querySelector(".details-backdrop");
  elements.detailsCloseBtn = document.getElementById("detailsCloseBtn");
  elements.detailsCancelBtn = document.getElementById("detailsCancelBtn");
  elements.detailsWatchBtn = document.getElementById("detailsWatchBtn");
  elements.detailsVisual = document.getElementById("detailsVisual");
  elements.detailsPoster = document.getElementById("detailsPoster");
  elements.detailsType = document.getElementById("detailsType");
  elements.detailsTitle = document.getElementById("detailsTitle");
  elements.detailsMeta = document.getElementById("detailsMeta");
  elements.detailsDescription = document.getElementById("detailsDescription");
  elements.detailsCast = document.getElementById("detailsCast");
  elements.searchInput = document.getElementById("searchInput");
  elements.searchBtn = document.getElementById("searchBtn");
  elements.heroType = document.getElementById("heroType");
  elements.heroTitle = document.getElementById("heroTitle");
  elements.heroMeta = document.getElementById("heroMeta");
  elements.heroDescription = document.getElementById("heroDescription");
  elements.heroBackdrop = document.getElementById("heroBackdrop");
  elements.heroPlayBtn = document.getElementById("heroPlayBtn");
  elements.surpriseBtn = document.getElementById("surpriseBtn");
  elements.homeSections = document.getElementById("home-sections");
  elements.trendingRail = document.getElementById("trendingRail");
  elements.popularRail = document.getElementById("popularRail");
  elements.seriesRail = document.getElementById("seriesRail");
  elements.topRatedRail = document.getElementById("topRatedRail");
  elements.resultsSection = document.getElementById("results-section");
  elements.results = document.getElementById("results");
  elements.resultsSummary = document.getElementById("resultsSummary");
  elements.playerTitle = document.getElementById("playerTitle");
  elements.playerSubtitle = document.getElementById("playerSubtitle");
  elements.playerFrame = document.getElementById("playerFrame");
  elements.playerFrameWrap = document.querySelector(".player-frame-wrap");
  elements.downloadContainer = document.getElementById("downloadContainer");
  elements.downloadLink = document.getElementById("downloadLink");
  elements.tvControls = document.getElementById("tvControls");
  elements.seasonSelect = document.getElementById("seasonSelect");
  elements.episodeSelect = document.getElementById("episodeSelect");
  elements.watchArea = document.getElementById("watch-area");
}

function bindEvents() {
  elements.homeLink.addEventListener("click", (event) => {
    event.preventDefault();
    resetToHome();
  });

  elements.detailsCloseBtn.addEventListener("click", () => closeDetailsPanel());
  elements.detailsCancelBtn.addEventListener("click", () => closeDetailsPanel());
  elements.detailsBackdrop.addEventListener("click", () => closeDetailsPanel());
  elements.detailsWatchBtn.addEventListener("click", () => {
    const selectedItem = state.activeDetailItem;

    if (!selectedItem) {
      return;
    }

    closeDetailsPanel();
    openPlayerForItem(selectedItem);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !elements.detailsPanel.hidden) {
      closeDetailsPanel();
    }
  });

  elements.searchBtn.addEventListener("click", () => doSearch());
  elements.searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      doSearch();
    }
  });
  elements.searchInput.addEventListener("input", () => {
    if (!elements.searchInput.value.trim()) {
      setHomeSectionsVisible(true);
      clearSearchResults();
      setResultsSectionVisible(false);
    }
  });

  elements.heroPlayBtn.addEventListener("click", () => {
    if (state.featuredItem) {
      openPlayerForItem(state.featuredItem);
    }
  });

  elements.surpriseBtn.addEventListener("click", () => {
    const source = state.searchResults.length ? state.searchResults : state.popularItems;
    if (!source.length) {
      return;
    }

    const randomItem = source[Math.floor(Math.random() * source.length)];
    setFeatured(randomItem);
    openPlayerForItem(randomItem);
  });
}

async function setupAccessModal() {
  document.body.classList.add("modal-open");
  elements.modal.classList.add("active");

  const feedback = document.createElement("p");
  feedback.className = "modal-feedback";
  feedback.hidden = true;
  elements.usernameSubmit.insertAdjacentElement("beforebegin", feedback);
  elements.feedback = feedback;

  if (!(await isBraveBrowser())) {
    elements.browserTip.hidden = false;
  }

  elements.usernameInput.focus();

  elements.usernameInput.addEventListener("input", () => {
    elements.usernameSubmit.disabled = elements.usernameInput.value.trim().length < 2;
    elements.feedback.hidden = true;
    elements.feedback.textContent = "";
  });

  elements.usernameInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !elements.usernameSubmit.disabled) {
      elements.usernameSubmit.click();
    }
  });

  elements.usernameSubmit.addEventListener("click", () => {
    const originalUsername = elements.usernameInput.value.trim();
    const normalizedUsername = originalUsername.toLowerCase();

    if (!whitelist.includes(normalizedUsername)) {
      elements.feedback.hidden = false;
      elements.feedback.textContent = "Username non autorizzato.";
      elements.usernameInput.value = "";
      elements.usernameSubmit.disabled = true;
      elements.usernameInput.focus();
      return;
    }

    if (window.umami) {
      window.umami.identify(originalUsername);
      window.umami.track("accesso_autorizzato", {
        username: originalUsername,
        data: new Date().toLocaleString("it-IT"),
        browser: navigator.userAgent.substring(0, 80),
      });
    }

    elements.modal.classList.remove("active");
    document.body.classList.remove("modal-open");
  });
}

async function loadHomepage() {
  renderRailLoading(elements.trendingRail);
  renderRailLoading(elements.popularRail);
  renderRailLoading(elements.seriesRail);
  renderRailLoading(elements.topRatedRail);

  try {
    const [trendingMovies, popularMovies, popularSeries, topRatedSeries] = await Promise.all([
      fetchCollection("/trending/movie/week", { language: "it-IT" }, "movie"),
      fetchCollection("/movie/popular", { language: "it-IT", region: "IT" }, "movie"),
      fetchCollection("/tv/popular", { language: "it-IT" }, "tv"),
      fetchCollection("/tv/top_rated", { language: "it-IT" }, "tv"),
    ]);

    state.popularItems = dedupeById([
      ...trendingMovies,
      ...popularMovies,
      ...popularSeries,
      ...topRatedSeries,
    ]).slice(0, 24);

    renderRail(elements.trendingRail, trendingMovies.slice(0, 12));
    renderRail(elements.popularRail, state.popularItems);
    renderRail(elements.seriesRail, popularSeries.slice(0, 12));
    renderRail(elements.topRatedRail, topRatedSeries.slice(0, 12));

    if (state.popularItems.length) {
      setFeatured(state.popularItems[0]);
    }
  } catch (error) {
    console.error("Errore durante il caricamento della home:", error);
    [
      elements.trendingRail,
      elements.popularRail,
      elements.seriesRail,
      elements.topRatedRail,
    ].forEach((container) => {
      container.innerHTML = "";
      container.appendChild(createEmptyState("Nessun titolo disponibile."));
    });
    setHeroFallback();
  }
}

async function doSearch() {
  const query = elements.searchInput.value.trim();
  if (!query) {
    resetToHome();
    return;
  }

  closeDetailsPanel();
  window.scrollTo({ top: 0, behavior: "smooth" });
  setHomeSectionsVisible(false);
  setResultsSectionVisible(true);
  elements.results.innerHTML = "";
  elements.resultsSummary.textContent = "";

  try {
    const results = await searchMedia(query);
    state.searchResults = results;

    if (!results.length) {
      elements.results.appendChild(createEmptyState("Nessun risultato."));
      return;
    }

    renderResults(results);
    setFeatured(results[0]);
    elements.resultsSummary.textContent = `${results.length} titoli`;

    if (window.umami) {
      window.umami.track("search", { query });
    }
  } catch (error) {
    console.error("Errore durante la ricerca:", error);
    elements.results.appendChild(createEmptyState("Ricerca non disponibile."));
  }
}

async function searchMedia(query) {
  const data = await fetchJson("/search/multi", {
    language: "it-IT",
    query,
    include_adult: false,
  });

  const normalized = (data.results || [])
    .filter((item) => item.media_type === "movie" || item.media_type === "tv")
    .map((item) => normalizeMediaItem(item))
    .filter(Boolean);

  return filterAvailableResults(normalized);
}

async function filterAvailableResults(items) {
  const baseList = items.filter((item) => item.poster);
  const candidates = baseList.slice(0, 16);

  if (!candidates.length) {
    return [];
  }

  const checks = await Promise.all(candidates.map((item) => probePlayableAvailability(item)));
  const hasDefinitiveCheck = checks.some((value) => value !== null);

  if (!hasDefinitiveCheck) {
    return baseList;
  }

  return candidates.filter((_, index) => checks[index] === true);
}

async function probePlayableAvailability(item) {
  try {
    const response = await fetch(buildProbeUrl(item), {
      method: "HEAD",
    });

    if (response.ok) {
      return true;
    }

    if (response.status === 404) {
      return false;
    }

    return null;
  } catch (error) {
    return null;
  }
}

function buildProbeUrl(item) {
  if (item.mediaType === "movie") {
    return buildMovieUrl(item.id);
  }

  return buildTvUrl(item.id, 1, 1);
}

async function fetchCollection(path, params, fallbackType) {
  const data = await fetchJson(path, params);
  return (data.results || [])
    .map((item) => normalizeMediaItem(item, fallbackType))
    .filter(Boolean);
}

async function fetchJson(path, params = {}) {
  const searchParams = new URLSearchParams({ api_key: tmdbApiKey });

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.set(key, String(value));
    }
  });

  const response = await fetch(`${tmdbBaseUrl}${path}?${searchParams.toString()}`);
  if (!response.ok) {
    throw new Error(`TMDB request failed: ${response.status}`);
  }

  return response.json();
}

async function fetchMediaDetails(item) {
  return fetchJson(`/${item.mediaType}/${item.id}`, {
    language: "it-IT",
    append_to_response: "credits",
  });
}

function normalizeMediaItem(item, fallbackType) {
  const mediaType = item.media_type || fallbackType || inferMediaType(item);
  if (mediaType !== "movie" && mediaType !== "tv") {
    return null;
  }

  if (!item.poster_path) {
    return null;
  }

  const title = item.title || item.name || item.original_title || item.original_name;
  if (!title) {
    return null;
  }

  const year = (item.release_date || item.first_air_date || "").slice(0, 4);
  const overview = (item.overview || "").trim();

  return {
    id: item.id,
    mediaType,
    title,
    label: mediaType === "movie" ? "Film" : "Serie TV",
    year,
    rating: Number(item.vote_average || 0).toFixed(1),
    genres: extractGenres(item, mediaType),
    overview,
    poster: `${imageBase.poster}${item.poster_path}`,
    backdrop: item.backdrop_path
      ? `${imageBase.backdrop}${item.backdrop_path}`
      : `${imageBase.poster}${item.poster_path}`,
  };
}

function inferMediaType(item) {
  if (item.first_air_date || item.name) {
    return "tv";
  }

  return "movie";
}

function extractGenres(item, mediaType) {
  if (Array.isArray(item.genres) && item.genres.length) {
    return item.genres.map((genre) => genre.name).filter(Boolean);
  }

  if (Array.isArray(item.genre_ids) && item.genre_ids.length) {
    return item.genre_ids
      .map((genreId) => genreLookup[mediaType] && genreLookup[mediaType][genreId])
      .filter(Boolean);
  }

  return [];
}

function renderRail(container, items) {
  container.innerHTML = "";

  if (!items.length) {
    container.appendChild(createEmptyState("Nessun titolo disponibile."));
    return;
  }

  items.forEach((item) => {
    container.appendChild(createMediaCard(item, true));
  });
}

function renderResults(items) {
  elements.results.innerHTML = "";
  items.forEach((item) => {
    elements.results.appendChild(createMediaCard(item, false));
  });
}

function renderRailLoading(container) {
  container.innerHTML = "";

  for (let index = 0; index < 6; index += 1) {
    const placeholder = document.createElement("div");
    placeholder.className = "media-card";
    placeholder.innerHTML = `
      <div class="media-card__fade"></div>
      <div class="media-card__content">
        <div class="pill-row">
          <span class="pill">...</span>
          <span class="pill">...</span>
        </div>
      </div>
    `;
    container.appendChild(placeholder);
  }
}

function createMediaCard(item, compact) {
  const description = compact
    ? ""
    : `<p>${escapeHtml(truncate(item.overview || (item.genres[0] || ""), 88))}</p>`;
  const card = document.createElement("button");
  card.type = "button";
  card.className = "media-card";
  card.innerHTML = `
    <div class="media-card__poster">
      <img src="${item.poster}" alt="${escapeHtml(item.title)}" loading="lazy" />
    </div>
    <div class="media-card__fade"></div>
    <div class="media-card__content">
      <div class="pill-row">
        <span class="pill">${item.label}</span>
        <span class="pill">${item.year || "Nuovo"}</span>
      </div>
      <div class="media-card__body">
        <h3>${escapeHtml(item.title)}</h3>
        ${description}
      </div>
    </div>
  `;

  card.addEventListener("click", () => {
    setFeatured(item);
    openDetailsPanel(item);
  });

  return card;
}

function setFeatured(item) {
  state.featuredItem = item;
  elements.heroType.textContent = item.label;
  elements.heroTitle.textContent = item.title;
  elements.heroMeta.innerHTML = "";
  elements.heroDescription.textContent = truncate(
    item.overview || item.genres.join(" | "),
    180
  );
  elements.heroBackdrop.style.backgroundImage = `
    linear-gradient(180deg, rgba(6, 7, 10, 0.15), rgba(6, 7, 10, 0.45)),
    linear-gradient(90deg, rgba(6, 7, 10, 0.92) 0%, rgba(6, 7, 10, 0.34) 60%, rgba(6, 7, 10, 0.86) 100%),
    url("${item.backdrop}")
  `;

  buildFeaturedMeta(item).forEach((entry) => {
    const span = document.createElement("span");
    span.className = "pill";
    span.textContent = entry;
    elements.heroMeta.appendChild(span);
  });
}

function setHeroFallback() {
  elements.heroType.textContent = "Film";
  elements.heroTitle.textContent = "MRFluffolFilm";
  elements.heroMeta.innerHTML = "";
  elements.heroDescription.textContent = "";
  elements.heroBackdrop.style.backgroundImage = `
    linear-gradient(180deg, rgba(6, 7, 10, 0.15), rgba(6, 7, 10, 0.45)),
    linear-gradient(135deg, rgba(215, 34, 52, 0.5), rgba(255, 106, 78, 0.18))
  `;
}

function buildFeaturedMeta(item) {
  const meta = [];

  if (item.year) {
    meta.push(item.year);
  }

  if (item.rating && item.rating !== "0.0") {
    meta.push(`TMDB ${item.rating}`);
  }

  if (item.genres[0]) {
    meta.push(item.genres[0]);
  }

  return meta;
}

async function openPlayerForItem(item) {
  if (!item) {
    return;
  }

  updatePlayerHeader(item.title, buildPlayerSubtitle(item));

  if (window.umami) {
    window.umami.track("play", {
      titolo: item.title,
      tipo: item.mediaType === "movie" ? "film" : "serie",
      tmdb_id: item.id,
    });
  }

  if (item.mediaType === "movie") {
    elements.tvControls.classList.remove("active");
    activatePlayer(buildMovieUrl(item.id), item.title, buildPlayerSubtitle(item));
    return;
  }

  await setupTvControls(item);
}

async function openDetailsPanel(item) {
  state.activeDetailItem = item;
  state.detailRequestId += 1;
  const requestId = state.detailRequestId;

  fillDetailsPanel(item);
  elements.detailsPanel.hidden = false;
  document.body.classList.add("overlay-open");

  try {
    const details = await fetchMediaDetails(item);
    if (requestId !== state.detailRequestId) {
      return;
    }

    const enrichedItem = mergeMediaDetails(item, details);
    state.activeDetailItem = enrichedItem;
    fillDetailsPanel(enrichedItem);
  } catch (error) {
    if (requestId !== state.detailRequestId) {
      return;
    }

    console.error("Errore durante il caricamento dei dettagli:", error);
  }
}

function closeDetailsPanel() {
  state.detailRequestId += 1;
  state.activeDetailItem = null;
  elements.detailsPanel.hidden = true;
  document.body.classList.remove("overlay-open");
}

function fillDetailsPanel(item) {
  elements.detailsType.textContent = item.label;
  elements.detailsTitle.textContent = item.title;
  elements.detailsPoster.src = item.poster;
  elements.detailsPoster.alt = item.title;
  elements.detailsDescription.textContent =
    truncate(item.overview, 155) || "Nessuna descrizione disponibile.";
  elements.detailsCast.textContent = buildCastLine(item.cast);
  elements.detailsVisual.style.backgroundImage = `
    linear-gradient(180deg, rgba(6, 7, 10, 0.12), rgba(6, 7, 10, 0.7)),
    linear-gradient(90deg, rgba(6, 7, 10, 0.12), rgba(6, 7, 10, 0.38)),
    url("${item.backdrop}")
  `;
  elements.detailsMeta.innerHTML = "";

  buildFeaturedMeta(item).forEach((entry) => {
    const span = document.createElement("span");
    span.className = "pill";
    span.textContent = entry;
    elements.detailsMeta.appendChild(span);
  });
}

function mergeMediaDetails(item, details) {
  return {
    ...item,
    overview: details.overview || item.overview,
    genres: Array.isArray(details.genres) && details.genres.length
      ? details.genres.map((genre) => genre.name).filter(Boolean)
      : item.genres,
    rating: details.vote_average ? Number(details.vote_average).toFixed(1) : item.rating,
    year: (details.release_date || details.first_air_date || item.year || "").slice(0, 4),
    cast: Array.isArray(details.credits && details.credits.cast)
      ? details.credits.cast.slice(0, 5).map((actor) => actor.name).filter(Boolean)
      : item.cast,
  };
}

function buildCastLine(cast) {
  if (!Array.isArray(cast) || !cast.length) {
    return "Cast non disponibile.";
  }

  return `Cast: ${cast.join(", ")}`;
}

async function setupTvControls(item) {
  elements.tvControls.classList.add("active");
  elements.seasonSelect.innerHTML = "";
  elements.episodeSelect.innerHTML = "";

  try {
    const details = await fetchJson(`/tv/${item.id}`, { language: "it-IT" });
    const seasons = (details.seasons || []).filter((season) => season.season_number > 0);

    if (!seasons.length) {
      updatePlayerHeader(item.title, "Nessuna stagione disponibile.");
      return;
    }

    seasons.forEach((season) => {
      const option = document.createElement("option");
      option.value = String(season.season_number);
      option.textContent = `Stagione ${season.season_number}`;
      elements.seasonSelect.appendChild(option);
    });

    let currentEpisodes = [];

    const playEpisode = (seasonNumber, episodeNumber) => {
      const selectedEpisode = currentEpisodes.find(
        (episode) => String(episode.episode_number) === String(episodeNumber)
      );
      const subtitle = selectedEpisode && selectedEpisode.name
        ? `Stagione ${seasonNumber} | Episodio ${episodeNumber} | ${selectedEpisode.name}`
        : `Stagione ${seasonNumber} | Episodio ${episodeNumber}`;

      activatePlayer(buildTvUrl(item.id, seasonNumber, episodeNumber), item.title, subtitle);

      if (window.umami) {
        window.umami.track("episode", {
          serie_id: item.id,
          stagione: seasonNumber,
          episodio: episodeNumber,
        });
      }
    };

    const loadEpisodes = async (seasonNumber) => {
      const seasonData = await fetchJson(`/tv/${item.id}/season/${seasonNumber}`, {
        language: "it-IT",
      });

      currentEpisodes = seasonData.episodes || [];
      elements.episodeSelect.innerHTML = "";

      currentEpisodes.forEach((episode) => {
        const option = document.createElement("option");
        option.value = String(episode.episode_number);
        option.textContent = `Ep ${episode.episode_number}: ${episode.name}`;
        elements.episodeSelect.appendChild(option);
      });

      if (!currentEpisodes.length) {
        updatePlayerHeader(item.title, `Nessun episodio per la stagione ${seasonNumber}.`);
        return;
      }

      const firstEpisodeNumber = String(currentEpisodes[0].episode_number);
      elements.episodeSelect.value = firstEpisodeNumber;
      playEpisode(seasonNumber, firstEpisodeNumber);
    };

    elements.seasonSelect.onchange = async () => {
      await loadEpisodes(elements.seasonSelect.value);
    };

    elements.episodeSelect.onchange = () => {
      playEpisode(elements.seasonSelect.value, elements.episodeSelect.value);
    };

    await loadEpisodes(elements.seasonSelect.value);
  } catch (error) {
    console.error("Errore durante il caricamento della serie:", error);
    elements.tvControls.classList.remove("active");
    updatePlayerHeader(item.title, "Serie non disponibile.");
  }
}

function activatePlayer(url, title, subtitle) {
  setWatchSectionVisible(true);
  elements.playerFrame.src = url;
  elements.playerFrameWrap.classList.add("is-active");
  elements.downloadContainer.classList.add("active");
  elements.downloadLink.href = url;
  updatePlayerHeader(title, subtitle);
  elements.watchArea.scrollIntoView({ behavior: "smooth", block: "start" });
}

function updatePlayerHeader(title, subtitle) {
  elements.playerTitle.textContent = title;
  elements.playerSubtitle.textContent = subtitle;
}

function buildPlayerSubtitle(item) {
  const meta = [item.label];

  if (item.year) {
    meta.push(item.year);
  }

  if (item.genres[0]) {
    meta.push(item.genres[0]);
  }

  return meta.join(" | ");
}

function buildMovieUrl(id) {
  return `https://vixsrc.to/movie/${id}?lang=it`;
}

function buildTvUrl(id, season, episode) {
  return `https://vixsrc.to/tv/${id}/${season}/${episode}?lang=it`;
}

function createEmptyState(message) {
  const emptyState = document.createElement("div");
  emptyState.className = "empty-state";
  emptyState.textContent = message;
  return emptyState;
}

function setHomeSectionsVisible(isVisible) {
  elements.homeSections.hidden = !isVisible;
}

function setResultsSectionVisible(isVisible) {
  elements.resultsSection.hidden = !isVisible;
}

function setWatchSectionVisible(isVisible) {
  elements.watchArea.hidden = !isVisible;
}

function resetToHome() {
  elements.searchInput.value = "";
  clearSearchResults();
  state.searchResults = [];
  closeDetailsPanel();

  setHomeSectionsVisible(true);
  setResultsSectionVisible(false);
  setWatchSectionVisible(false);
  resetPlayerState();

  const homeItem = state.popularItems[0];
  if (homeItem) {
    setFeatured(homeItem);
  } else {
    setHeroFallback();
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function clearSearchResults() {
  elements.results.innerHTML = "";
  elements.resultsSummary.textContent = "";
}

function resetPlayerState() {
  elements.tvControls.classList.remove("active");
  elements.seasonSelect.innerHTML = "";
  elements.episodeSelect.innerHTML = "";
  elements.downloadContainer.classList.remove("active");
  elements.downloadLink.href = "#";
  elements.playerFrame.src = "";
  elements.playerFrameWrap.classList.remove("is-active");
  elements.playerTitle.textContent = "Player";
  elements.playerSubtitle.textContent = "";
}

function dedupeById(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = `${item.mediaType}-${item.id}`;
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function truncate(value, maxLength) {
  if (!value) {
    return "";
  }

  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1).trim()}...`;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function isBraveBrowser() {
  if (navigator.brave && typeof navigator.brave.isBrave === "function") {
    try {
      return await navigator.brave.isBrave();
    } catch (error) {
      console.warn("Controllo Brave non disponibile:", error);
    }
  }

  return navigator.userAgent.toLowerCase().includes("brave");
}
