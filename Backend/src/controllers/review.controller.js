import mongoose from "mongoose";

import { Appointment } from "../models/appointment.model.js";
import { Doctor } from "../models/atanu.doctor.model.js";
import { Order } from "../models/atanu.order.model.js";
import { Product } from "../models/atanu.product.model.js";
import { User } from "../models/atanu.user.model.js";
import { Review } from "../models/review.model.js";

const PUBLIC_STATUS = "Approved";
const COMPLETED_ORDER_STATUSES = new Set(["delivered", "completed"]);
const COMPLETED_APPOINTMENT_STATUSES = new Set(["completed"]);
const EDIT_WINDOW_HOURS = 24;

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const toNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

const getPagination = (query) => {
    const page = Number(query.page) > 0 ? Number(query.page) : 1;
    const limit = Number(query.limit) > 0 ? Number(query.limit) : 10;

    return {
        page,
        limit,
        skip: (page - 1) * limit,
    };
};

const normalizeText = (value) => (typeof value === "string" ? value.trim() : "");

const normalizeStatus = (value) => normalizeText(value).toLowerCase();

const getSort = (query) => {
    const sortBy = normalizeText(query.sortBy || query.sort || "newest").toLowerCase();

    if (sortBy === "mosthelpful") {
        return { helpfulCount: -1, createdAt: -1 };
    }

    return { createdAt: -1 };
};

const buildMediaList = (value) => {
    const items = Array.isArray(value) ? value : [];

    return items
        .map((item) => {
            if (typeof item === "string") {
                const url = item.trim();
                return url ? { url } : null;
            }

            if (item && typeof item === "object" && typeof item.url === "string") {
                const url = item.url.trim();
                return url ? { url } : null;
            }

            return null;
        })
        .filter(Boolean);
};

const resolveTarget = (body) => {
    const doctorId = normalizeText(body.doctorId);
    const productId = normalizeText(body.productId);

    if (doctorId && productId) {
        return { error: "Provide either doctorId or productId, not both." };
    }

    if (!doctorId && !productId) {
        return { error: "Either doctorId or productId is required." };
    }

    if (doctorId && !isValidObjectId(doctorId)) {
        return { error: "Invalid doctorId." };
    }

    if (productId && !isValidObjectId(productId)) {
        return { error: "Invalid productId." };
    }

    return {
        doctorId: doctorId || null,
        productId: productId || null,
    };
};

const getCompletedOrderForProduct = async ({ userId, productId }) => {
    const order = await Order.findOne({
        user: userId,
        $or: [{ "products.productId": productId }, { "orderItems.productId": productId }],
    }).sort({ createdAt: -1 });

    if (!order) {
        return null;
    }

    const orderStatus = normalizeStatus(order.status || order.orderStatus);

    if (!COMPLETED_ORDER_STATUSES.has(orderStatus)) {
        return null;
    }

    return order;
};

const getCompletedAppointment = async ({ userId, doctorId, appointmentId }) => {
    if (!appointmentId || !isValidObjectId(appointmentId)) {
        return null;
    }

    const appointment = await Appointment.findOne({
        _id: appointmentId,
        patient: userId,
        doctor: doctorId,
    });

    if (!appointment) {
        return null;
    }

    if (!COMPLETED_APPOINTMENT_STATUSES.has(normalizeStatus(appointment.status))) {
        return null;
    }

    return appointment;
};

const recalculateEntityRating = async ({ productId, doctorId }) => {
    const approvedMatch = { status: PUBLIC_STATUS };

    if (productId) {
        const productObjectId = new mongoose.Types.ObjectId(productId);
        const [summary] = await Review.aggregate([
            { $match: { ...approvedMatch, product: productObjectId } },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: "$rating" },
                    totalReviews: { $sum: 1 },
                },
            },
        ]);

        await Product.collection.updateOne(
            { _id: productObjectId },
            {
                $set: {
                    averageRating: Number((summary?.averageRating || 0).toFixed(2)),
                    totalReviews: summary?.totalReviews || 0,
                },
            }
        );
    }

    if (doctorId) {
        const doctorObjectId = new mongoose.Types.ObjectId(doctorId);
        const [summary] = await Review.aggregate([
            { $match: { ...approvedMatch, doctor: doctorObjectId } },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: "$rating" },
                    totalReviews: { $sum: 1 },
                },
            },
        ]);

        await Doctor.updateOne(
            { _id: doctorObjectId },
            {
                $set: {
                    averageRating: Number((summary?.averageRating || 0).toFixed(2)),
                    totalReviews: summary?.totalReviews || 0,
                },
            }
        );
    }
};

