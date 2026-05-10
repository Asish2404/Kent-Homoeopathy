import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


//asynce await function is using here is bcause db is on another continent

const connectDB = async () => {
    try{
       const connectionInstance =  await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
       console.log(`\n MongoDB connected !! DB HOST : ${
        connectionInstance.connection.host
       }`);
    }catch(error){
        console.log("MONGODB connection failed ", error);
        process.exit(1);//its form node js and its passing the ref of the current process
    }
}

export default connectDB