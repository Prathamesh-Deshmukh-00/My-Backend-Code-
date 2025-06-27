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
import Comments from "./routes/comment.routes.js";
import Likes from "./routes/like.routes.js";
import PlayList from "./routes/playlist.routes.js";

//routes declaration of user route
app.use("/api/v1/users",userRouter)

// router declaration of video route 
app.use("/api/v1/videos",videoRouter)

// router declaration of twwets route 
app.use("/api/v1/tweets",tweetRouter)

// router declaration of comment route 
app.use("/api/v1/comments",Comments)

// router declaration of like route 
app.use("/api/v1/Likes",Likes)

// router declaration of playlist route 
app.use("/api/v1/PlayList",PlayList)


export { app }