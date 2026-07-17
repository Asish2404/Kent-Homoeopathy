import mongoose from "mongoose";

const stockMovementSchema = new mongoose.Schema(
    {
        movementType: {
            type: String,
            enum: ["Stock Added", "Stock Removed", "Reserved", "Released", "Damaged", "Returned", "Expired"],
            required: true,
            trim: true,
        },

        quantity: {
            type: Number,
            required: true,
            min: [1, "Movement quantity must be at least 1"],
        },

        referenceType: {
            type: String,
            trim: true,
        },

        referenceId: {
            type: mongoose.Schema.Types.ObjectId,
            trim: true,
        },

        description: {
            type: String,
            trim: true,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        timestamp: {
            type: Date,
            default: Date.now,
        },
    },
    { _id: false }
);

const inventorySchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
            unique: true,
            index: true,
        },

        sku: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true,
            index: true,
        },

        barcode: {
            type: String,
            trim: true,
            unique: true,
            sparse: true,
            index: true,
        },

        batchNumber: {
            type: String,
            trim: true,
            index: true,
        },

        manufacturerBatchNumber: {
            type: String,
            trim: true,
        },

        warehouseLocation: {
            type: String,
            trim: true,
            index: true,
        },

        currentStock: {
            type: Number,
            required: true,
            default: 0,
            min: [0, "Current stock cannot be negative"],
        },

        reservedStock: {
            type: Number,
            default: 0,
            min: [0, "Reserved stock cannot be negative"],
        },

        availableStock: {
            type: Number,
            required: true,
            default: 0,
            min: [0, "Available stock cannot be negative"],
        },

        minimumStockLevel: {
            type: Number,
            default: 0,
            min: [0, "Minimum stock level cannot be negative"],
        },

        maximumStockLevel: {
            type: Number,
            default: 0,
            min: [0, "Maximum stock level cannot be negative"],
        },

        reorderLevel: {
            type: Number,
            default: 0,
            min: [0, "Reorder level cannot be negative"],
        },

        reorderQuantity: {
            type: Number,
            default: 0,
            min: [0, "Reorder quantity cannot be negative"],
        },

        manufacturingDate: {
            type: Date,
        },

        expiryDate: {
            type: Date,
            validate: {
                validator: function (value) {
                    if (!value || !this.manufacturingDate) {
                        return true;
                    }

                    return value > this.manufacturingDate;
                },
                message: "Expiry date must be greater than manufacturing date",
            },
        },

        shelfLife: {
            type: String,
            trim: true,
        },

        medicineType: {
            type: String,
            trim: true,
        },

        storageInstructions: {
            type: String,
            trim: true,
        },

        temperatureRequirement: {
            type: String,
            trim: true,
        },

        purchasePrice: {
            type: Number,
            required: true,
            default: 0,
            min: [0.01, "Purchase price must be greater than zero"],
        },

        sellingPrice: {
            type: Number,
            required: true,
            default: 0,
            min: [0.01, "Selling price must be greater than zero"],
        },

        mrp: {
            type: Number,
            required: true,
            default: 0,
            min: [0.01, "MRP must be greater than zero"],
        },

        gstPercentage: {
            type: Number,
            default: 0,
            min: [0, "GST percentage cannot be negative"],
        },

        stockStatus: {
            type: String,
            enum: ["In Stock", "Low Stock", "Out Of Stock", "Discontinued", "Expired"],
            default: "In Stock",
            required: true,
            trim: true,
            index: true,
        },

        stockMovements: {
            type: [stockMovementSchema],
            default: [],
            validate: {
                validator: (values) => Array.isArray(values),
                message: "Stock movements must be an array",
            },
        },

        supplierName: {
            type: String,
            trim: true,
        },

        supplierCode: {
            type: String,
            trim: true,
        },

        supplierContact: {
            type: String,
            trim: true,
        },

        supplierEmail: {
            type: String,
            trim: true,
            lowercase: true,
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid supplier email address"],
        },

        lastStockUpdate: {
            type: Date,
            default: Date.now,
        },

        lastPhysicalVerification: {
            type: Date,
        },

        verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Lookup indexes for pharmacy inventory, expiry management, and admin operations.
inventorySchema.index({ product: 1 });
inventorySchema.index({ sku: 1 });
inventorySchema.index({ barcode: 1 });
inventorySchema.index({ batchNumber: 1 });
inventorySchema.index({ expiryDate: 1 });
inventorySchema.index({ stockStatus: 1 });
inventorySchema.index({ warehouseLocation: 1 });

export const Inventory = mongoose.model("Inventory", inventorySchema);
