import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import AppError from "../uitils/appError.js";
import catchAsync from "../uitils/catchAsync.js";
import { promisify } from "util";
import Student from "../models/studentModel.js";
import { updateUserRoleService } from "../services/authService.js";
import ejs from "ejs";
import path from "path";
import { sendMail } from "../uitils/sendMail.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Get the directory name of the current module


const getAllAdmins = async (req, res) => {
//1:filter
 //1a: build the query
  const queryObj = {...req.query}
  const excludedField = ["page", "sort", "limit", "fields"]
  //console.log(req.query, queryObj)
  excludedField.forEach(el => delete queryObj[el])
  //1a: await the query
  let queryStr = JSON.stringify(queryObj)
  //replace gte,gt,lte,lt
 queryStr =  queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
  console.log(JSON.parse(queryStr))
  let query =  User.find(JSON.parse(queryStr));
   //2:sorting
   if (req.query.sort){
      const sortBy = req.query.sort.split(",").join(" ")
      console.log(sortBy)
      query = query.sort(sortBy)
   }else {
    query = query.sort("createdAt")
   }

   //3: fields limit 
   if (req.query.fields){
    const fields = req.query.fields.split(",").join(" ")
    console.log(fields)
    query = query.select(fields)
 }else {
  query = query.sort("-__v")
 }
  



  const user = await query
  
 //const user = await User.find().where("role").equals("user")
  res.status(200).json({
    result: user.length,
    status: "ok",
    user,
  });
};

const deleteUser = async (req, res) => {
  const { email } = req.params;
  const newAdmin = req.body;
  const user = await User.findOneAndDelete({ email });
  res.status(200).json({
    status: "ok",
    data: { user },
  });
};
const deleteStudent = async (req, res) => {
  const { id } = req.params;
  const newStudent = req.body;
  const student = await Student.findByIdAndDelete(id);
  res.status(200).json({
    status: "ok",
    data: { Student },
  });
};

const signedToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

const createSendToken = (user, statusCode, res) => {
   const token = signedToken(user._id);
   const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true,
  }
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true
    res.cookie("jwt", token, cookieOptions )
  //don't send password to the client
  user.password = undefined;

    res.status(statusCode).json({
      status: "success",
      token,
      data: {user}
    });
};

// const signUp = catchAsync ( async (req, res, next) => {
//   const {
//     name,
//     email,
//     phoneNumber,
//     password,
//     confirmPassword,
//     passwordChangedAt,
//     role,
//     avatar,
//   } = req.body

//   const userExist = await User.findOne({email})

//   if (userExist) {
//     return next(new AppError("user already exist", 400))
//   }

//   const newUser = {
//     name,
//     email,
//     phoneNumber,
//     password,
//     confirmPassword,
//     passwordChangedAt,
//     role,
//     avatar,
//   }

//   //sending activation email to the user
//   const activationToken = createActivationToken(newUser);
//   const activationCode = activationToken.activationCode;
//   const data = { newUser: { name: newUser.name }, activationCode };
//   const html = await ejs.renderFile(

//     path.join(__dirname,  "../mails/activation-email.ejs"),

//     data
//   );

//   try {
//     await sendMail({
//       email: newUser.email,
//       subject: "Welcome to NaijaPunter",
//       template: "activation-email.ejs",
//       data,
//     });

//     res.status(201).json({
//       success: true,
//       message: `Please check your email: ${newUser.email} to see your welcome activation-email`,
//       activationToken: activationToken.token,
//     });
//   } catch (error) {
//     return next(new AppError(error.message, 400));
//   }

// });
const signUp = catchAsync(async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword, phoneNumber, role } =
      req.body;

    const isEmailExist = await User.findOne({ email });
    if (isEmailExist) {
      return next(new AppError("Email already exist", 400));
    }

    const user = {
      name,
      email,
      password,
      confirmPassword,
      phoneNumber,
      role,
    };

    const activationToken = createActivationToken(user);

    const activationCode = activationToken.activationCode;

    //const url = `${req.protocol}://${req.get('host')}/${user.name}`; //to send link to email
    const data = { user: { name: user.name }, activationCode };
    const html = await ejs.renderFile(
      path.join(__dirname, "../mails/activation-email.ejs"),
      data
    );

    try {
      await sendMail({
        email: user.email,
        subject: "Activate your account",
        template: "activation-email.ejs",
        data,
      });

      res.status(201).json({
        success: true,
        message: `Please check your email: ${user.email} to activate your account!`,
        activationToken: activationToken.token,
      });
    } catch (error) {
      return next(new AppError(error.message, 400));
    }
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
});

