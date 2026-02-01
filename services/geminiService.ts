
import { GoogleGenAI } from "@google/genai";

const LOADING_MESSAGES = [
  "Analyzing original video dynamics...",
  "Extracting high-resolution seed frame...",
  "Initializing Veo 3.1 Neural Engine...",
  "Synthesizing immersive advertising environment...",
  "Identifying contextual brand alignment...",
  "Generating 10-second cinematic extension...",
  "Refining temporal consistency...",
  "Applying professional color grading...",
  "Finalizing your immersive experience..."
];

/**
 * Extracts a frame from the video to serve as the visual seed for extension.
 */
async function extractFrame(videoBase64: string, timeSeconds: number = 0): Promise<{ data: string, mimeType: string }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.src = videoBase64;
    video.crossOrigin = 'anonymous';
    video.muted = true;
    
    video.onloadedmetadata = () => {
      // Seek to the end if timeSeconds is very high, otherwise specific time
      video.currentTime = Math.min(timeSeconds, video.duration - 0.1);
    };

    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/png');
      const [header, data] = dataUrl.split(',');
      const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';
      resolve({ data, mimeType });
    };

    video.onerror = (e) => reject(new Error('Failed to analyze video frame'));
  });
}

export async function generateExtendedVideo(
  originalVideoBase64: string, 
  prompt: string,
  onMessage: (msg: string) => void
): Promise<string> {
  // Ensure we use the latest API key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  onMessage("Extracting keyframe for continuity...");
  // We use the last frame to "extend" the video
  const frame = await extractFrame(originalVideoBase64, 999); 

  // 1. Start generation
  // We use the image-to-video capability because 'video' input is for server-side objects
  const finalPrompt = prompt || "Continue this scene as an immersive, high-end brand advertisement. Seamlessly integrate digital billboards, professional stadium lighting, and product placements for a brand that fits the context (like Nike, Gatorade, or Red Bull). The camera should track the subject as the action intensifies.";

  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-generate-preview',
    prompt: finalPrompt,
    image: {
      imageBytes: frame.data,
      mimeType: frame.mimeType,
    },
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '16:9'
    }
  });

  // 2. Poll for completion
  let messageIndex = 0;
  while (!operation.done) {
    onMessage(LOADING_MESSAGES[messageIndex % LOADING_MESSAGES.length]);
    messageIndex++;
    
    await new Promise(resolve => setTimeout(resolve, 10000));
    // Poll with a fresh instance
    const pollingAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
    operation = await pollingAi.operations.getVideosOperation({ operation: operation });
  }

  // 3. Fetch result
  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) {
    throw new Error('No video URI returned from the API');
  }

  const resultResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  if (!resultResponse.ok) {
    throw new Error(`Failed to download result video: ${resultResponse.statusText}`);
  }

  const blob = await resultResponse.blob();
  return URL.createObjectURL(blob);
}
