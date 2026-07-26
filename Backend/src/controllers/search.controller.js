import { Product } from "../models/atanu.product.model.js";
import { Doctor } from "../models/atanu.doctor.model.js";
import { Category } from "../models/atanu.category.model.js";
import { LabTest } from "../models/atanu.labtest.model.js";
import { Faq } from "../models/faq.model.js";

const toQuery = (value) => String(value || "").trim();

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const mapProduct = (product) => ({
  _id: product._id,
  product_name: product.product_name,
  product_image: product.product_image,
  brand: product.brand,
  short_description: product.short_description,
  discount_price: product.discount_price,
  mrp_price: product.mrp_price,
  category: product.category,
  isKentProduct: product.isKentProduct,
});

export const universalSearch = async (req, res) => {
  try {
    const q = toQuery(req.query.q);

    if (!q) {
      return res.status(200).json({
        success: true,
        products: [],
        doctors: [],
        categories: [],
        labTests: [],
        faqs: [],
      });
    }

    const rx = new RegExp(escapeRegex(q), "i");
    const limit = 6;

    const [products, doctors, categories, labTests, faqs] = await Promise.all([
      Product.find({
        $or: [
          { product_name: rx },
          { brand: rx },
          { short_description: rx },
          { detailed_description: rx },
        ],
      }).populate("category").limit(limit),
      Doctor.find({
        $or: [
          { doctor_name: rx },
          { specialization: rx },
          { qualification: rx },
          { hospital: rx },
          { about: rx },
        ],
      }).limit(limit),
      Category.find({ category_name: rx }).limit(limit),
      LabTest.find({
        $or: [{ test_name: rx }, { refered_by: rx }],
      }).limit(limit),
      Faq.find({
        isActive: true,
        $or: [{ question: rx }, { answer: rx }, { keywords: rx }, { category: rx }],
      }).limit(limit),
    ]);

    return res.status(200).json({
      success: true,
      products: products.map(mapProduct),
      doctors,
      categories,
      labTests,
      faqs,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error?.message || "Failed to search" });
  }
};