"use client";

import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, ChevronLeft, Package, ShoppingCart, Plus, CheckCircle2, ChevronDown } from 'lucide-react';
import { addToCart, getCartCount } from '@/lib/cart';
import { Product, CATEGORIES, getCategoryLabel, formatPrice } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';
import CartSidebar from '@/components/CartSidebar';
import Footer from '@/components/Footer';

export default function CatalogClient({ initialProducts, initialCategory }: { initialProducts: Product[]; initialCategory: string }) {
    const [products] = useState<Product[]>(initialProducts);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(initialCategory);
    const [inStockOnly, setInStockOnly] = useState(false);
    const [sortBy, setSortBy] = useState('newest');
    const [cartOpen, setCartOpen] = useState(false);
    const [cartCount, setCartCount] = useState(0);

    const refreshCartCount = () => setCartCount(getCartCount());

    useEffect(() => {
        refreshCartCount();
        const openCart = () => setCartOpen(true);
        window.addEventListener('cart-updated', refreshCartCount);
        window.addEventListener('cart-item-added', openCart);
        return () => {
            window.removeEventListener('cart-updated', refreshCartCount);
            window.removeEventListener('cart-item-added', openCart);
        };
    }, []);

    const filtered = products
        .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .filter(p => !selectedCategory || p.category === selectedCategory)
        .filter(p => !inStockOnly || p.stockQuantity > 0)
        .sort((a, b) => {
            if (sortBy === 'price-asc') return a.sellingPrice - b.sellingPrice;
            if (sortBy === 'price-desc') return b.sellingPrice - a.sellingPrice;
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

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
            </nav>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Каталог на играчки - Интер Стар Џамбо</h1>
                    <p className="text-gray-500">
                        Најголем асортиман на квалитетни играчки достапни во нашата продавница во Куманово и онлајн со достава низ цела Македонија.
                        {filtered.length} {filtered.length === 1 ? 'артикл' : 'артикли'} на залиха
                    </p>
                </div>

                {/* Filters Bar */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-8">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search Input */}
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Пребарај играчки..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-jumbo-blue text-sm transition-all focus:bg-white"
                            />
                        </div>

                        {/* Dropdown Filters Container */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            {/* Category Dropdown */}
                            <div className="relative min-w-[200px]">
                                <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full pl-9 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-jumbo-blue text-sm font-medium appearance-none cursor-pointer hover:bg-white transition-all"
                                >
                                    <option value="">Сите категории</option>
                                    {CATEGORIES.map(c => (
                                        <option key={c.value} value={c.value}>{c.label}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                            </div>

                            {/* Stock Status Dropdown */}
                            <div className="relative min-w-[150px]">
                                <CheckCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                                <select
                                    value={inStockOnly ? 'true' : 'false'}
                                    onChange={(e) => setInStockOnly(e.target.value === 'true')}
                                    className="w-full pl-9 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-jumbo-blue text-sm font-medium appearance-none cursor-pointer hover:bg-white transition-all"
                                >
                                    <option value="false">Сите артикли</option>
                                    <option value="true">На залиха</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                            </div>

                            {/* Sort Dropdown */}
                            <div className="relative min-w-[180px]">
                                <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full pl-9 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-jumbo-blue text-sm font-medium appearance-none cursor-pointer hover:bg-white transition-all"
                                >
                                    <option value="newest">Најнови</option>
                                    <option value="price-asc">Цена: Ниска до Висока</option>
                                    <option value="price-desc">Цена: Висока до Ниска</option>
                                    <option value="name">Име А-Ш</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Grid */}
                {filtered.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {filtered.map(product => (
                            <div
                                key={product.id}
                                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                            >
                                <Link href={`/produkt/${product.slug}`}>
                                    <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden p-2 cursor-pointer relative">
                                        {product.imageUrl ? (
                                            <Image src={product.imageUrl} alt={product.name} fill sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1280px) 25vw, 20vw" className={`object-contain transition-transform duration-300 p-2 ${product.stockQuantity > 0 ? 'group-hover:scale-105' : 'opacity-90'}`} />
                                        ) : (
                                            <Package className={`w-12 h-12 text-gray-200 ${product.stockQuantity <= 0 ? 'opacity-80' : ''}`} />
                                        )}
                                        {product.stockQuantity <= 0 && (
                                            <div className="absolute inset-0 bg-white/20 flex flex-col items-center justify-center z-10 pointer-events-none">
                                                <span className="bg-gray-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg border border-gray-700 backdrop-blur-md">Нема залиха</span>
                                            </div>
                                        )}
                                    </div>
                                </Link>
                                <div className={`p-2.5 sm:p-3 ${product.stockQuantity <= 0 ? 'opacity-80' : ''}`}>
                                    <p className="text-[10px] text-gray-400 mb-0.5 truncate">{getCategoryLabel(product.category)}</p>
                                    <Link href={`/produkt/${product.slug}`}>
                                        <h3 className="font-semibold text-gray-900 text-xs sm:text-sm leading-tight line-clamp-2 mb-2 min-h-[2rem] hover:text-jumbo-blue transition-colors cursor-pointer">{product.name}</h3>
                                    </Link>
                                    <div className="flex items-center justify-between mb-2 gap-1 flex-wrap">
                                        <span className={`text-sm sm:text-base font-bold leading-none ${product.stockQuantity > 0 ? 'text-jumbo-blue' : 'text-gray-500'}`}>
                                            {formatPrice(product.sellingPrice)}<span className="text-[10px] font-normal text-gray-400 ml-0.5">ден</span>
                                        </span>
                                        {product.stockQuantity > 0 ? (
                                            <span className="text-[9px] font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                                                ✓ Залиха
                                            </span>
                                        ) : (
                                            <span className="text-[9px] font-medium text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                                                Нема залиха
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => addToCart({ productId: product.id, name: product.name, price: product.sellingPrice, imageUrl: product.imageUrl, stock: product.stockQuantity })}
                                        disabled={product.stockQuantity <= 0}
                                        className={`w-full flex items-center justify-center gap-1 py-2 rounded-lg text-[11px] sm:text-xs font-semibold transition-colors ${product.stockQuantity > 0
                                            ? 'bg-jumbo-red/10 text-jumbo-red hover:bg-jumbo-red hover:text-white'
                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            }`}
                                    >
                                        <Plus size={13} />
                                        {product.stockQuantity > 0 ? 'Додај во кошничка' : 'Нема залиха'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
                        <div className="relative w-24 h-24 mx-auto mb-6">
                            <div className="absolute inset-0 bg-jumbo-blue/5 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
                            <div className="relative w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center">
                                <Package className="w-12 h-12 text-gray-300" />
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {searchTerm ? 'Ништо не е пронајдено' : 'Нема артикли во оваа категорија'}
                        </h3>
                        <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
                            {searchTerm
                                ? `Не пронајдовме артикли за „${searchTerm}". Обидете се со друг термин.`
                                : 'Моментално нема артикли во оваа категорија. Проверете повторно наскоро!'}
                        </p>
                        {(searchTerm || selectedCategory) && (
                            <button
                                onClick={() => { setSearchTerm(''); setSelectedCategory(''); }}
                                className="inline-flex items-center gap-2 bg-jumbo-blue text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-blue-700 transition-colors"
                            >
                                Покажи ги сите играчки
                            </button>
                        )}
                    </div>
                )}
            </div>

            <Footer />

            <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
        </div>
    );
}
