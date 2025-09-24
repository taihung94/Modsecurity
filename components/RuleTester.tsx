
import React, { useState, useCallback } from 'react';
import { AnalysisResult } from '../types';
import { analyzeRuleAndPayload } from '../services/geminiService';
import { BrainIcon } from './icons/BrainIcon';
import AnalysisCard from './AnalysisCard';
import { CodeIcon } from './icons/CodeIcon';
import { TestTubeIcon } from './icons/TestTubeIcon';

const RuleTester: React.FC = () => {
  const [rule, setRule] = useState<string>('SecRule ARGS "@rx (?i)(?:select|union|insert|update|delete).*(?:from|into|where)" "id:101,phase:2,t:none,log,deny,msg:\'SQL Injection Attempt\'"');
  const [payload, setPayload] = useState<string>('product_id=10; select user, password from users');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rule.trim() || !payload.trim()) {
      setError("Both rule and payload fields are required.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    const result = await analyzeRuleAndPayload(rule, payload);
    if (result.decision === 'ERROR') {
        setError(result.explanation);
    } else {
        setAnalysis(result);
    }
    setIsLoading(false);
  }, [rule, payload]);

  const decisionColor = analysis?.decision === 'BLOCKED' ? 'text-red-400' : 
                        analysis?.decision === 'ALLOWED' ? 'text-green-400' : 'text-gray-400';
  const decisionBg = analysis?.decision === 'BLOCKED' ? 'bg-red-500/10' :
                     analysis?.decision === 'ALLOWED' ? 'bg-green-500/10' : 'bg-gray-500/10';

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="p-6 bg-gray-800/50 border border-gray-700 rounded-lg shadow-lg backdrop-blur-sm">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="payload" className="text-sm font-medium text-gray-300">HTTP Request Payload</label>
            <textarea
              id="payload"
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              placeholder="e.g., id=1' or '1'='1"
              className="font-fira-code w-full h-32 p-3 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="rule" className="text-sm font-medium text-gray-300">ModSecurity Rule (SecRule)</label>
            <textarea
              id="rule"
              value={rule}
              onChange={(e) => setRule(e.target.value)}
              placeholder="e.g., SecRule ARGS \"@contains ' or 1=1\" \"id:101,...\""
              className="font-fira-code w-full h-32 p-3 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-center">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center px-8 py-3 font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 shadow-lg shadow-cyan-500/20"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </>
            ) : (
              <>
                <BrainIcon className="w-5 h-5 mr-2" />
                Analyze
              </>
            )}
          </button>
        </div>
      </form>

      {error && <div className="text-center p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg">{error}</div>}

      {isLoading && (
        <div className="text-center text-gray-400 animate-pulse">
            <p>Gemini is analyzing the rule... this may take a moment.</p>
        </div>
      )}

      {analysis && (
        <div className="space-y-6 animate-fade-in">
          <AnalysisCard title="Analysis Result" icon={<BrainIcon />}>
              <div className="flex items-center space-x-4">
                  <span className={`px-4 py-2 rounded-full font-bold text-lg ${decisionBg} ${decisionColor}`}>
                      {analysis.decision}
                  </span>
                  <p className="text-gray-300">{analysis.decision === 'BLOCKED' ? 'The payload was blocked by the rule.' : 'The payload was allowed by the rule.'}</p>
              </div>
          </AnalysisCard>
          
          <AnalysisCard title="Detailed Explanation" icon={<BrainIcon />}>
              <div className="prose prose-invert prose-p:text-gray-300 prose-strong:text-gray-100" dangerouslySetInnerHTML={{ __html: analysis.explanation.replace(/\n/g, '<br />') }} />
          </AnalysisCard>

          <AnalysisCard title="Rule Breakdown" icon={<CodeIcon />}>
             <div className="prose prose-invert prose-p:text-gray-300 prose-strong:text-gray-100" dangerouslySetInnerHTML={{ __html: analysis.ruleBreakdown.replace(/\n/g, '<br />') }} />
          </AnalysisCard>

          <AnalysisCard title="Example Malicious Payloads" icon={<TestTubeIcon />}>
            <ul className="space-y-4">
              {analysis.suggestedPayloads.map((p, index) => (
                <li key={index} className="p-4 bg-gray-900/70 border border-gray-700 rounded-md">
                  <p className="font-fira-code text-cyan-400 break-all">{p.payload}</p>
                  <p className="mt-2 text-sm text-gray-400">{p.description}</p>
                </li>
              ))}
            </ul>
          </AnalysisCard>
        </div>
      )}
    </div>
  );
};

export default RuleTester;
