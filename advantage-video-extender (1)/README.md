
# AdVantage AI: Immersive Ad Extender 🎬

Built for the **Gemini 3 Superhack**, AdVantage AI is a cutting-edge platform that transforms short, user-generated clips into high-production-value immersive advertisements using **Gemini Veo 3.1**.

## 🚀 The Concept
Brands often struggle to turn short social media clips into cohesive brand stories. AdVantage AI uses generative video to:
1. **Analyze** the end of an existing 3-second clip.
2. **Extend** the narrative seamlessly using Veo 3.1.
3. **Inject** brand assets (like Oral-B dental floss) and high-satisfaction expressions to create a professional 15-second commercial.

## 🛠️ Technical Stack
- **AI Model**: `veo-3.1-fast-generate-preview` (Video-to-Video Extension)
- **Engine**: `@google/genai` SDK
- **Frontend**: React 19 + Tailwind CSS
- **Processing**: Client-side frame extraction for visual continuity.

## 📦 Getting Started
1. Clone this repository:
   ```bash
   git clone https://github.com/Mahsajou/Gemini3-Superhack.git
   ```
2. Open `index.html` in a supported environment (like IDX or a local dev server).
3. Select your **Paid API Key** (required for Veo models).
4. Upload a 3s clip and watch AI craft your advertisement.

## 🧠 Features
- **Smart Continuity**: Captures the exact last frame of source video as a prompt anchor.
- **Dynamic Prompting**: Context-aware commercial storytelling.
- **Robust UX**: Polling-based generation states with reassuring progress updates.
- **Auto-Recovery**: Handles API key expiration/errors gracefully.

---
*Created for the Gemini 3 Superhack competition.*
