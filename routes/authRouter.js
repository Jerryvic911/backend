import express from "express";
import {
  signUp,
  login,
  getAllAdmins,
  deleteUser,
  updateUserRole,
  activateUser,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.js";
import { protect } from "../controllers/auth.js";
import { restrictTo } from "../controllers/auth.js";
import { deleteStudent } from "../controllers/auth.js";

const authRouter = express.Router();

authRouter
  .post("/signup", signUp)
  .post("/login", login)
  .post("/activateuser", activateUser)
  .post("/forgotpassword", forgotPassword)
  .post("/resetpassword/:token", resetPassword)
  .get("/admins", protect, restrictTo("bursar", "admin"), getAllAdmins)
  .patch("/editsUserRole", protect, restrictTo("admin"), updateUserRole)
  .delete("/delete/admin-email", protect, restrictTo("admin"), deleteUser);
//.patch("/editprofile", updateProfilePicture)

authRouter.delete("/delete/email", protect, restrictTo("admin"), deleteStudent);
export default authRouter;
