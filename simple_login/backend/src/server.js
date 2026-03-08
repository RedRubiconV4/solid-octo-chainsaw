import express from 'express'
import dotenv from 'dotenv' // import 'dotenv/config'
import cors from 'cors'
import router from './routes/routes.js'
import cookieParser from 'cookie-parser'

const PORT = process.env.PORT || 5000

const app = express();
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(cookieParser());
dotenv.config()

app.use('/api', router)

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`)
})