import mysql from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
}).promise()

export async function createUser(username, email, password) {
    try {
        console.log(`Creating user with username: ${username}, email: ${email}`);
        const [result] = await pool.query("INSERT INTO users (username, email, password) VALUES (?, ?, ?)", [username, email, password])
        const id = result.insertId
        console.log(`User created with id: ${id}`);
        return getUser(id);
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
}

export async function getAllUsers() {
    try {
        console.log('Fetching all users');
        const [rows] = await pool.query("SELECT * FROM users")
        console.log(`Fetched ${rows.length} users`);
        return rows
    } catch (error) {
        console.error('Error getting all users:', error);
        throw error;
    }
}

export async function getUser(id) {
    try {
        console.log(`Fetching user with id: ${id}`);
        const [rows] = await pool.query("SELECT * FROM users WHERE user_id = ?", [id])
        console.log(`Fetched user: ${JSON.stringify(rows[0])}`);
        return rows[0]
    } catch (error) {
        console.error(`Error getting user with id ${id}:`, error);
        throw error;
    }
}

export async function getUserByName(username) {
    try {
        console.log(`Fetching user with username: ${username}`);
        const [rows] = await pool.query("SELECT * FROM users WHERE username = ?", [username])
        console.log(`Fetched user: ${JSON.stringify(rows[0])}`);
        return rows[0]
    } catch (error) {
        console.error(`Error getting user with username ${username}:`, error);
        throw error;
    }
}

export async function getUserIdByEmail(email) {
    try {
        console.log(`Fetching user id by email: ${email}`);
        const [rows] = await pool.query("SELECT user_id FROM users WHERE email = ?", [email]);
        if (rows.length > 0) {
            console.log(`Fetched user id: ${rows[0].user_id}`);
            return rows[0].user_id;
        }
        console.log('No user found with this email');
        return null;
    } catch (error) {
        console.error(`Error getting user id by email ${email}:`, error);
        throw error;
    }
}

export async function authenticateUser(username, password) {
    try {
        console.log(`Authenticating user with username: ${username}`);
        const user = await getUserByName(username);
        if (!user) {
            console.log('User not found');
            return null;
        }

        const match = await password === user.password;
        if (match) {
            console.log('Password match');
            return user;
        } else {
            console.log('Password doesnt match');
            return null;
        }
    } catch (error) {
        console.error(`Error authenticating user with username ${username}:`, error);
        throw error;
    }
}

export async function updatePassword(email, password) {
    try {
        console.log(`Updating password for email: ${email}`);
        const userId = await getUserIdByEmail(email);
        if (!userId) {
            console.log('User not found');
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

export async function uploadSongs(title, artist, userId, music, description, artwork, tags) {
    try {
        console.log(`Uploading song for user: ${userId}`);
        const [result] = await pool.query("INSERT INTO songs (title, artist, user_id, audio_path, description, image_path, tags) VALUES (?, ?, ?, ?, ?, ?, ?)", [title, artist, userId, music, description, artwork, tags]);
        const id = result.insertId;
        console.log(`Song uploaded with id: ${id}`);
        return getSongById(id);
    } catch (error) {
        console.error('Error uploading song:', error);
        throw error;
    }
}


export async function getSongById(songId) {
    try {
        console.log(`Fetching song with id: ${songId}`);
        const [rows] = await pool.query("SELECT * FROM songs WHERE song_id = ?", [songId]);
        console.log(`Fetched song: ${JSON.stringify(rows[0])}`);
        return rows[0];
    } catch (error) {
        console.error(`Error getting song with id ${songId}:`, error);
        throw error;
    }
}

export async function getSongsByUser(userId) {
    try {
        console.log(`Fetching songs for user: ${userId}`);
        const [rows] = await pool.query("SELECT * FROM songs WHERE user_id = ?", [userId]);
        console.log(`Fetched ${rows.length} songs`);
        return rows;
    } catch (error) {
        console.error(`Error getting songs for user ${userId}:`, error);
        throw error;
    }
}
