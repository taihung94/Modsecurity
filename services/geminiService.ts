
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, SuggestedPayload } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    decision: {
      type: Type.STRING,
      description: 'The outcome of the rule evaluation. Must be either "BLOCKED" or "ALLOWED".',
    },
    explanation: {
      type: Type.STRING,
      description: 'A detailed step-by-step reason for the decision, explaining how the payload interacts with the rule.',
    },
    ruleBreakdown: {
      type: Type.STRING,
      description: 'An explanation of the ModSecurity rule\'s syntax, directives, variables, and its security purpose.',
    },
    suggestedPayloads: {
      type: Type.ARRAY,
      description: 'An array of three distinct, example malicious payloads that the rule is designed to block.',
      items: {
        type: Type.OBJECT,
        properties: {
          payload: { type: Type.STRING, description: 'The example malicious payload.' },
          description: { type: Type.STRING, description: 'A brief explanation of the attack vector for this payload.' }
        },
        required: ['payload', 'description']
      }
    }
  },
  required: ['decision', 'explanation', 'ruleBreakdown', 'suggestedPayloads']
};


export const analyzeRuleAndPayload = async (rule: string, payload: string): Promise<AnalysisResult> => {
  try {
    const prompt = `
      As a ModSecurity expert, analyze the provided rule and payload.
      1.  Simulate the rule against the payload and decide if it's "BLOCKED" or "ALLOWED".
      2.  Explain in detail why that decision was made, referencing the specific operators and transformations.
      3.  Provide a clear breakdown of the ModSecurity rule's syntax and purpose.
      4.  Generate three distinct examples of malicious payloads that the rule *would* block, and briefly explain each one.

      Return your full analysis in a JSON object that strictly adheres to the provided schema.

      Payload:
      \`\`\`
      ${payload}
      \`\`\`

      Rule:
      \`\`\`
      ${rule}
      \`\`\`
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
            temperature: 0.2,
        }
    });

    const jsonText = response.text.trim();
    const parsedJson = JSON.parse(jsonText);
    
    // Validate the parsed structure to match AnalysisResult
    if (
        typeof parsedJson.decision !== 'string' ||
        typeof parsedJson.explanation !== 'string' ||
        typeof parsedJson.ruleBreakdown !== 'string' ||
        !Array.isArray(parsedJson.suggestedPayloads)
    ) {
        throw new Error('API response does not match the expected format.');
    }

    return {
        decision: parsedJson.decision as 'BLOCKED' | 'ALLOWED',
        explanation: parsedJson.explanation,
        ruleBreakdown: parsedJson.ruleBreakdown,
        suggestedPayloads: parsedJson.suggestedPayloads as SuggestedPayload[],
    };

  } catch (error) {
    console.error("Error analyzing with Gemini:", error);
    let errorMessage = "An unknown error occurred while analyzing.";
    if (error instanceof Error) {
        errorMessage = `Failed to get analysis from Gemini. Please check the console for details. Error: ${error.message}`;
    }
    return {
      decision: 'ERROR',
      explanation: errorMessage,
      ruleBreakdown: 'Could not analyze the rule due to an error.',
      suggestedPayloads: []
    };
  }
};
