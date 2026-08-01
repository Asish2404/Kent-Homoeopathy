// Test CORS behavior - this simulates a browser request from a different origin
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

// Simulate frontend on default Vite port
await testCors("http://localhost:5173");
// Simulate frontend on the currently running dev port
await testCors("http://localhost:5174");
// Simulate production origin (deployed frontend)
await testCors("https://kent-health.netlify.app");
await testCors("https://kentweb.vercel.app");
await testCors("null");
