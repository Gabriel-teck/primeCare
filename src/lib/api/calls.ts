import { api } from "./client";

export type CallMode = "audio" | "video";

export type CallSession = {
  callId: string;
  consultationId: string;
  mode: CallMode;
  localPeerId: string;
  remotePeerId: string;
  isStarter: boolean;
};

export async function startCall(
  consultationId: string,
  mode: CallMode,
  token: string | null,
) {
  return api.post<CallSession>(
    `/consultations/${consultationId}/calls/start`,
    { mode },
    { token, auth: true },
  );
}

export async function acceptCall(
  consultationId: string,
  callId: string,
  token: string | null,
) {
  return api.post<CallSession>(
    `/consultations/${consultationId}/calls/accept`,
    { callId },
    { token, auth: true },
  );
}

export async function declineCall(
  consultationId: string,
  callId: string,
  token: string | null,
) {
  return api.post<{ ok: boolean }>(
    `/consultations/${consultationId}/calls/decline`,
    { callId },
    { token, auth: true },
  );
}

export async function endCall(
  consultationId: string,
  callId: string,
  token: string | null,
) {
  return api.post<{ ok: boolean }>(
    `/consultations/${consultationId}/calls/end`,
    { callId },
    { token, auth: true },
  );
}
