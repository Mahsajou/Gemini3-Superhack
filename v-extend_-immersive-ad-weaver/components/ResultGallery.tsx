
import React from 'react';
import { ExtendedVideo } from '../types';

interface Props {
  videos: ExtendedVideo[];
}

export const ResultGallery: React.FC<Props> = ({ videos }) => {
  return (
    <div className="grid grid-cols-1 gap-12">
      {videos.map((video) => (
        <div key={video.id} className="glass rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl border-zinc-800/50 hover:border-zinc-700 transition-all group p-2">
          <div className="bg-black rounded-[2.2rem] overflow-hidden relative">
            <video 
              src={video.url} 
              className="w-full aspect-video object-cover" 
              controls 
            />
            <div className="absolute top-6 left-6 flex space-x-2">
              <span className="bg-blue-600/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-white">
                Veo 3.1 Neural Gen
              </span>
              <span className="bg-zinc-900/80 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-zinc-300">
                10s Extension
              </span>
            </div>
          </div>
          <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-3 max-w-2xl">
              <p className="text-2xl font-bold text-zinc-100 tracking-tight">
                Extended Brand Sequence
              </p>
              <p className="text-sm text-zinc-400 leading-relaxed italic border-l-2 border-blue-500/50 pl-4">
                "{video.prompt}"
              </p>
              <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-tighter">
                ID: {video.id} • Generated {new Date(video.timestamp).toLocaleTimeString()}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <a 
                href={video.url} 
                download={`extended-ad-${video.id}.mp4`}
                className="px-8 py-4 bg-white text-black text-sm font-bold rounded-2xl hover:bg-zinc-200 transition-all flex items-center justify-center space-x-3 shadow-xl"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download MP4</span>
              </a>
              <button className="px-8 py-4 bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm font-bold rounded-2xl hover:bg-zinc-800 transition-all">
                Project Settings
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
