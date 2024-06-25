import app from "./app.js";
import mongoose from "mongoose";
import dotenv  from "dotenv";

dotenv.config();
mongoose.connect(process.env.DB_URL).then(con => {
    console.log("Connection successfull");
    // console.log(con.connection)
    
});

const port = 3000;

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
