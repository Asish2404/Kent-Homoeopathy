import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
    discountPercent: { type: Number, required: true, min: 0 },
    brand: { type: String, trim: true, default: "" },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

bannerSchema.index({ discountPercent: 1 });

export const Banner = mongoose.model("Banner", bannerSchema);




