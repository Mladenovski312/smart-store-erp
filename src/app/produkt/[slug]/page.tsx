import { notFound } from 'next/navigation';
import { getProductBySlug, getRelatedProducts } from '@/lib/store';
import { formatPrice } from '@/lib/types';
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
        || `Купи ${product.name} во Интер Стар Џамбо Куманово. Цена: ${formatPrice(product.sellingPrice)} ден. Брза достава низ цела Македонија.`;

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
    const productUrl = `https://interstarjumbo.com/produkt/${slug}`;

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
                        "description": product.description || `Купи ${product.name} во Интер Стар Џамбо Куманово. Најдобра цена и брза достава низ цела Македонија.`,
                        "sku": product.barcode || product.id,
                        "brand": {
                            "@type": "Brand",
                            "name": "Interstar Jumbo"
                        },
                        "offers": {
                            "@type": "Offer",
                            "url": productUrl,
                            "priceCurrency": "MKD",
                            "price": product.sellingPrice,
                            "availability": product.stockQuantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                            "seller": {
                                "@type": "Organization",
                                "name": "Интер Стар Џамбо"
                            }
                        }
                    })
                }}
            />
        </>
    );
}
