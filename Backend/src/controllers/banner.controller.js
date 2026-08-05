import { Banner } from "../models/banner.model.js";

export const getBanners = async (_req, res) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort({ discountPercent: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: banners.length,
      banners,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};