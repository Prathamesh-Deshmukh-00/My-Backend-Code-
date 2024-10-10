import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN ,
    credentials : true
}))

app.use(express.json({limit : "16kb"}))
app.use(express.urlencoded({extended:true,limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import tweetRouter from "./routes/tweet.routes.js";

//routes declaration of user route
app.use("/api/v1/users",userRouter)

// router declaration of video route 
app.use("/api/v1/videos",videoRouter)

// router declaration of twwets route 
app.use("/api/v1/tweets",tweetRouter)


export { app }