const buildReviewMatch = (query) => {
    const match = { status: PUBLIC_STATUS };

    const productId = normalizeText(query.productId);
    const doctorId = normalizeText(query.doctorId);
    const rating = query.rating;
    const status = normalizeText(query.status);

    if (productId) {
        if (!isValidObjectId(productId)) {
            return { error: "Invalid productId." };
        }

        match.product = new mongoose.Types.ObjectId(productId);
    }

    if (doctorId) {
        if (!isValidObjectId(doctorId)) {
            return { error: "Invalid doctorId." };
        }

        match.doctor = new mongoose.Types.ObjectId(doctorId);
    }

    if (rating !== undefined && rating !== null && String(rating).trim().length > 0) {
        const numericRating = toNumber(rating);

        if (!numericRating || numericRating < 1 || numericRating > 5) {
            return { error: "Invalid rating filter." };
        }

        match.rating = numericRating;
    }

    if (status && status !== PUBLIC_STATUS.toLowerCase()) {
        return { error: "Public review listings only expose approved reviews." };
    }

    return { match };
};

const getReviewPipeline = ({ match, search, sort, skip, limit }) => {
    const pipeline = [
        { $match: match },
        {
            $lookup: {
                from: User.collection.name,
                localField: "user",
                foreignField: "_id",
                as: "user",
            },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: Product.collection.name,
                localField: "product",
                foreignField: "_id",
                as: "product",
            },
        },
        { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: Doctor.collection.name,
                localField: "doctor",
                foreignField: "_id",
                as: "doctor",
            },
        },
        { $unwind: { path: "$doctor", preserveNullAndEmptyArrays: true } },
    ];

    const searchTerm = normalizeText(search);

    if (searchTerm) {
        const searchRegex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

        pipeline.push({
            $match: {
                $or: [
                    { reviewTitle: searchRegex },
                    { reviewDescription: searchRegex },
                    { status: searchRegex },
                    { "product.product_name": searchRegex },
                    { "doctor.fullName": searchRegex },
                ],
            },
        });
    }

    pipeline.push({ $sort: sort });
    pipeline.push({
        $facet: {
            reviews: [{ $skip: skip }, { $limit: limit }],
            meta: [{ $count: "totalCount" }],
        },
    });

    return pipeline;
};

const sanitizeReviewBody = (body) => ({
    rating: toNumber(body.rating),
    title: normalizeText(body.title ?? body.reviewTitle),
    comment: normalizeText(body.comment ?? body.reviewDescription),
    images: buildMediaList(body.images ?? body.reviewImages),
});

export const createReview = async (req, res) => {
    try {
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized." });
        }

        const target = resolveTarget(req.body);

        if (target.error) {
            return res.status(400).json({ success: false, message: target.error });
        }

        const { rating, title, comment, images } = sanitizeReviewBody(req.body);

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: "Rating must be between 1 and 5." });
        }

        if (target.productId) {
            const product = await Product.findById(target.productId).select("_id");

            if (!product) {
                return res.status(404).json({ success: false, message: "Product not found." });
            }

            const order = await getCompletedOrderForProduct({ userId, productId: target.productId });

            if (!order) {
                return res.status(403).json({ success: false, message: "Cannot review before purchase." });
            }

            const existingReview = await Review.findOne({ user: userId, product: target.productId });

            if (existingReview) {
                return res.status(409).json({ success: false, message: "Duplicate review for this product." });
            }

            const review = await Review.create({
                user: userId,
                product: target.productId,
                doctor: null,
                order: order._id,
                appointment: null,
                reviewTitle: title,
                reviewDescription: comment,
                rating,
                reviewImages: images,
                verifiedPurchase: true,
                verifiedConsultation: false,
                status: "Pending",
            });

            return res.status(201).json({
                success: true,
                message: "Medicine review submitted successfully.",
                review,
            });
        }

        const doctor = await Doctor.findById(target.doctorId).select("_id");

        if (!doctor) {
            return res.status(404).json({ success: false, message: "Doctor not found." });
        }

        const appointmentId = normalizeText(req.body.appointmentId);

        if (!appointmentId || !isValidObjectId(appointmentId)) {
            return res.status(400).json({ success: false, message: "Valid appointmentId is required for doctor reviews." });
        }

        const appointment = await getCompletedAppointment({
            userId,
            doctorId: target.doctorId,
            appointmentId,
        });

        if (!appointment) {
            return res.status(403).json({ success: false, message: "Cannot review before consultation." });
        }

        const existingReview = await Review.findOne({ user: userId, appointment: appointmentId });

        if (existingReview) {
            return res.status(409).json({ success: false, message: "Duplicate review for this appointment." });
        }

        const review = await Review.create({
            user: userId,
            product: null,
            doctor: target.doctorId,
            order: null,
            appointment: appointmentId,
            reviewTitle: title,
            reviewDescription: comment,
            rating,
            reviewImages: images,
            verifiedPurchase: false,
            verifiedConsultation: true,
            status: "Pending",
        });

        return res.status(201).json({
            success: true,
            message: "Doctor review submitted successfully.",
            review,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error?.message || "Database error." });
    }
};

