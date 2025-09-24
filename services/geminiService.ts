import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    overallRisk: { type: Type.STRING, description: 'The overall risk assessment. Must be one of: "High", "Medium", "Low", "None".' },
    summary: { type: Type.STRING, description: 'A high-level summary of the findings.' },
    triggeredRules: {
      type: Type.ARRAY,
      description: 'An array of all OWASP CRS rules that the request triggered.',
      items: {
        type: Type.OBJECT,
        properties: {
          ruleId: { type: Type.STRING, description: 'The ID of the triggered rule (e.g., "942100").' },
          ruleMessage: { type: Type.STRING, description: 'The message or description of the rule.' },
          matchedData: { type: Type.STRING, description: 'The exact part of the request that triggered the rule.' },
          diagnosis: { type: Type.STRING, description: 'The diagnosis of the alert. Must be either "True Positive" or "False Positive".' },
          explanation: { type: Type.STRING, description: 'A detailed explanation for the diagnosis, justifying why it is a true or false positive.' },
          severity: { type: Type.STRING, description: 'The severity level of the rule (e.g., "CRITICAL", "WARNING").' },
          suggestedRegex: { type: Type.STRING, description: 'For a False Positive, a narrowly-scoped regex to match the benign data. Omit for True Positives.' },
          whitelistRule: { type: Type.STRING, description: 'For a False Positive, a complete ModSecurity rule snippet to whitelist the specific case. Omit for True Positives.' },
        },
        required: ['ruleId', 'ruleMessage', 'matchedData', 'diagnosis', 'explanation', 'severity']
      }
    }
  },
  required: ['overallRisk', 'summary', 'triggeredRules']
};

export const analyzeHttpRequest = async (request: string): Promise<AnalysisResult> => {
  try {
    const prompt = `
      You are a senior security analyst operating a ModSecurity Web Application Firewall (WAF) with the latest OWASP Core Rule Set (CRS) enabled at Paranoia Level 1.

      Your task is to analyze the following full HTTP request. For your analysis, you must:
      1.  Identify EVERY OWASP CRS rule that the request would trigger.
      2.  For each triggered rule, provide a detailed analysis and diagnose it as either a "True Positive" (a genuine malicious attempt) or a "False Positive" (benign traffic that incorrectly triggered a rule).
      3.  For any rule diagnosed as a "False Positive", you MUST provide a potential mitigation strategy. This includes:
          a. A 'suggestedRegex': A narrowly-scoped regular expression that specifically matches the benign data causing the trigger.
          b. A 'whitelistRule': A complete and secure ModSecurity whitelist rule snippet (e.g., using 'SecRuleUpdateTargetById') to bypass the rule for only that specific case. The whitelist rule should be as specific as possible to avoid weakening security.
      4.  For rules diagnosed as "True Positive", the 'suggestedRegex' and 'whitelistRule' fields MUST be omitted or be empty strings.
      5.  Assess the overall risk posed by the request.
      6.  Return your complete findings in a single JSON object that strictly adheres to the provided schema. Do not include any markdown formatting like \`\`\`json.

      HTTP Request:
      \`\`\`
      ${request}
      \`\`\`
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
            temperature: 0.1,
        }
    });

    const jsonText = response.text.trim();
    const parsedJson = JSON.parse(jsonText);

    if (
        !parsedJson.overallRisk ||
        !parsedJson.summary ||
        !Array.isArray(parsedJson.triggeredRules)
    ) {
        throw new Error('API response does not match the expected format.');
    }

    return parsedJson as AnalysisResult;

  } catch (error) {
    console.error("Error analyzing with Gemini:", error);
    let errorMessage = "An unknown error occurred during analysis.";
    if (error instanceof Error) {
        errorMessage = `Failed to get analysis from Gemini. Error: ${error.message}`;
    }
    return {
      overallRisk: 'ERROR',
      summary: errorMessage,
      triggeredRules: [],
    };
  }
};