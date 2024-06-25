function navigateProfile() {
  window.location.href = "/client/profile/profile.html";
}

function openPage(pageName, elmnt, color) {
  // Hide all elements with class="tabcontent" by default
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Remove the background color of all tablinks/buttons
  tablinks = document.getElementsByClassName("tablink");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].style.backgroundColor = "";
  }

  // Show the specific tab content
  document.getElementById(pageName).style.display = "block";

  // Add the specific color to the button used to open the tab content
  elmnt.style.backgroundColor = color;
}

// Get the element with id="defaultOpen" and click on it
document.getElementById("defaultOpen").click();

const results = document.getElementById("results");

async function searchSongs(value) {
  const term = value;
  try {
    results.classList.add("hideResults");
    if (!term) {
      return;
    }
    const response = await fetch(`http://localhost:8000/search/${term}`);
    if (response.ok) {
      const songs = await response.json();
      results.innerHTML = "";
      results.classList.remove("hideResults");
      songs.forEach((song) => {
        const searchItem = document.createElement("div");
        searchItem.className = "search-item";
        searchItem.innerHTML = `
            <img src="${song.cover_path}" class="search-song-img" alt="Song Cover" />
            <div class="song-info">
              <p class="song-title">${song.title}</p>
              <p class="artist-name">${song.artist}</p>
            </div>
            `;
        searchItem.onclick = () => {
          playSongById(song.song_id);
        };
        results.appendChild(searchItem); // Append the searchItem to the results container
      });
    } else {
      const errorText = await response.text();
      alert(`Failed to search: ${errorText}`);
      results.innerHTML = ""; // Clear previous results on error
    }
  } catch (error) {
    console.error(error);
    alert("An error occurred while fetching the search results.");
    results.innerHTML = ""; // Clear previous results on error
    results.classList.add("hideResults");
  }
}
