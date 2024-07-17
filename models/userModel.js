import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs"
import crypto from "crypto"

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

    // avatar:{
    //     type: String,
    // },

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
    passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,

    role:{
        type: String,
        enum: ["student", "teacher", "bursar", "admin" ],
        default: "student"
    },

    

    
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
  
  userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');// create reset token by creating random token
  
    this.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
  
    console.log({ resetToken }, this.passwordResetToken);
  
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; //current time + 10min
  
    return resetToken;
  };


const User = mongoose.model("User", userSchema)

export default User;