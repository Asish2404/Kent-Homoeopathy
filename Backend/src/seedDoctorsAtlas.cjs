const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
    doctor_name: { type: String, required: true, trim: true },
    specialization: { type: String, required: true },
    qualification: { type: String, required: true },
    experience: { type: Number, required: true },
    hospital: { type: String, required: true },
    consultation_fee: { type: Number, required: true },
    available_days: { type: String, required: true },
    available_time: { type: String, required: true },
    image: { type: String, required: true },
    about: { type: String, required: true },
}, { timestamps: true });

const Doctor = mongoose.model("Doctor", doctorSchema);

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

async function seedAtlas() {
    try {
        const uri = process.env.MONGODB_URI || "mongodb://Asish2404:Asish2404@ac-wpvclcu-shard-00-00.kqxhlor.mongodb.net:27017,ac-wpvclcu-shard-00-01.kqxhlor.mongodb.net:27017,ac-wpvclcu-shard-00-02.kqxhlor.mongodb.net:27017/?ssl=true&replicaSet=atlas-1wywns-shard-0&authSource=admin&appName=AsishBackend";
        await mongoose.connect(uri);
        console.log("Connected to MongoDB Atlas");

        const beforeCount = await Doctor.countDocuments({});
        console.log(`Doctors before seeding: ${beforeCount}`);

        let inserted = 0;
        for (const doc of SEED_DOCTORS) {
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
        console.log(`\nDoctors after seeding: ${afterCount}`);
        console.log(`Inserted: ${inserted}`);

        const allDocs = await Doctor.find({}).select("doctor_name specialization consultation_fee").lean();
        console.log("\nAll doctors in MongoDB Atlas:");
        allDocs.forEach((d, i) => {
            console.log(`  ${i + 1}. ${d.doctor_name} — ${d.specialization} — ₹${d.consultation_fee}`);
        });

        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

seedAtlas();

