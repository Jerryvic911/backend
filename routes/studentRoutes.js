
import express from "express";
import {
    getAllStudents,
    createStudent,
    editStudent,
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
  .get(protect ,restrictTo("bursar", "admin"), getSingleStudent);

export default studentsRouter;
