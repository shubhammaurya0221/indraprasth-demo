import express from "express"
import dotenv from "dotenv"
import connectDb from "./configs/db.js"
import authRouter from "./routes/authRoute.js"
import cookieParser from "cookie-parser"
import cors from "cors"
import userRouter from "./routes/userRoute.js"
import courseRouter from "./routes/courseRoute.js"


import testRouter from "./routes/testRoute.js"
import mcqRouter from "./routes/mcqRoute.js"
import noteRouter from "./routes/noteRoute.js"
import questionRouter from "./routes/questionRoute.js"
import path from "path"
import { fileURLToPath } from 'url'
import { dirname } from 'path'

// Get the directory name in ES module scope
const __filename = fileURLToPath(import.meta.url);
const _dirname = dirname(_filename);

dotenv.config()

let port = process.env.PORT
let app = express()
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ["https://indraprasth-demo-frontend.onrender.com"]
  : [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175"
    ];
app.use(express.json())
app.use(cookieParser())
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));
// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')))

app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)
app.use("/api/course", courseRouter)

// app.use("/api/ai", aiRouter)

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
