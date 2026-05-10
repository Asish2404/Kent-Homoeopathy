import mongoose from "mongoose";
import { time } from "node:console";
import { stat } from "node:fs";
import test from "node:test";

const labTestSchema = new mongoose.Schema(
    {
        test_name:{type:String,required:true},
        refered_by:{type:String,required:true},
        price:{type:Number,required:true},
        labTest_date:{type:Date,required:true},
        labTest_time:{type:String,required:true},
        status:{type:String,enum:["pending","completed"],default:"pending"},
        user_name:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
        phone:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
        address:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
        email:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
        
    },{timestamps:true})

export const LabTest = mongoose.model("LabTest",labTestSchema)
