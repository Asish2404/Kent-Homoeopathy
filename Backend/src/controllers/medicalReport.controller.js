import mongoose from "mongoose";
import { MedicalReport } from "../models/medicalReport.model.js";
import { Appointment } from "../models/appointment.model.js";
import { Prescription } from "../models/prescription.model.js";
import { Doctor } from "../models/doctor.model.js";
import { User } from "../models/atanu.user.model.js";

const getPagination = (query = {}) => {
    const page = Number(query.page) > 0 ? Number(query.page) : 1;
    const limit = Number(query.limit) > 0 ? Math.min(Number(query.limit), 100) : 10;
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const REPORT_TYPES = new Set([
    "Blood Test",
    "Urine Test",
    "X-Ray",
    "MRI",
    "CT Scan",
    "ECG",
    "Ultrasound",
    "Prescription",
    "Previous Medical Record",
    "Other",
]);

// Business -> Model enum mapping (never change model enum)
const mapBusinessStatusToModelStatus = (status) => {
    switch (status) {
        case "Pending":
            return "Pending Review";
        case "Reviewed":
            return "Reviewed";
        case "Completed":
            return "Approved";
        case "Rejected":
            return "Rejected";
        case "Archived":
            return "Archived";
        default:
            return null;
    }
};

const getDoctorFromReq = async (req) => {
    const user = req.user;
    if (!user || user.role !== "doctor") return null;

    const doctor = await Doctor.findOne({ user: user._id });
    return doctor;
};

const normalizeFiles = (files) => {
    // Accept either:
    // - files: [{ fileUrl, publicId, ... }]
    // - fileUrl: string (single)
    if (!files) return [];
    if (!Array.isArray(files)) return null;

    return files.map((f) => ({
        originalFileName: typeof f?.originalFileName === "string" ? f.originalFileName.trim() : undefined,
        fileUrl: typeof f?.fileUrl === "string" ? f.fileUrl.trim() : undefined,
        thumbnailUrl: typeof f?.thumbnailUrl === "string" ? f.thumbnailUrl.trim() : undefined,
        fileSize: typeof f?.fileSize === "number" ? f.fileSize : undefined,
        fileFormat: typeof f?.fileFormat === "string" ? f.fileFormat.trim() : undefined,
        publicId: typeof f?.publicId === "string" ? f.publicId.trim() : undefined,
    }));
};

const normalizeSingleFileUrlIntoFiles = ({ fileUrl, files }) => {
    if (files !== undefined) return normalizeFiles(files);

    if (fileUrl === undefined || fileUrl === null) return [];
    if (typeof fileUrl !== "string" || !fileUrl.trim()) return null;

    return [{ fileUrl: fileUrl.trim() }];
};

const pickUpdateFields = (body) => {
    const allowed = [
        "reportName",
        "reportType",
        "description",
        "files",
        "fileUrl",
        "generatedDate",
        "reportDate",
        "remarks",
        "doctorNotes",
        "patientNotes",
        "adminNotes",
    ];

    const update = {};
    for (const k of allowed) {
        if (body[k] !== undefined) update[k] = body[k];
    }

    // Normalize reportDate -> generatedDate
    if (update.reportDate !== undefined) {
        update.generatedDate = update.reportDate;
        delete update.reportDate;
    }

    // Normalize remarks into doctorNotes (doctor editing)
    if (update.remarks !== undefined && update.doctorNotes === undefined) {
        update.doctorNotes = typeof update.remarks === "string" ? update.remarks.trim() : update.remarks;
        delete update.remarks;
    }

    return update;
};

const ensurePatientExists = async (patientId) => {
    if (!isValidObjectId(patientId)) return false;
    const user = await User.findById(patientId).lean();
    return !!user;
};

const ensureDoctorProfileExists = async (doctorId) => {
    if (!isValidObjectId(doctorId)) return false;
    const d = await Doctor.findById(doctorId);
    return !!d;
};

export const createMedicalReport = async (req, res) => {
    try {
        const {
            appointmentId,
            prescriptionId,
            patientId,
            doctorId,
            reportNumber,
            reportName,
            reportType,
            description,
            fileUrl,
            files,
            reportDate,
            status,
            remarks,
        } = req.body;

        if (!appointmentId || !isValidObjectId(appointmentId)) {
            return res.status(400).json({ success: false, message: "Valid appointmentId is required." });
        }

        if (typeof reportType !== "string" || !REPORT_TYPES.has(reportType)) {
            return res.status(400).json({ success: false, message: "Invalid reportType" });
        }

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ success: false, message: "Appointment not found." });
        }

        const role = req.user?.role;
        if (!role) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        let resolvedPatientId = null;
        let resolvedDoctorProfile = null;
        let resolvedDoctorId = null;

        if (role === "doctor") {
            resolvedDoctorProfile = await getDoctorFromReq(req);
            if (!resolvedDoctorProfile) {
                return res.status(403).json({ success: false, message: "Doctor profile not found." });
            }

            resolvedDoctorId = resolvedDoctorProfile._id;
            resolvedPatientId = appointment.patient?.toString();

            if (appointment.doctor?.toString() !== resolvedDoctorId.toString()) {
                return res.status(403).json({ success: false, message: "You are not assigned to this appointment." });
            }
        } else if (role === "user") {
            resolvedPatientId = req.user._id.toString();
            resolvedDoctorId = appointment.doctor?.toString() || null;

            if (appointment.patient?.toString() !== resolvedPatientId.toString()) {
                return res.status(403).json({ success: false, message: "You can only upload reports for your own appointment." });
            }
        } else if (role === "admin") {
            if (patientId && !isValidObjectId(patientId)) {
                return res.status(400).json({ success: false, message: "Invalid patientId" });
            }
            if (doctorId && !isValidObjectId(doctorId)) {
                return res.status(400).json({ success: false, message: "Invalid doctorId" });
            }

            resolvedPatientId = (patientId || appointment.patient)?.toString();
            resolvedDoctorId = (doctorId || appointment.doctor)?.toString();
        }

        if (!(await ensurePatientExists(resolvedPatientId))) {
            return res.status(404).json({ success: false, message: "Patient not found." });
        }

        if (resolvedDoctorId && !(await ensureDoctorProfileExists(resolvedDoctorId))) {
            return res.status(404).json({ success: false, message: "Doctor not found." });
        }

        let resolvedPrescriptionId = null;
        if (prescriptionId !== undefined && prescriptionId !== null) {
            if (!isValidObjectId(prescriptionId)) {
                return res.status(400).json({ success: false, message: "Invalid prescriptionId" });
            }

            const prescription = await Prescription.findById(prescriptionId);
            if (!prescription) {
                return res.status(404).json({ success: false, message: "Prescription not found." });
            }

            if (prescription.appointment?.toString() !== appointment._id.toString()) {
                return res.status(409).json({ success: false, message: "Prescription does not belong to this appointment." });
            }

            resolvedPrescriptionId = prescription._id;
        }

        const modelFiles = normalizeSingleFileUrlIntoFiles({ fileUrl, files });
        if (modelFiles === null) {
            return res.status(400).json({ success: false, message: "Invalid fileUrl/files" });
        }

        const modelStatus = status ? mapBusinessStatusToModelStatus(status) : "Pending Review";
        if (status && !modelStatus) {
            return res.status(400).json({ success: false, message: "Invalid status" });
        }

        const finalReportNumber =
            typeof reportNumber === "string" && reportNumber.trim().length
                ? reportNumber.trim()
                : `MR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        if (!reportName || typeof reportName !== "string" || !reportName.trim()) {
            return res.status(400).json({ success: false, message: "reportName is required." });
        }

        const created = await MedicalReport.create({
            patient: resolvedPatientId,
            doctor: role === "doctor" ? resolvedDoctorProfile._id : resolvedDoctorId || null,
            appointment: appointment._id,
            prescription: resolvedPrescriptionId || null,
            reportNumber: finalReportNumber,
            reportName: reportName.trim(),
            reportType,
            description: typeof description === "string" ? description.trim() : description,
            files: modelFiles,
            generatedDate: reportDate ? new Date(reportDate) : appointment.appointmentDate || new Date(),
            status: modelStatus,
            doctorNotes: role === "doctor" ? (typeof remarks === "string" ? remarks.trim() : remarks) : undefined,
            patientNotes: role === "user" ? (typeof remarks === "string" ? remarks.trim() : remarks) : undefined,
        });

        return res.status(201).json({
            success: true,
            message: "Medical report uploaded successfully",
            medicalReport: created,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error?.message || "Database error" });
    }
};

export const getMedicalReports = async (req, res) => {
    try {
        const { page, limit, skip } = getPagination(req.query);
        const { search = "", status } = req.query;

        const role = req.user?.role;
        if (!role) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        let filter = {};

        if (role === "admin") {
            filter = {};
        } else if (role === "doctor") {
            const doctor = await getDoctorFromReq(req);
            if (!doctor) {
                return res.status(403).json({ success: false, message: "Doctor profile not found." });
            }
            filter = { doctor: doctor._id };
        } else {
            filter = { patient: req.user._id };
        }

        if (status) {
            const mapped = mapBusinessStatusToModelStatus(status) || status;
            filter.status = mapped;
        }

        if (search) {
            const s = String(search).trim();
            filter.$or = [
                { reportName: { $regex: s, $options: "i" } },
                { reportNumber: { $regex: s, $options: "i" } },
                { description: { $regex: s, $options: "i" } },
            ];
        }

        const [total, reports] = await Promise.all([
            MedicalReport.countDocuments(filter),
            MedicalReport.find(filter)
                .sort({ generatedDate: -1 })
                .skip(skip)
                .limit(limit)
                .populate("patient", "user_name email")
                .populate("doctor", "fullName specialization")
                .populate("appointment", "appointmentNumber appointmentDate status patientName")
                .populate("prescription", "prescriptionNumber status")
                .lean(),
        ]);

        return res.status(200).json({
            success: true,
            medicalReports: reports,
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

export const getMedicalReportById = async (req, res) => {
    try {
        const { reportId } = req.params;
        if (!isValidObjectId(reportId)) {
            return res.status(400).json({ success: false, message: "Invalid reportId" });
        }

        const report = await MedicalReport.findById(reportId)
            .populate("patient", "user_name email")
            .populate("doctor", "fullName specialization")
            .populate("appointment", "appointmentNumber appointmentDate status patientName")
            .populate("prescription", "prescriptionNumber status")
            .lean();

        if (!report) {
            return res.status(404).json({ success: false, message: "Medical report not found" });
        }

        const role = req.user?.role;
        if (!role) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        if (role === "admin") return res.status(200).json({ success: true, medicalReport: report });

        if (role === "doctor") {
            const doctor = await getDoctorFromReq(req);
            if (!doctor) {
                return res.status(403).json({ success: false, message: "Doctor profile not found." });
            }
            if (report.doctor?.toString() !== doctor._id.toString()) {
                return res.status(403).json({ success: false, message: "Access denied." });
            }
            return res.status(200).json({ success: true, medicalReport: report });
        }

        if (report.patient?.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Access denied." });
        }

        return res.status(200).json({ success: true, medicalReport: report });
    } catch (error) {
        return res.status(500).json({ success: false, message: error?.message || "Database error" });
    }
};

export const updateMedicalReport = async (req, res) => {
    try {
        const { reportId } = req.params;
        if (!isValidObjectId(reportId)) {
            return res.status(400).json({ success: false, message: "Invalid reportId" });
        }

        if (req.user?.role !== "doctor") {
            return res.status(403).json({ success: false, message: "Doctor only." });
        }

        const doctor = await getDoctorFromReq(req);
        if (!doctor) {
            return res.status(403).json({ success: false, message: "Doctor profile not found." });
        }

        const report = await MedicalReport.findById(reportId);
        if (!report) {
            return res.status(404).json({ success: false, message: "Medical report not found" });
        }

        if (report.doctor?.toString() !== doctor._id.toString()) {
            return res.status(403).json({ success: false, message: "You can only edit your own patient's reports." });
        }

        // Model has no Draft state; enforce spec by allowing edit only while Pending Review.
        if (report.status !== "Pending Review") {
            return res.status(409).json({ success: false, message: "Report cannot be modified after review." });
        }

        const update = pickUpdateFields(req.body);

        if (update.reportType !== undefined) {
            if (typeof update.reportType !== "string" || !REPORT_TYPES.has(update.reportType)) {
                return res.status(400).json({ success: false, message: "Invalid reportType" });
            }
        }

        if (update.files !== undefined || update.fileUrl !== undefined) {
            const normalizedFiles = normalizeSingleFileUrlIntoFiles({ fileUrl: update.fileUrl, files: update.files });
            if (normalizedFiles === null) {
                return res.status(400).json({ success: false, message: "Invalid fileUrl/files" });
            }
            update.files = normalizedFiles;
            delete update.fileUrl;
        }

        // Prevent ownership / immutable fields update
        delete update.patient;
        delete update.doctor;
        delete update.appointment;
        delete update.prescription;
        delete update.reportNumber;
        delete update.status;
        delete update.visibleToDoctor;
        delete update.visibleToPatient;
        delete update.visibleToAdmin;

        if (update.generatedDate !== undefined) {
            const d = new Date(update.generatedDate);
            if (Number.isNaN(d.getTime())) {
                return res.status(400).json({ success: false, message: "Invalid reportDate/generatedDate" });
            }
            update.generatedDate = d;
        }

        Object.assign(report, update);
        await report.save();

        return res.status(200).json({
            success: true,
            message: "Medical report updated successfully",
            medicalReport: report,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error?.message || "Database error" });
    }
};

export const updateMedicalReportStatus = async (req, res) => {
    try {
        const { reportId } = req.params;
        if (!isValidObjectId(reportId)) {
            return res.status(400).json({ success: false, message: "Invalid reportId" });
        }

        const role = req.user?.role;
        if (!role || (role !== "doctor" && role !== "admin")) {
            return res.status(403).json({ success: false, message: "Doctor/Admin only" });
        }

        const { status, remarks } = req.body;
        const mapped = mapBusinessStatusToModelStatus(status);
        if (!mapped) {
            return res.status(400).json({ success: false, message: "Invalid status" });
        }

        const report = await MedicalReport.findById(reportId);
        if (!report) {
            return res.status(404).json({ success: false, message: "Medical report not found" });
        }

        if (role === "doctor") {
            const doctor = await getDoctorFromReq(req);
            if (!doctor) {
                return res.status(403).json({ success: false, message: "Doctor profile not found." });
            }
            if (report.doctor?.toString() !== doctor._id.toString()) {
                return res.status(403).json({ success: false, message: "Access denied." });
            }
            if (typeof remarks === "string") report.doctorNotes = remarks.trim();
        } else {
            if (typeof remarks === "string") report.adminNotes = remarks.trim();
        }

        report.status = mapped;
        await report.save();

        return res.status(200).json({
            success: true,
            message: "Medical report status updated successfully",
            medicalReport: report,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error?.message || "Database error" });
    }
};

export const softDeleteMedicalReport = async (req, res) => {
    try {
        const { reportId } = req.params;
        if (!isValidObjectId(reportId)) {
            return res.status(400).json({ success: false, message: "Invalid reportId" });
        }

        if (req.user?.role !== "admin") {
            return res.status(403).json({ success: false, message: "Admin only" });
        }

        const report = await MedicalReport.findById(reportId);
        if (!report) {
            return res.status(404).json({ success: false, message: "Medical report not found" });
        }

        // Soft delete by setting status Archived (model enum already has Archived)
        report.status = "Archived";
        await report.save();

        return res.status(200).json({ success: true, message: "Medical report deleted successfully (soft delete)" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error?.message || "Database error" });
    }
};

