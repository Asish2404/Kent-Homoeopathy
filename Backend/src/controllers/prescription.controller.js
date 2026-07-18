import mongoose from "mongoose";
import { Prescription } from "../models/prescription.model.js";
import { Appointment } from "../models/appointment.model.js";
import { Doctor } from "../models/doctor.model.js";
import { User } from "../models/atanu.user.model.js";

const getPagination = (query = {}) => {
    const page = Number(query.page) > 0 ? Number(query.page) : 1;
    const limit = Number(query.limit) > 0 ? Math.min(Number(query.limit), 100) : 10;
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const normalizeMedicines = (medicines) => {
    if (!medicines) return [];
    if (!Array.isArray(medicines)) return null;

    // Only validate the fields defined in the model; allow extra fields from client.
    const normalized = medicines.map((m) => ({
        medicineName: typeof m?.medicineName === "string" ? m.medicineName.trim() : m?.medicineName,
        strength: typeof m?.strength === "string" ? m.strength.trim() : m?.strength,
        dosage: typeof m?.dosage === "string" ? m.dosage.trim() : m?.dosage,
        morningDose: m?.morningDose ?? 0,
        afternoonDose: m?.afternoonDose ?? 0,
        nightDose: m?.nightDose ?? 0,
        duration: typeof m?.duration === "string" ? m.duration.trim() : m?.duration,
        instructions: typeof m?.instructions === "string" ? m.instructions.trim() : m?.instructions,
        foodPreference: m?.foodPreference,
    }));

    return normalized;
};

const ensureDoctorOwnershipForAppointment = (appointmentDoctorId, doctorId) => {
    // Enforced rule: appointment.doctor must match doctor._id
    return appointmentDoctorId?.toString() === doctorId?.toString();
};

const getDoctorFromReq = async (req) => {
    const user = req.user;
    if (!user) return null;

    if (user.role !== "doctor") {
        return null;
    }

    const doctor = await Doctor.findOne({ user: user._id });
    return doctor;
};

const assertAppointmentAllowedStatus = (status) => {
    // Spec: Completed, Confirmed only.
    // Appointment model uses enum values: Pending, Confirmed, Completed, Cancelled, No Show, Rescheduled
    return status === "Completed" || status === "Confirmed";
};

const pickMedicalContentPatch = (body) => {
    // Business rule: doctors can edit medical content; admins cannot edit.
    // Controllers will only allow doctors and only when NOT finalized.
    const fields = [
        "chiefComplaint",
        "diagnosis",
        "clinicalNotes",
        "advice",
        "medicines",
        "investigations",
        "followUpRequired",
        "followUpDate",
        "prescriptionPdfUrl",
        "doctorSignatureUrl",
        "uploadedMedicalReports",
    ];

    const update = {};
    for (const f of fields) {
        if (body[f] !== undefined) update[f] = body[f];
    }
    if (update.medicines !== undefined) update.medicines = normalizeMedicines(update.medicines);
    return update;
};

const isFinalPrescription = (prescription) => prescription?.status === "Completed";

// ===============================
// POST /api/prescriptions
// ===============================
export const createPrescription = async (req, res) => {
    try {
        const doctor = await getDoctorFromReq(req);
        if (!doctor) {
            return res.status(403).json({ success: false, message: "Doctor profile not found." });
        }

        const {
            appointmentId,
            chiefComplaint,
            diagnosis,
            clinicalNotes,
            advice,
            medicines,
            investigations,
            followUpRequired,
            followUpDate,
        } = req.body;

        if (!appointmentId || !isValidObjectId(appointmentId)) {
            return res.status(400).json({ success: false, message: "Valid appointmentId is required." });
        }

        if (typeof chiefComplaint !== "string" || !chiefComplaint.trim()) {
            return res.status(400).json({ success: false, message: "chiefComplaint is required." });
        }

        if (typeof diagnosis !== "string" || !diagnosis.trim()) {
            return res.status(400).json({ success: false, message: "diagnosis is required." });
        }

        if (medicines !== undefined) {
            const normalized = normalizeMedicines(medicines);
            if (normalized === null) {
                return res.status(400).json({ success: false, message: "Medicines must be an array." });
            }
            // If provided, ensure every medicine has required model fields.
            for (const [idx, m] of normalized.entries()) {
                if (!m?.medicineName && m?.medicineName !== "") {
                    // medicineName is required by schema
                    return res.status(400).json({ success: false, message: `Medicine at index ${idx} missing medicineName.` });
                }
                if (!m?.dosage || !String(m.dosage).trim()) {
                    return res.status(400).json({ success: false, message: `Medicine at index ${idx} missing dosage.` });
                }
                if (!m?.duration || !String(m.duration).trim()) {
                    return res.status(400).json({ success: false, message: `Medicine at index ${idx} missing duration.` });
                }
            }
        }

        if (followUpRequired === true && !followUpDate) {
            return res.status(400).json({ success: false, message: "followUpDate is required when followUpRequired is true." });
        }

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ success: false, message: "Appointment not found." });
        }

        if (!ensureDoctorOwnershipForAppointment(appointment.doctor, doctor._id)) {
            return res.status(403).json({ success: false, message: "You are not assigned to this appointment." });
        }

        if (!assertAppointmentAllowedStatus(appointment.status)) {
            return res.status(409).json({
                success: false,
                message: "Prescription can only be created for appointments with status Completed or Confirmed.",
            });
        }

        // One appointment → one prescription
        const existingPrescription = await Prescription.findOne({ appointment: appointment._id });
        if (existingPrescription) {
            return res.status(409).json({ success: false, message: "Prescription already exists for this appointment." });
        }

        // Patient exists (ObjectId + doc)
        if (!isValidObjectId(appointment.patient)) {
            return res.status(400).json({ success: false, message: "Invalid patient in appointment." });
        }
        const patientExists = await User.findById(appointment.patient);
        if (!patientExists) {
            return res.status(404).json({ success: false, message: "Patient not found." });
        }

        // Doctor exists
        const doctorExists = await Doctor.findById(doctor._id);
        if (!doctorExists) {
            return res.status(404).json({ success: false, message: "Doctor not found." });
        }

        const prescriptionNumber = `RX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const created = await Prescription.create({
            patient: appointment.patient,
            doctor: doctor._id,
            appointment: appointment._id,
            chiefComplaint: chiefComplaint.trim(),
            diagnosis: diagnosis.trim(),
            clinicalNotes: clinicalNotes?.trim?.() ? clinicalNotes.trim() : clinicalNotes,
            advice: advice?.trim?.() ? advice.trim() : advice,
            medicines: medicines !== undefined ? normalizeMedicines(medicines) : [],
            investigations,
            followUpRequired: !!followUpRequired,
            followUpDate: followUpDate ? followUpDate : undefined,
            status: "Generated",
        });

        // Link prescription to appointment
        appointment.prescription = created._id;
        await appointment.save();

        return res.status(201).json({ success: true, message: "Prescription created successfully", prescription: created });
    } catch (error) {
        return res.status(500).json({ success: false, message: error?.message || "Database error" });
    }
};

// ===============================
// GET /api/prescriptions
// ===============================
export const getPrescriptions = async (req, res) => {
    try {
        const { page, limit, skip } = getPagination(req.query);

        const role = req.user?.role;
        if (!role) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        let filter = {};

        if (role === "admin") {
            filter = { $or: [{ status: { $ne: "Cancelled" } }, {}] };
        } else if (role === "doctor") {
            const doctor = await Doctor.findOne({ user: req.user._id });
            if (!doctor) {
                return res.status(403).json({ success: false, message: "Doctor profile not found." });
            }
            filter = { doctor: doctor._id };
        } else {
            // patient
            filter = { patient: req.user._id };
        }

        const [total, prescriptions] = await Promise.all([
            Prescription.countDocuments(filter),
            Prescription.find(filter)
                .sort({ generatedDate: -1 })
                .skip(skip)
                .limit(limit)
                .populate("patient", "user_name email")
                .populate("doctor", "fullName specialization")
                .populate("appointment", "appointmentNumber appointmentDate status")
                .lean(),
        ]);

        return res.status(200).json({
            success: true,
            prescriptions,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error?.message || "Database error" });
    }
};

// ===============================
// GET /api/prescriptions/:prescriptionId
// ===============================
export const getPrescriptionById = async (req, res) => {
    try {
        const { prescriptionId } = req.params;
        if (!isValidObjectId(prescriptionId)) {
            return res.status(400).json({ success: false, message: "Invalid prescriptionId" });
        }

        const prescription = await Prescription.findById(prescriptionId)
            .populate("patient", "user_name email")
            .populate("doctor", "fullName specialization")
            .populate("appointment", "appointmentNumber appointmentDate status");

        if (!prescription) {
            return res.status(404).json({ success: false, message: "Prescription not found" });
        }

        const role = req.user?.role;
        if (role === "admin") {
            return res.status(200).json({ success: true, prescription });
        }

        if (role === "doctor") {
            const doctor = await Doctor.findOne({ user: req.user._id });
            if (!doctor) {
                return res.status(403).json({ success: false, message: "Doctor profile not found." });
            }
            if (prescription.doctor.toString() !== doctor._id.toString()) {
                return res.status(403).json({ success: false, message: "Access denied." });
            }
            return res.status(200).json({ success: true, prescription });
        }

        // patient
        if (prescription.patient.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Access denied." });
        }

        return res.status(200).json({ success: true, prescription });
    } catch (error) {
        return res.status(500).json({ success: false, message: error?.message || "Database error" });
    }
};

// ===============================
// PATCH /api/prescriptions/:prescriptionId
// ===============================
export const editPrescription = async (req, res) => {
    try {
        const { prescriptionId } = req.params;
        if (!isValidObjectId(prescriptionId)) {
            return res.status(400).json({ success: false, message: "Invalid prescriptionId" });
        }

        const doctor = await getDoctorFromReq(req);
        if (!doctor) {
            return res.status(403).json({ success: false, message: "Doctor profile not found." });
        }

        const prescription = await Prescription.findById(prescriptionId);
        if (!prescription) {
            return res.status(404).json({ success: false, message: "Prescription not found" });
        }

        if (prescription.doctor.toString() !== doctor._id.toString()) {
            return res.status(403).json({ success: false, message: "You can only edit your own prescriptions." });
        }

        if (isFinalPrescription(prescription)) {
            return res.status(409).json({ success: false, message: "Final prescription cannot be modified." });
        }

        const update = pickMedicalContentPatch(req.body);

        if (update.medicines !== undefined && update.medicines === null) {
            return res.status(400).json({ success: false, message: "Medicines must be an array" });
        }

        if (update.followUpRequired === true && !update.followUpDate) {
            return res.status(400).json({ success: false, message: "followUpDate is required when followUpRequired is true" });
        }

        // Prevent updating immutable ownership fields
        delete update.patient;
        delete update.doctor;
        delete update.appointment;
        delete update.prescriptionNumber;
        delete update.generatedDate;

        Object.assign(prescription, update);
        await prescription.save();

        return res.status(200).json({ success: true, message: "Prescription updated successfully", prescription });
    } catch (error) {
        return res.status(500).json({ success: false, message: error?.message || "Database error" });
    }
};

// ===============================
// PATCH /api/prescriptions/:prescriptionId/finalize
// ===============================
export const finalizePrescription = async (req, res) => {
    try {
        const { prescriptionId } = req.params;
        if (!isValidObjectId(prescriptionId)) {
            return res.status(400).json({ success: false, message: "Invalid prescriptionId" });
        }

        const doctor = await getDoctorFromReq(req);
        if (!doctor) {
            return res.status(403).json({ success: false, message: "Doctor profile not found." });
        }

        const prescription = await Prescription.findById(prescriptionId);
        if (!prescription) {
            return res.status(404).json({ success: false, message: "Prescription not found" });
        }

        if (prescription.doctor.toString() !== doctor._id.toString()) {
            return res.status(403).json({ success: false, message: "You can only finalize your own prescriptions." });
        }

        if (isFinalPrescription(prescription)) {
            return res.status(409).json({ success: false, message: "Prescription already finalized." });
        }

        prescription.status = "Completed";
        await prescription.save();

        return res.status(200).json({ success: true, message: "Prescription finalized successfully", prescription });
    } catch (error) {
        return res.status(500).json({ success: false, message: error?.message || "Database error" });
    }
};

// ===============================
// DELETE /api/prescriptions/:prescriptionId
// ===============================
export const softDeletePrescription = async (req, res) => {
    try {
        const { prescriptionId } = req.params;
        if (!isValidObjectId(prescriptionId)) {
            return res.status(400).json({ success: false, message: "Invalid prescriptionId" });
        }

        const prescription = await Prescription.findById(prescriptionId);
        if (!prescription) {
            return res.status(404).json({ success: false, message: "Prescription not found" });
        }

        // Soft delete via status Cancelled (model supports Cancelled)
        prescription.status = "Cancelled";
        await prescription.save();

        return res.status(200).json({ success: true, message: "Prescription deleted successfully (soft delete)" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error?.message || "Database error" });
    }
};

