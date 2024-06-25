async function fetchSongs() {
  try {
    const response = await fetch("http://localhost:8000/songs");
    const songs = await response.json();
    allSongs = songs;
    const songsContainer = document.getElementById("songs-container");
    songsContainer.innerHTML = "";
    songs.forEach((song, index) => {
      const songElement = document.createElement("div");
      songElement.className = "song-item";
      songElement.innerHTML = `
          <img src="${song.cover_path}" alt="Artwork" class="img-cover" data-song-index="${index}" onclick="handleSongClick(${index})">
          <p>${song.title}</p>
          <p class="song-artist">${song.artist}</p>
        `;
      songsContainer.appendChild(songElement);
    });
  } catch {
    alert("An error occurred while loading the songs");
  }
}

async function fetchPlaylists() {
  const response = await fetch(`http://localhost:8000/playlist/user/${sessionStorage.getItem("currentuser_id")}`);
  const playlists = await response.json();
  const playlistContainer = document.getElementById("playlist-container");
  playlistContainer.innerHTML = "";
  playlists.forEach((playlist) => {
    const playlistElement = document.createElement("div");
    playlistElement.className = "song-item";
    playlistElement.innerHTML = `
          <img src="${playlist.cover_path}" alt="Playlist Cover" class="img-cover" class="img-cover" onclick="navigateToPlaylistInfo('${playlist.playlist_id}')">
          <p>${playlist.title}</p>
        `;
    playlistContainer.appendChild(playlistElement);
  });
}

function initializeApp() {
  return Promise.all([fetchSongs(), fetchPlaylists()]);
}

window.onload = function () {
  initializeApp().catch(() => {
    alert("An error occurred while initializing the app");
  });
};

function navigateToPlaylistInfo(playlistId) {
  window.location.href = `/client/playlist/playlist.html?playlistId=${playlistId}`;
}