const activateUser = catchAsync(async (req, res, next) => {
  try {
    const { activation_token, activation_code } = req.body;

    const newUser = jwt.verify(activation_token, process.env.JWT_SECRET);

    if (newUser.activationCode !== activation_code) {
      return next(new AppError("Invalid activation code", 400));
    }

    const { name, email, password, confirmPassword, role, phoneNumber } =
      newUser.user;

    const existUser = await User.findOne({ email });

    if (existUser) {
      return next(new AppError("Email already exist", 400));
    }
    const user = await User.create({
      name,
      email,
      password,
      confirmPassword,
      phoneNumber,
      role,
    });

    res.status(201).json({
      success: true,
    });
  } catch (error) {
    return next(new AppError("failed", 400));
  }
});

//forgot password controller
const forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on provided email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("There is no user with email address.", 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/resetpassword/${resetToken}`;

  // 3) Send it to user's email
  try {
    //send the email
    const data = { resetURL };
    const html = await ejs.renderFile(
      path.join(__dirname, "../mails/forgot-password-email.ejs"),
      data
    );

    try {
      await sendMail({
        email: user.email,
        subject: "reset password",
        template: "forgot-password-email.ejs",
        data,
      });

      res.status(201).json({
        success: true,
        message: `Please check your email  to reset your password!`,
      });
    } catch (error) {
      return next(new AppError(error.message, 400));
    }
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError(error.message, 500));
  }
});

const resetPassword = catchAsync(async (req, res, next) => {
  const token = req.params.token;
  // 1) Get user based on the token
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changedPasswordAt property for the user
  // 4) Log the user in, send JWT
  createSendToken(user, 200,res);
});

// const signUp = catchAsync(
//   async (req, res, next) => {
//     try {
//       const { name, email, password } = req.body;

//       const isEmailExist = await User.findOne({ email });
//       if (isEmailExist) {
//         return next(new ErrorHandler("Email already exist", 400));
//       }

//       const user = {
//         name,
//         email,
//         password,
//       };

//       const activationToken = createActivationToken(user);

//       const activationCode = activationToken.activationCode;

//       const data = { user: { name: user.name }, activationCode };

//       const html = await ejs.renderFile(
//         path.join(__dirname,  "../mails/activation-email.ejs"),
//         data
//       );

//       try {
//         await sendMail({
//           email: user.email,
//           subject: "Welcome to NaijaPunter",
//           template: "activation-email.ejs",
//           data,
//         });

//         res.status(201).json({
//           success: true,
//           message: `Please check your email: ${user.email} to see your welcome message`,
//           activationToken: activationToken.token,
//         });
//       } catch (error) {
//         return next(new AppError(error.message, 400));
//       }
//     } catch (error) {
//       return next(new AppError(error.message, 400));
//     }
//   }
// );
const createActivationToken = (user) => {
  const activationCode = Math.floor(1000 + Math.random() * 9000).toString();

  const token = jwt.sign(
    {
      user,
      activationCode,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "10m",
    }
  );

  return { token, activationCode };
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
  createSendToken(user, 200, res)
  // const token = signedToken(user._id);
  // res.status(200).json({
  //   status: "success",
  //   token,
  // });
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
 // console.log(token);
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
  //console.log(decoded);
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
    if (!roles.includes(req.user.role)) {
      return next(new AppError("You do not have access to view this", 403));
    }
    next();
  };
};

const updateUserRole = catchAsync(async (req, res, next) => {
  const { email, role } = req.body;
  const isUserExist = await User.findOne({ email });
  const id = isUserExist._id;
  if (!isUserExist) {
    return next(new AppError("this user does not exist", 400));
  }

  updateUserRoleService(res, id, role);
});

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

// const updateProfilePicture = catchAsync(async (req, res, next) => {
//   try {
//     const { avatar } = req.body;

//     const userId = req.user?._id;

//     const user = await User.findOne({ email }).select("+password");

//     // if (avatar && user) {
//     //   // if user have one avatar then call this if
//     //   if (user?.avatar?.public_id) {
//     //     // first delete the old image
//     //     await cloudinary.v2.uploader.destroy(user?.avatar?.public_id);

//     //     const myCloud = await cloudinary.v2.uploader.upload(avatar, {
//     //       folder: "avatars",
//     //       width: 150,
//     //     });
//     //     user.avatar = {
//     //       public_id: myCloud.public_id,
//     //       url: myCloud.secure_url,
//     //     };
//     //   } else {
//     //     const myCloud = await cloudinary.v2.uploader.upload(avatar, {
//     //       folder: "avatars",
//     //       width: 150,
//     //     });
//     //     user.avatar = {
//     //       public_id: myCloud.public_id,
//     //       url: myCloud.secure_url,
//     //     };
//     //   }
//     // }

//     await user?.save();

// //     res.status(200).json({
// //       success: true,
// //       user,
// //     });
// //   } catch (error) {
// //     return next(new AppError("failed to upload picture", 400));
// //   }
//  });

export {
  signUp,
  login,
  protect,
  restrictTo,
  deleteUser,
  getAllAdmins,
  deleteStudent,
  updateUserRole,
  createActivationToken,
  activateUser,
  forgotPassword,
  resetPassword,
};