export const getReviews = async (req, res) => {
    try {
        const { page, limit, skip } = getPagination(req.query);
        const sort = getSort(req.query);
        const search = req.query.search || req.query.q || "";

        const filterResult = buildReviewMatch(req.query);

        if (filterResult.error) {
            return res.status(400).json({ success: false, message: filterResult.error });
        }

        const aggregateResult = await Review.aggregate(
            getReviewPipeline({
                match: filterResult.match,
                search,
                sort,
                skip,
                limit,
            })
        );

        const payload = aggregateResult[0] || { reviews: [], meta: [] };
        const reviews = payload.reviews || [];
        const totalCount = payload.meta?.[0]?.totalCount || 0;

        return res.status(200).json({
            success: true,
            reviews,
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(totalCount / limit),
                totalCount,
            },
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error?.message || "Database error." });
    }
};

export const getReviewById = async (req, res) => {
    try {
        const { reviewId } = req.params;

        if (!isValidObjectId(reviewId)) {
            return res.status(400).json({ success: false, message: "Invalid reviewId." });
        }

        const aggregateResult = await Review.aggregate(
            getReviewPipeline({
                match: {
                    _id: new mongoose.Types.ObjectId(reviewId),
                    status: PUBLIC_STATUS,
                },
                search: "",
                sort: { createdAt: -1 },
                skip: 0,
                limit: 1,
            })
        );

        const review = aggregateResult[0]?.reviews?.[0] || null;

        if (!review) {
            return res.status(404).json({ success: false, message: "Review not found." });
        }

        return res.status(200).json({ success: true, review });
    } catch (error) {
        return res.status(500).json({ success: false, message: error?.message || "Database error." });
    }
};

export const updateReview = async (req, res) => {
    try {
        const userId = req.user?._id;
        const { reviewId } = req.params;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized." });
        }

        if (!isValidObjectId(reviewId)) {
            return res.status(400).json({ success: false, message: "Invalid reviewId." });
        }

        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({ success: false, message: "Review not found." });
        }

        if (review.user.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: "Owner only." });
        }

        if (review.status === PUBLIC_STATUS) {
            const moderatedAt = review.moderatedDate || review.updatedAt || review.createdAt;
            const ageInHours = (Date.now() - new Date(moderatedAt).getTime()) / (1000 * 60 * 60);

            if (ageInHours > EDIT_WINDOW_HOURS) {
                return res.status(400).json({ success: false, message: "Cannot edit Approved review after 24 hours." });
            }
        }

        const nextRating = req.body.rating !== undefined ? toNumber(req.body.rating) : null;

        if (req.body.rating !== undefined && (!nextRating || nextRating < 1 || nextRating > 5)) {
            return res.status(400).json({ success: false, message: "Rating must be between 1 and 5." });
        }

        if (req.body.title !== undefined || req.body.reviewTitle !== undefined) {
            review.reviewTitle = normalizeText(req.body.title ?? req.body.reviewTitle);
        }

        if (req.body.comment !== undefined || req.body.reviewDescription !== undefined) {
            review.reviewDescription = normalizeText(req.body.comment ?? req.body.reviewDescription);
        }

        if (req.body.images !== undefined || req.body.reviewImages !== undefined) {
            review.reviewImages = buildMediaList(req.body.images ?? req.body.reviewImages);
        }

        if (nextRating !== null) {
            review.rating = nextRating;
        }

        const previousStatus = review.status;

        review.status = "Pending";
        review.moderatedBy = null;
        review.moderatedDate = null;

        await review.save();

        if (previousStatus === PUBLIC_STATUS) {
            await recalculateEntityRating({ productId: review.product, doctorId: review.doctor });
        }

        return res.status(200).json({ success: true, message: "Review updated successfully.", review });
    } catch (error) {
        return res.status(500).json({ success: false, message: error?.message || "Database error." });
    }
};

