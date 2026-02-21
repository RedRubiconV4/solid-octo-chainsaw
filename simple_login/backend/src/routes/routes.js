import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { signupSchema, loginSchema } from '../middlewares/validation.js'
import pool from '../schema/db.js'

const JWT_SECRET_KEY = process.env.JWT_SECRET
const router = Router()

// const user = {
//     email: "test@example.com",
//     password: "password123"
// }

// router.get("/api/test", (req, res) => {
//     console.log("testing");
//     res.status(201).json({message: "response sent back to front-end"});
// })

const usertasklist = [
    {id: 1, task: "Eat breakfast", completed: false},
    {id: 2, task: "Study", completed: false},
    {id: 3, task: "Gym", completed: false},
]

router.get("/getTaskList", (req, res) => {
    res.status(201).json(usertasklist);
})

router.post("/login", async (req, res) => {
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

router.post("/signup", async (req, res) => {
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

export default router