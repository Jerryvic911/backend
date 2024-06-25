import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
        unique: true,
    },
    studentId: {
        type: String,
        required: true,
        default: function () {
          return (
            "STU" +
            Math.floor(100 + Math.random() * 900) +
            Date.now().toString().slice(2, 4) +
            this.name
              .split(" ")
              .map(name => name[0])
              .join("")
              .toUpperCase()
          );
        },
      },
      age:{
        type: Number,
        required: true,
      },
      gender:{
        type: ["Male", "Female"],
        required: true,
      },
      role:{
        type: String,
        required: true,
      },

})

const Student = mongoose.model("Student", studentSchema);

export default Student;