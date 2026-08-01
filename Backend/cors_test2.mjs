// Re-test CORS after fix
async function testCors(origin) {
  const res = await fetch("http://localhost:4000/api/products", {
    headers: { Origin: origin },
  });
  const allowOrigin = res.headers.get("access-control-allow-origin");
  console.log(`Origin: ${origin}`);
  console.log(`  Status: ${res.status}`);
  console.log(`  Access-Control-Allow-Origin: ${allowOrigin}`);
  console.log(`  ALLOWED: ${allowOrigin === origin ? "YES" : "NO"}`);
  console.log("");
}

await testCors("http://localhost:5173");
await testCors("http://localhost:5174");
await testCors("http://localhost:4173");
await testCors("https://kent-health.netlify.app");
await testCors("https://kentweb.vercel.app");
await testCors("http://127.0.0.1:5173");

// No origin (curl / server-to-server)
const res = await fetch("http://localhost:4000/api/products");
console.log("NO ORIGIN:");
console.log("  Status:", res.status);
console.log("  ALLOWED: YES");
