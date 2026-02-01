
export interface VideoMetadata {
  name: string;
  size: number;
  type: string;
  duration?: number;
}

export interface GenerationStatus {
  step: 'idle' | 'uploading' | 'initializing' | 'processing' | 'downloading' | 'completed' | 'error';
  progress: number;
  message: string;
}

export interface ExtendedVideo {
  url: string;
  id: string;
  prompt: string;
  timestamp: number;
}
