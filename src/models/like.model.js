import mongoose , {mongo, Schema} from "mongoose";


const likeSchema = new Schema(
    {
       
       video : {
        type : Schema.Types.ObjectId,
        ref : "Video"
       },
       Comment : {
        type : Schema.Types.ObjectId,
        ref : "Comment"
       },
       Tweet : {
        type : Schema.Types.ObjectId,
        ref : "Tweet"
       },
       Owner : {
        type : Schema.Types.ObjectId,
        ref : "User"
       },
       LikedBy : {
        type : Schema.Types.ObjectId,
        ref : "User"
       }

    },
    {
        timestamps : true 
    }
)


export const Like = mongoose.model("Like" , likeSchema) 