import { Doctor } from "../models/atanu.doctor.model.js";

export const createDoctor = async (req, res) => {
    try {

        const {
            doctor_name,
            specialization,
            qualification,
            experience,
            hospital,
            consultation_fee,
            available_days,
            available_time,
            image,
            about
        } = req.body;

        const doctor = await Doctor.create({
            doctor_name,
            specialization,
            qualification,
            experience,
            hospital,
            consultation_fee,
            available_days,
            available_time,
            image,
            about
        });

        res.status(201).json({
            message: "Doctor Added Successfully",
            doctor
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};