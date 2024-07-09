import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs"

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, "input name"]
    },

    email:{
        type: String,
        required : [true, "input email address"],
        unique : true,
        lowercase : true,
        trim: true,
        validate: [
            validator.isEmail, "please enter a valid email"
        ],
        
    },

    phoneNumber:{
            type: String,
            
            unique: true
    },
   

    password:{
        type: String,
        required: [true, "input password"],
        minlength: 5,
        select:false,

    },

    confirmPassword:{
        type: String,
        required: [true, "confirm password"],
        select: false,
        validate: {
            validator : function (el){
                return el === this.password
            },
            message:"password does not match"
        }
    },

    role:{
        type: String,
        enum: ["student", "teacher", "bursar", "admin" ],
        default: "student"
    },

    passwordChangedAt:Date  
})

userSchema.pre("save", async function (next){
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 12)

    this.confirmPassword = undefined
    next()
})
userSchema.methods.correctPassword = async function(candidatePassword, userPassword){
    return await bcrypt.compare(candidatePassword, userPassword)
}

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if (this.passwordChangedAt) {
      const changedTimestamp = parseInt(
        this.passwordChangedAt.getTime() / 1000,
        10
      );
  
      return JWTTimestamp < changedTimestamp;
    }
  
    // False means NOT changed
    return false;
  };


const User = mongoose.model("User", userSchema)

export default User;