const base = "http://localhost:4000/api";

// 1. Signup a new user
async function signup() {
  const res = await fetch(`${base}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_name: "Test Customer",
      email: "customer@test.com",
      password: "TestPass123",
      phone: "9876543210",
      address: "Test Address",
    }),
  });
  const data = await res.json();
  console.log("SIGNUP STATUS:", res.status);
  console.log("SIGNUP MSG:", data.message);
  console.log("SIGNUP USER:", data.user?._id, "ROLE:", data.user?.role);
  return data.user?._id;
}

// 2. Login with the new user
async function loginCustomer() {
  const res = await fetch(`${base}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "customer@test.com", password: "TestPass123" }),
  });
  const data = await res.json();
  console.log("CUSTOMER LOGIN STATUS:", res.status);
  console.log("TOKEN:", !!data.token, "ROLE:", data.user?.role);
  return data.token;
}

// 3. Duplicate signup (should 409)
async function dupSignup() {
  const res = await fetch(`${base}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_name: "Test Customer 2",
      email: "customer@test.com",
      password: "TestPass123",
      phone: "9876543211",
      address: "Test Address 2",
    }),
  });
  console.log("DUP SIGNUP STATUS:", res.status);
  console.log("DUP SIGNUP MSG:", (await res.json()).message);
}

// 4. Profile with token (protected route)
async function profile(token) {
  const res = await fetch(`${base}/auth/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  console.log("PROFILE STATUS:", res.status);
  console.log("PROFILE USER:", data.user?.email, "ROLE:", data.user?.role);
}

await signup();
const token = await loginCustomer();
if (token) await profile(token);
await dupSignup();
