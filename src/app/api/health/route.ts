import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
    const start = Date.now();

    try {
        const supabase = createClient();
        const { count, error } = await supabase
            .from('products')
            .select('id', { count: 'exact', head: true });

        if (error) {
            console.error('Health check DB error:', error.message);
            return NextResponse.json(
                { status: 'degraded', db: 'error', ms: Date.now() - start },
                { status: 503 }
            );
        }

        return NextResponse.json({
            status: 'ok',
            db: 'connected',
            products: count,
            ms: Date.now() - start,
        });
    } catch (err) {
        console.error('Health check error:', err);
        return NextResponse.json(
            { status: 'error', ms: Date.now() - start },
            { status: 503 }
        );
    }
}
