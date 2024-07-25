import express from "express";

import { activateUser, aliasTop5, forgotPassword, protect, resetPassword } from "../controllers/auth.js";
import { restrictTo } from "../controllers/auth.js";
import { deleteStudent, deleteUser, getAllAdmins, login, signUp, updateUserRole } from "../controllers/admin.js";

const adminRouter = express.Router();

adminRouter
  .post("/signup", signUp)
  .post("/login", login)
  .post("/activateuser", activateUser)
  .post("/forgotpassword", forgotPassword)
  .post("/resetpassword/:token", resetPassword)
  .get("/top5rated", aliasTop5 ,getAllAdmins)
  .get("/admins", protect, restrictTo("bursar", "admin"), getAllAdmins)
  .patch("/editsUserRole", protect, restrictTo("admin"), updateUserRole)
  .delete("/delete/admin-email", protect, restrictTo("admin"), deleteUser);
//.patch("/editprofile", updateProfilePicture)

adminRouter.delete("/delete/email", protect, restrictTo("admin"), deleteStudent);
export default adminRouter;
