import mongoose from "mongoose";
import { Doctor } from "./models/atanu.doctor.model.js";
import { DB_NAME } from "./constants.js";

const SEED_DOCTORS = [
  {
    doctor_name: "Dr. Ananya Sen",
    specialization: "Homoeopathy Specialist",
    qualification: "BHMS, MD (Hom.)",
    experience: 12,
    hospital: "Dr. Kent Wellness Clinic",
    consultation_fee: 499,
    available_days: "Mon-Sat",
    available_time: "09:00 AM - 05:00 PM",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=1200&auto=format&fit=crop",
    about: "Experienced homeopathy specialist with 12 years of practice. Dedicated to providing holistic and personalized care to every patient.",
  },
  {
    doctor_name: "Dr. Raj Mehta",
    specialization: "Chronic Care Expert",
    qualification: "BHMS, FCCA",
    experience: 10,
    hospital: "City Care Centre",
    consultation_fee: 399,
    available_days: "Mon-Sat",
    available_time: "09:00 AM - 05:00 PM",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=1200&auto=format&fit=crop",
    about: "Expert in chronic disease management with 10 years of clinical experience. Specializes in long-term care plans.",
  },
  {
    doctor_name: "Dr. Priya Roy",
    specialization: "Women Wellness",
    qualification: "BHMS, Women Health Specialist",
    experience: 8,
    hospital: "CarePlus Women Clinic",
    consultation_fee: 449,
    available_days: "Mon-Sat",
    available_time: "09:00 AM - 05:00 PM",
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=1200&auto=format&fit=crop",
    about: "Dedicated women's health specialist with 8 years of experience. Providing comprehensive wellness care for women.",
  },
  {
    doctor_name: "Dr. Suman Ghosh",
    specialization: "General Physician",
    qualification: "MBBS, Family Medicine",
    experience: 14,
    hospital: "Central Health Hub",
    consultation_fee: 349,
    available_days: "Mon-Sat",
    available_time: "09:00 AM - 05:00 PM",
    image: "https://images.unsplash.com/photo-1511174511562-5f7f18b874f8?q=80&w=1200&auto=format&fit=crop",
    about: "Experienced general physician with 14 years in family medicine. Committed to accessible healthcare for all ages.",
  },
  {
    doctor_name: "Dr. Nisha Kapoor",
    specialization: "Dermatologist",
    qualification: "MD, Skin and Aesthetic Care",
    experience: 9,
    hospital: "SkinCare Studio",
    consultation_fee: 599,
    available_days: "Mon-Sat",
    available_time: "09:00 AM - 05:00 PM",
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=1200&auto=format&fit=crop",
    about: "Board-certified dermatologist with 9 years of experience in medical and aesthetic dermatology.",
  },
  {
    doctor_name: "Dr. Arjun Verma",
    specialization: "Cardiologist",
    qualification: "DM, Cardiac Care",
    experience: 16,
    hospital: "Heartline Hospital",
    consultation_fee: 699,
    available_days: "Mon-Sat",
    available_time: "09:00 AM - 05:00 PM",
    image: "https://images.unsplash.com/photo-1579684453423-f84349ef60b0?q=80&w=1200&auto=format&fit=crop",
    about: "Senior cardiologist with 16 years of experience. Specializing in preventive cardiology and heart disease management.",
  },
];

async function seed() {
  try {
    await mongoose.connect(`mongodb://127.0.0.1:27017/${DB_NAME}`);
    console.log("Connected to MongoDB");

    // Count existing doctors
    const beforeCount = await Doctor.countDocuments({});
    console.log(`Doctors in MongoDB before seeding: ${beforeCount}`);

    let inserted = 0;
    for (const doc of SEED_DOCTORS) {
      // Check if doctor already exists by name
      const existing = await Doctor.findOne({ doctor_name: doc.doctor_name });
      if (!existing) {
        await Doctor.create(doc);
        inserted++;
        console.log(`  + Inserted: ${doc.doctor_name}`);
      } else {
        console.log(`  = Already exists: ${doc.doctor_name}`);
      }
    }

    const afterCount = await Doctor.countDocuments({});
    console.log(`\nDoctors in MongoDB after seeding: ${afterCount}`);
    console.log(`Inserted: ${inserted}, Skipped (already existed): ${SEED_DOCTORS.length - inserted}`);

    // List all doctors
    const allDocs = await Doctor.find({}).select("doctor_name specialization consultation_fee hospital").lean();
    console.log("\nAll doctors in MongoDB:");
    allDocs.forEach((d, i) => {
      console.log(`  ${i + 1}. ${d.doctor_name} — ${d.specialization} — ₹${d.consultation_fee}`);
    });

    await mongoose.disconnect();
    console.log("\nDone!");
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

seed();

