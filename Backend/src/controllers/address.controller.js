import mongoose from "mongoose";
import { Address } from "../models/address.model.js";

const REQUIRED_FIELDS = [
    "fullName",
    "phoneNumber",
    "addressLine1",
    "city",
    "state",
    "postalCode",
    "country",
    "addressType",
];

const validateRequiredFields = (body) => {
    const missing = REQUIRED_FIELDS.filter((f) => {
        const v = body?.[f];
        return typeof v !== "string" || v.trim().length === 0;
    });

    return missing;
};

const normalizePhone = (phone) => (typeof phone === "string" ? phone.replace(/\s+/g, "").trim() : "");
const normalizePostalCode = (postalCode) =>
    typeof postalCode === "string" ? postalCode.replace(/\s+/g, "").trim() : "";

const buildDuplicateQuery = (userId, body) => {
    // Duplicate prevention: same user + same phone + same addressLine1 + postalCode
    return {
        user: userId,
        phoneNumber: normalizePhone(body.phoneNumber),
        addressLine1: body.addressLine1?.trim(),
        postalCode: normalizePostalCode(body.postalCode),
    };
};

const getAddressProjection = () => {
    // Return full doc; leaving as-is for compatibility.
    return null;
};

export const addAddress = async (req, res) => {
    try {
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const missing = validateRequiredFields(req.body);
        if (missing.length) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missing.join(", ")}`,
            });
        }

        const phoneNumber = normalizePhone(req.body.phoneNumber);
        const postalCode = normalizePostalCode(req.body.postalCode);

        // Phone / postal validation (schema-driven constraints). We also validate here for better 400 responses.
        if (!/^\d{10}$/.test(phoneNumber)) {
            return res.status(400).json({ success: false, message: "Phone number must contain exactly 10 digits" });
        }

        if (!/^\d{6}$/.test(postalCode)) {
            return res.status(400).json({ success: false, message: "Postal code must contain exactly 6 digits" });
        }

        const duplicateQuery = buildDuplicateQuery(userId, { ...req.body, phoneNumber, postalCode });
        const duplicate = await Address.findOne(duplicateQuery);
        if (duplicate) {
            return res.status(409).json({
                success: false,
                message: "Duplicate address",
            });
        }

        const existingCount = await Address.countDocuments({ user: userId, isActive: true });
        const isDefault = existingCount === 0;

        const addressDoc = await Address.create({
            ...req.body,
            user: userId,
            phoneNumber,
            postalCode,
            isDefault,
        });

        // Ensure only ONE default across user
        if (isDefault) {
            await Address.updateMany(
                { user: userId, _id: { $ne: addressDoc._id } },
                { $set: { isDefault: false } }
            );
        } else {
            // Ensure the user still has at most ONE active default
            await Address.updateMany(
                { user: userId, isDefault: true, _id: { $ne: addressDoc._id }, isActive: true },
                { $set: { isDefault: false } }
            );
        }


        return res.status(201).json({
            success: true,
            message: "Address added successfully",
            address: addressDoc,
        });
    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            return res.status(400).json({
                success: false,
                message: error.message || "Validation error",
            });
        }

        return res.status(500).json({
            success: false,
            message: error?.message || "Database error",
        });
    }
};

export const getMyAddresses = async (req, res) => {
    try {
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const addresses = await Address.find({ user: userId, isActive: true })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            addresses,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error?.message || "Database error",
        });
    }
};

export const getAddressById = async (req, res) => {
    try {
        const userId = req.user?._id;
        const { addressId } = req.params;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        if (!mongoose.Types.ObjectId.isValid(addressId)) {
            return res.status(400).json({ success: false, message: "Invalid addressId" });
        }

        const address = await Address.findOne({ _id: addressId, user: userId, isActive: true });

        if (!address) {
            return res.status(404).json({ success: false, message: "Address not found" });
        }

        return res.status(200).json({ success: true, address });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error?.message || "Database error",
        });
    }
};

export const updateAddress = async (req, res) => {
    try {
        const userId = req.user?._id;
        const { addressId } = req.params;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        if (!mongoose.Types.ObjectId.isValid(addressId)) {
            return res.status(400).json({ success: false, message: "Invalid addressId" });
        }

        // Required fields validation for PATCH (as per requirement)
        const missing = validateRequiredFields(req.body);
        if (missing.length) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missing.join(", ")}`,
            });
        }

        const phoneNumber = normalizePhone(req.body.phoneNumber);
        const postalCode = normalizePostalCode(req.body.postalCode);

        if (!/^\d{10}$/.test(phoneNumber)) {
            return res.status(400).json({ success: false, message: "Phone number must contain exactly 10 digits" });
        }

        if (!/^\d{6}$/.test(postalCode)) {
            return res.status(400).json({ success: false, message: "Postal code must contain exactly 6 digits" });
        }

        const address = await Address.findOne({ _id: addressId, user: userId, isActive: true });
        if (!address) {
            return res.status(404).json({ success: false, message: "Address not found" });
        }

        const duplicateQuery = buildDuplicateQuery(userId, { ...req.body, phoneNumber, postalCode });
        const duplicate = await Address.findOne({
            ...duplicateQuery,
            _id: { $ne: addressId },
        });

        if (duplicate) {
            return res.status(409).json({
                success: false,
                message: "Duplicate address",
            });
        }

        address.fullName = req.body.fullName.trim();
        address.phoneNumber = phoneNumber;
        address.addressLine1 = req.body.addressLine1.trim();
        address.addressLine2 = req.body.addressLine2?.trim() || "";
        address.landmark = req.body.landmark?.trim() || "";
        address.city = req.body.city.trim();
        address.state = req.body.state.trim();
        address.district = req.body.district?.trim() || address.district;
        address.postalCode = postalCode;
        address.country = req.body.country?.trim() || address.country;
        address.addressType = req.body.addressType;
        address.isDefault = Boolean(req.body.isDefault ?? address.isDefault);
        address.email = req.body.email?.trim() || address.email;
        address.alternatePhoneNumber = req.body.alternatePhoneNumber?.trim() || address.alternatePhoneNumber;

        await address.save();

        // If this address was marked default, unset others
        if (address.isDefault) {
            await Address.updateMany(
                { user: userId, _id: { $ne: address._id } },
                { $set: { isDefault: false } }
            );
        }

        return res.status(200).json({
            success: true,
            message: "Address updated successfully",
            address,
        });
    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            return res.status(400).json({ success: false, message: error.message || "Validation error" });
        }

        return res.status(500).json({
            success: false,
            message: error?.message || "Database error",
        });
    }
};

