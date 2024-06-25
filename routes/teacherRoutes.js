import express from "express";
import {getAllTeachers, createTeacher, getSingleTeacher, editTeacherInfo, deleteTeacher} from "../controllers/teacherControllers.js"


const teachersRouter = express.Router();

teachersRouter.param('id', (req, res, next, val)=> {
    console.log(`student is : ${val}`)
    next()
})

teachersRouter.route("/")
.get(getAllTeachers)
.post(createTeacher);


teachersRouter
  .route("/:id")
  .get(getSingleTeacher)
  .put(editTeacherInfo)
  .delete(deleteTeacher);

export default teachersRouter   