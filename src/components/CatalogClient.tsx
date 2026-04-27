"use client";

import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, ChevronLeft, Package, ChevronDown } from 'lucide-react';
import { Product, CATEGORIES, getCategoryLabel } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/Footer';
import { matchesSearch } from '@/lib/search';

interface CatalogClientProps {
    initialProducts: Product[];
    initialCategory: string;
    initialQuery?: string;
    initialMin?: number;
    initialMax?: number;
}

export default function CatalogClient({ initialProducts, initialCategory, initialQuery = '' }: CatalogClientProps) {
    const [products] = useState<Product[]>(initialProducts);
    const [searchTerm, setSearchTerm] = useState(initialQuery);
    const [selectedCategory, setSelectedCategory] = useState(initialCategory);
    const [sortBy, setSortBy] = useState('newest');

    const filtered = useMemo(() => products
        .filter(p => matchesSearch(p.name, searchTerm))
        .filter(p => !selectedCategory || p.category === selectedCategory)
        .sort((a, b) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }), [products, searchTerm, selectedCategory, sortBy]);

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
                                ИНТЕР СТАР <span className="text-red-300">ЏАМБО</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Каталог на играчки - Интер Стар Џамбо</h1>
                    <p className="text-gray-500">
                        Каталогот е во подготовка. Цените и онлајн нарачките се во подготовка додека ги усогласуваме сите правни информации.
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
                            <div className="relative min-w-[12.5rem]">
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

                            {/* Sort Dropdown */}
                            <div className="relative min-w-[11.25rem]">
                                <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full pl-9 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-jumbo-blue text-sm font-medium appearance-none cursor-pointer hover:bg-white transition-all"
                                >
                                    <option value="newest">Најнови</option>
                                    <option value="name">Име А-Ш</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    <p className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500">
                        Цените и онлајн нарачките се во подготовка.
                    </p>
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
                                    <p className="text-xs text-gray-500 mb-0.5 truncate">{getCategoryLabel(product.category)}</p>
                                    <Link href={`/produkt/${product.slug}`}>
                                        <h3 className="font-semibold text-gray-900 text-xs sm:text-sm leading-tight line-clamp-2 mb-2 min-h-[2rem] hover:text-jumbo-blue transition-colors cursor-pointer">{product.name}</h3>
                                    </Link>
                                    <p className="mb-2 text-sm font-semibold text-jumbo-blue">Цена во подготовка</p>
                                    <p className="text-xs text-gray-500 leading-relaxed">
                                        Цените и онлајн нарачките се во подготовка.
                                    </p>
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
        </div>
    );
}
