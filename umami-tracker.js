window.tracker = {
  // Helper per creare dati analitici coerenti e uniformi
  getPayload: (item, extra = {}) => {
    try {
      return {
        titolo: item.title || "Sconosciuto",
        tipo: item.mediaType === "movie" ? "Film" : "Serie TV",
        genere: item.genres?.[0] || "Non specificato",
        anno: item.year || "N/A",
        rating: item.rating || "0",
        ...extra
      };
    } catch (e) {
      return { errore: "dati_mancanti" };
    }
  },

  trackLogin: (username) => {
    if (window.umami) {
      window.umami.identify({ username: username });
      window.umami.track("login_effettuato", { utente: username });
    }
  },

  trackSearch: (query, risultatiCount) => {
    if (window.umami) {
      window.umami.track("ricerca_effettuata", { 
        query: query, 
        risultati_trovati: risultatiCount 
      });
    }
  },

  trackViewDetails: (item) => {
    if (window.umami) {
      window.umami.track("dettagli_visualizzati", window.tracker.getPayload(item));
    }
  },

  trackPlay: (item) => {
    if (window.umami) {
      window.umami.track("riproduzione_avviata", window.tracker.getPayload(item));
    }
  },

  trackEpisode: (item, stagione, episodio) => {
    if (window.umami) {
      window.umami.track("episodio_avviato", window.tracker.getPayload(item, {
        stagione: stagione,
        episodio: episodio
      }));
    }
  }
};
