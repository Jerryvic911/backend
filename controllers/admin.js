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
import { createActivationToken } from "./auth.js";
import { createSendToken } from "./auth.js";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Get the directory name of the current module

const getAllAdmins = async (req, res, next) => {
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
    
     //pagination
     const page = req.query.page * 1 || 1
    // limits the amount of data to show 
     const limit = req.query.limit * 1 || 100
    
     /** skip (page 1 - 1) = 0 (0 *10) = 0 
      skip (page 2 - 1) = 1 (1 * 10) = 10
     */
     const skip = (page - 1) * limit
     if (req.query.page){
        const numberOfUsers =  await User.countDocuments()
        if (skip >= numberOfUsers){
          return next(new AppError("this is the end", 404))
        }
     }
     query = query.skip(skip).limit(limit)
      
    
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

      const updateUserRole = catchAsync(async (req, res, next) => {
        const { email, role } = req.body;
        const isUserExist = await User.findOne({ email });
        const id = isUserExist._id;
        if (!isUserExist) {
          return next(new AppError("this user does not exist", 400));
        }
      
        updateUserRoleService(res, id, role);
      });

      export {
        signUp,
        login,
        deleteUser,
        getAllAdmins,
        deleteStudent,
        updateUserRole,
      };