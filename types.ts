

export enum Page {
  LOGIN,
  CREATOR,
  COMMUNITY,
  SETTINGS,
  MY_ADDONS,
  CHAT,
}

export interface EvaluationResult {
  complexity: string;
  quality: string;
  innovation: string;
  common: string;
  summary: string;
}

export interface SavedAddon {
  id: string;
  name: string;
  prompt: string;
  generatedFiles: Record<string, string>;
  pixelArt: string | null;
  evaluation: EvaluationResult | null;
  timestamp: number;
  imageAnalysis: string | null;
  searchSources: any[] | null;
  version: string;
}