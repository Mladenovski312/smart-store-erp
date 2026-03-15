import type { Metadata } from 'next';
import { getProducts } from '@/lib/store';
import CatalogClient from '@/components/CatalogClient';

export const metadata: Metadata = {
    title: 'Каталог',
    description: 'Пребарувајте го целиот асортиман на играчки во Интер Стар Џамбо. Филтрирајте по категорија, цена и возраст.',
};

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
