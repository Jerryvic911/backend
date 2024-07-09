import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import AppError from "../uitils/appError.js";
import catchAsync from "../uitils/catchAsync.js";
import { promisify } from "util";

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

export { signUp, login, protect, restrictTo };
