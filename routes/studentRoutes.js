import express from "express";
import {
    getAllStudents,
    createStudent,
    getSingleStudent,
    editStudentInfo,
    deleteStudent,
  } from "../controllers/studentControllers.js";

const studentsRouter = express.Router();

studentsRouter
.route("/")
.get(getAllStudents)
.post(createStudent);

studentsRouter
  .route("/:id")
  .get(getSingleStudent)
  .put(editStudentInfo)
  .delete(deleteStudent);

export default studentsRouter;