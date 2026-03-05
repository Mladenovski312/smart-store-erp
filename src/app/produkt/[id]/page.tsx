"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
    ChevronLeft, ChevronRight, ShoppingCart, Heart, Package,
    Minus, Plus, Truck, Share2, Copy, Check
} from 'lucide-react';
import { getProductById } from '@/lib/store';
import { addToCart, getCartCount } from '@/lib/cart';
import { Product, getCategoryLabel, formatPrice } from '@/lib/types';
import CartSidebar from '@/components/CartSidebar';
import Footer from '@/components/Footer';

export default function ProductDetailPage() {
    const params = useParams();
    const productId = params.id as string;

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [cartOpen, setCartOpen] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [copied, setCopied] = useState(false);
    const [addedToCart, setAddedToCart] = useState(false);

    const refreshCartCount = () => setCartCount(getCartCount());

    useEffect(() => {
        if (productId) {
            getProductById(productId).then(p => {
                setProduct(p);
                setLoading(false);
            });
        }
        setTimeout(() => setCartCount(getCartCount()), 0);
        const openCart = () => setCartOpen(true);
        window.addEventListener('cart-updated', refreshCartCount);
        window.addEventListener('cart-item-added', openCart);
        return () => {
            window.removeEventListener('cart-updated', refreshCartCount);
            window.removeEventListener('cart-item-added', openCart);
        };
    }, [productId]);

    const handleAddToCart = () => {
        if (!product) return;
        for (let i = 0; i < quantity; i++) {
            addToCart({
                productId: product.id,
                name: product.name,
                price: product.sellingPrice,
                imageUrl: product.imageUrl,
                stock: product.stockQuantity,
            });
        }
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
    };

    const getShareUrl = () => typeof window !== 'undefined' ? window.location.href : '';

    const handleCopyLink = () => {
        navigator.clipboard.writeText(getShareUrl());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareLinks = [
        {
            name: 'Facebook',
            icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
            ),
            href: (url: string, title: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
            color: 'hover:bg-[#1877F2] hover:text-white',
        },
        {
            name: 'X',
            icon: (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
            ),
            href: (url: string, title: string) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
            color: 'hover:bg-black hover:text-white',
        },
        {
            name: 'LinkedIn',
            icon: (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
            ),
            href: (url: string, title: string) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
            color: 'hover:bg-[#0A66C2] hover:text-white',
        },
        {
            name: 'Pinterest',
            icon: (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z" /></svg>
            ),
            href: (url: string, title: string) => `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(title)}`,
            color: 'hover:bg-[#E60023] hover:text-white',
        },
        {
            name: 'Email',
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            ),
            href: (url: string, title: string) => `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Погледни го овој производ: ${url}`)}`,
            color: 'hover:bg-gray-700 hover:text-white',
        },
    ];

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-white">
                <div className="w-10 h-10 border-4 border-jumbo-blue border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <Link href="/catalog" className="flex items-center gap-2 text-gray-500 hover:text-jumbo-blue transition-colors">
                                <ChevronLeft size={20} />
                                <span className="text-sm font-medium">Назад кон каталог</span>
                            </Link>
                        </div>
                    </div>
                </nav>
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <Package className="w-20 h-20 text-gray-200 mx-auto mb-6" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Производот не е пронајден</h2>
                        <p className="text-gray-500 mb-6">Овој производ може да не е веќе достапен.</p>
                        <Link href="/catalog" className="inline-flex items-center gap-2 bg-jumbo-blue text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors">
                            <ChevronLeft size={18} />
                            Кон каталогот
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Nav */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <Link href="/catalog" className="flex items-center gap-2 text-gray-500 hover:text-jumbo-blue transition-colors">
                                <ChevronLeft size={20} />
                                <span className="text-sm font-medium hidden sm:inline">Назад</span>
                            </Link>
                            <Link href="/" className="bg-jumbo-blue text-white px-2.5 py-1 rounded-lg font-black text-sm tracking-tight">
                                ИНТЕР СТАР <span className="text-jumbo-red">ЏАМБО</span>
                            </Link>
                        </div>
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
            </nav>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
                    <Link href="/" className="hover:text-jumbo-blue transition-colors">Почетна</Link>
                    <ChevronRight size={14} className="text-gray-300" />
                    <Link href="/catalog" className="hover:text-jumbo-blue transition-colors">Каталог</Link>
                    <ChevronRight size={14} className="text-gray-300" />
                    <Link href={`/catalog?category=${encodeURIComponent(product.category)}`} className="hover:text-jumbo-blue transition-colors">
                        {getCategoryLabel(product.category)}
                    </Link>
                    <ChevronRight size={14} className="text-gray-300" />
                    <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.name}</span>
                </nav>

                {/* Product Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
                    {/* Image */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 lg:p-10 flex items-center justify-center aspect-square relative">
                        {product.imageUrl ? (
                            <Image
                                src={product.imageUrl}
                                alt={product.name}
                                fill
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                className="object-contain p-6 lg:p-10"
                                priority
                            />
                        ) : (
                            <Package className="w-32 h-32 text-gray-200" />
                        )}
                    </div>

                    {/* Details */}
                    <div className="flex flex-col">
                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                            {product.name}
                        </h1>

                        <p className="text-3xl font-bold text-jumbo-blue mb-6">
                            {formatPrice(product.sellingPrice)} <span className="text-base font-normal text-gray-500">ден</span>
                        </p>

                        {/* Description */}
                        {product.description && (
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Опис</h3>
                                <div className="text-gray-600 text-sm leading-relaxed space-y-2">
                                    {product.description.split('\n').map((line, i) => (
                                        <p key={i}>{line.startsWith('•') || line.startsWith('-') ? line : line}</p>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Stock Status */}
                        <div className="flex items-center gap-2 mb-6">
                            {product.stockQuantity > 0 ? (
                                <>
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-sm font-medium text-green-700">НА ЗАЛИХА</span>
                                </>
                            ) : (
                                <>
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                                    <span className="text-sm font-medium text-red-700">НЕМА НА ЗАЛИХА</span>
                                </>
                            )}
                        </div>

                        {/* Quantity & Add to Cart */}
                        {product.stockQuantity > 0 && (
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
                                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        disabled={quantity <= 1}
                                        className={`p-3 transition-colors ${quantity <= 1 ? 'bg-gray-50 text-gray-200' : 'bg-gray-300 text-gray-800 hover:bg-gray-400'}`}
                                    >
                                        <Minus size={16} />
                                    </button>
                                    <span className="px-5 py-3 text-sm font-semibold min-w-[50px] text-center border-x border-gray-200">
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                                        disabled={quantity >= product.stockQuantity}
                                        className={`p-3 transition-colors ${quantity >= product.stockQuantity ? 'bg-gray-50 text-gray-200' : 'bg-gray-300 text-gray-800 hover:bg-gray-400'}`}
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>

                                <button
                                    onClick={handleAddToCart}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-8 rounded-xl font-semibold text-sm transition-all duration-300 ${addedToCart
                                        ? 'bg-green-600 text-white'
                                        : 'bg-jumbo-red text-white hover:bg-red-700 hover:shadow-lg'
                                        }`}
                                >
                                    {addedToCart ? (
                                        <>
                                            <Check size={18} />
                                            ДОДАДЕНО!
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingCart size={18} />
                                            ДОДАЈ ВО КОШНИЧКА
                                        </>
                                    )}
                                </button>

                                <button className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-gray-200 text-gray-500 hover:text-jumbo-red hover:border-jumbo-red transition-all text-sm font-medium">
                                    <Heart size={18} />
                                    <span className="sm:hidden">ВО ЖЕЛБОТЕКА</span>
                                </button>
                            </div>
                        )}

                        {/* Delivery Info */}
                        <div className="flex items-center gap-3 bg-blue-50 p-4 rounded-xl mb-6">
                            <Truck size={20} className="text-jumbo-blue shrink-0" />
                            <p className="text-sm text-gray-700">
                                Период на испорака во работни денови: <strong>3 - 7 дена</strong>
                            </p>
                        </div>

                        {/* Product Meta */}
                        <div className="border-t border-gray-100 pt-6 space-y-3 text-sm">
                            {product.barcode && (
                                <div className="flex gap-2">
                                    <span className="text-gray-400 font-medium">Шифра:</span>
                                    <span className="text-gray-700">{product.barcode}</span>
                                </div>
                            )}
                            <div className="flex gap-2">
                                <span className="text-gray-400 font-medium">Категорија:</span>
                                <Link href={`/catalog?category=${encodeURIComponent(product.category)}`} className="text-jumbo-blue hover:underline font-medium">
                                    {getCategoryLabel(product.category)}
                                </Link>
                            </div>
                        </div>

                        {/* Social Sharing */}
                        <div className="border-t border-gray-100 mt-6 pt-6">
                            <div className="flex items-center gap-3 flex-wrap">
                                <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Сподели</span>
                                {shareLinks.map(link => (
                                    <a
                                        key={link.name}
                                        href={link.href(getShareUrl(), product.name)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title={link.name}
                                        className={`w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 transition-all duration-200 ${link.color}`}
                                    >
                                        {link.icon}
                                    </a>
                                ))}
                                <button
                                    onClick={handleCopyLink}
                                    title="Копирај линк"
                                    className={`w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center transition-all duration-200 ${copied ? 'bg-green-600 text-white border-green-600' : 'text-gray-500 hover:bg-gray-700 hover:text-white'
                                        }`}
                                >
                                    {copied ? <Check size={16} /> : <Copy size={16} />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Mobile Add to Cart Bar */}
            {product.stockQuantity > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex items-center gap-3 lg:hidden z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
                    <div className="flex-1">
                        <p className="text-xs text-gray-500 truncate">{product.name}</p>
                        <p className="text-lg font-bold text-jumbo-blue">{formatPrice(product.sellingPrice)} ден</p>
                    </div>
                    <button
                        onClick={handleAddToCart}
                        className={`flex items-center gap-2 py-3 px-6 rounded-xl font-semibold text-sm transition-all ${addedToCart
                            ? 'bg-green-600 text-white'
                            : 'bg-jumbo-red text-white hover:bg-red-700'
                            }`}
                    >
                        {addedToCart ? (
                            <>
                                <Check size={16} />
                                Додадено
                            </>
                        ) : (
                            <>
                                <ShoppingCart size={16} />
                                Додај
                            </>
                        )}
                    </button>
                </div>
            )}

            <div className="lg:block hidden">
                <Footer />
            </div>
            <div className="lg:hidden pb-20">
                <Footer />
            </div>

            <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />

            {/* Product Structured Data for SEO/AEO */}
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
                            "url": typeof window !== 'undefined' ? window.location.href : "",
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
        </div>
    );
}
