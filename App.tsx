
import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { VideoUploader } from './components/VideoUploader';
import { VideoPreview } from './components/VideoPreview';
import { ProcessingOverlay } from './components/ProcessingOverlay';
import { ResultGallery } from './components/ResultGallery';
import { generateExtendedVideo } from './services/geminiService';
import { GenerationStatus, ExtendedVideo } from './types';

// Extend window interface for AI Studio methods
// The environment expects a property named 'aistudio' of type 'AIStudio'.
// We define the interface to match this requirement and avoid modifier mismatch.
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    // Adding readonly to match the environment's pre-configured global declaration and fix modifier mismatch errors
    readonly aistudio: AIStudio;
  }
}

const App: React.FC = () => {
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [originalVideo, setOriginalVideo] = useState<string | null>(null);
  const [status, setStatus] = useState<GenerationStatus>({
    step: 'idle',
    progress: 0,
    message: '',
  });
  const [results, setResults] = useState<ExtendedVideo[]>([]);

  useEffect(() => {
    const checkApiKey = async () => {
      if (window.aistudio) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(selected);
      }
    };
    checkApiKey();
  }, []);

  const handleSelectApiKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      // Assume success after opening dialog as per instructions to avoid race conditions
      setHasApiKey(true);
    }
  };

  const handleVideoUpload = (base64: string) => {
    setOriginalVideo(base64);
  };

  const handleExtend = async (prompt: string) => {
    if (!originalVideo) return;

    setStatus({
      step: 'initializing',
      progress: 10,
      message: 'Analyzing original footage...',
    });

    try {
      // Simulate progress for better UX during long waits
      const progressInterval = setInterval(() => {
        setStatus(prev => {
          if (prev.progress < 90) {
            return { ...prev, progress: prev.progress + 0.5 };
          }
          return prev;
        });
      }, 5000);

      const videoUrl = await generateExtendedVideo(originalVideo, prompt, (msg) => {
        setStatus(prev => ({ ...prev, message: msg }));
      });

      clearInterval(progressInterval);

      const newResult: ExtendedVideo = {
        id: Math.random().toString(36).substr(2, 9),
        url: videoUrl,
        prompt: prompt,
        timestamp: Date.now(),
      };

      setResults(prev => [newResult, ...prev]);
      setStatus({ step: 'completed', progress: 100, message: 'Generation complete!' });
      
      // Auto reset status after a delay
      setTimeout(() => setStatus(prev => ({ ...prev, step: 'idle' })), 3000);
    } catch (error: any) {
      console.error('Extension failed:', error);
      const isKeyError = error?.message?.includes('Requested entity was not found');
      if (isKeyError) {
        setHasApiKey(false);
      }
      setStatus({ 
        step: 'error', 
        progress: 0, 
        message: isKeyError ? 'API Key error. Please re-select your key.' : 'Failed to extend video. Please try again.' 
      });
    }
  };

  if (!hasApiKey) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-zinc-900 to-black text-white">
        <div className="max-w-md w-full glass p-8 rounded-3xl text-center space-y-6">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">V-Extend</h1>
          <p className="text-zinc-400">
            Welcome to the future of AI video production. Select a valid Gemini API key from a paid GCP project to begin extending your stories.
          </p>
          <a 
            href="https://ai.google.dev/gemini-api/docs/billing" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-xs text-blue-400 hover:underline block"
          >
            Learn about billing and requirements
          </a>
          <button
            onClick={handleSelectApiKey}
            className="w-full py-4 bg-white text-black font-semibold rounded-xl hover:bg-zinc-200 transition-all transform active:scale-95 shadow-xl"
          >
            Select API Key
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        <section className="grid lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">1. Upload Footage</h2>
              <p className="text-zinc-400 text-sm">Upload a short clip (3s) to start the extension process.</p>
            </div>
            <VideoUploader onUpload={handleVideoUpload} />
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">2. Define Your Story</h2>
              <p className="text-zinc-400 text-sm">Describe how you want to extend the scene and integrate branding.</p>
            </div>
            <VideoPreview 
              videoBase64={originalVideo} 
              onExtend={handleExtend} 
              isProcessing={status.step !== 'idle' && status.step !== 'completed' && status.step !== 'error'} 
            />
          </div>
        </section>

        {results.length > 0 && (
          <section className="space-y-6 pt-12 border-t border-zinc-800">
            <h2 className="text-2xl font-semibold">Extended Creations</h2>
            <ResultGallery videos={results} />
          </section>
        )}
      </main>

      {status.step !== 'idle' && status.step !== 'completed' && status.step !== 'error' && (
        <ProcessingOverlay status={status} />
      )}
      
      {status.step === 'error' && (
        <div className="fixed bottom-6 right-6 glass border-red-500/50 p-4 rounded-xl flex items-center space-x-3 text-red-400 animate-in fade-in slide-in-from-bottom-4">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{status.message}</span>
          <button onClick={() => setStatus(prev => ({ ...prev, step: 'idle' }))} className="ml-2 hover:text-white">×</button>
        </div>
      )}
    </div>
  );
};

export default App;
