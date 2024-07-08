import express from "express";
import {
    getAllStudents,
    createStudent,
    editStudent,
    deleteStudent,
    getSingleStudent,
  } from "../controllers/studentControllers.js";
  import { protect } from "../controllers/auth.js";

const studentsRouter = express.Router();

studentsRouter
.route("/")
.get(protect, getAllStudents)
.post(createStudent)


studentsRouter
  .route("/:id")
  .delete(deleteStudent)
  .patch(editStudent)
  .get(getSingleStudent);

export default studentsRouter;