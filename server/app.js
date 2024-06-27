import express from "express";
import cors from "cors";
import multer, { memoryStorage } from "multer";
import { v4 as uuid } from "uuid";
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import {
  getAllUsers,
  getUser,
  createUser,
  authenticateUser,
  updatePassword,
  uploadSongs,
  getSongById,
  fetchAllSongs,
  getSearchData,
  getSongsByUser,
  getPlaylistList,
  getPlayListById,
  getPlaylistSongs,
  createPlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
  deleteSong,
} from "./database.js";
import { firebaseConfig } from "./firebase_config.js";

// Initialize Firebase app
const firebase = initializeApp(firebaseConfig);

const app = express();
app.use(express.json());
app.use(cors());
const port = 8000;

// Configure Firebase Storage
const storage = getStorage(firebase);
const upload = multer({ storage: multer.memoryStorage() });

app.post("/users", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    console.log(`Creating user with username: ${username}, email: ${email}`);
    const user = await createUser(username, email, password);
    console.log(`User created with id: ${user.user_id}`);
    res.status(201).send(user);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).send({ message: "Internal server error" });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    console.log(`Authenticating user with username: ${username}`);
    const user = await authenticateUser(username, password);
    if (user) {
      console.log("Login successfully with user:", user.user_id);
      res.status(200).send({ message: "Login Successfully", user_id: user.user_id });
    } else {
      console.log("Invalid username or password");
      res.status(401).send({ message: "Invalid username or password" });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).send({ message: "Internal server error" });
  }
});

