
import { GoogleGenAI } from "@google/genai";

export async function checkApiKey() {
  if (typeof (window as any).aistudio?.hasSelectedApiKey === 'function') {
    return await (window as any).aistudio.hasSelectedApiKey();
  }
  return false;
}

export async function openApiKeySelector() {
  if (typeof (window as any).aistudio?.openSelectKey === 'function') {
    await (window as any).aistudio.openSelectKey();
    return true;
  }
  return false;
}

export async function extendVideoWithBrand(
  frameData: { bytes: string; mimeType: string },
  onStatusUpdate: (status: string) => void
): Promise<string> {
  // Always create a new instance to get the latest injected API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  onStatusUpdate("Initializing Cinematic Extension (Veo 3.1)...");

  const prompt = `Start exactly from this frame. The player in the blue football jersey finishes his flossing routine. 
  Immediately after, he pulls out a sleek Oral-B dental floss package from his pocket. 
  He holds it up, looks at the 'Oral-B' logo clearly visible on the pack, and gives a genuine, 
  radiant smile of satisfaction. The lighting is bright and commercial-quality. 
  The video should be roughly 10-12 seconds long. 
  End with a close-up of the player's happy expression and the product.`;

  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      image: {
        imageBytes: frameData.bytes,
        mimeType: frameData.mimeType,
      },
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '9:16'
      }
    });

    onStatusUpdate("Generation in progress. This takes 1-3 minutes...");

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      onStatusUpdate("Synthesizing brand-safe frames... (polling Gemini)");
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
      throw new Error("Generation completed but no video URI was found.");
    }

    onStatusUpdate("Finalizing your advertisement...");
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    if (!response.ok) throw new Error("Failed to download generated video asset.");
    
    const blob = await response.blob();
    return URL.createObjectURL(blob);

  } catch (error: any) {
    console.error("Gemini Video Gen Error:", error);
    // Mandatory check for key reset based on instructions
    if (error.message?.includes("Requested entity was not found") || error.message?.includes("404")) {
        throw new Error("API_KEY_RESET_REQUIRED");
    }
    throw error;
  }
}
