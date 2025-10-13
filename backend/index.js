import express from "express"
import dotenv from "dotenv"
import connectDb from "./configs/db.js"
import authRouter from "./routes/authRoute.js"
import cookieParser from "cookie-parser"
import cors from "cors"
import userRouter from "./routes/userRoute.js"
import courseRouter from "./routes/courseRoute.js"

// import aiRouter from "./routes/aiRoute.js"
import reviewRouter from "./routes/reviewRoute.js"
import testRouter from "./routes/testRoute.js"
import mcqRouter from "./routes/mcqRoute.js"
import noteRouter from "./routes/noteRoute.js"
import questionRouter from "./routes/questionRoute.js"
import path from "path"
import { fileURLToPath } from 'url'
import { dirname } from 'path'

// Get the directory name in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config()

let port = process.env.PORT
let app = express()
app.use(express.json())
app.use(cookieParser())
const allowedOrigins = [
    "https://indraprasth-demo-frontend.onrender.com",
    "http://localhost:5173" // add your dev frontend URL
];

app.use(cors({
    origin: function(origin, callback) {
        if (!origin) return callback(null, true); // allow non-browser requests
        if (allowedOrigins.indexOf(origin) === -1) {
            return callback(new Error("CORS policy does not allow access from this origin"), false);
        }
        return callback(null, true);
    },
    credentials: true
}));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')))

app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)
app.use("/api/course", courseRouter)

// app.use("/api/ai", aiRouter)
app.use("/api/review", reviewRouter)
app.use("/api/test-series", testRouter)
app.use("/api/mcq", mcqRouter)
app.use("/api/notes", noteRouter)
app.use("/api/questions", questionRouter)

app.get("/" , (req,res)=>{
    res.send("Hello From Server")
})

app.listen(port , ()=>{
    console.log("Server Started")
    connectDb()
})
