"use client";

import { useState, useEffect } from 'react';
import { ShoppingBag, MapPin, Phone, Clock, ChevronRight, Star, Truck, Shield, Gift, Search, ShoppingCart, Plus } from 'lucide-react';
import { getProducts } from '@/lib/store';
import { addToCart, getCartCount } from '@/lib/cart';
import { Product, CATEGORIES, getCategoryLabel } from '@/lib/types';
import Link from 'next/link';
import CartSidebar from '@/components/CartSidebar';
import Footer from '@/components/Footer';

export default function StorefrontHome() {
    const [mounted, setMounted] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [cartOpen, setCartOpen] = useState(false);
    const [cartCount, setCartCount] = useState(0);

    const refreshCartCount = () => setCartCount(getCartCount());

    useEffect(() => {
        setMounted(true);
        getProducts().then(all => setProducts(all.filter(p => p.stockQuantity > 0)));
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

    if (!mounted) {
        return (
            <div className="flex h-screen items-center justify-center bg-white">
                <div className="w-10 h-10 border-4 border-jumbo-blue border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
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

                        <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6 tracking-tight">
                            Најголемиот избор на<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-300 to-jumbo-red">играчки</span> во Куманово
                        </h1>

                        <p className="text-blue-100 text-lg md:text-xl mb-8 leading-relaxed max-w-lg">
                            Lego, Barbie, Paw Patrol, Bruder и уште многу повеќе.
                            Дојдете и побарајте ја вашата омилена играчка!
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                href="/catalog"
                                className="inline-flex items-center justify-center gap-2 bg-jumbo-red hover:bg-red-700 text-white px-8 py-3.5 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                            >
                                <ShoppingBag size={20} />
                                Погледни ги играчките
                            </Link>
                            <Link
                                href="/lokacija"
                                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-8 py-3.5 rounded-xl font-semibold text-lg transition-all backdrop-blur-sm border border-white/20"
                            >
                                <MapPin size={20} />
                                Најди не
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ Trust Badges ═══ */}
            <section className="border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <TrustBadge icon={<Shield />} title="Оригинални брендови" subtitle="100% автентични" />
                        <TrustBadge icon={<Truck />} title="Достава низ МК" subtitle="Испорака до врата" />
                        <TrustBadge icon={<Star />} title="20+ години искуство" subtitle="Од 2004 година" />
                        <TrustBadge icon={<Gift />} title="Подарок пакување" subtitle="Бесплатно" />
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
                        {(categoryGroups.length > 0 ? categoryGroups : CATEGORIES.map(c => ({ ...c, count: 0 }))).map(cat => (
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
                                    Погледни ги сите {products.length} артикли
                                    <ChevronRight size={18} />
                                </Link>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* ═══ Top Brands ═══ */}
            <section className="py-14 md:py-20 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-10 text-center">ВРВНИ БРЕНДОВИ</h2>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-6 md:gap-8 items-center">
                        {[
                            { name: 'LEGO', src: '/brands/lego.png' },
                            { name: 'Bruder', src: '/brands/bruder.png' },
                            { name: 'Clementoni', src: '/brands/clementoni.png' },
                            { name: 'Kikka Boo', src: '/brands/kikkaboo.png' },
                            { name: 'Barbie', src: null },
                            { name: 'Paw Patrol', src: null },
                        ].map(brand => (
                            <div key={brand.name} className="flex items-center justify-center h-20 grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300">
                                {brand.src ? (
                                    <img src={brand.src} alt={brand.name} className="max-h-14 max-w-[120px] object-contain" />
                                ) : (
                                    <span className="text-lg font-bold text-gray-400 hover:text-gray-700 transition-colors">{brand.name}</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ Delivery Banner ═══ */}
            <section className="py-12 md:py-16 bg-gradient-to-r from-jumbo-blue via-blue-700 to-indigo-800">
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
                            дете преку квалитетни и оригинални играчки од светски познати брендови.
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

            <Footer />

            <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
        </div>
    );
}

// ─── Sub-components ─────────────────────────────────

function TrustBadge({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
    return (
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-jumbo-blue-light text-jumbo-blue rounded-xl flex items-center justify-center shrink-0">
                {icon}
            </div>
            <div>
                <div className="font-semibold text-gray-900 text-sm">{title}</div>
                <div className="text-xs text-gray-500">{subtitle}</div>
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
        });
    };

    return (
        <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden p-3">
                {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                ) : (
                    <div className="text-5xl font-bold text-gray-200">{product.name.charAt(0)}</div>
                )}
            </div>
            <div className="p-4">
                <p className="text-xs text-gray-400 mb-1">{getCategoryLabel(product.category)}</p>
                <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 mb-2 min-h-[2.5rem]">{product.name}</h3>
                <div className="flex items-end justify-between mb-3">
                    <span className="text-lg font-bold text-jumbo-blue">
                        {product.sellingPrice.toLocaleString()} <span className="text-xs font-normal text-gray-400">ден</span>
                    </span>
                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        На залиха
                    </span>
                </div>
                <button
                    onClick={handleAddToCart}
                    className="w-full flex items-center justify-center gap-2 bg-jumbo-red/10 text-jumbo-red hover:bg-jumbo-red hover:text-white py-2 rounded-lg text-xs font-semibold transition-colors"
                >
                    <Plus size={14} />
                    Додај во кошничка
                </button>
            </div>
        </div>
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
        'Разно (Miscellaneous)': '🎁',
    };
    return map[category] || '📦';
}
