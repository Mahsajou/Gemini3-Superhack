
export interface VideoGenerationState {
  isGenerating: boolean;
  status: string;
  progress: number;
  resultUrl?: string;
  error?: string;
}

export interface VideoFile {
  file: File;
  previewUrl: string;
}

export enum Step {
  UPLOAD = 'UPLOAD',
  CONFIGURE = 'CONFIGURE',
  GENERATING = 'GENERATING',
  RESULT = 'RESULT'
}
