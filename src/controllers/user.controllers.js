import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"

const  registerUser = asyncHandler( async(req,res)=> {


    const {fullName ,email,userName , password} = req.body;
 
    //check all fields are mention or not 
    if (
        [fullName,email,userName,password].map((field)=> field? field.trim() === "" : false)
    ){
        throw new ApiError(400,"All fields are required")
    }
    
    //check user is already exists or not 
     const existedUser = User.findOne({
        $or : [{userName} , {email}]
     })
     
     console.log("this is : - ",existedUser)
     
     if (existedUser){
        throw new ApiError(409,"user with eamil or username already exists")
     }

     //check coverImage and avatar is present or not 
     const avatarLocalPath = req.files?.avatar[0]?.path;
     const coverImageLocalPath = req.files?.coverImage[0]?.path;
     
     if(!avatarLocalPath){
        throw new ApiError(400 , "Avater file is required");
     } 

     //upload on uploadOnCloudinary
     const avatar = await uploadOnCloudinary(avatarLocalPath)
     const coverImage = await uploadOnCloudinary(coverImageLocalPath)
     
     if(!avatar){
        throw new ApiError(400 , "Avater file is required");
     } 

     // create user object 
     const user = await User.create(
        {
             fullName,
             avatar : avatar.url,
             coverImage : coverImage?.url || "",
             email,
             password,
             userName : userName.toLowerCase()
        }
      )

      //remove password and refresh token field from response 
      const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
      )
      
      //check for user creation 
      if(!createdUser){
        throw new ApiError(500 , "something went wrong while register user");
      }
    
     // return api response 
     return res.status(201).json(
        new ApiResponse(200,createdUser,"user registered successfully")
     )

    

} )

export { registerUser}