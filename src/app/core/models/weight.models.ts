export interface WeightEntryDto {
  id: number;
  weight: number;
  recordedAt: string;
  createdAt: string;
}

export interface CreateWeightEntryRequest {
  weight: number;
  recordedAt: string;
}
