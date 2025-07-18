const API_BASE_URL = "http://localhost:3001";

export async function getUser(token: string) {
  const res = await fetch(`${API_BASE_URL}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Not Authenticated");
  return res.json();
}

export async function checkEmailExists(email: string) {
  const res = await fetch(
    `${API_BASE_URL}/users/exists?email=${encodeURIComponent(email)}`
  );
  if (!res.ok) throw new Error("Failed to check email");
  const data = await res.json();
  return data.exists;
}

// this function to get all patients for admin
export async function getAllPatients(token: string) {
  const res = await fetch(`${API_BASE_URL}/users/patients`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch patients");
  return res.json();
}

// Get patient by ID for admin
export async function getPatientById(id: string, token: string) {
  const res = await fetch(`${API_BASE_URL}/users/patients/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch patient");
  return res.json();
}