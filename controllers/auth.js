import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import AppError from "../uitils/appError.js";
import catchAsync from "../uitils/catchAsync.js";
import { promisify } from "util";
import Student from "../models/studentModel.js";
import { updateUserRoleService } from "../services/authService.js";
import ejs from "ejs"
import path from 'path';
import {sendMail} from "../uitils/sendMail.js"
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Get the directory name of the current module



const getAllAdmins = async (req, res) => {
  const newAdmin = await User.find();
  res.status(200).json({
    result: newAdmin.length,
    status: "ok",
    newAdmin,
  });
};

const deleteUser = async (req, res) => {
  const { email } = req.params;
  const newAdmin = req.body;
  const admin = await User.findOneAndDelete(email);
  res.status(200).json({
    status: "ok",
    data: { User },
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
 const signUp = catchAsync(
  async (req, res, next) => {
    try {
      const { name, email, password, confirmPassword, phoneNumber, role } = req.body;

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
        role
      };

      const activationToken = createActivationToken(user);

      const activationCode = activationToken.activationCode;

      const url = `${req.protocol}://${req.get('host')}/me`;
      const data = { user: { name: user.name }, activationCode, url };
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
  }
);

const activateUser = catchAsync(
  async (req, res, next) => {
    try {
      const { activation_token, activation_code } = req.body;

    const newUser = jwt.verify(
      activation_token,
      process.env.JWT_SECRET
    )

    if (newUser.activationCode !== activation_code) {
      return next(new AppError("Invalid activation code", 400));
    }

    const { name, email, password, confirmPassword, role, phoneNumber } = newUser.user;

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
    }
  );

 
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
};
