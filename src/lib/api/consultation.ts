const API_BASE_URL = "http://localhost:3001";

export async function bookConsultation(data: any, token: string, file?: File) {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (key !== "file") formData.append(key, value as string);
  });
  if (file) formData.append("file", file);

  const res = await fetch("http://localhost:3001/consultations", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) throw new Error("Booking failed");
  return res.json();
}

export async function getMyConsultations(token: string) {
  const res = await fetch(`${API_BASE_URL}/consultations/my`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

export async function cancelConsultation(id: string, token: string) {
  const res = await fetch(`http://localhost:3001/consultations/cancel/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Cancel failed");
  return res.json();
}

export async function rescheduleConsultation(
  id: string,
  date: string,
  time: string,
  token: string
) {
  const res = await fetch(
    `http://localhost:3001/consultations/reschedule/${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ date, time }),
    }
  );
  if (!res.ok) throw new Error("Reschedule failed");
  return res.json();
}

//Admin
export async function getAllConsultations(token: string) {
  const res = await fetch(`${API_BASE_URL}/consultations`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch consultations");
  return res.json();
}

export async function updateConsultation(id: string, data: any, token: string) {
  const res = await fetch(`${API_BASE_URL}/consultations/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Update failed");
  return res.json();
}
