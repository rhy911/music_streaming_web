const playBtn = document.getElementById("play-btn");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const currentTimeElement = document.getElementById("current-time");
const durationTimeElement = document.getElementById("duration-time");
const timerSlider = document.getElementById("timer");
const volumeSlider = document.getElementById("volume-slider");

const title = document.getElementById("title");
const artwork = document.getElementById("artwork");
const artist = document.getElementById("artist");

const audio = new Audio();
let isPlaying = false;
let allSongs = [];
let currentIndex = null;
let currentSongId = null;
let pastVolume = volumeSlider.value / 100;

function playSongById(songId) {
  currentSongId = songId;
  currentIndex = allSongs.findIndex((song) => song.song_id === currentSongId);
  fetch(`http://localhost:8000/songs/${currentSongId}`)
    .then((response) => response.json())
    .then((song) => {
      audio.src = song.audio_path;
      title.textContent = song.title;
      artwork.src = song.cover_path;
      artist.textContent = song.artist;
      isPlaying = true;
      updatePlayBtn();
      currentTimeElement.textContent = "00:00";
      timerSlider.value = 0;
      audio.play();
    })
    .catch(() => {
      alert("An error occurred while loading the song");
    });
}

function nextSong() {
  if (allSongs.length > 0 && currentSongId !== null) {
    const nextIndex = (currentIndex + 1) % allSongs.length;
    const nextSongId = allSongs[nextIndex].song_id;
    playSongById(nextSongId);
  }
}

function prevSong() {
  if (allSongs.length > 0 && currentSongId !== null) {
    const prevIndex = (currentIndex - 1 + allSongs.length) % allSongs.length;
    const prevSongId = allSongs[prevIndex].song_id;
    playSongById(prevSongId);
  }
}

function updatePlayBtn() {
  const img = playBtn.querySelector("img");
  img.src = isPlaying ? "/images/button/pause.png" : "/images/button/play.png";
}

function playSong() {
  isPlaying ? audio.pause() : audio.play();
  isPlaying = !isPlaying;
  updatePlayBtn();
}

function formatTime(time) {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

audio.addEventListener("timeupdate", () => {
  if (isFinite(audio.duration)) {
    currentTimeElement.textContent = formatTime(audio.currentTime);
    const sliderValue = (audio.currentTime / audio.duration) * 100;
    timerSlider.value = sliderValue;
  }
});

audio.addEventListener("loadedmetadata", () => {
  durationTimeElement.textContent = formatTime(audio.duration);
});

audio.addEventListener("ended", nextSong);

timerSlider.addEventListener("input", () => {
  const time = (timerSlider.value / 100) * audio.duration;
  audio.currentTime = time;
});

volumeSlider.addEventListener("input", () => {
  const volumeLevel = volumeSlider.value / 100;
  audio.volume = volumeLevel;
  pastVolume = volumeLevel;
});

function volumePressed() {
  const volumeBtn = document.getElementById("volume-btn");
  if (audio.volume != 0) {
    audio.volume = 0;
    volumeSlider.value = 0;
    volumeBtn.src = "/images/button/mute.png";
  } else {
    audio.volume = pastVolume;
    volumeSlider.value = pastVolume * 100;
    volumeBtn.src = "/images/button/volume.png";
  }
}

function handleSongClick(index) {
  console.log(`index clicked: ${index}`);
  const currentSongId = allSongs[index].song_id;
  playSongById(currentSongId);
}
