import express from "express";
import { getSingleTeacher, editTeacherInfo,} from "../controllers/teacherControllers.js"
import {getAllStudents} from "./../controllers/studentControllers.js"

const teachersRouter = express.Router();

teachersRouter.param('id', (req, res, next, val)=> {
    console.log(`student is : ${val}`)
    next()
})

teachersRouter.route("/")
.get( getAllStudents)


teachersRouter
  .route("/:id")
  .get(getSingleTeacher)
  .put(editTeacherInfo)

export default teachersRouter   