import express from "express"
import dotenv from "dotenv"
import connectDb from "./config/connectDb.js"
import cookieParser from "cookie-parser"
dotenv.config()
import cors from "cors"
import authRouter from "./routes/auth.route.js"
import userRouter from "./routes/user.route.js"
import interviewRouter from "./routes/interview.route.js"
import paymentRouter from "./routes/payment.route.js"
import bookingRouter from "./routes/booking.route.js"
import questionBankRouter from "./routes/questionBank.route.js"
import analyticsRouter from "./routes/analytics.route.js"
import resumeOptimizerRouter from "./routes/resumeOptimizer.route.js"
import battleRouter from "./routes/battle.route.js"
import certificateRouter from "./routes/certificate.route.js"
import { initReminderScheduler } from "./services/reminder.service.js"
import { seedQuestionBankIfEmpty } from "./services/questionBankSeed.js"

const app = express()
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}))

app.use(express.json())
app.use(cookieParser())

app.use("/api/auth" , authRouter)
app.use("/api/user", userRouter)
app.use("/api/interview" , interviewRouter)
app.use("/api/payment" , paymentRouter)
app.use("/api/booking", bookingRouter)
app.use("/api/question-bank", questionBankRouter)
app.use("/api/analytics", analyticsRouter)
app.use("/api/resume-optimizer", resumeOptimizerRouter)
app.use("/api/battle", battleRouter)
app.use("/api/certificate", certificateRouter)

import http from "http"
import { initWebSocketServer } from "./services/socket.service.js"

const server = http.createServer(app)

const PORT = process.env.PORT || 6000
server.listen(PORT , async ()=>{
    console.log(`Server running on port ${PORT}`)
    initWebSocketServer(server)
    await connectDb()
    initReminderScheduler()
    await seedQuestionBankIfEmpty()
})


