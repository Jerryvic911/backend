import express from "express";
import {
  activateUser,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.js";

const authRouter = express.Router();

authRouter
  .post("/activateuser", activateUser)
  .post("/forgotpassword", forgotPassword)
  .post("/resetpassword/:token", resetPassword)
//.patch("/editprofile", updateProfilePicture)

export default authRouter;
