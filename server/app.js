import express from 'express'
import cors from 'cors'
import {
    getAllUsers, getUser, createUser,
    authenticateUser, updatePassword
} from './database.js'
const app = express()

app.use(express.json())
app.use(cors());
const port = 8000


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
            console.log('Login successfully');
            res.status(200).send({ message: 'Login Successfully' });
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

app.listen(8000, () => {
    console.log(`Server is running at http://localhost:${port}`);
});