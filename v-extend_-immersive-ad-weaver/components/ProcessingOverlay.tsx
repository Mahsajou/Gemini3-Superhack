
import React from 'react';
import { GenerationStatus } from '../types';

interface Props {
  status: GenerationStatus;
}

export const ProcessingOverlay: React.FC<Props> = ({ status }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full space-y-8 animate-in zoom-in duration-300">
        <div className="relative">
          {/* Animated Spinner Background */}
          <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          
          <div className="relative w-32 h-32 mx-auto">
             <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="60"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-zinc-800"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="60"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={377}
                  strokeDashoffset={377 - (377 * status.progress) / 100}
                  strokeLinecap="round"
                  className="text-blue-500 transition-all duration-1000 ease-in-out"
                />
             </svg>
             <div className="absolute inset-0 flex items-center justify-center font-bold text-2xl">
               {Math.round(status.progress)}%
             </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-3xl font-bold tracking-tight">Crafting Your Video</h2>
          <p className="text-blue-400 font-medium animate-pulse">{status.message}</p>
          <div className="glass p-4 rounded-2xl text-zinc-500 text-sm leading-relaxed">
            Veo is currently synthesizing high-resolution temporal data. This usually takes 2-5 minutes depending on current traffic.
          </div>
        </div>

        <div className="flex justify-center space-x-2">
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></span>
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
        </div>
      </div>
    </div>
  );
};
