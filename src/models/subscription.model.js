import mongoose , {Schema} from "mongoose";

const subscriptionSchema = new Schema({
    subscriber : {
        type : Schema.Types.ObjectId, // user id of suscriber 
        ref:"User" // user who suscribing 
    },
    channel : {
        type : Schema.Types.ObjectId, // user id of channel owner user 
        ref:"User" // channel owner user 
    },

},
{
    timestamps: true
})


export const  Subscription = mongoose.model("Subsciption", subscriptionSchema)