export const deleteAddress = async (req, res) => {
    try {
        const userId = req.user?._id;
        const { addressId } = req.params;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        if (!mongoose.Types.ObjectId.isValid(addressId)) {
            return res.status(400).json({ success: false, message: "Invalid addressId" });
        }

        const address = await Address.findOne({ _id: addressId, user: userId, isActive: true });
        if (!address) {
            return res.status(404).json({ success: false, message: "Address not found" });
        }

        const wasDefault = address.isDefault;

        await Address.updateOne({ _id: addressId }, { $set: { isActive: false, isDefault: false } });

        if (wasDefault) {
            // Promote another address (newest remaining)
            const nextDefault = await Address.findOne({
                user: userId,
                isActive: true,
            })
                .sort({ createdAt: -1 });

            if (nextDefault) {
                await Address.updateMany(
                    { user: userId },
                    { $set: { isDefault: false } }
                );
                nextDefault.isDefault = true;
                await nextDefault.save();
            }
        }

        return res.status(200).json({
            success: true,
            message: "Address deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error?.message || "Database error",
        });
    }
};

export const setDefaultAddress = async (req, res) => {
    try {
        const userId = req.user?._id;
        const { addressId } = req.params;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        if (!mongoose.Types.ObjectId.isValid(addressId)) {
            return res.status(400).json({ success: false, message: "Invalid addressId" });
        }

        const address = await Address.findOne({ _id: addressId, user: userId, isActive: true });
        if (!address) {
            return res.status(404).json({ success: false, message: "Address not found" });
        }

        await Address.updateMany(
            { user: userId, isActive: true },
            { $set: { isDefault: false } }
        );

        address.isDefault = true;
        await address.save();

        return res.status(200).json({
            success: true,
            message: "Default address set successfully",
            address,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error?.message || "Database error",
        });
    }
};

