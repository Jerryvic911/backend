import User from "../models/userModel.js"
import jwt from "jsonwebtoken"
import AppError from "../uitils/appError.js";
import catchAsync from "../uitils/catchAsync.js"

const signedToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES
   });
  };

const signUp = async(req, res) => {
    const newUser = await User.create({
        name:req.body.name,
        email:req.body.email,
        phoneNumber:req.body.phoneNumber,
        password:req.body.password,
        confirmPassword:req.body.confirmPassword
    })


    const token = signedToken(newUser._id)
        res.status(201).json({
            status:"success",
            token,
            data: {
                user: newUser,
            }
    })
}

/*const login = catchAsync( async(req, res, next ) => {
    const {email, password} = req.body;

    //check if email and password are provided
    if (!email || !password){
      next (new AppError("please provide email and password", 400))
    }

    //check if user exist and password is correct
    const user = await User.findOne({email}).select("+password")
    // const correct =
     if (!user || !( await user.correctPassword(password, user.password))){
        next (new AppError("incorrect email or password", 401))
     }

    //if everything is ok send token to client
     const token = signedToken(user._id)
     res.status(200).json({
        status:"success",
        token
     })
})*/

const login = catchAsync( async(req, res, next ) => {
    const {email, password} = req.body;

    //check if email and password are provided
    if (!email || !password){
      next (new AppError("please provide email and password", 400))
    }

    try {
        // Find the user by email
        const user = await User.findOne({ email }).select("+password");
        const isPasswordCorrect = await user.correctPassword(password, user.password);

        if (!user || !isPasswordCorrect) {
            return next(new AppError("Please enter a valid email or password", 401));
        }

 
        // If everything is OK, send the token to the client
        const token = signedToken(user._id);
        res.status(200).json({
            status: "success",
            token,
        });
    } catch (error) {
     
        return next(new AppError("Something went wrong", 500));
    }
})

export { signUp, login}