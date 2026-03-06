import { createClient } from '@/lib/supabase';

export default async function sitemap() {
    const supabase = createClient();
    const { data: products } = await supabase
        .from('products')
        .select('slug, updated_at')
        .gt('stock_quantity', 0);

    const productUrls = (products ?? []).map((p: any) => ({
        url: `https://interstarjumbo.com/produkt/${p.slug}`,
        lastModified: p.updated_at,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    return [
        { url: 'https://interstarjumbo.com', lastModified: new Date(), priority: 1.0 },
        { url: 'https://interstarjumbo.com/catalog', lastModified: new Date(), priority: 0.9 },
        { url: 'https://interstarjumbo.com/uslovi-za-isporaka', priority: 0.5 },
        { url: 'https://interstarjumbo.com/politika-za-vrakanje', priority: 0.5 },
        ...productUrls,
    ];
}
