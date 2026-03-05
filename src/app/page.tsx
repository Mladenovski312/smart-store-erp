"use client";

import { useState, useEffect } from 'react';
import { ShoppingBag, MapPin, Phone, Clock, ChevronRight, Star, Truck, Shield, Gift, Search, ShoppingCart, Plus } from 'lucide-react';
import { getProducts } from '@/lib/store';
import { addToCart, getCartCount } from '@/lib/cart';
import { Product, CATEGORIES, getCategoryLabel, formatPrice } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';
import CartSidebar from '@/components/CartSidebar';
import Footer from '@/components/Footer';

export default function Home() {
    const [products, setProducts] = useState<Product[]>([]);
    const [cartOpen, setCartOpen] = useState(false);
    const [cartCount, setCartCount] = useState(0);

    const refreshCartCount = () => setCartCount(getCartCount());

    useEffect(() => {
        getProducts().then(all => setProducts(all));
        refreshCartCount();
        const openCart = () => setCartOpen(true);
        window.addEventListener('cart-updated', refreshCartCount);
        window.addEventListener('cart-item-added', openCart);
        return () => {
            window.removeEventListener('cart-updated', refreshCartCount);
            window.removeEventListener('cart-item-added', openCart);
        };
    }, []);

    const featured = products.slice(0, 8);
    const categoryGroups = CATEGORIES.map(c => ({
        ...c,
        count: products.filter(p => p.category === c.value).length,
    })).filter(c => c.count > 0);

    return (
        <div className="min-h-screen bg-white text-gray-900">
            {/* ═══ Navigation ═══ */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <Link href="/" className="bg-jumbo-blue text-white px-2.5 py-1 rounded-lg font-black text-sm tracking-tight">
                                ИНТЕР СТАР <span className="text-jumbo-red">ЏАМБО</span>
                            </Link>
                        </div>

                        <div className="hidden md:flex items-center gap-8">
                            <a href="#products" className="text-sm font-medium text-gray-600 hover:text-jumbo-blue transition-colors">Продукти</a>
                            <a href="#categories" className="text-sm font-medium text-gray-600 hover:text-jumbo-blue transition-colors">Категории</a>
                            <Link href="/uslovi-za-isporaka" className="text-sm font-medium text-gray-600 hover:text-jumbo-blue transition-colors">Испорака</Link>
                            <a href="#about" className="text-sm font-medium text-gray-600 hover:text-jumbo-blue transition-colors">За нас</a>
                        </div>

                        <div className="flex items-center gap-3">
                            <Link
                                href="/catalog"
                                className="flex items-center gap-2 bg-jumbo-blue text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors shadow-sm"
                            >
                                <Search size={16} />
                                <span className="hidden sm:inline">Пребарај</span>
                            </Link>
                            <button
                                onClick={() => setCartOpen(true)}
                                aria-label="Отвори кошничка"
                                className="relative p-2 text-gray-600 hover:text-jumbo-blue transition-colors"
                            >
                                <ShoppingCart size={22} />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-jumbo-red text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                        {cartCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* ═══ Hero Section ═══ */}
            <section className="relative overflow-hidden bg-gradient-to-br from-jumbo-blue via-blue-800 to-indigo-900">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 w-72 h-72 bg-jumbo-red rounded-full blur-3xl" />
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-400 rounded-full blur-3xl" />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 bg-white/10 text-white/90 px-4 py-1.5 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
                            <Gift size={14} />
                            Над 20 години радост за децата
                        </div>

                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.1] mb-6 drop-shadow-lg">
                            Најголемиот избор на играчки во <span className="text-jumbo-red">Куманово</span>
                        </h1>
                        <p className="text-lg md:text-xl text-blue-50 mb-10 leading-relaxed font-medium max-w-xl drop-shadow">
                            Вашата омилена локална продавница за играчки. Нарачајте онлајн со брза достава низ цела Македонија и плаќање при достава (COD).
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                href="/catalog"
                                className="bg-jumbo-red hover:bg-red-600 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all hover:scale-105 active:scale-95 text-center shadow-lg shadow-red-500/25 flex items-center justify-center gap-2"
                            >
                                <ShoppingBag size={22} />
                                Погледни ги играчките
                            </Link>
                            <Link
                                href="/lokacija"
                                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all hover:scale-105 active:scale-95 text-center flex items-center justify-center gap-2 backdrop-blur-sm"
                            >
                                <MapPin size={22} />
                                Најди не
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ Trust Badges ═══ */}
            <section className="border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        <TrustBadge icon={<Truck />} title="Достава низ МК" subtitle="Испорака до врата" />
                        <TrustBadge icon={<Star />} title="20+ години искуство" subtitle="Од 2004 година" />
                        <TrustBadge icon={<Shield />} title="Познати брендови" subtitle="Широк асортиман" />
                        <TrustBadge icon={<Gift />} title="Подарок пакување" subtitle="Бесплатно, по желба" />
                    </div>
                </div>
            </section>

            {/* ═══ Categories Grid ═══ */}
            <section id="categories" className="py-16 md:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Категории</h2>
                        <p className="text-gray-500 max-w-md mx-auto">Разгледајте ги нашите категории и пронајдете ја совршената играчка.</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {categoryGroups.map(cat => (
                            <Link
                                key={cat.value}
                                href={`/catalog?category=${encodeURIComponent(cat.value)}`}
                                className="group relative bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg hover:border-jumbo-blue/20 hover:-translate-y-1 transition-all"
                            >
                                <div className="text-3xl mb-3">{getCategoryEmoji(cat.value)}</div>
                                <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-jumbo-blue transition-colors">{cat.label}</h3>
                                <p className="text-sm text-gray-400">{cat.count} артикли</p>
                                <ChevronRight className="absolute top-6 right-5 w-4 h-4 text-gray-300 group-hover:text-jumbo-blue group-hover:translate-x-1 transition-all" />
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ Featured Products ═══ */}
            {featured.length > 0 && (
                <section id="products" className="py-16 md:py-24 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-end justify-between mb-12">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">На залиха</h2>
                                <p className="text-gray-500">Моментално достапни играчки во нашата продавница.</p>
                            </div>
                            <Link
                                href="/catalog"
                                className="hidden md:flex items-center gap-1 text-jumbo-blue font-semibold hover:gap-2 transition-all"
                            >
                                Сите →
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                            {featured.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>

                        {products.length > 8 && (
                            <div className="text-center mt-10">
                                <Link
                                    href="/catalog"
                                    className="inline-flex items-center gap-2 bg-jumbo-blue text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-800 transition-colors shadow-sm"
                                >
                                    Види ги сите артикли
                                    <ChevronRight size={18} />
                                </Link>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* ═══ Top Brands ═══ */}
            <section className="py-14 md:py-20 border-b border-gray-100 overflow-hidden bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-wide uppercase">ВРВНИ БРЕНДОВИ</h2>
                </div>

                <div className="relative flex overflow-hidden group py-4">
                    <div className="absolute left-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

                    {[1, 2].map(copy => (
                        <div key={copy} className="flex min-w-full shrink-0 items-center justify-around gap-20 px-8 animate-marquee group-hover:[animation-play-state:paused]" aria-hidden={copy === 2}>
                            {BRANDS.map((brand, i) => (
                                <div key={`${brand.name}-${copy}-${i}`} className="inline-flex items-center justify-center h-28 grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300">
                                    <Image src={brand.src} alt={brand.name} width={192} height={96} className="max-h-24 max-w-[192px] object-contain" loading="lazy" />
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </section>

            {/* ═══ Delivery Banner ═══ */}
            <section className="py-12 md:py-16 bg-gradient-to-r from-jumbo-blue via-blue-700 to-indigo-800 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="text-center md:text-left">
                            <div className="inline-flex items-center gap-2 bg-white/15 text-white px-4 py-1.5 rounded-full text-sm font-medium mb-3 backdrop-blur-sm">
                                <Truck size={16} />
                                Нарачај онлајн
                            </div>
                            <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">Достава низ цела Македонија</h3>
                            <p className="text-blue-200 max-w-lg">
                                Нарачајте ја вашата омилена играчка и ние ќе ви ја испорачаме на вашата адреса. Плаќање при достава.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Link
                                href="/catalog"
                                className="inline-flex items-center gap-2 bg-white text-jumbo-blue px-6 py-3 rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors shadow-lg"
                            >
                                <ShoppingBag size={18} />
                                Купувај онлајн
                            </Link>
                            <Link
                                href="/uslovi-za-isporaka"
                                className="inline-flex items-center gap-2 bg-white/10 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-white/20 transition-colors border border-white/20"
                            >
                                Услови →
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ About Section ═══ */}
            <section id="about" className="py-16 md:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">За Интер Стар Џамбо</h2>
                        <p className="text-gray-600 text-lg leading-relaxed mb-8">
                            Со над 20 години искуство, <strong>Интер Стар Џамбо</strong> е една од најпознатите
                            продавници за играчки во Куманово. Нашата мисија е да донесеме радост на секое
                            дете преку широк избор на играчки од познати светски брендови.
                        </p>
                        <div className="flex flex-wrap justify-center gap-3">
                            {['LEGO', 'Barbie', 'Paw Patrol', 'Bruder', 'Clementoni', 'Kikka Boo'].map(brand => (
                                <span key={brand} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium">
                                    {brand}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ FAQ AI / AEO Section ═══ */}
            <section className="py-16 bg-gray-50 border-t border-gray-100">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">Често поставувани прашања</h2>
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Дали Interstar Jumbo врши достава надвор од Куманово?</h3>
                            <p className="text-gray-600">Да! Иако нашата физичка продавница се наоѓа во Куманово, ние вршиме брза достава низ цела Македонија со опција за плаќање при преземање на пратката (COD).</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Каде можам да купам квалитетни играчки во Куманово?</h3>
                            <p className="text-gray-600">Можете да нè посетите во нашата продавница на ул. Народна Револуција 43 во Куманово, или да ги разгледате сите достапни играчки онлајн преку нашиот каталог.</p>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />

            <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />

            {/* Structured Data (JSON-LD) for AEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "ToyStore",
                        "name": "Интер Стар Џамбо",
                        "image": "https://www.interstarjumbo.com/hd_logo.webp",
                        "@id": "https://www.interstarjumbo.com",
                        "url": "https://www.interstarjumbo.com",
                        "telephone": "+389 31 422 656",
                        "address": {
                            "@type": "PostalAddress",
                            "streetAddress": "Narodna Revolucija 43",
                            "addressLocality": "Kumanovo",
                            "postalCode": "1300",
                            "addressCountry": "MK"
                        },
                        "geo": {
                            "@type": "GeoCoordinates",
                            "latitude": 42.1322,
                            "longitude": 21.7144
                        },
                        "openingHoursSpecification": {
                            "@type": "OpeningHoursSpecification",
                            "dayOfWeek": [
                                "Monday",
                                "Tuesday",
                                "Wednesday",
                                "Thursday",
                                "Friday",
                                "Saturday"
                            ],
                            "opens": "09:00",
                            "closes": "20:00"
                        }
                    })
                }}
            />
        </div>
    );
}

// ─── Constants ──────────────────────────────────────

const BRANDS = [
    { name: 'LEGO', src: '/brands/lego.png' },
    { name: 'Bruder', src: '/brands/bruder.png' },
    { name: 'Clementoni', src: '/brands/clementoni.png' },
    { name: 'Kikka Boo', src: '/brands/kikkaboo.png' },
    { name: 'Barbie', src: '/brands/barbie.svg' },
    { name: 'Paw Patrol', src: '/brands/pawpatrol.webp' },
    { name: 'Nip', src: '/brands/nip.png' },
];

// ─── Sub-components ─────────────────────────────────

function TrustBadge({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
    return (
        <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-50 text-jumbo-blue rounded-xl flex items-center justify-center shrink-0">
                {icon}
            </div>
            <div>
                <div className="font-bold text-gray-900 text-base">{title}</div>
                <div className="text-sm text-gray-500">{subtitle}</div>
            </div>
        </div>
    );
}

function ProductCard({ product }: { product: Product }) {
    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        addToCart({
            productId: product.id,
            name: product.name,
            price: product.sellingPrice,
            imageUrl: product.imageUrl,
            stock: product.stockQuantity,
        });
    };

    return (
        <Link href={`/produkt/${product.id}`} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden p-3 relative">
                {product.imageUrl ? (
                    <Image src={product.imageUrl} alt={product.name} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" className={`object-contain transition-transform duration-300 p-3 ${product.stockQuantity > 0 ? 'group-hover:scale-105' : 'opacity-90'}`} />
                ) : (
                    <div className={`text-5xl font-bold text-gray-200 ${product.stockQuantity <= 0 ? 'opacity-80' : ''}`}>{product.name.charAt(0)}</div>
                )}
                {product.stockQuantity <= 0 && (
                    <div className="absolute inset-0 bg-white/20 flex flex-col items-center justify-center z-10 pointer-events-none">
                        <span className="bg-gray-800 text-white text-sm font-bold px-4 py-2 rounded-xl shadow-lg border border-gray-700 backdrop-blur-md">Нема залиха</span>
                    </div>
                )}
            </div>
            <div className={`p-4 ${product.stockQuantity <= 0 ? 'opacity-80' : ''}`}>
                <p className="text-xs text-gray-400 mb-1">{getCategoryLabel(product.category)}</p>
                <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 mb-2 min-h-[2.5rem]">{product.name}</h3>
                <div className="flex items-end justify-between mb-3">
                    <span className={`text-lg font-bold ${product.stockQuantity > 0 ? 'text-jumbo-blue' : 'text-gray-500'}`}>
                        {formatPrice(product.sellingPrice)} <span className="text-xs font-normal text-gray-400">ден</span>
                    </span>
                    {product.stockQuantity > 0 ? (
                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                            На залиха
                        </span>
                    ) : (
                        <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                            Нема на залиха
                        </span>
                    )}
                </div>
                <button
                    onClick={handleAddToCart}
                    disabled={product.stockQuantity <= 0}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${product.stockQuantity > 0
                        ? 'bg-jumbo-red text-white hover:bg-red-700 hover:shadow-md active:scale-95'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                >
                    <Plus size={16} />
                    {product.stockQuantity > 0 ? 'Додај во кошничка' : 'Нема залиха'}
                </button>
            </div>
        </Link>
    );
}

function getCategoryEmoji(category: string): string {
    const map: Record<string, string> = {
        'Vehicles & Ride-ons': '🚗',
        'Dolls & Figures': '🎎',
        'Baby & Toddler': '👶',
        'Outdoor & Sports': '⚽',
        'Games & Puzzles': '🧩',
        'Clothing & School': '🎒',
        'Играчки': '🧸',
        'Разно (Miscellaneous)': '🎁',
    };
    return map[category] || '📦';
}
