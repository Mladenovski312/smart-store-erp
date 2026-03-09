import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@/lib/supabase';

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

// ── Rate limiter (in-memory, resets on server restart) ──────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const entry = rateLimitMap.get(ip);
    if (!entry || now > entry.resetAt) {
        rateLimitMap.set(ip, { count: 1, resetAt: now + 3_600_000 });
        return false;
    }
    if (entry.count >= 10) return true;
    entry.count++;
    return false;
}

const SYSTEM_PROMPT = `You are a product assistant for Интер Стар Џамбо, a toy store in Kumanovo, Macedonia.

STRICT RULES:
- You ONLY know about the products provided to you in this conversation.
- You have NO knowledge of anything outside this product list.
- You NEVER mention other stores, websites, or brands not in the provided list.
- You NEVER answer general knowledge questions (news, politics, recipes, math, or anything unrelated to finding products from this store).
- If asked anything unrelated to finding products from this store, respond ONLY with this exact JSON: []

OUTPUT RULES:
- Respond in the same language the customer used (Macedonian or English).
- Respond ONLY with a valid JSON array. No markdown, no explanation, no extra text.
- Format: [{"product_id": "...", "reason": "..."}]
- Return only genuine matches. If only 1 product matches, return only 1. Never pad results with irrelevant products.
- Maximum 3 results.
- reason must be max 20 words, in the same language the customer used.
- If nothing matches, return: []`;

export async function POST(req: NextRequest) {
    // ── Rate limit check ────────────────────────────────────
    const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
    if (isRateLimited(ip)) {
        return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
    }

    // ── Input validation ────────────────────────────────────
    let body: { query?: string };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { query } = body;
    if (!query || query.trim().length < 2) {
        return NextResponse.json({ error: 'Query too short' }, { status: 400 });
    }

    const supabase = createClient();

    // ── Fetch product catalog (compact fields for prompt) ───
    const { data: products } = await supabase
        .from('products')
        .select('id, name, brand, price, age_range')
        .gt('stock', 0);

    if (!products?.length) {
        return NextResponse.json({ recommendations: [] });
    }

    // ── Call Gemini ─────────────────────────────────────────
    const userPrompt = `Customer request: "${query.trim()}"\n\nAvailable products:\n${JSON.stringify(products)}`;

    let rawResponse = '';
    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                {
                    role: 'user',
                    parts: [{ text: userPrompt }],
                },
            ],
            config: {
                systemInstruction: SYSTEM_PROMPT,
                maxOutputTokens: 300,
                temperature: 0.3,
                responseMimeType: 'application/json',
            },
        });
        rawResponse = response?.text || '[]';
    } catch (error: unknown) {
        const status = (error as { status?: number })?.status;
        if (status === 429) {
            return NextResponse.json({ error: 'quota_exceeded' }, { status: 429 });
        }
        console.error('Gift Finder Gemini error:', error);
        return NextResponse.json({ error: 'gemini_error' }, { status: 500 });
    }

    // ── Parse response ──────────────────────────────────────
    let matches: { product_id: string; reason: string }[] = [];
    try {
        const clean = rawResponse.replace(/```json|```/g, '').trim();
        matches = JSON.parse(clean);
        if (!Array.isArray(matches)) matches = [];
    } catch {
        return NextResponse.json({ recommendations: [] });
    }

    if (!matches.length) {
        return NextResponse.json({ recommendations: [] });
    }

    // ── Re-validate products still in stock ─────────────────
    const ids = matches.map(m => m.product_id);
    const { data: validProducts } = await supabase
        .from('products')
        .select('id, name, brand, price, image_url, slug, stock')
        .in('id', ids)
        .gt('stock', 0);

    const recommendations = matches
        .map(m => ({
            product: validProducts?.find(p => p.id === m.product_id),
            reason: m.reason,
        }))
        .filter(r => r.product != null);

    return NextResponse.json({ recommendations });
}
