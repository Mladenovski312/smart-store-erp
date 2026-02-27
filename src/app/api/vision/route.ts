import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// Lazy-init so the build doesn't crash when env vars are missing
let _ai: GoogleGenAI | null = null;
function getAI() {
    if (!_ai) {
        const key = process.env.GEMINI_API_KEY;
        if (!key) throw new Error('GEMINI_API_KEY is not set');
        _ai = new GoogleGenAI({ apiKey: key });
    }
    return _ai;
}

export async function POST(req: NextRequest) {
    try {
        const ai = getAI();

        const formData = await req.formData();
        const imageFile = formData.get('image') as File;

        if (!imageFile) {
            return NextResponse.json({ error: 'No image provided' }, { status: 400 });
        }

        // Convert file to base64
        const buffer = await imageFile.arrayBuffer();
        const base64Image = Buffer.from(buffer).toString('base64');
        const mimeType = imageFile.type;

        const prompt = `
      You are an AI assistant for a local toy store named "Интер Стар Џамбо" in Kumanovo, Macedonia.
      Analyze the provided image of a toy or product.
      
      Suggest the following details in JSON format:
      1. name: A short, descriptive name for the toy in Macedonian.
      2. category: The best fitting category from the following list ONLY:
         - Vehicles & Ride-ons
         - Dolls & Figures
         - Baby & Toddler
         - Outdoor & Sports
         - Games & Puzzles
         - Clothing & School
         - Разно (Miscellaneous)
      
      Respond ONLY with valid JSON. Do not include markdown formatting or extra text.
      Example: { "name": "Полициски автомобил на батерии", "category": "Vehicles & Ride-ons" }
    `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                {
                    role: 'user',
                    parts: [
                        { text: prompt },
                        { inlineData: { data: base64Image, mimeType: mimeType } }
                    ],
                }
            ],
            config: {
                responseMimeType: "application/json",
            }
        });

        const aiResponseText = response?.text || "{}";
        const result = JSON.parse(aiResponseText);

        return NextResponse.json(result);

    } catch (error) {
        console.error('Vision API Error:', error);
        return NextResponse.json({ error: 'Failed to process image' }, { status: 500 });
    }
}
