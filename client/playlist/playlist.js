let chosenSongIndex = 0;

// Access the query string
const queryString = window.location.search;

// Parse the query string
const urlParams = new URLSearchParams(queryString);

// Get the playlistId parameter from the URL
const playlistId = urlParams.get("playlistId");

window.onload = function () {
  fetchPlaylistData();
};

function fetchPlaylistData() {
  fetch(`http://localhost:8000/playlist/${playlistId}`)
    .then((response) => response.json())
    .then((playlist) => {
      const playlistTitle = document.getElementById("playlist-title");
      playlistTitle.innerHTML = playlist.title;
      const playlistDescription = document.getElementById("playlist-description");
      playlistDescription.innerHTML = playlist.description;
      const playlistCover = document.getElementById("playlist-cover");
      playlistCover.src = playlist.cover_path;

      fetchSongs();
    });
}

async function fetchSongs() {
  try {
    await fetch(`http://localhost:8000/playlist/${playlistId}/songs`)
      .then((response) => response.json())
      .then(async (songs) => {
        allSongs = songs;
        const playlistSongsElement = document.getElementById("playlist-songs");
        playlistSongsElement.innerHTML = "";
        const songPromises = songs.map((song, index) => {
          return new Promise(async (resolve) => {
            const audio = new Audio(song.audio_path);
            audio.addEventListener("loadedmetadata", () => {
              const songElement = document.createElement("li");
              songElement.className = "playlist-item";
              songElement.innerHTML = `
            <button class="more" id="more" onclick="openDropDown(${index})"><img src="/images/button/more.png" alt="More" /></button>
            <div class="dropdown-content hidden" id="dropdown" data-dropdown-index="${index}">
              <p onclick="removeSong(${song.song_id}, ${playlistId})">Remove</p>  
            </div>
            <img src="${song.cover_path}" alt="Artwork" class="song-cover"/>
            <div class="song-info" data-song-index="${index}" onclick="handleSongClick(${index})">
              <p class="song-title">${song.title} - </p>
              <p class="song-artist">${song.artist}</p>
              <p class="song-duration">${formatTime(audio.duration)}</p>
            </div>`;
              resolve(songElement);
            });
          });
        });

        // Wait for all songs to process
        const songElements = await Promise.all(songPromises);
        songElements.forEach((songElement) => {
          playlistSongsElement.appendChild(songElement);
        });
      });
  } catch (error) {
    console.error("Failed to fetch songs:", error);
  }
}

function addSongs() {
  if (chosenSongIndex != 0) {
    fetch(`http://localhost:8000/playlist/${playlistId}/add/${chosenSongIndex}`, {
      method: "POST",
    })
      .then((response) => {
        if (response.ok) {
          fetchSongs();
          chosenSongIndex = 0;
          alert("Song added.");
        } else {
          alert("Failed to add song to playlist.");
        }
      })
      .catch((error) => {
        console.error(error);
        alert("An error occurred while adding the song to the playlist.");
      });
  }
}

const searchResults = document.getElementById("playlist-results");
const selectedSong = document.getElementById("selected-song");
async function searchSongsForPlaylist(value) {
  const term = value;
  try {
    searchResults.classList.add("hideResults");
    if (!term) {
      return;
    }
    const response = await fetch(`http://localhost:8000/search/${term}`);
    if (response.ok) {
      const songs = await response.json();
      searchResults.innerHTML = "";
      searchResults.classList.remove("hideResults");
      songs.forEach((song, index) => {
        const searchItem = document.createElement("div");
        searchItem.className = "search-item";
        searchItem.innerHTML = `
            <img src="${song.cover_path}" class="search-song-img" alt="Song Cover" />
            <div class="song-info" data-song-index="${index}">
              <p class="song-title">${song.title}</p>
              <p class="artist-name">${song.artist}</p>
            </div>
            `;
        searchItem.onclick = () => {
          chosenSongIndex = song.song_id;
          searchResults.classList.add("hideResults");
          selectedSong.textContent = `${song.title} - ${song.artist}`;
        };
        searchResults.appendChild(searchItem);
      });
    } else {
      const errorText = await response.text();
      alert(`Failed to search: ${errorText}`);
      searchResults.innerHTML = "";
    }
  } catch (error) {
    console.error(error);
    alert("An error occurred while fetching the search results.");
    searchResults.innerHTML = "";
    searchResults.classList.add("hideResults");
  }
}

function removeSong(songId, playlistId) {
  fetch(`http://localhost:8000/playlist/${playlistId}/remove/${songId}`, {
    method: "DELETE",
  })
    .then((response) => {
      if (response.ok) {
        fetchSongs();
        alert("Song removed.");
      } else {
        alert("Failed to remove song from playlist.");
      }
    })
    .catch((error) => {
      console.error(error);
      alert("An error occurred while removing the song from the playlist.");
    });
}

let dropdown = false;
function openDropDown(index) {
  const dropdownElement = document.querySelector(`div.dropdown-content[data-dropdown-index="${index}"]`);
  if (dropdown) {
    dropdownElement.classList.remove("hidden");
  } else {
    dropdownElement.classList.add("hidden");
  }
  dropdown = !dropdown;
}

function formatTime(time) {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

function navigateHome() {
  window.location.href = "/client/home/home.html";
}
