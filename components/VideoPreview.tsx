
import React, { useState } from 'react';

interface Props {
  videoBase64: string | null;
  onExtend: (prompt: string) => void;
  isProcessing: boolean;
}

export const VideoPreview: React.FC<Props> = ({ videoBase64, onExtend, isProcessing }) => {
  const [prompt, setPrompt] = useState('After the original video, extend the scene by showing the player running onto the field. Seamlessly integrate immersive stadium advertising for a major sports brand like Nike or Gatorade as he passes by.');

  if (!videoBase64) {
    return (
      <div className="h-full min-h-[400px] glass rounded-3xl flex flex-col items-center justify-center text-zinc-600 border-zinc-800/50">
        <svg className="w-12 h-12 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm">Upload footage to see preview</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="aspect-video bg-zinc-900 rounded-2xl overflow-hidden relative shadow-2xl border border-zinc-800">
        <video 
          src={videoBase64} 
          className="w-full h-full object-cover" 
          controls 
          autoPlay 
          loop 
          muted 
        />
        <div className="absolute top-4 left-4 glass px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white">
          Original Input
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Extension Directive</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full h-32 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none transition-all"
            placeholder="Describe the cinematic extension..."
          />
        </div>

        <button
          onClick={() => onExtend(prompt)}
          disabled={isProcessing}
          className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 transition-all shadow-lg ${
            isProcessing 
              ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20 active:scale-95'
          }`}
        >
          {isProcessing ? (
            <>
              <svg className="animate-spin h-5 w-5 text-zinc-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Generating...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Extend & Add Immersive Ad</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
