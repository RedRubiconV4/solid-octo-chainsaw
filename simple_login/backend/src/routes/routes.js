import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { signupSchema, loginSchema } from '../middlewares/validation.js'
// import pool from '../schema/db.js'
import prisma from '../prismaClient.js'

const JWT_SECRET_KEY = process.env.JWT_SECRET
const router = Router()

const usertasklist = [
    {id: 1, task: "Eat breakfast", completed: false},
    {id: 2, task: "Study", completed: false},
    {id: 3, task: "Gym", completed: false},
]

router.get("/me", async (req, res) => {
    try {
        const token = req.cookies.accessToken;

        if (!token) {
            return res.status(401).json({message: "Not authenicated"});
        }

        const decoded = jwt.verify(token, JWT_SECRET_KEY);

        res.status(200).json({user: decoded});
    } catch (err) {
        return res.status(401).json({message: "Invalid or expired token"});
    }

})

router.get("/getTaskList", async (req, res) => {
    const token = req.cookies.accessToken;
    // console.log("token ", token);

    if (!token) {
        return res.status(401).json({error: 'Not authorised - no token'});
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET_KEY);
        // const taskData = await pool.query("SELECT * FROM tasks WHERE user_id = $1", [decoded.userId])
        // const tasks = taskData.rows;
        // console.log("decoded", decoded);
        const tasks = await prisma.task.findMany({
            where: {
                userId: decoded.userId
            }
        });
        // console.log("tasks ", tasks);

        res.status(201).json({message: 'Task list', user: decoded, tasks: tasks});
    } catch (err) {
        res.status(401).json({error: 'Invalid/expired token'});
    }
})

router.post("/login", async (req, res) => {
    try {
        const result = loginSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({message: 'Validation check failed'});
        }

        const {username, password} = result.data;

        // const user_db = await pool.query("SELECT id, username, password FROM users WHERE username = $1", [username]);
        const user = await prisma.user.findUnique({
            where: {
                username: username
            }
        })

        if (!user) {
            return res.status(401).json({message: 'Invalid username or password'});
        }

        const isPasswordMatching = await bcrypt.compare(password, user.password);

        if (username !== user.username) {
            return res.status(401).send({message: "Invalid credentials username"});
        }

        if (!isPasswordMatching) {
            return res.status(401).send({message: "Invalid credentials password"});
        }

        const token = jwt.sign({userId: user.id}, JWT_SECRET_KEY, {expiresIn: "24h"});
        res.cookie('accessToken', token, {
            httpOnly: true,
            secure: false, // true for https only
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000,
            // path: '/' // Not sure to give root accessToken?
        });
        res.status(200).json({message: "Login successful", user: {id: user.id, username: user.username}});
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
        // console.log("username", username);

        // const checkExistingUser = await pool.query("SELECT username FROM users WHERE username = $1", [username]);
        const checkExistingUser = await prisma.user.findUnique({
            where: {
                username: username
            }
        })

        if (checkExistingUser) {
            return res.status(400).json({error: 'conflict', message: 'Username already exist'});
        }

        const hashedPassword = await bcrypt.hash(password, 8);
        // const result = await pool.query('INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *', [username, hashedPassword]);
        const user = await prisma.user.create({
            data: {
                username: username,
                password: hashedPassword
            }
        })
        // console.log(result);
        // const user = result.rows[0];
        const taskName = "Your first tasks"
        // const insertTask = await pool.query('INSERT INTO tasks (task, user_id) VALUES ($1, $2) RETURNING *', [taskName, user.id]);
        const insertTask = await prisma.task.create({
            data: {
                task: taskName,
                userId: user.id
            }
        })

        const token = jwt.sign({userId: user.id}, JWT_SECRET_KEY, {expiresIn: "24h"});
        res.cookie('accessToken', token, {
            httpOnly: true,
            secure: false, // true for https only
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000,
            // path: '/'
        });

        res.status(201).json({
            message: 'Account successfully created', 
            user: {
                id: user.id,
                username: user.username,
            }
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

router.delete("/deleteTask/:taskId", async (req, res) => {
    const taskId = Number(req.params.taskId);
    
    try {
        await prisma.task.delete({
            where: {
                id: taskId
            }
        })
        res.status(200).json({message: "task deleted"});
    } catch (err) {
        console.error("Error deleting task", err);
        res.status(500).json({error: "Failed to delete task"});
    }
})

router.patch("/editTask/:taskId", async (req, res) => {
    const taskId = Number(req.params.taskId);
    const { task } = req.body;
    
    try {
        await prisma.task.update({
            where: {
                id: taskId
            },
            data: {
                task: task
            }
        })
        res.status(200).json({message: "task deleted"});
    } catch (err) {
        console.error("Error editing task", err);
        res.status(500).json({error: "Failed to edit task"});
    }
})

router.patch("/toggleComplete/:taskId", async (req, res) => {
    const taskId = Number(req.params.taskId);
    
    try {
        const task = await prisma.task.findUnique({
            where: {
                id: taskId
            }
        })

        await prisma.task.update({
            where: {
                id: taskId
            },
            data: {
                completed: !task.completed
            }
        })
        res.status(200).json({message: "task sucessfully edited"});
    } catch (err) {
        console.error("Error completing task", err);
        res.status(500).json({error: "Failed to completing task"});
    }
})

router.post('/createTask', async (req, res) => {
    const { task } = req.body;
    const token = req.cookies.accessToken;

    try {
        const decoded = jwt.verify(token, JWT_SECRET_KEY);

        await prisma.task.create({
            data: {
                task: task,
                userId: decoded.userId
            }
        })
        res.status(200).json({message: "task sucessfully created"});
    } catch (err) {
        console.error("Error creating task", err);
        res.status(500).json({error: "Failed to create task"});
    }
})

router.post("/logout", (req, res) => {
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
    });

    res.status(200).json({message: "Logged out"});
})

export default router