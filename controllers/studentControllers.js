import Student from "../models/studentModel.js";


const getAllStudents = (req, res) => {
    res.send({
        "status": "Ok",
        "message": "students"
    });
}

const createStudent = async (req, res) => {
    const {name, email, age, gender, role} = req.body;
    const newStudent = await Student.create(req.body);
    res.status(201).json({
        status: "Ok",
        message: "New Student Created"
    })
}
const getSingleStudent = (req, res) => {
    res.send({
        "status": "Ok",
        "message": "student"
    })
}

const editStudentInfo = (req, res) => {
    res.send({
        "status": "Ok",
        "message": "students"
    })
}

const deleteStudent = (req, res) => {
    res.send({
        "status": "Ok",
        "message": "students"
    })
}

export {getAllStudents, createStudent, getSingleStudent, editStudentInfo, deleteStudent}