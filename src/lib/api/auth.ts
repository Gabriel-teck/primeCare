const API_BASE_URL = "http://localhost:3001";

export async function login(email: string, password: string) {
  console.log("Attempting login with:", { email, password: "***" });

  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  console.log("Response status:", res.status);
  console.log("Response headers:", res.headers);

  if (!res.ok) {
    const errorText = await res.text();
    console.log("Error response:", errorText);
    throw new Error(`Login Failed: ${res.status} - ${errorText}`);
  }

  const data = await res.json();
  console.log("Login successful:", data);
  return data;
}

export async function registerUser(
  email: string,
  fullName: string,
  password: string
) {
  const res = await fetch(`${API_BASE_URL}/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, fullName, password }),
  });
  if (!res.ok) throw new Error("Registration Failed");
  return res.json();
}

export async function forgotPassword(email: string) {
  const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "Application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error("Request Failed");
  return res.json();
}

export async function resetPassword(token: string, password: string) {
  const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "Application/json" },
    body: JSON.stringify({ token, password }),
  });
  if (!res.ok) throw new Error("Reset failed");
  return res.json();
}
