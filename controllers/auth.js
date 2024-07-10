import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import AppError from "../uitils/appError.js";
import catchAsync from "../uitils/catchAsync.js";
import { promisify } from "util";
import Student from "../models/studentModel.js";
import { updateUserRoleService } from "../services/authService.js";


const getAllAdmins = async (req, res) => {
  const newAdmin = await User.find();
  res.status(200).json({
      result: newAdmin.length,
      "status": "ok",
      newAdmin
  })
}


const deleteUser = async (req, res) => {
  const {id} = req.params
  const newAdmin = req.body
  const admin = await User.findByIdAndDelete(id)
  res.status(200).json({
      status: "ok",
      data:{User}
  });
}
const deleteStudent = async (req, res) => {
  const {id} = req.params
  const newStudent = req.body
  const student = await Student.findByIdAndDelete(id)
  res.status(200).json({
      status: "ok",
      data:{Student}
  });
};

const signedToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

const signUp = async (req, res) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    phoneNumber: req.body.phoneNumber,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    passwordChangedAt: req.body.passwordChangedAt,
    role:req.body.role,
    avatar:req.body.avatar
  });

 

  const token = signedToken(newUser._id);
  res.status(201).json({
    status: "success",
    token,
    data: {
      user: newUser,
    },
  });
};

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //check if email and password are provided
  if (!email || !password) {
    return next(new AppError("please provide email and password", 400));
  }

  //check if user exist and password is correct
  const user = await User.findOne({ email }).select("+password");
  // const correct =
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("incorrect email or password", 401));
  }

  //if everything is ok send token to client
  const token = signedToken(user._id);
  res.status(200).json({
    status: "success",
    token,
  });
});

const protect = catchAsync(async (req, res, next) => {
  //check if theres token
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  console.log(token);
  if (!token) {
    return next(
      new AppError(
        "you are not logged in, kindly login to access this route",
        401
      )
    );
  }
  //verify the token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decoded);
  //verify the token still exist

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError("the user is no longer among us"));
  }

  //check if the user changed password after token after token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("user recently changed password please login again", 401)
    );
  }

  //Grant access
  req.user = currentUser;
  next();
});

 const restrictTo = (...roles) => {
  return (req, res, next) => {
      if (!roles.includes(req.user.role)){
        return next (new AppError("You do not have access to view this", 403))
      }
      next()
  }
 }

  const updateUserRole = catchAsync(
  async (req, res, next) => {
    
      const { email, role } = req.body;
      const isUserExist = await User.findOne({ email });
      const id = isUserExist._id;
      if (!isUserExist) {
        return next(new AppError("this user does not exist", 400));
      }
     
      updateUserRoleService(res, id, role);
    
  }
);

// const updateUserRole = catchAsync(
//   async (req, res, next) => {
//       const { email, role } = req.body;
//       const isUserExist = await User.findOne({ email });
//       if (isUserExist) {
//         //const id = isUserExist._id;
//         updateUserRoleService(res,  role);
//       } else {
//         res.status(400).json({
//           success: false,
//           message: "User not found",
//         });
//       }
//       return next(new AppError("something went very wrong", 400));
//     
//   }
// );

 const updateProfilePicture = catchAsync(
  async (req, res, next) => {
    try {
      const { avatar } = req.body;

      const userId = req.user?._id;

      const user = await User.findOne({email}).select("+password");

      // if (avatar && user) {
      //   // if user have one avatar then call this if
      //   if (user?.avatar?.public_id) {
      //     // first delete the old image
      //     await cloudinary.v2.uploader.destroy(user?.avatar?.public_id);

      //     const myCloud = await cloudinary.v2.uploader.upload(avatar, {
      //       folder: "avatars",
      //       width: 150,
      //     });
      //     user.avatar = {
      //       public_id: myCloud.public_id,
      //       url: myCloud.secure_url,
      //     };
      //   } else {
      //     const myCloud = await cloudinary.v2.uploader.upload(avatar, {
      //       folder: "avatars",
      //       width: 150,
      //     });
      //     user.avatar = {
      //       public_id: myCloud.public_id,
      //       url: myCloud.secure_url,
      //     };
      //   }
      // }

      await user?.save();

      //await redis.set(userId, JSON.stringify(user));

      res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      return next(new AppError("failed to upload picture", 400));
    }
  }
);

export { signUp, login, protect, restrictTo, deleteUser, getAllAdmins, deleteStudent, updateUserRole , updateProfilePicture};
