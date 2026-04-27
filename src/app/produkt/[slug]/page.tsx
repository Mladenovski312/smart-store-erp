import { notFound } from 'next/navigation';
import { getProductBySlug, getRelatedProducts } from '@/lib/store';
import ProductDetailClient from '@/components/ProductDetailClient';
import type { Metadata } from 'next';

type Props = {
    params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const product = await getProductBySlug(slug);

    if (!product) {
        return { title: 'Производот не е пронајден' };
    }

    const title = product.name;
    const description = product.description
        || `${product.name} во каталогот на Интер Стар Џамбо Куманово. Цените и онлајн нарачките се во подготовка.`;

    return {
        title,
        description,
        openGraph: {
            title: `${product.name} | Интер Стар Џамбо`,
            description,
            url: `https://interstarjumbo.com/produkt/${slug}`,
            images: product.imageUrl
                ? [{ url: product.imageUrl, width: 800, height: 800, alt: product.name }]
                : [],
            type: 'article',
        },
        twitter: {
            card: 'summary_large_image',
            title: `${product.name} | Интер Стар Џамбо`,
            description,
            images: product.imageUrl ? [product.imageUrl] : [],
        },
    };
}

export default async function ProductDetailPage({ params }: Props) {
    const { slug } = await params;
    const product = await getProductBySlug(slug);

    if (!product) notFound();

    const relatedProducts = await getRelatedProducts(product);
    return (
        <>
            <ProductDetailClient product={product} relatedProducts={relatedProducts} />

            {/* Product Structured Data for SEO/AEO — rendered server-side with correct URL */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Product",
                        "name": product.name,
                        "image": product.imageUrl || "https://www.interstarjumbo.com/hd_logo.webp",
                        "description": product.description || `${product.name} во каталогот на Интер Стар Џамбо Куманово. Цените и онлајн нарачките се во подготовка.`,
                        "sku": product.barcode || product.id,
                        "brand": {
                            "@type": "Brand",
                            "name": "Interstar Jumbo"
                        }
                    })
                }}
            />
        </>
    );
}