export const deleteReview = async (req, res) => {
    try {
        const userId = req.user?._id;
        const { reviewId } = req.params;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized." });
        }

        if (!isValidObjectId(reviewId)) {
            return res.status(400).json({ success: false, message: "Invalid reviewId." });
        }

        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({ success: false, message: "Review not found." });
        }

        if (review.user.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: "Owner only." });
        }

        const previousStatus = review.status;

        review.status = "Hidden";
        review.deletedAt = new Date();
        review.moderatedBy = null;
        review.moderatedDate = null;

        await review.save();

        if (previousStatus === PUBLIC_STATUS) {
            await recalculateEntityRating({ productId: review.product, doctorId: review.doctor });
        }

        return res.status(200).json({ success: true, message: "Review removed successfully." });
    } catch (error) {
        return res.status(500).json({ success: false, message: error?.message || "Database error." });
    }
};

export const voteHelpful = async (req, res) => {
    try {
        const userId = req.user?._id;
        const { reviewId } = req.params;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized." });
        }

        if (!isValidObjectId(reviewId)) {
            return res.status(400).json({ success: false, message: "Invalid reviewId." });
        }

        const updatedReview = await Review.findOneAndUpdate(
            {
                _id: reviewId,
                helpfulVotes: { $ne: userId },
            },
            {
                $addToSet: { helpfulVotes: userId },
                $inc: { helpfulCount: 1 },
            },
            {
                new: true,
            }
        );

        if (!updatedReview) {
            const existingReview = await Review.findById(reviewId);

            if (!existingReview) {
                return res.status(404).json({ success: false, message: "Review not found." });
            }

            return res.status(409).json({ success: false, message: "You have already marked this review as helpful." });
        }

        return res.status(200).json({
            success: true,
            message: "Helpful vote recorded successfully.",
            review: updatedReview,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error?.message || "Database error." });
    }
};

export const reportReview = async (req, res) => {
    try {
        const userId = req.user?._id;
        const { reviewId } = req.params;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized." });
        }

        if (!isValidObjectId(reviewId)) {
            return res.status(400).json({ success: false, message: "Invalid reviewId." });
        }

        const review = await Review.findByIdAndUpdate(reviewId, { $inc: { reportCount: 1 } }, { new: true });

        if (!review) {
            return res.status(404).json({ success: false, message: "Review not found." });
        }

        return res.status(200).json({ success: true, message: "Review reported successfully.", review });
    } catch (error) {
        return res.status(500).json({ success: false, message: error?.message || "Database error." });
    }
};

export const approveReview = async (req, res) => {
    try {
        const { reviewId } = req.params;

        if (!isValidObjectId(reviewId)) {
            return res.status(400).json({ success: false, message: "Invalid reviewId." });
        }

        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({ success: false, message: "Review not found." });
        }

        review.status = PUBLIC_STATUS;
        review.moderatedBy = req.user?._id || null;
        review.moderatedDate = new Date();
        review.deletedAt = null;

        await review.save();
        await recalculateEntityRating({ productId: review.product, doctorId: review.doctor });

        return res.status(200).json({ success: true, message: "Review approved successfully.", review });
    } catch (error) {
        return res.status(500).json({ success: false, message: error?.message || "Database error." });
    }
};

export const rejectReview = async (req, res) => {
    try {
        const { reviewId } = req.params;

        if (!isValidObjectId(reviewId)) {
            return res.status(400).json({ success: false, message: "Invalid reviewId." });
        }

        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({ success: false, message: "Review not found." });
        }

        const previousStatus = review.status;

        review.status = "Rejected";
        review.moderatedBy = req.user?._id || null;
        review.moderatedDate = new Date();
        review.deletedAt = null;

        await review.save();

        if (previousStatus === PUBLIC_STATUS) {
            await recalculateEntityRating({ productId: review.product, doctorId: review.doctor });
        }

        return res.status(200).json({ success: true, message: "Review rejected successfully.", review });
    } catch (error) {
        return res.status(500).json({ success: false, message: error?.message || "Database error." });
    }
};

export const hideReview = async (req, res) => {
    try {
        const { reviewId } = req.params;

        if (!isValidObjectId(reviewId)) {
            return res.status(400).json({ success: false, message: "Invalid reviewId." });
        }

        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({ success: false, message: "Review not found." });
        }

        const previousStatus = review.status;

        review.status = "Hidden";
        review.moderatedBy = req.user?._id || null;
        review.moderatedDate = new Date();
        review.deletedAt = new Date();

        await review.save();

        if (previousStatus === PUBLIC_STATUS) {
            await recalculateEntityRating({ productId: review.product, doctorId: review.doctor });
        }

        return res.status(200).json({ success: true, message: "Review hidden successfully.", review });
    } catch (error) {
        return res.status(500).json({ success: false, message: error?.message || "Database error." });
    }
};

