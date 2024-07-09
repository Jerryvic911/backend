import express from "express";
import {
    getAllStudents,
    createStudent,
    editStudent,
    deleteStudent,
    getSingleStudent,
  } from "../controllers/studentControllers.js";
  import { protect, restrictTo } from "../controllers/auth.js";

const studentsRouter = express.Router();

studentsRouter
.route("/")
.get(protect, restrictTo("bursar", "admin"), getAllStudents)
.post(createStudent)


studentsRouter
  .route("/:id")
  .patch(editStudent)
  .get(protect , getSingleStudent);

export default studentsRouter;