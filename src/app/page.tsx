import type { Metadata } from 'next';
import { getProducts } from '@/lib/store';
import HomePageClient from '@/components/HomePageClient';

export const metadata: Metadata = {
    title: 'Интер Стар Џамбо — Играчки Куманово',
    description: 'Најголемиот избор на играчки во Куманово. Lego, Barbie, Paw Patrol, возила и повеќе — со бесплатна достава.',
};

export const revalidate = 60;

export default async function Home() {
    const products = await getProducts();
    return <HomePageClient initialProducts={products} />;
}
