export interface Participation {
  id: number;
  year: number;
  city: string;
  medalsCount: number;
  athleteCount: number;
}

export interface OlympicCountry {
  id: number;
  country: string;
  participations: Participation[];
}

export interface PieChartSlice {
  label: string;
  value: number;
  color?: string;
  meta?: Record<string, unknown>;
}

export interface LineChartPoint {
  label: string;
  value: number;
}
