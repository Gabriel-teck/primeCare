export type CatalogType = "specialty" | "urgent_care" | "service" | string;

export type CatalogItem = {
  id: string;
  name: string;
  type: CatalogType;
  description: string;
  price?: number | null;
  currency?: string | null;
  published: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateCatalogPayload = {
  name: string;
  type: string;
  description: string;
  price?: number | null;
  currency?: string;
  published?: boolean;
};

export type UpdateCatalogPayload = Partial<CreateCatalogPayload>;
