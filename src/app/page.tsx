import { getProducts } from '@/lib/store';
import HomePageClient from '@/components/HomePageClient';

export const dynamic = 'force-dynamic';

export default async function Home() {
    const products = await getProducts();
    return <HomePageClient initialProducts={products} />;
}
