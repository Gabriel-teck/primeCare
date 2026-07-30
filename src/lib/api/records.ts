import { api } from "./client";

export type PatientNote = {
  id: string;
  patientId: string;
  authorId: string;
  body: string;
  createdAt: string;
};

export async function listPatientNotes(
  patientId: string,
  token: string | null,
) {
  return api.get<PatientNote[]>(`/records/notes/patient/${patientId}`, {
    token,
    auth: true,
  });
}

export async function createPatientNote(
  patientId: string,
  body: string,
  token: string | null,
) {
  return api.post<PatientNote>(
    "/records/notes",
    { patientId, body },
    { token, auth: true },
  );
}
