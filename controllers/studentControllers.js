import Student from "../models/studentModel.js";


const getAllStudents = async (req, res) => {
    const newStudent = await Student.find();
    res.status(200).json({
        result: newStudent.length,
        "status": "ok",
        newStudent
    })
}

const createStudent = async (req, res) => {
    const {name, email, age, gender, role} = req.body;
    const newStudent = await Student.create(req.body);
    res.status(201).json({
        status: "Ok",
        message: "New Student "
    })
}
const editStudent = async (req, res) => {
    //best way to write a controller
    try {
        const {id} = req.params
    const newStudent = req.body
    const student = await Student.findByIdAndUpdate(id, newStudent)
    res.status(200).json({
        status: "ok",
        data:{Student}
    })
    } catch (error) {
        res.status(404).json({
            status:"fail",
            message:error
        })
    }
  
};

const getSingleStudent = async (req, res) => {
    const {id} = req.params
    const newStudent = req.body
    const student = await Student.findById(id)
    res.status(200).json({
        status: "ok",
        data:{student}
    })
  
};







export {getAllStudents, createStudent,  editStudent, getSingleStudent}