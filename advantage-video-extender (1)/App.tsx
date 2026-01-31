
import React, { useState, useEffect, useRef } from 'react';
import { Step, VideoGenerationState, VideoFile } from './types';
import { checkApiKey, openApiKeySelector, extendVideoWithBrand } from './services/gemini';
import ApiKeySelection from './components/ApiKeySelection';

const App: React.FC = () => {
  const [step, setStep] = useState<Step>(Step.UPLOAD);
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [isCheckingKey, setIsCheckingKey] = useState<boolean>(true);
  const [sourceVideo, setSourceVideo] = useState<VideoFile | null>(null);
  const [genState, setGenState] = useState<VideoGenerationState>({
    isGenerating: false,
    status: '',
    progress: 0
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const init = async () => {
      const selected = await checkApiKey();
      setHasApiKey(selected);
      setIsCheckingKey(false);
    };
    init();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setSourceVideo({ file, previewUrl });
      setStep(Step.CONFIGURE);
    }
  };

  /**
   * Captures a frame from the end of the video to ensure 
   * visual continuity for the Veo video extension.
   */
  const captureReferenceFrame = (): Promise<{ bytes: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.src = sourceVideo!.previewUrl;
      video.crossOrigin = 'anonymous';
      video.muted = true;
      video.play();
      
      // Capture frame near the end (2.8s for a 3s clip)
      video.currentTime = 2.8; 
      
      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject("Canvas context failed");
        
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        const bytes = dataUrl.split(',')[1];
        resolve({ bytes, mimeType: 'image/png' });
        video.remove();
      };
      
      video.onerror = () => reject("Failed to process source video for AI reference.");
    });
  };

  const handleStartGeneration = async () => {
    if (!sourceVideo) return;

    setStep(Step.GENERATING);
    setGenState(prev => ({ 
      ...prev, 
      isGenerating: true, 
      error: undefined, 
      status: "Analyzing sequence continuity..." 
    }));

    try {
      // 1. Prepare visual anchor
      const frameData = await captureReferenceFrame();
      
      // 2. Generate video with Gemini Veo
      const resultUrl = await extendVideoWithBrand(
        frameData,
        (status) => setGenState(prev => ({ ...prev, status }))
      );
      
      setGenState(prev => ({ ...prev, isGenerating: false, resultUrl }));
      setStep(Step.RESULT);
    } catch (error: any) {
      console.error("App Error:", error);
      if (error.message === 'API_KEY_RESET_REQUIRED') {
        setHasApiKey(false);
        setStep(Step.UPLOAD);
        await openApiKeySelector();
        setHasApiKey(true);
      } else {
        setGenState(prev => ({ 
          ...prev, 
          isGenerating: false, 
          error: error.message || 'The AI service is currently at capacity. Please try again.' 
        }));
      }
    }
  };

  if (isCheckingKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <span className="text-slate-500 font-medium animate-pulse">Initializing AdVantage Engine...</span>
        </div>
      </div>
    );
  }

  if (!hasApiKey) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <ApiKeySelection onKeySelected={() => setHasApiKey(true)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 selection:bg-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-600 to-blue-500 p-2 rounded-xl shadow-indigo-100 shadow-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
               <h1 className="text-xl font-black tracking-tight leading-none">AdVantage <span className="text-indigo-600 italic">AI</span></h1>
               <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Superhack Submission</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="hidden sm:block text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
               Veo 3.1 Pro ⚡️
             </div>
             <button 
                onClick={async () => { await openApiKeySelector(); setHasApiKey(true); }}
                className="p-2 hover:bg-slate-100 rounded-xl transition-all border border-transparent hover:border-slate-200"
                title="Change API Key"
              >
                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-8">
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-3 mb-10 overflow-x-auto pb-4 no-scrollbar">
          {[Step.UPLOAD, Step.CONFIGURE, Step.GENERATING, Step.RESULT].map((s, i) => (
            <React.Fragment key={s}>
              <div className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black transition-all duration-500 ${
                  step === s ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 rotate-3' : 'bg-white border border-slate-200 text-slate-400'
                }`}>
                  {i + 1}
                </div>
                <span className={`text-xs font-bold uppercase tracking-widest ${step === s ? 'text-indigo-600' : 'text-slate-400'}`}>
                  {s}
                </span>
              </div>
              {i < 3 && <div className={`w-8 h-0.5 rounded-full ${step === s ? 'bg-indigo-600/30' : 'bg-slate-200'}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* Glassmorphism Container */}
        <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-slate-200 overflow-hidden min-h-[550px] border border-white transition-all duration-500">
          
          {step === Step.UPLOAD && (
            <div className="p-12 text-center h-full flex flex-col items-center justify-center">
              <div className="mb-8 w-28 h-28 bg-indigo-50 rounded-[2rem] flex items-center justify-center mx-auto ring-12 ring-indigo-50/30 animate-bounce-slow">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h2 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">AI Ad Extension</h2>
              <p className="text-slate-500 mb-12 max-w-sm mx-auto font-medium leading-relaxed">
                Upload your 3-second flossing clip and let Gemini Veo craft an immersive Oral-B brand story.
              </p>
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="px-12 py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 hover:shadow-indigo-200 transition-all active:scale-95 flex items-center gap-4 group"
              >
                Select Source Video
                <svg className="w-5 h-5 group-hover:translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="video/*" 
              />
            </div>
          )}

          {step === Step.CONFIGURE && sourceVideo && (
            <div className="p-10">
              <div className="grid md:grid-cols-2 gap-10 items-start">
                <div className="space-y-6">
                  <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                    <span className="w-2 h-8 bg-indigo-600 rounded-full"></span>
                    Input Sequence
                  </h3>
                  <div className="rounded-[2rem] overflow-hidden shadow-2xl aspect-[9/16] bg-slate-900 border-8 border-white ring-1 ring-slate-100 relative group">
                    <video 
                      src={sourceVideo.previewUrl} 
                      className="w-full h-full object-cover"
                      controls
                      autoPlay
                      loop
                    />
                    <div className="absolute top-4 right-4 bg-indigo-600/90 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-full border border-indigo-400/30">
                      ORIGINAL CLIP
                    </div>
                  </div>
                </div>

                <div className="flex flex-col h-full pt-4">
                  <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
                    <span className="w-2 h-8 bg-emerald-500 rounded-full"></span>
                    Extension Logic
                  </h3>
                  <div className="bg-white/50 rounded-[1.5rem] p-6 mb-10 border border-slate-100 shadow-inner">
                    <h4 className="text-[10px] font-black text-indigo-600 uppercase mb-3 tracking-tighter">AI Directive</h4>
                    <p className="text-slate-700 leading-relaxed text-sm font-medium italic">
                      "Analyze the player in the blue jersey. Extend the timeline to 15s. Reveal an Oral-B floss pack. End with a 4K commercial-grade smile of satisfaction."
                    </p>
                  </div>

                  <div className="space-y-5 mb-10">
                    <div className="flex items-center gap-4 group">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                      </div>
                      <span className="text-sm font-bold text-slate-600">Dynamic Extension (6-15s)</span>
                    </div>
                    <div className="flex items-center gap-4 group">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>
                      </div>
                      <span className="text-sm font-bold text-slate-600">Oral-B Brand Fidelity Mode</span>
                    </div>
                  </div>

                  <div className="mt-auto pt-8 border-t border-slate-100 flex gap-4">
                    <button 
                      onClick={() => setStep(Step.UPLOAD)}
                      className="flex-1 py-5 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all"
                    >
                      Reset
                    </button>
                    <button 
                      onClick={handleStartGeneration}
                      className="flex-[2] py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 transition-all active:scale-95"
                    >
                      Extend Ad Sequence
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === Step.GENERATING && (
            <div className="p-12 flex flex-col items-center justify-center h-full min-h-[500px]">
              <div className="relative mb-12">
                <div className="w-32 h-32 border-8 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center shadow-inner">
                    <svg className="w-10 h-10 text-indigo-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <h2 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">AI Visioning Process</h2>
              <div className="px-6 py-2 bg-indigo-100 text-indigo-700 font-black rounded-full text-xs uppercase tracking-widest mb-6 animate-pulse">
                {genState.status}
              </div>
              <p className="text-slate-400 text-sm max-w-sm text-center font-medium leading-relaxed">
                Gemini Veo is calculating physics-accurate transitions and cinematic lighting for the advertising segment.
              </p>

              {genState.error && (
                <div className="mt-10 p-6 bg-rose-50 border border-rose-100 text-rose-600 rounded-3xl flex items-start gap-4 max-w-md shadow-sm">
                   <div className="bg-rose-100 p-2 rounded-xl">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                   </div>
                   <div className="flex-1">
                    <p className="font-black text-sm uppercase tracking-tighter">Integration Issue</p>
                    <p className="text-xs font-medium leading-relaxed mt-1 opacity-80">{genState.error}</p>
                    <div className="flex gap-4 mt-4">
                      <button 
                        onClick={handleStartGeneration}
                        className="text-xs font-black px-4 py-2 bg-white border border-rose-200 rounded-xl hover:bg-rose-100 transition-colors shadow-sm"
                      >
                        Retry Gen
                      </button>
                      <button 
                        onClick={() => setStep(Step.UPLOAD)}
                        className="text-xs font-bold text-rose-700 opacity-60 hover:opacity-100"
                      >
                        Start Over
                      </button>
                    </div>
                   </div>
                </div>
              )}
            </div>
          )}

          {step === Step.RESULT && genState.resultUrl && (
            <div className="p-10">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight">Production Ready</h2>
                  <p className="text-slate-500 text-sm font-medium">Your immersive Oral-B ad has been rendered.</p>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = genState.resultUrl!;
                      link.download = 'oral-b-ad-advantage-ai.mp4';
                      link.click();
                    }}
                    className="flex items-center gap-3 px-6 py-3 bg-slate-900 hover:bg-black text-white rounded-2xl text-sm font-black transition-all shadow-xl"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0L8 8m4-4v12"/></svg>
                    Download
                  </button>
                  <button 
                    onClick={() => setStep(Step.UPLOAD)}
                    className="flex items-center gap-3 px-6 py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-2xl text-sm font-bold transition-all"
                  >
                    New Ad
                  </button>
                </div>
              </div>

              <div className="rounded-[2.5rem] overflow-hidden shadow-2xl aspect-[9/16] bg-slate-900 max-w-sm mx-auto mb-10 border-8 border-white ring-1 ring-slate-100 relative group">
                <video 
                  src={genState.resultUrl} 
                  className="w-full h-full object-cover"
                  controls
                  autoPlay
                />
                <div className="absolute top-4 left-4 bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-full border border-emerald-400/30">
                  AI MASTER RENDER
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-[2rem] p-8 flex items-start gap-5 shadow-sm">
                <div className="p-3 bg-white rounded-2xl text-emerald-600 shadow-md ring-1 ring-emerald-50">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
                <div>
                  <h4 className="font-black text-emerald-900 text-sm mb-1 uppercase tracking-tighter">Campaign Logic Applied</h4>
                  <p className="text-emerald-800/80 text-xs leading-relaxed font-medium">
                    The AI successfully identified the player’s attire and matched the cinematic lighting of the 
                    Oral-B segment to the source clip. The brand logo placement and satisfaction smile meet 
                    professional creative standards.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white/60 backdrop-blur-md border-t border-slate-100 py-3 text-center">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-3">
           AdVantage AI Engine <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span> Gemini 3 Superhack Submission
        </p>
      </footer>
    </div>
  );
};

export default App;
