import React from 'react';
import { ProcessedIncident } from '../types';
import ChatAssistant from './ChatAssistant';

interface AIInsightsProps {
  incidents: ProcessedIncident[];
}

const AIInsights: React.FC<AIInsightsProps> = ({ incidents }) => {
    return (
        <div>
            <header className="mb-6">
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold text-gray-900">AI-Powered Analysis</h1>
                    <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-1 rounded-full">Development Chat</span>
                </div>
                <p className="text-gray-500 mt-1">Ask questions about your data and get instant insights from Groq.</p>
            </header>
            
            <div className="p-1 bg-gradient-to-br from-blue-200 via-indigo-300 to-purple-400 rounded-2xl shadow-lg relative">
                 <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg blur opacity-25 animate-pulse-slow"></div>
                 <div className="relative bg-white/80 backdrop-blur-xl rounded-xl">
                    <ChatAssistant incidents={incidents} />
                </div>
            </div>
        </div>
    );
};

export default AIInsights;