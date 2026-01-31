
import React from 'react';
import { openApiKeySelector } from '../services/gemini';

interface Props {
  onKeySelected: () => void;
}

const ApiKeySelection: React.FC<Props> = ({ onKeySelected }) => {
  const handleOpenSelector = async () => {
    await openApiKeySelector();
    onKeySelected();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-white rounded-2xl shadow-xl border border-gray-100 max-w-2xl mx-auto mt-12">
      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
      </div>
      <h2 className="text-3xl font-bold text-gray-800 mb-4">Gemini Veo Access Required</h2>
      <p className="text-gray-600 mb-8 max-w-md">
        To use advanced video generation, you must select a paid API key. 
        Please ensure you have billing enabled on your Google Cloud Project.
      </p>
      
      <button 
        onClick={handleOpenSelector}
        className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
      >
        Select API Key
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      <a 
        href="https://ai.google.dev/gemini-api/docs/billing" 
        target="_blank" 
        rel="noopener noreferrer"
        className="mt-6 text-sm text-blue-500 hover:underline"
      >
        Learn more about billing & API keys
      </a>
    </div>
  );
};

export default ApiKeySelection;
