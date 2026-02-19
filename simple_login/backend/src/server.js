require('dotenv').config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require('./db')
const { z } = require('zod')
// const corsOption = {origin: ["http://localhost:5173"]}

const PORT = process.env.PORT || 5000
const JWT_SECRET_KEY = process.env.JWT_SECRET

const app = express();
app.use(cors());
app.use(express.json());

const user = {
    email: "test@example.com",
    password: "password123"
}

const usertasklist = [
    {id: 1, task: "Eat breakfast", completed: false},
    {id: 2, task: "Study", completed: false},
    {id: 3, task: "Gym", completed: false},
]

const signupSchema = z.object({
    username: z.string(),
    password: z.string().min(8)
});

const loginSchema = z.object({
    username: z.string().min(1).max(100),
    password: z.string()
});

app.get("/api/getTaskList", (req, res) => {
    res.status(201).json(usertasklist);
})

app.get("/api/test", (req, res) => {
    console.log("testing");
    res.status(201).json({message: "response sent back to front-end"});
})

app.post("/api/login", async (req, res) => {
    try {
        const result = loginSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({message: 'Validation check failed'});
        }

        const {username, password} = result.data;

        const user_db = await pool.query("SELECT id, username, password FROM users WHERE username = $1", [username]);

        if (user_db.rowCount === 0) {
            return res.status(401).json({message: 'Invalid username or password'});
        }

        const user = user_db.rows[0];
        const isPasswordMatching = await bcrypt.compare(password, user.password);

        if (username !== user.username) {
            return res.status(401).send({message: "Invalid credentials username"});
        }

        if (!isPasswordMatching) {
            return res.status(401).send({message: "Invalid credentials password"});
        }

        const token = jwt.sign({userId: user.id}, JWT_SECRET_KEY, {expiresIn: "24h"});
        res.status(200).json({token});
    } catch(err) {
        console.log(err.message)
        return res.sendStatus(503);
    }
})

app.post("/api/signup", async (req, res) => {
    try {
        const body = signupSchema.safeParse(req.body);
        console.log(body);
        if (!body.success) {
            return res.status(400).json({message: 'Validation check failed'});
        }

        const {username, password} = body.data;

        if (!username || !password) {
            return res.status(400).send({message: "Username and password must not be empty"});
        }

        const checkExistingUser = await pool.query("SELECT username FROM users WHERE username = $1", [username]);
        if (checkExistingUser.rowCount > 0) {
            return res.status(400).json({error: 'conflict', message: 'Username already exist'});
        }

        const hashedPassword = await bcrypt.hash(password, 8);
        const result = await pool.query('INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *', [username, hashedPassword]);
        // console.log(result);
        const user = result.rows[0];
        // console.log(user);
        const token = jwt.sign({userId: user.id}, JWT_SECRET_KEY, {expiresIn: "24h"});

        return res.status(201).json({
            message: 'Account successfully created', 
            user: {
                id: user.id,
                username: user.username,
            },
            token: token
        });
    } catch(err) {
        if (err instanceof z.ZodError) {
            return res.status(422).json({
                error: 'validation_error',
                issues: err.flatten().fieldErrors
            })
        }

        console.error('[Signup error]', err);
        return res.status(500).json({
            error: 'internal_server_error',
            message: 'Something went wrong - please try again later'
        })
    }
})

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`)
})

async function createTable() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS tasks (
                id SERIAL PRIMARY KEY,
                task TEXT UNIQUE NOT NULL,
                completed BOOLEAN DEFAULT false,
                user_id INTEGER NOT NULL,
                CONSTRAINT fk_user
                    FOREIGN KEY(user_id)
                    REFERENCES users(id)
                    ON DELETE CASCADE
            );
        `);
        console.log("Successfully created db");
    } catch(err) {
        console.error("Error creating table:", err);
    }
}
createTable();