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
    const [result] = await pool.query("INSERT INTO users (username, email, password) VALUES (?, ?, ?)", [username, email, password])
    const id = result.insertId
    return getUser(id)
}
// const result = await createUser('test', 'test', 'test')
// console.log(result)


export async function getAllUsers() {
    const [rows] = await pool.query("SELECT * FROM users")
    return rows
}
export async function getUser(id) {
    const [rows] = await pool.query("SELECT * FROM users WHERE user_id = ?", [id])
    return rows[0]
}
// const users = await getUser(1)
// console.log(users)


export async function deleteUser(id) {
    const [rows] = await pool.query("DELETE FROM users WHERE user_id = ?", [id]);
    return rows.affectedRows > 0;
}