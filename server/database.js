import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

// Database Connection Pool
const pool = mysql
  .createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  })
  .promise();

// User Functions

// Create a new user
export async function createUser(username, email, password) {
  try {
    console.log(`Creating user with username: ${username}, email: ${email}`);
    const [result] = await pool.query("INSERT INTO users (username, email, password) VALUES (?, ?, ?)", [username, email, password]);
    const id = result.insertId;
    console.log(`User created with id: ${id}`);
    return getUser(id);
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

// Get all users
export async function getAllUsers() {
  try {
    console.log("Fetching all users");
    const [rows] = await pool.query("SELECT * FROM users");
    console.log(`Fetched ${rows.length} users`);
    return rows;
  } catch (error) {
    console.error("Error getting all users:", error);
    throw error;
  }
}

// Get user by ID
export async function getUser(id) {
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE user_id = ?", [id]);
    return rows[0];
  } catch (error) {
    throw error;
  }
}

// Get user by username
export async function getUserByName(username) {
  try {
    console.log(`Fetching user with username: ${username}`);
    const [rows] = await pool.query("SELECT * FROM users WHERE username = ?", [username]);
    console.log(`Fetched user: ${JSON.stringify(rows[0])}`);
    return rows[0];
  } catch (error) {
    console.error(`Error getting user with username ${username}:`, error);
    throw error;
  }
}

// Get user ID by email
export async function getUserIdByEmail(email) {
  try {
    console.log(`Fetching user id by email: ${email}`);
    const [rows] = await pool.query("SELECT user_id FROM users WHERE email = ?", [email]);
    if (rows.length > 0) {
      console.log(`Fetched user id: ${rows[0].user_id}`);
      return rows[0].user_id;
    }
    console.log("No user found with this email");
    return null;
  } catch (error) {
    console.error(`Error getting user id by email ${email}:`, error);
    throw error;
  }
}

// Authenticate user
export async function authenticateUser(username, password) {
  try {
    console.log(`Authenticating user with username: ${username}`);
    const user = await getUserByName(username);
    if (!user) {
      console.log("User not found");
      return null;
    }

    const match = (await password) === user.password;
    if (match) {
      console.log("Password match");
      return user;
    } else {
      console.log("Password doesn't match");
      return null;
    }
  } catch (error) {
    console.error(`Error authenticating user with username ${username}:`, error);
    throw error;
  }
}

// Update user password
export async function updatePassword(email, password) {
  try {
    console.log(`Updating password for email: ${email}`);
    const userId = await getUserIdByEmail(email);
    if (!userId) {
      console.log("User not found");
      return false;
    }

    const [rows] = await pool.query("UPDATE users SET password = ? WHERE user_id = ?", [password, userId]);

    if (rows.affectedRows > 0) {
      console.log(`Password updated for email: ${email}`);
      return true;
    } else {
      console.log(`No user found with email: ${email}`);
      return false;
    }
  } catch (error) {
    console.error(`Error updating password for email ${email}:`, error);
    throw error;
  }
}

// Song Functions

// Upload a song
export async function uploadSongs(title, artist, userId, music, description, artwork, tags) {
  try {
    console.log(`Uploading song for user: ${userId}`);
    const [result] = await pool.query("INSERT INTO songs (title, artist, user_id, audio_path, description, cover_path, tags) VALUES (?, ?, ?, ?, ?, ?, ?)", [
      title,
      artist,
      userId,
      music,
      description,
      artwork,
      tags,
    ]);
    const id = result.insertId;
    console.log(`Song uploaded with id: ${id}`);
  } catch (error) {
    console.error("Error uploading song:", error);
    throw error;
  }
}

// Get song by ID
export async function getSongById(songId) {
  try {
    console.log(`Fetching song with id: ${songId}`);
    const [rows] = await pool.query("SELECT * FROM songs WHERE song_id = ?", [songId]);
    return rows[0];
  } catch (error) {
    console.error(`Error getting song with id ${songId}:`, error);
    throw error;
  }
}

// Get all songs
export async function fetchAllSongs() {
  try {
    const [rows] = await pool.query("SELECT * FROM songs ORDER BY song_id DESC");
    return rows;
  } catch (error) {
    console.error("Error getting all songs:", error);
    throw error;
  }
}

// Get songs by user ID
export async function getSongsByUser(userId) {
  try {
    console.log(`Fetching songs for user: ${userId}`);
    const [rows] = await pool.query("SELECT * FROM songs WHERE user_id = ? ORDER BY song_id DESC", [userId]);
    console.log(`Fetched ${rows.length} songs`);
    return rows;
  } catch (error) {
    console.error(`Error getting songs for user ${userId}:`, error);
    throw error;
  }
}

// Playlist Functions

// Create a playlist
export async function createPlaylist(userId, title, description, cover) {
  try {
    const [result] = await pool.query("INSERT INTO playlists (user_id, title, description, cover_path) VALUES (?, ?, ?, ?)", [userId, title, description, cover]);
    return result;
  } catch (error) {
    throw error;
  }
}

export async function addSongToPlaylist(songId, playlistId) {
  try {
    const [result] = await pool.query("INSERT INTO has (song_id, playlist_id) VALUES (?, ?)", [songId, playlistId]);
    return result;
  } catch (error) {
    throw error;
  }
}

// Get playlist list by user ID
export async function getPlaylistList(userId) {
  try {
    console.log(`Fetching playlist for user: ${userId}`);
    const [rows] = await pool.query("SELECT * FROM playlists WHERE user_id = ?", [userId]);
    console.log(`Fetched ${rows.length} playlists`);
    return rows;
  } catch (error) {
    throw error;
  }
}

// Get playlist by ID
export async function getPlayListById(playlistId) {
  try {
    const [rows] = await pool.query("SELECT * FROM playlists WHERE playlist_id = ?;", [playlistId]);
    return rows[0];
  } catch (error) {
    throw error;
  }
}

// Get songs in a playlist
export async function getPlaylistSongs(playlistId) {
  try {
    console.log(`Fetching songs for playlist: ${playlistId}`);
    const [rows] = await pool.query("SELECT songs.* FROM songs JOIN has ON songs.song_id = has.song_id JOIN playlists ON has.playlist_id = playlists.playlist_id WHERE playlists.playlist_id = ?;", [
      playlistId,
    ]);
    return rows;
  } catch (error) {
    throw error;
  }
}

// Search Function

// Get search results
export async function getSearchData(searchTerm) {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM songs WHERE (title LIKE ? OR artist LIKE ? OR tags LIKE ?) ORDER BY CASE WHEN title Like ? THEN 1 WHEN artist LIKE ? THEN 2 WHEN tags LIKE ? THEN 3 ELSE 4 END;",
      [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]
    );
    return rows;
  } catch (error) {
    console.error("Error getting search data:", error);
    throw error;
  }
}
