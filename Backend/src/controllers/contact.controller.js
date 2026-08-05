import { Contact } from "../models/contact.model.js";

/**
 * Submit a contact / support inquiry.
 * Guests and authenticated users can both submit.
 * Saves to the Contact collection (admin can review later).
 * Optionally sends an email notification if SMTP is configured.
 */
export const createContact = async (req, res) => {
    try {
        const {
            fullName,
            email,
            phoneNumber,
            companyName = "",
            subject,
            message,
            inquiryType = "General Inquiry",
        } = req.body || {};

        // Basic required-field validation
        if (!fullName || !email || !phoneNumber || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: "fullName, email, phoneNumber, subject and message are required",
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email address",
            });
        }

        const contact = await Contact.create({
            fullName,
            email,
            phoneNumber,
            companyName,
            subject,
            message,
            inquiryType,
            user: req.user?._id || null,
            priority: "Medium",
            status: "Open",
            assignedTo: null,
            assignedDate: null,
            resolutionNotes: "",
            resolvedDate: null,
            closedDate: null,
            internalNotes: "",
            attachmentUrl: "",
        });

// Optional email notification — resolves gracefully when no email
        // provider is configured (see utils/email.utils.js). Never blocks.
        try {
            const { sendContactEmail } = await import("../utils/email.utils.js");
            await sendContactEmail({ contact });
        } catch (emailErr) {
            console.error("Contact email notification failed:", emailErr?.message || emailErr);
        }

        return res.status(201).json({
            success: true,
            message: "Your message has been received. Our team will reach out shortly.",
            contact: {
                _id: contact._id,
                fullName: contact.fullName,
                email: contact.email,
                subject: contact.subject,
                status: contact.status,
                createdAt: contact.createdAt,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to submit your message. Please try again.",
        });
    }
};

/**
 * Admin: list all contact inquiries with optional pagination + status filter.
 */
export const getContacts = async (req, res) => {
    try {
        const page = Number(req.query.page) > 0 ? Number(req.query.page) : 1;
        const limit = Number(req.query.limit) > 0 ? Number(req.query.limit) : 20;
        const skip = (page - 1) * limit;

        const { status, inquiryType } = req.query || {};
        const filter = {};
        if (status) filter.status = status;
        if (inquiryType) filter.inquiryType = inquiryType;

        const [contacts, totalCount] = await Promise.all([
            Contact.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Contact.countDocuments(filter),
        ]);

        return res.status(200).json({
            success: true,
            contacts,
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(totalCount / limit),
                totalCount,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch contacts",
        });
    }
};

/**
 * Admin: update contact status / priority / notes.
 */
export const updateContact = async (req, res) => {
    try {
        const { contactId } = req.params;
        const { status, priority, internalNotes, resolutionNotes, assignedTo } = req.body || {};

        const contact = await Contact.findById(contactId);
        if (!contact) {
            return res.status(404).json({ success: false, message: "Contact not found" });
        }

        const now = new Date();

        if (status) contact.status = status;
        if (priority) contact.priority = priority;
        if (internalNotes !== undefined) contact.internalNotes = internalNotes;
        if (resolutionNotes !== undefined) contact.resolutionNotes = resolutionNotes;
        if (assignedTo !== undefined) {
            contact.assignedTo = assignedTo || null;
            contact.assignedDate = assignedTo ? now : null;
        }
        if (status === "Resolved" && !contact.resolvedDate) contact.resolvedDate = now;
        if (status === "Closed" && !contact.closedDate) contact.closedDate = now;

        await contact.save();

        return res.status(200).json({ success: true, message: "Contact updated", contact });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to update contact",
        });
    }
};

/**
 * Admin: delete a contact inquiry.
 */
export const deleteContact = async (req, res) => {
    try {
        const { contactId } = req.params;
        const contact = await Contact.findByIdAndDelete(contactId);
        if (!contact) {
            return res.status(404).json({ success: false, message: "Contact not found" });
        }
        return res.status(200).json({ success: true, message: "Contact deleted" });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to delete contact",
        });
    }
};
