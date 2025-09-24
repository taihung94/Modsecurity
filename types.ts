
export interface SuggestedPayload {
  payload: string;
  description: string;
}

export interface AnalysisResult {
  decision: 'BLOCKED' | 'ALLOWED' | 'ERROR' | 'UNKNOWN';
  explanation: string;
  ruleBreakdown: string;
  suggestedPayloads: SuggestedPayload[];
}

export type AnalysisSection = 'decision' | 'explanation' | 'ruleBreakdown' | 'suggestedPayloads';
