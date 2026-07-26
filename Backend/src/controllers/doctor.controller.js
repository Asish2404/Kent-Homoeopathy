import mongoose from "mongoose";
import { Doctor } from "../models/atanu.doctor.model.js";

const normalizeString = (v) => (typeof v === "string" ? v.trim() : v);

const validateEmailFormat = (email) => {
    // In case email is provided in body though model doesn't store it.
    return typeof email === "string" ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) : false;
};

const validatePhoneFormat = (phone) => {
    if (typeof phone !== "string") return false;
    const normalized = phone.replace(/\s+/g, "").trim();
    return /^\d{10}$/.test(normalized);
};

const validateRequired = (body, fields) => {
    const missing = fields.filter((f) => {
        const v = body?.[f];
        return typeof v !== "string" && typeof v !== "number" ? v === undefined || v === null : String(v).trim().length === 0;
    });
    return missing;
};

const parsePositiveNumber = (v) => {
    const n = typeof v === "number" ? v : Number(v);
    return Number.isFinite(n) ? n : NaN;
};

export const createDoctor = async (req, res) => {
    try {
        const {
            doctor_name,
            qualification,
            specialization,
            experience,
            consultation_fee,
            hospital,
            available_days,
            available_time,
            license_number,
            image,
            status,
            about,
            // optional fields for validation (not present in current model)
            email,
            phone,
            profile_image,
        } = req.body;

        const requiredFields = [
            "doctor_name",
            "qualification",
            "specialization",
            "experience",
            "consultation_fee",
            "hospital",
            "available_days",
            "available_time",
            "image",
            "about",
        ];

        const missing = requiredFields.filter((f) => req.body?.[f] === undefined || req.body?.[f] === null || String(req.body?.[f]).trim().length === 0);
        if (missing.length) {
            return res.status(400).json({ success: false, message: `Missing required fields: ${missing.join(", ")}` });
        }

        if (email !== undefined && !validateEmailFormat(email)) {
            return res.status(400).json({ success: false, message: "Invalid email format" });
        }

        if (phone !== undefined && !validatePhoneFormat(phone)) {
            return res.status(400).json({ success: false, message: "Invalid phone format" });
        }

        const fee = parsePositiveNumber(consultation_fee);
        if (!Number.isFinite(fee) || fee <= 0) {
            return res.status(400).json({ success: false, message: "Consultation fee must be positive" });
        }

        const exp = parsePositiveNumber(experience);
        if (!Number.isFinite(exp) || exp < 0) {
            return res.status(400).json({ success: false, message: "Experience must be >= 0" });
        }

        // Duplicate checks: since current model doesn't include email/phone/license_number,
        // we can only enforce duplicates on doctor_name + specialization by best-effort.
        // If your schema is extended later, these checks will be updated.
        const existing = await Doctor.findOne({
            doctor_name: normalizeString(doctor_name),
            specialization: normalizeString(specialization),
            isActive: true,
        });

        if (existing) {
            return res.status(409).json({ success: false, message: "Doctor already exists" });
        }

        const doctor = await Doctor.create({
            doctor_name: normalizeString(doctor_name),
            qualification: normalizeString(qualification),
            specialization: normalizeString(specialization),
            experience: exp,
            hospital: normalizeString(hospital),
            consultation_fee: fee,
            available_days: normalizeString(available_days),
            available_time: normalizeString(available_time),
            image: normalizeString(image),
            about: normalizeString(about),
            // soft delete control if field exists
            isActive: status ? status === "active" || status === true : true,
        });

        return res.status(201).json({
            success: true,
            message: "Doctor Added Successfully",
            doctor,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error?.message || "Database error" });
    }
};

