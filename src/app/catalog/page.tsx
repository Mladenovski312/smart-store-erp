import { getProducts } from '@/lib/store';
import CatalogClient from '@/components/CatalogClient';

export default async function CatalogPage({
    searchParams,
}: {
    searchParams: Promise<{ category?: string; q?: string; min?: string; max?: string }>;
}) {
    const [products, resolvedParams] = await Promise.all([
        getProducts(),
        searchParams,
    ]);

    return (
        <CatalogClient
            initialProducts={products}
            initialCategory={resolvedParams.category || ''}
            initialQuery={resolvedParams.q || ''}
            initialMin={resolvedParams.min ? Number(resolvedParams.min) : undefined}
            initialMax={resolvedParams.max ? Number(resolvedParams.max) : undefined}
        />
    );
}
