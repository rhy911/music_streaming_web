document.getElementById("upload-form").addEventListener("submit", async function (event) {
  event.preventDefault();

  document.getElementById("loadingIndicator").style.display = "block";

  const music = document.getElementById("upload-music").files[0];
  const title = document.getElementById("upload-title").value;
  const artist = document.getElementById("upload-artist").value;
  const tags = document.getElementById("upload-tags").value;
  const description = document.getElementById("upload-description").value;
  const artwork = document.getElementById("upload-artwork").files[0];
  const userId = sessionStorage.getItem("currentuser_id");

  const formData = new FormData();
  formData.append("music", music);
  formData.append("title", title);
  formData.append("artist", artist);
  formData.append("tags", tags);
  formData.append("description", description);
  formData.append("artwork", artwork);
  formData.append("userId", userId);

  try {
    const response = await fetch("http://localhost:8000/upload", {
      method: "POST",
      body: formData,
    });

    document.getElementById("loadingIndicator").style.display = "none";

    if (response.ok) {
      alert("Upload successful");
      window.location.reload();
    } else {
      const errorData = await response.json();
      alert(`Upload failed: ${errorData.message || "Unknown error"}`);
    }
  } catch (error) {
    document.getElementById("loadingIndicator").style.display = "none";
    alert("An error occurred while uploading");
  }
});

document.getElementById("create-playlist-form").addEventListener("submit", async function (event) {
  event.preventDefault();

  document.getElementById("loadingIndicator").style.display = "block";

  const title = document.getElementById("playlist-title").value;
  const description = document.getElementById("playlist-description").value;
  const cover = document.getElementById("playlist-cover").files[0];
  const userId = sessionStorage.getItem("currentuser_id");

  console.log(title, description, cover, userId);

  const formData = new FormData();
  formData.append("title", title);
  formData.append("description", description);
  formData.append("cover", cover);
  formData.append("userId", userId);
  console.log(formData);
  try {
    const response = await fetch("http://localhost:8000/createPlaylist", {
      method: "POST",
      body: formData,
    });

    document.getElementById("loadingIndicator").style.display = "none";

    if (response.ok) {
      alert("Playlist created");
      window.location.reload();
    } else {
      const errorData = await response.json();
      alert(`Failed to create playlist: ${errorData.message || "Unknown error"}`);
      document.getElementById("loadingIndicator").style.display = "none";
    }
  } catch (error) {
    alert("An error occurred while creating playlist");
    document.getElementById("loadingIndicator").style.display = "none";
  }
});
