import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
    {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true },
        productName: { type: String },
        productImage: { type: String },
        mrpPrice: { type: Number },
        discountPrice: { type: Number },
        unitPrice: { type: Number },
        subtotal: { type: Number },
        // ===== Variant-based order support =====
        variant_id: { type: String, default: "" },
        variant_index: { type: Number, default: null },
        selected_size: { type: String, default: "" },
        selected_potency: { type: String, default: "" },
        selling_price: { type: Number, default: 0 },
    },
    { _id: false }
);


const orderSchema = new mongoose.Schema(
    {
        orderNumber: { type: String, index: true },

        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

        products: { type: [orderItemSchema], default: undefined },
        orderItems: { type: [orderItemSchema], default: undefined },

        orderPrice: { type: Number, required: true },

        // Shipping
        shippingAddress: {
            fullName: { type: String },
            phone: { type: String },
            email: { type: String },
            house: { type: String },
            street: { type: String },
            landmark: { type: String },
            city: { type: String },
            state: { type: String },
            pincode: { type: String },
            slot: { type: String },
        },

        address: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

        // Payment
        paymentMethod: { type: String },
        paymentStatus: { type: String, default: "Pending" },

        // Pricing
        subtotal: { type: Number, default: 0 },
        discount: { type: Number, default: 0 },
        deliveryCharge: { type: Number, default: 0 },
        tax: { type: Number, default: 0 },
        grandTotal: { type: Number, default: 0 },

        // Order lifecycle
        status: {
            type: String,
            enum: ["pending", "confirmed", "processing", "packed", "shipped", "delivered", "cancelled"],
            default: "pending",
        },
        orderStatus: { type: String },

        estimatedDelivery: { type: Date },
    },
    { timestamps: true }
);


export const Order = mongoose.model("Order",orderSchema)