app.post("/reset-password", async (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) {
    console.log("Email and new password are required");
    return res.status(400).json({ message: "Email and new password are required" });
  }
  try {
    console.log(`Resetting password for email: ${email}`);
    const success = await updatePassword(email, newPassword);
    if (success) {
      console.log("Password reset successful");
      res.status(200).json({ message: "Password reset successful" });
    } else {
      console.log("User not found");
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/users", async (req, res) => {
  try {
    console.log("Fetching all users");
    const users = await getAllUsers();
    console.log(`Fetched ${users.length} users`);
    res.send(users);
  } catch (error) {
    console.error("Error getting all users:", error);
    res.status(500).send({ message: "Internal server error" });
  }
});

app.get("/users/:user_id", async (req, res) => {
  const id = req.params.user_id;
  try {
    console.log(`Fetching user with id: ${id}`);
    const user = await getUser(id);
    console.log(`Fetched user: ${JSON.stringify(user)}`);
    res.send(user);
  } catch (error) {
    console.error(`Error getting user with id ${id}:`, error);
    res.status(500).send({ message: "Internal server error" });
  }
});

app.post(
  "/upload",
  upload.fields([
    { name: "music", maxCount: 1 },
    { name: "artwork", maxCount: 1 },
  ]),
  async (req, res) => {
    const { title, artist, tags, description, userId } = req.body;
    const musicFile = req.files?.music?.[0];
    const artworkFile = req.files?.artwork?.[0];

    try {
      const uploadToFirebase = async (file, path) => {
        const storageRef = ref(storage, path);
        const snapshot = await uploadBytes(storageRef, file.buffer);
        return getDownloadURL(snapshot.ref);
      };
      // Upload audio file to Firebase Storage
      const musicUrl = musicFile ? await uploadToFirebase(musicFile, `music/${uuid()}-${musicFile.originalname}`) : null;
      // Upload artwork to Firebase Storage
      const artworkUrl = artworkFile ? await uploadToFirebase(artworkFile, `artwork/${uuid()}-${artworkFile.originalname}`) : null;
      // Store the file URLs and other information in the database
      await uploadSongs(title, artist, userId, musicUrl, description, artworkUrl, tags);

      console.log("Uploading audio file:", musicUrl);
      console.log("Uploading artwork:", artworkUrl);
      console.log(`Title: ${title}, Artist: ${artist}, Tags: ${tags}, Description: ${description}`);

      res.status(200).json({ message: "Upload successful" });
    } catch (error) {
      console.error("Error uploading:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

app.get("/songs", async (req, res) => {
  try {
    const songs = await fetchAllSongs();
    res.send(songs);
  } catch (error) {
    console.error("Error getting all songs:", error);
    res.status(500).send({ message: "Internal server error" });
  }
});

app.get("/songs/:song_id", async (req, res) => {
  const id = req.params.song_id;
  try {
    const song = await getSongById(id);
    res.send(song);
    console.log(`Fetched song: ${JSON.stringify(song.title)}`);
  } catch {
    console.error(`Error getting song with id ${id}:`, error);
    res.status(500).send({ message: "Internal server error" });
  }
});

app.get("/songs/user/:user_id", async (req, res) => {
  const id = req.params.user_id;
  try {
    const songs = await getSongsByUser(id);
    res.send(songs);
  } catch {
    console.error(`Error getting songs for user with id ${id}:`, error);
    res.status(500).send({ message: "Internal server error" });
  }
});

app.delete("/songs/delete/:song_id", async (req, res) => {
  const id = req.params.song_id;
  try {
    const song = await getSongById(id);
    const audioRef = ref(storage, song.audio_path);
    const coverRef = ref(storage, song.cover_path);
    console.log(`Deleting song with id: ${id}`);

    await deleteSong(id);
    await deleteObject(audioRef);
    await deleteObject(coverRef);
    console.log("Success");
    res.status(200).send({ message: "Song deleted" });
  } catch (error) {
    console.error(`Error deleting song with id ${id}:`, error);
    res.status(500).send({ message: "Internal server error" });
  }
});

app.post("/createPlaylist", upload.single("cover"), async (req, res) => {
  const { title, description, userId } = req.body;
  const coverFile = req.file;

  console.log(`Creating playlist for user: ${userId}`);
  try {
    const uploadToFirebase = async (file, path) => {
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file.buffer);
      return getDownloadURL(snapshot.ref);
    };
    // Upload artwork to Firebase Storage
    const coverUrl = coverFile ? await uploadToFirebase(coverFile, `artwork/${uuid()}-${coverFile.originalname}`) : null;
    const playlist = await createPlaylist(userId, title, description, coverUrl);
    res.status(200).json({ message: `Created playlist: ${playlist.title}` });
  } catch (error) {
    console.error("Error creating playlist:", error);
    res.status(500).send({ message: "Internal server error" });
  }
});

app.post("/playlist/:playlist_id/add/:song_id", async (req, res) => {
  const { playlist_id, song_id } = req.params;
  const playlistId = parseInt(playlist_id);
  const songId = parseInt(song_id);
  try {
    console.log(`Adding song with id ${songId} to playlist with id ${playlistId}`);
    await addSongToPlaylist(songId, playlistId);
    res.status(200).send({ message: "Song added to playlist" });
  } catch (error) {
    console.error(`Error adding song to playlist:`, error);
    res.status(500).send({ message: "Internal server error" });
  }
});

app.delete("/playlist/:playlist_id/remove/:song_id", async (req, res) => {
  const { playlist_id, song_id } = req.params;
  const playlistId = parseInt(playlist_id);
  const songId = parseInt(song_id);
  try {
    console.log(`Removing song with id ${songId} from playlist with id ${playlistId}`);
    await removeSongFromPlaylist(songId, playlistId);
    res.status(200).send({ message: "Song removed from playlist" });
  } catch (error) {
    console.error(`Error removing song from playlist:`, error);
    res.status(500).send({ message: "Internal server error" });
  }
});

app.get("/playlist/user/:user_id", async (req, res) => {
  const id = req.params.user_id;
  try {
    const playlists = await getPlaylistList(id);
    res.send(playlists);
  } catch {
    console.error(`Error getting playlists for user with id ${id}:`, error);
    res.status(500).send({ message: "Internal server error" });
  }
});

app.get("/playlist/:playlist_id", async (req, res) => {
  const id = req.params.playlist_id;
  try {
    const playlist = await getPlayListById(id);
    res.send(playlist);
  } catch {
    console.error(`Error getting playlist with id ${id}:`, error);
    res.status(500).send({ message: "Internal server error" });
  }
});

app.get("/playlist/:playlist_id/songs", async (req, res) => {
  const id = req.params.playlist_id;
  try {
    console.log(`Fetching songs for playlist with id: ${id}`);
    const playlist = await getPlaylistSongs(id);
    res.send(playlist);
  } catch (error) {
    console.error(`Error getting songs for playlist with id ${id}:`, error);
    res.status(500).send({ message: "Internal server error" });
  }
});

app.get("/search/:term", async (req, res) => {
  const term = req.params.term;
  if (!term || typeof term !== "string") {
    console.log("Invalid search term");
    return res.status(400).send({ message: "Invalid search term" });
  }
  try {
    const data = await getSearchData(term.trim()); // Trim to remove leading/trailing whitespace
    res.json(data); // Explicitly sending JSON response
  } catch (error) {
    console.error("Error searching:", error);
    res.status(500).send({ message: "Internal server error" });
  }
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  res.status(500).send("Something broke!");
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