export const getDoctors = async (req, res) => {
    try {
        const {
            page = "1",
            limit = "10",
            search = "",
            specialization = "",
            minExperience,
            sortBy = "createdAt",
            sortOrder = "desc",
            availability = "",
        } = req.query;

        const p = Math.max(1, Number(page));
        const l = Math.max(1, Math.min(100, Number(limit)));

        const query = {};

        if (specialization) {
            query.specialization = { $regex: String(specialization), $options: "i" };
        }

        if (minExperience !== undefined && minExperience !== null && String(minExperience).trim().length) {
            const minExp = Number(minExperience);
            if (Number.isFinite(minExp)) {
                query.experience = { $gte: minExp };
            }
        }

        if (availability) {
            query.available_days = { $regex: String(availability), $options: "i" };
        }

        if (search) {
            const s = String(search);
            query.$or = [
                { doctor_name: { $regex: s, $options: "i" } },
                { specialization: { $regex: s, $options: "i" } },
                { hospital: { $regex: s, $options: "i" } },
            ];
        }

        const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

        const [total, doctors] = await Promise.all([
            Doctor.countDocuments(query),
            Doctor.find(query)
                .sort(sort)
                .skip((p - 1) * l)
                .limit(l),
        ]);

        return res.status(200).json({
            success: true,
            doctors,
            pagination: {
                page: p,
                limit: l,
                total,
                totalPages: Math.ceil(total / l),
            },
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error?.message || "Database error" });
    }
};

export const getDoctorById = async (req, res) => {
    try {
        const { doctorId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(doctorId)) {
            return res.status(400).json({ success: false, message: "Invalid doctorId" });
        }

        const doctor = await Doctor.findById(doctorId);

        if (!doctor) {
            return res.status(404).json({ success: false, message: "Doctor not found" });
        }

        return res.status(200).json({ success: true, doctor });
    } catch (error) {
        return res.status(500).json({ success: false, message: error?.message || "Database error" });
    }
};

export const updateDoctor = async (req, res) => {
    try {
        const { doctorId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(doctorId)) {
            return res.status(400).json({ success: false, message: "Invalid doctorId" });
        }

        const update = {};
        const fields = [
            "doctor_name",
            "qualification",
            "specialization",
            "hospital",
            "consultation_fee",
            "available_days",
            "available_time",
            "image",
            "about",
            "experience",
        ];

        for (const f of fields) {
            if (req.body[f] !== undefined) {
                if (f === "consultation_fee") {
                    const fee = parsePositiveNumber(req.body[f]);
                    if (!Number.isFinite(fee) || fee <= 0) {
                        return res.status(400).json({ success: false, message: "Consultation fee must be positive" });
                    }
                    update[f] = fee;
                } else if (f === "experience") {
                    const exp = parsePositiveNumber(req.body[f]);
                    if (!Number.isFinite(exp) || exp < 0) {
                        return res.status(400).json({ success: false, message: "Experience must be >= 0" });
                    }
                    update[f] = exp;
                } else {
                    update[f] = normalizeString(req.body[f]);
                }
            }
        }

        const doctor = await Doctor.findByIdAndUpdate(
            doctorId,
            { $set: update },
            { new: true }
        );

        if (!doctor) {
            return res.status(404).json({ success: false, message: "Doctor not found" });
        }

        return res.status(200).json({ success: true, message: "Doctor updated successfully", doctor });
    } catch (error) {
        return res.status(500).json({ success: false, message: error?.message || "Database error" });
    }
};

export const deleteDoctor = async (req, res) => {
    try {
        const { doctorId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(doctorId)) {
            return res.status(400).json({ success: false, message: "Invalid doctorId" });
        }

        const doctor = await Doctor.findByIdAndUpdate(
            doctorId,
            { $set: { isActive: false } },
            { new: true }
        );

        if (!doctor) {
            return res.status(404).json({ success: false, message: "Doctor not found" });
        }

        return res.status(200).json({ success: true, message: "Doctor deleted successfully (soft delete)" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error?.message || "Database error" });
    }
};

export const updateDoctorAvailability = async (req, res) => {
    try {
        const { doctorId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(doctorId)) {
            return res.status(400).json({ success: false, message: "Invalid doctorId" });
        }

        const { available_days, available_time } = req.body;

        if (!available_days || !available_time) {
            return res.status(400).json({ success: false, message: "available_days and available_time are required" });
        }

        const doctor = await Doctor.findByIdAndUpdate(
            doctorId,
            {
                $set: {
                    available_days: normalizeString(available_days),
                    available_time: normalizeString(available_time),
                },
            },
            { new: true }
        );

        if (!doctor) {
            return res.status(404).json({ success: false, message: "Doctor not found" });
        }

        return res.status(200).json({ success: true, message: "Availability updated successfully", doctor });
    } catch (error) {
        return res.status(500).json({ success: false, message: error?.message || "Database error" });
    }
};

