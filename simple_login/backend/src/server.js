import express from 'express'
import dotenv from 'dotenv' // import 'dotenv/config'
import cors from 'cors'
import pool from './schema/db.js'
import router from './routes/routes.js'
// const corsOption = {origin: ["http://localhost:5173"]}

const PORT = process.env.PORT || 5000

const app = express();
app.use(cors());
app.use(express.json());
dotenv.config()

app.use('/api', router)

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