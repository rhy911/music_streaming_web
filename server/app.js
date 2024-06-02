import express from 'express'
import cors from 'cors'
import {
    getAllUsers, getUser, createUser, deleteUser
} from './database.js'
const app = express()

app.use(express.json())
app.use(cors());
const port = 8000


app.post("/users", async (req, res) => {
    const {
        username, email, password
    } = req.body
    const user = await createUser(username, email, password)
    res.status(201).send(user)
})


app.get("/users", async (req, res) => {
    const users = await getAllUsers()
    res.send(users)
})
app.get("/users/:user_id", async (req, res) => {
    const id = req.params.user_id
    const user = await getUser(id)
    res.send(user)
})


app.delete("/users/:user_id", async (req, res) => {
    const id = req.params.user_id
    const deleted = await deleteUser(id)
    if (deleted) {
        res.status(204).send()
    } else {
        res.status(404).send()
    }
})


app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('Something broke!')
})

app.listen(8000, () => {
    console.log(`Server is running at http://localhost:${port}`);
})