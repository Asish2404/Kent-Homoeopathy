import { Banner } from "../models/banner.model.js";

/**
 * Get active, in-date-range banners for the homepage promotional carousel.
 * Public read-only endpoint (guest-accessible).
 *
 * Query params (all optional):
 *  - position: filter by bannerPosition (e.g. "Hero")
 *  - limit: max number of banners to return (default 10)
 */
export const getActiveBanners = async (req, res) => {
  try {
    const limit = Math.max(1, Math.min(50, Number(req.query.limit) || 10));
    const position = req.query.position;

    const now = new Date();
    const filter = {
      isActive: true,
      $or: [
        { startDate: { $exists: false } },
        { startDate: null },
        { startDate: { $lte: now } },
      ],
      $and: [
        {
          $or: [
            { endDate: { $exists: false } },
            { endDate: null },
            { endDate: { $gte: now } },
          ],
        },
      ],
    };

    if (position) {
      filter.bannerPosition = position;
    }

    const banners = await Banner.find(filter)
      .sort({ sortOrder: 1, createdAt: -1 })
      .limit(limit);

    // Map to the shape the frontend expects.
    const mapped = banners.map((b) => ({
      _id: b._id,
      title: b.bannerTitle,
      subtitle: b.subtitle || b.description || "",
      image: b.desktopImageUrl || b.mobileImageUrl || b.thumbnailUrl || "",
      ctaText: b.buttonText || "Shop Now",
      ctaLink: b.buttonUrl || "/Products",
      altText: b.altText || b.bannerTitle || "Promotional banner",
      sortOrder: b.sortOrder,
    }));

    res.status(200).json({
      success: true,
      count: mapped.length,
      banners: mapped,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
