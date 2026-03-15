import { GoogleGenAI } from '@google/genai';

// Lazy-init so the build doesn't crash when env vars are missing
let _ai: GoogleGenAI | null = null;

export function getAI(): GoogleGenAI {
    if (!_ai) {
        const key = process.env.GEMINI_API_KEY;
        if (!key) throw new Error('GEMINI_API_KEY is not set');
        _ai = new GoogleGenAI({ apiKey: key });
    }
    return _ai;
}
