const username = document.getElementById("username");
const email = document.getElementById("email");
const date = document.getElementById("date-registered");

const songList = document.getElementById("user-uploads");
const userId = sessionStorage.getItem("currentuser_id");
window.onload = () => {
  fetch(`http://localhost:8000/users/${userId}`)
    .then((response) => response.json())
    .then((user) => {
      username.textContent = user.username;
      email.textContent = user.email;
      date.textContent = user.date_registered;
    });
  fetch(`http://localhost:8000/songs/user/${userId}`)
    .then((response) => response.json())
    .then((songs) => {
      allSongs = songs;
      const mostRecent = document.getElementById("most-recent");
      mostRecent.src = songs[0].cover_path;
      const songList = document.getElementById("user-uploads");
      // Create a Promise for each song to load its metadata
      const songPromises = songs.map((song, index) => {
        return new Promise((resolve) => {
          const audio = new Audio(song.audio_path);
          audio.addEventListener("loadedmetadata", () => {
            const audioDuration = audio.duration;
            const songItem = document.createElement("li");
            songItem.innerHTML = `
            <button class="more" id="more" onclick="openDropDown(${index})"><img src="/images/button/more.png" alt="More" /></button>
            <div class="dropdown-content hidden" id="dropdown" data-dropdown-index="${index}">
              <p onclick="deleteSong(${song.song_id})">Delete</p> 
            </div>
            <img src="${song.cover_path}" alt="list cover" />
            <div class="song-details" data-song-index="${index}" onclick="handleSongClick(${index})">
              <p>${song.artist} -</p>
              <p>${song.title}</p>
              <p class="song-duration">${formatTime(audioDuration)}</p>
            </div>`;
            // Resolve the Promise with the songItem
            resolve(songItem);
          });
        });
      });

      // Wait for all songs to load their metadata
      Promise.all(songPromises).then((songItems) => {
        // Append each songItem to the DOM in order
        songItems.forEach((songItem) => {
          songList.appendChild(songItem);
        });
      });
    });
};

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

function deleteSong(song_id) {
  fetch(`http://localhost:8000/songs/delete/${song_id}`, {
    method: "DELETE",
  })
    .then(() => {
      alert("Song deleted");
      window.location.reload();
    })
    .catch(() => {
      alert("An error occurred while deleting the song");
    });
}

function formatTime(time) {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

function navigateHome() {
  window.location.href = "/client/home/home.html";
}
