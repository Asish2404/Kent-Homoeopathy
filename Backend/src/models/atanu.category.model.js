import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
    {
    category_name:{type:String,required:true},
    }, 
    {timestamps:true}
);

export const Category = mongoose.model("Category",categorySchema)
