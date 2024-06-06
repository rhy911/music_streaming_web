import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { v4 as uuid } from 'uuid';
import {
    getAllUsers, getUser, createUser,
    authenticateUser, updatePassword, uploadSongs
} from './database.js';

const app = express();

app.use(express.json());
app.use(cors());
const port = 8000;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.mimetype.startsWith('audio/')) {
            cb(null, 'uploads/audios')
        } else if (file.mimetype.startsWith('image/')) {
            cb(null, 'uploads/images');
        } else {
            console.log(file.mimetype);
            cb({ error: 'Mime type not supported' })
        }
    },
    filename: (req, file, cb) => {
        const { originalname } = file;
        cb(null, `${uuid()}-${originalname}`);
    },
});

const upload = multer({ storage: storage, });

app.post("/users", async (req, res) => {
    const { username, email, password } = req.body;
    try {
        console.log(`Creating user with username: ${username}, email: ${email}`);
        const user = await createUser(username, email, password);
        console.log(`User created with id: ${user.user_id}`);
        res.status(201).send(user);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
});

app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        console.log(`Authenticating user with username: ${username}`);
        const user = await authenticateUser(username, password);
        if (user) {
            console.log('Login successfully with user_id:', user.user_id);
            res.status(200).send({ message: 'Login Successfully', user_id: user.user_id });
        } else {
            console.log('Invalid username or password');
            res.status(401).send({ message: 'Invalid username or password' });
        }
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).send({ message: 'Internal server error' });
    }
});

app.post('/reset-password', async (req, res) => {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
        console.log('Email and new password are required');
        return res.status(400).json({ message: 'Email and new password are required' });
    }
    try {
        console.log(`Resetting password for email: ${email}`);
        const success = await updatePassword(email, newPassword);
        if (success) {
            console.log('Password reset successful');
            res.status(200).json({ message: 'Password reset successful' });
        } else {
            console.log('User not found');
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post("/upload", upload.fields([{ name: 'music', maxCount: 1 }, { name: 'artwork', maxCount: 1 }]), async (req, res) => {
    const { title, artist, tags, description, userId } = req.body;
    const music = req.files?.music?.[0]?.path || null;
    const artwork = req.files?.artwork?.[0]?.path || null;

    try {
        const result = await uploadSongs(title, artist, userId, music, description, artwork, tags);
        console.log('Uploading audio file:', music);
        console.log('Uploading artwork:', artwork);
        console.log(`Title: ${title}, Artist: ${artist}, Tags: ${tags}, Description: ${description}`);
        res.status(200).json({ message: 'Upload successful' });
    } catch (error) {
        console.error('Error uploading:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get("/users", async (req, res) => {
    try {
        console.log('Fetching all users');
        const users = await getAllUsers();
        console.log(`Fetched ${users.length} users`);
        res.send(users);
    } catch (error) {
        console.error('Error getting all users:', error);
        res.status(500).send({ message: 'Internal server error' });
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
        res.status(500).send({ message: 'Internal server error' });
    }
});

app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.stack);
    res.status(500).send('Something broke!');
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
