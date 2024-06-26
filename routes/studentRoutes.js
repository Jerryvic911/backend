import express from "express";
import {
    getAllStudents,
    createStudent,
    editStudent,
    deleteStudent,
    getSingleStudent,
  } from "../controllers/studentControllers.js";

const studentsRouter = express.Router();

studentsRouter
.route("/")
.get(getAllStudents)
.post(createStudent)


studentsRouter
  .route("/")
  .delete(deleteStudent)
  .patch(editStudent)
  .get(getSingleStudent);

export default studentsRouter;