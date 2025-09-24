import React, { useState, useCallback } from 'react';
import { AnalysisResult } from '../types';
import { analyzeHttpRequest } from '../services/geminiService';
import { BrainIcon } from './icons/BrainIcon';
import AnalysisCard from './AnalysisCard';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { FlagIcon } from './icons/FlagIcon';
import { ShieldIcon } from './icons/ShieldIcon';
import { WrenchIcon } from './icons/WrenchIcon';

const defaultRequest = `POST /api/v1/update HTTP/1.1
Host: example.com
Content-Type: application/json
Content-Length: 68

{"comment": "The new update is great, but select options are limited."}`;


const RuleTester: React.FC = () => {
  const [request, setRequest] = useState<string>(defaultRequest);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!request.trim()) {
      setError("HTTP Request field is required.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    const result = await analyzeHttpRequest(request);
    if (result.overallRisk === 'ERROR') {
        setError(result.summary);
    } else {
        setAnalysis(result);
    }
    setIsLoading(false);
  }, [request]);

  const riskColor = analysis?.overallRisk === 'High' ? 'text-red-400' : 
                    analysis?.overallRisk === 'Medium' ? 'text-yellow-400' :
                    analysis?.overallRisk === 'Low' ? 'text-cyan-400' : 'text-gray-400';
  const riskBg = analysis?.overallRisk === 'High' ? 'bg-red-500/10' :
                 analysis?.overallRisk === 'Medium' ? 'bg-yellow-500/10' :
                 analysis?.overallRisk === 'Low' ? 'bg-cyan-500/10' : 'bg-gray-500/10';


  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="p-6 bg-gray-800/50 border border-gray-700 rounded-lg shadow-lg backdrop-blur-sm">
        <div className="space-y-2">
          <label htmlFor="request" className="text-sm font-medium text-gray-300">Full HTTP Request</label>
          <textarea
            id="request"
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            placeholder="Paste your full HTTP request here..."
            className="font-fira-code w-full h-60 p-3 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
          />
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
                Diagnose Request
              </>
            )}
          </button>
        </div>
      </form>

      {error && <div className="text-center p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg">{error}</div>}

      {isLoading && (
        <div className="text-center text-gray-400 animate-pulse">
            <p>Gemini is running diagnostics... this may take a moment.</p>
        </div>
      )}

      {analysis && (
        <div className="space-y-6 animate-fade-in">
            <AnalysisCard title="Overall Assessment" icon={<BrainIcon />}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-3 sm:space-y-0">
                    <span className={`px-4 py-2 rounded-full font-bold text-lg ${riskBg} ${riskColor}`}>
                        Risk: {analysis.overallRisk}
                    </span>
                    <p className="text-gray-300">{analysis.summary}</p>
                </div>
            </AnalysisCard>

            {analysis.triggeredRules.length > 0 ? (
            analysis.triggeredRules.map((rule, index) => (
                <React.Fragment key={index}>
                    <AnalysisCard
                        title={`Triggered Rule: ${rule.ruleId}`}
                        icon={<FlagIcon />}
                    >
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                {rule.diagnosis === 'True Positive' ? (
                                    <CheckCircleIcon className="w-6 h-6 text-red-400" />
                                ) : (
                                    <XCircleIcon className="w-6 h-6 text-yellow-400" />
                                )}
                                <h4 className={`text-xl font-bold ${rule.diagnosis === 'True Positive' ? 'text-red-400' : 'text-yellow-400'}`}>
                                    {rule.diagnosis}
                                </h4>
                            </div>
                            <span className="px-3 py-1 text-sm font-semibold text-gray-300 bg-gray-700 rounded-full">{rule.severity}</span>
                        </div>

                        <div>
                        <p className="text-sm font-semibold text-gray-400 mb-1">Rule Message</p>
                        <p className="text-gray-200">{rule.ruleMessage}</p>
                        </div>

                        <div>
                        <p className="text-sm font-semibold text-gray-400 mb-1">Matched Data</p>
                        <pre className="p-3 bg-gray-900/70 border border-gray-700 rounded-md font-fira-code text-cyan-300 text-sm overflow-x-auto">
                            <code>{rule.matchedData}</code>
                        </pre>
                        </div>

                        <div>
                        <p className="text-sm font-semibold text-gray-400 mb-1">Analyst Explanation</p>
                        <div className="prose prose-invert prose-p:text-gray-300" dangerouslySetInnerHTML={{ __html: rule.explanation.replace(/\n/g, '<br />') }} />
                        </div>
                    </div>
                    </AnalysisCard>
                    
                    {rule.diagnosis === 'False Positive' && rule.whitelistRule && (
                        <AnalysisCard
                            title="Mitigation Suggestion"
                            icon={<WrenchIcon />}
                        >
                            <div className="space-y-4">
                                {rule.suggestedRegex && (
                                <div>
                                    <p className="text-sm font-semibold text-gray-400 mb-1">Suggested Regex</p>
                                    <pre className="p-3 bg-gray-900/70 border border-gray-700 rounded-md font-fira-code text-green-300 text-sm overflow-x-auto">
                                        <code>{rule.suggestedRegex}</code>
                                    </pre>
                                </div>
                                )}
                                <div>
                                    <p className="text-sm font-semibold text-gray-400 mb-1">Whitelist Rule Snippet</p>
                                    <pre className="p-3 bg-gray-900/70 border border-gray-700 rounded-md font-fira-code text-green-300 text-sm overflow-x-auto">
                                        <code>{rule.whitelistRule}</code>
                                    </pre>
                                </div>
                            </div>
                        </AnalysisCard>
                    )}
                </React.Fragment>
            ))
            ) : (
                analysis.overallRisk !== 'ERROR' && (
                    <AnalysisCard title="No Rules Triggered" icon={<ShieldIcon className="w-6 h-6" />}>
                        <p className="text-gray-300">The request was analyzed against the OWASP Core Rule Set and did not trigger any security rules.</p>
                    </AnalysisCard>
                )
            )}
        </div>
        )}

    </div>
  );
};

export default RuleTester;