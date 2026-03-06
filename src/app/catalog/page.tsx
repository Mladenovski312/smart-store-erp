import { getProducts } from '@/lib/store';
import CatalogClient from '@/components/CatalogClient';

export default async function CatalogPage({
    searchParams,
}: {
    searchParams: Promise<{ category?: string }>;
}) {
    const [products, resolvedParams] = await Promise.all([
        getProducts(),
        searchParams,
    ]);

    return (
        <CatalogClient
            initialProducts={products}
            initialCategory={resolvedParams.category || ''}
        />
    );
}
