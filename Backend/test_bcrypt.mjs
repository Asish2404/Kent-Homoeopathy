import bcrypt from "bcryptjs";
console.log("compare type:", typeof bcrypt.compare);
console.log("hash type:", typeof bcrypt.hash);

const hash = await bcrypt.hash("test123", 10);
console.log("hash:", hash);
const result = await bcrypt.compare("test123", hash);
console.log("compare result:", result);
