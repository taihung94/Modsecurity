export interface TriggeredRule {
  ruleId: string;
  ruleMessage: string;
  matchedData: string;
  diagnosis: 'True Positive' | 'False Positive';
  explanation: string;
  severity: string;
  suggestedRegex?: string;
  whitelistRule?: string;
}

export interface AnalysisResult {
  overallRisk: 'High' | 'Medium' | 'Low' | 'None' | 'ERROR';
  summary: string;
  triggeredRules: TriggeredRule[];
}