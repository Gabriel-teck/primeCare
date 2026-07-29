export type ContentBlock = {
  id: string;
  key: string;
  title: string;
  body: string;
  createdAt?: string;
  updatedAt?: string;
};

export type UpsertContentPayload = {
  key: string;
  title: string;
  body: string;
};

export type UpdateContentPayload = {
  title?: string;
  body?: string;
};
