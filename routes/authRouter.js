import express from "express"
import   {signUp,login, getAllAdmins, deleteUser, updateUserRole}   from "../controllers/auth.js"
import { protect } from "../controllers/auth.js";
import { restrictTo } from "../controllers/auth.js";
import { deleteStudent } from "../controllers/auth.js";


const authRouter = express.Router();

authRouter
.post("/signup", signUp)
.post("/login", login)
.get("/admins",protect, restrictTo("bursar", "admin"), getAllAdmins)
.patch("/editsUserRole" ,updateUserRole)

authRouter
.delete(protect ,restrictTo( "admin"), deleteUser)
.delete("/delete/:id",protect ,restrictTo("admin"), deleteStudent)
export default authRouter