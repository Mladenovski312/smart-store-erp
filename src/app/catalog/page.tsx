"use client";

import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, ChevronLeft, Package, ShoppingCart, Plus } from 'lucide-react';
import { getProducts } from '@/lib/store';
import { addToCart, getCartCount } from '@/lib/cart';
import { Product, CATEGORIES, getCategoryLabel } from '@/lib/types';
import Link from 'next/link';
import CartSidebar from '@/components/CartSidebar';
import Footer from '@/components/Footer';

export default function CatalogPage() {
    const [mounted, setMounted] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [cartOpen, setCartOpen] = useState(false);
    const [cartCount, setCartCount] = useState(0);

    const refreshCartCount = () => setCartCount(getCartCount());

    useEffect(() => {
        setMounted(true);
        getProducts().then(all => setProducts(all.filter(p => p.stockQuantity > 0)));
        refreshCartCount();
        window.addEventListener('cart-updated', refreshCartCount);

        // Read category from URL if present
        const params = new URLSearchParams(window.location.search);
        const cat = params.get('category');
        if (cat) setSelectedCategory(cat);

        return () => window.removeEventListener('cart-updated', refreshCartCount);
    }, []);

    const filtered = products
        .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .filter(p => !selectedCategory || p.category === selectedCategory)
        .sort((a, b) => {
            if (sortBy === 'price-asc') return a.sellingPrice - b.sellingPrice;
            if (sortBy === 'price-desc') return b.sellingPrice - a.sellingPrice;
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

    if (!mounted) {
        return (
            <div className="flex h-screen items-center justify-center bg-white">
                <div className="w-10 h-10 border-4 border-jumbo-blue border-t-transparent rounded-full animate-spin" />
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
                            <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-jumbo-blue transition-colors">
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

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Каталог на играчки</h1>
                    <p className="text-gray-500">
                        {filtered.length} {filtered.length === 1 ? 'артикл' : 'артикли'} на залиха
                    </p>
                </div>

                {/* Filters Bar */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-8">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Пребарај играчки..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-jumbo-blue text-sm"
                            />
                        </div>

                        <div className="flex gap-3">
                            <div className="relative">
                                <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="pl-10 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-jumbo-blue text-sm appearance-none"
                                >
                                    <option value="">Сите категории</option>
                                    {CATEGORIES.map(c => (
                                        <option key={c.value} value={c.value}>{c.label}</option>
                                    ))}
                                </select>
                            </div>

                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-jumbo-blue text-sm appearance-none"
                            >
                                <option value="newest">Најнови</option>
                                <option value="price-asc">Цена ↑</option>
                                <option value="price-desc">Цена ↓</option>
                                <option value="name">Име А-Ш</option>
                            </select>
                        </div>
                    </div>

                    {/* Active category chip */}
                    {selectedCategory && (
                        <div className="mt-3 flex items-center gap-2">
                            <span className="text-xs text-gray-400">Филтер:</span>
                            <button
                                onClick={() => setSelectedCategory('')}
                                className="inline-flex items-center gap-1 bg-jumbo-blue-light text-jumbo-blue text-xs font-medium px-3 py-1.5 rounded-full hover:bg-blue-200 transition-colors"
                            >
                                {getCategoryLabel(selectedCategory)}
                                <span className="text-jumbo-blue/60 ml-1">✕</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Product Grid */}
                {filtered.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {filtered.map(product => (
                            <div
                                key={product.id}
                                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                            >
                                <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden p-3">
                                    {product.imageUrl ? (
                                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                                    ) : (
                                        <Package className="w-12 h-12 text-gray-200" />
                                    )}
                                </div>
                                <div className="p-4">
                                    <p className="text-xs text-gray-400 mb-1">{getCategoryLabel(product.category)}</p>
                                    <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 mb-2 min-h-[2.5rem]">{product.name}</h3>
                                    <div className="flex items-end justify-between mb-3">
                                        <span className="text-lg font-bold text-jumbo-blue">
                                            {product.sellingPrice.toLocaleString()} <span className="text-xs font-normal text-gray-400">ден</span>
                                        </span>
                                        <span className="text-[10px] font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                            ✓ Залиха
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => addToCart({ productId: product.id, name: product.name, price: product.sellingPrice, imageUrl: product.imageUrl })}
                                        className="w-full flex items-center justify-center gap-2 bg-jumbo-red/10 text-jumbo-red hover:bg-jumbo-red hover:text-white py-2 rounded-lg text-xs font-semibold transition-colors"
                                    >
                                        <Plus size={14} />
                                        Додај во кошничка
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
                        <Package className="w-14 h-14 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Нема резултати</h3>
                        <p className="text-gray-500 text-sm max-w-sm mx-auto">
                            {searchTerm
                                ? `Нема пронајдено артикли за „${searchTerm}".`
                                : 'Моментално нема артикли во оваа категорија.'}
                        </p>
                    </div>
                )}
            </div>

            <Footer />

            <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
        </div>
    );
}
