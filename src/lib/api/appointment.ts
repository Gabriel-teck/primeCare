const API_BASE_URL = "http://localhost:3001";

export async function bookAppointment(data: any, token: string) {
  const res = await fetch(`${API_BASE_URL}/appointment`, {
    method: "POST",
    headers: {
      "Content-Type": "Application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Booking failed");
  return res.json();
}

export async function getMyAppointments(token: string) {
  const res = await fetch(`${API_BASE_URL}/appointment/my`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

export async function rescheduleAppointment(
  id: string,
  date: string,
  time: string,
  token: string
) {
  const res = await fetch(`${API_BASE_URL}/appointment/rescheduled/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ date, time }),
  });
  if (!res.ok) throw new Error("Reschedule failed");
  return res.json();
}

export async function cancelAppointment(id: string, token: string) {
  const res = await fetch(`http://localhost:3001/appointment/cancel/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Cancel failed");
  return res.json();
}

//for admin
export async function getAllAppointments(token: string) {
  const res = await fetch(`${API_BASE_URL}/appointment`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch appointments");
  return res.json();
}

export async function updateAppointment(id: string, data: any, token: string) {
  const res = await fetch(`${API_BASE_URL}/appointment/${id}`, {
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
