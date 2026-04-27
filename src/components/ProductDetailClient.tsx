"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    ChevronLeft, ChevronRight, ShoppingCart, Package,
    Truck, ArrowUpRight, Check
} from 'lucide-react';
import { getCartCount } from '@/lib/cart';
import { Product, getCategoryLabel } from '@/lib/types';
import CartSidebar from '@/components/CartSidebar';
import Footer from '@/components/Footer';

export default function ProductDetailClient({ product, relatedProducts = [] }: { product: Product; relatedProducts?: Product[] }) {
    const [cartOpen, setCartOpen] = useState(false);
    const [cartCount, setCartCount] = useState(() => getCartCount());
    const [copied, setCopied] = useState(false);
    const [shareUrl] = useState(() =>
        typeof window !== 'undefined' ? window.location.href : `https://interstarjumbo.com/produkt/${product.slug}`
    );

    const refreshCartCount = () => setCartCount(getCartCount());

    useEffect(() => {
        const openCart = () => setCartOpen(true);
        window.addEventListener('cart-updated', refreshCartCount);
        window.addEventListener('cart-item-added', openCart);
        return () => {
            window.removeEventListener('cart-updated', refreshCartCount);
            window.removeEventListener('cart-item-added', openCart);
        };
    }, []);

    const getShareUrl = () => shareUrl;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(getShareUrl());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareLinks = [
        {
            name: 'Messenger',
            icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.145 2 11.26c0 2.923 1.558 5.513 3.963 7.152v3.91l3.6-1.996c.783.218 1.606.336 2.437.336 5.523 0 10-4.145 10-9.26S17.523 2 12 2zm1.096 12.333l-2.82-3.006-5.496 3.006 6.02-6.402 2.903 3.006 5.37-3.006-6.02 6.402z" /></svg>
            ),
            href: (url: string) => `fb-messenger://share/?link=${encodeURIComponent(url)}`,
            color: 'hover:bg-[#00B2FF] hover:text-white',
        },
        {
            name: 'Viber',
            icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M21.322 10.966c-.198-4.437-3.811-8.03-8.257-8.117-5.067-.101-9.24 3.99-9.24 8.948h.011c0 2.219.805 4.254 2.138 5.827L4.661 22.012l4.606-1.503c1.378.503 2.872.784 4.43.784 4.636 0 8.514-3.513 8.932-8.08.064-.694.064-1.405-.256-2.158zm-4.706 4.605c-.321.493-.82 1.053-1.636.812-2.302-.684-4.888-2.584-6.3-4.87-.272-.441-.24-1.127.172-1.594.347-.393.633-.679.914-.627.28.051.782 1.348 1.052 1.838.27.491.042.85-.24 1.254-.158.226-.341.496-.183.774.526.924 1.354 1.688 2.247 2.115.342.164.67-.091.902-.338.233-.248.887-1.042 1.187-1.053.301-.012 1.554.73 1.956.938.402.208.571.491.433 1.053z" /></svg>
            ),
            href: (url: string) => `viber://forward?text=${encodeURIComponent(url)}`,
            color: 'hover:bg-[#7360F2] hover:text-white',
        },
        {
            name: 'WhatsApp',
            icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.445 0 .081 5.363.079 11.971c0 2.112.551 4.175 1.597 6.011L0 24l6.143-1.611a11.772 11.772 0 005.904 1.583h.005c6.604 0 11.967-5.363 11.97-11.97a11.75 11.75 0 00-3.51-8.465z" /></svg>
            ),
            href: (url: string) => `https://wa.me/?text=${encodeURIComponent(url)}`,
            color: 'hover:bg-[#25D366] hover:text-white',
        },
        {
            name: 'Email',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            ),
            href: (url: string, title: string) => `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Погледни го овој производ: ${url}`)}`,
            color: 'hover:bg-gray-700 hover:text-white',
        },
    ];

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
                                ИНТЕР СТАР <span className="text-red-500">ЏАМБО</span>
                            </Link>
                        </div>
                        <button
                            onClick={() => setCartOpen(true)}
                            aria-label="Отвори кошничка"
                            className="relative p-2 text-gray-600 hover:text-jumbo-blue transition-colors"
                        >
                            <ShoppingCart size={22} />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-jumbo-red text-white text-[0.625rem] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-1.5 flex-wrap text-sm text-gray-500 mb-8">
                    <Link href="/" className="hover:text-jumbo-blue transition-colors shrink-0">Почетна</Link>
                    <ChevronRight size={14} className="text-gray-300 shrink-0" />
                    <Link href="/catalog" className="hover:text-jumbo-blue transition-colors shrink-0">Каталог</Link>
                    <ChevronRight size={14} className="text-gray-300 shrink-0" />
                    <Link href={`/catalog?category=${encodeURIComponent(product.category)}`} className="hover:text-jumbo-blue transition-colors shrink-0">
                        {getCategoryLabel(product.category)}
                    </Link>
                    <ChevronRight size={14} className="text-gray-300 shrink-0" />
                    <span className="text-gray-900 font-medium truncate min-w-0 max-w-[10rem] sm:max-w-xs md:max-w-none">{product.name}</span>
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

                        <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
                            <p className="text-lg font-bold text-jumbo-blue">Цена во подготовка</p>
                            <p className="mt-1 text-sm text-gray-600">
                                Цените и онлајн нарачките се во подготовка додека ги усогласуваме сите правни информации.
                            </p>
                        </div>

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

                        {product.stockQuantity <= 0 && (
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                                <span className="text-sm font-medium text-red-700">НЕМА НА ЗАЛИХА</span>
                            </div>
                        )}

                        {/* Delivery Info */}
                        <div className="flex items-center gap-3 bg-blue-50 p-4 rounded-xl mb-6">
                            <Truck size={20} className="text-jumbo-blue shrink-0" />
                            <p className="text-sm text-gray-700">
                                Условите за достава ќе бидат објавени пред активирање на онлајн нарачките.
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
                                        aria-label={`Сподели на ${link.name}`}
                                        title={link.name}
                                        className={`w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 transition-all duration-200 ${link.color}`}
                                    >
                                        {link.icon}
                                    </a>
                                ))}
                                <button
                                    onClick={handleCopyLink}
                                    aria-label="Копирај линк"
                                    title="Копирај линк"
                                    className={`w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center transition-all duration-200 ${copied ? 'bg-green-600 text-white border-green-600' : 'text-gray-500 hover:bg-gray-700 hover:text-white'
                                        }`}
                                >
                                    {copied ? <Check size={18} /> : <ArrowUpRight size={18} />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Слични производи</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {relatedProducts.map(rp => (
                            <Link
                                key={rp.id}
                                href={`/produkt/${rp.slug}`}
                                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                            >
                                <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden p-2 relative">
                                    {rp.imageUrl ? (
                                        <Image src={rp.imageUrl} alt={rp.name} fill sizes="(max-width: 1024px) 200px, 25vw" className="object-contain p-2 group-hover:scale-105 transition-transform duration-300" />
                                    ) : (
                                        <Package className="w-12 h-12 text-gray-200" />
                                    )}
                                </div>
                                <div className="p-3">
                                    <p className="text-[0.625rem] text-gray-400 mb-0.5 truncate">{getCategoryLabel(rp.category)}</p>
                                    <h3 className="font-semibold text-gray-900 text-xs sm:text-sm leading-tight line-clamp-2 mb-2 min-h-[2rem] group-hover:text-jumbo-blue transition-colors">{rp.name}</h3>
                                    <p className="text-sm font-bold text-jumbo-blue">Цена во подготовка</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            <div>
                <Footer />
            </div>

            <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
        </div>
    );
}
