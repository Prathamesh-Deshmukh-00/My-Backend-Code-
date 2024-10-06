import mongoose , {mongo, Schema} from "mongoose";


const playlistSchema = new Schema(
    {
       video : [
        {
        type : Schema.Types.ObjectId,
        ref : "Video"
       }
    ],
       Owner : {
        type : Schema.Types.ObjectId,
        ref : "User"
       },

       Name : { 
        type : String , 
        required : true
       },
       description : { 
        type : String , 
        required : true
       }
       
    },
    {
        timestamps : true 
    }
)


export const PlayList = mongoose.model("PlayList" , playlistSchema) 