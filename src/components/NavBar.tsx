'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Product } from '@/lib/types';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SearchDropdown from '@/components/SearchDropdown';

export default function NavBar({ products }: { products: Product[] }) {
    const [navSearchOpen, setNavSearchOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const closeSearch = () => setNavSearchOpen(false);
        window.addEventListener('cart-item-added', closeSearch);
        return () => window.removeEventListener('cart-item-added', closeSearch);
    }, []);

    return (
        <>
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 gap-3">
                        {/* Logo — hidden when search is open on mobile to free space */}
                        <div className={`flex items-center gap-3 shrink-0 ${navSearchOpen ? 'hidden sm:flex' : 'flex'}`}>
                            <Link href="/" className="bg-jumbo-blue text-white px-2.5 py-1 rounded-lg font-black text-sm tracking-tight whitespace-nowrap">
                                ИНТЕР СТАР <span className="text-red-500">ЏАМБО</span>
                            </Link>
                        </div>

                        <div className="hidden md:flex items-center gap-8">
                            <Link href="/catalog" className={`text-sm font-medium transition-colors ${pathname === '/catalog' ? 'text-jumbo-blue font-semibold' : 'text-gray-600 hover:text-jumbo-blue'}`}>Каталог</Link>
                            <a href="#products" className="text-sm font-medium text-gray-600 hover:text-jumbo-blue transition-colors">Продукти</a>
                            <a href="#categories" className="text-sm font-medium text-gray-600 hover:text-jumbo-blue transition-colors">Категории</a>
                            <Link href="/za-nas" className={`text-sm font-medium transition-colors ${pathname === '/za-nas' ? 'text-jumbo-blue font-semibold' : 'text-gray-600 hover:text-jumbo-blue'}`}>За нас</Link>
                        </div>

                        <div className="flex items-center gap-2 flex-1 justify-end sm:flex-none sm:justify-start">
                            {/* Mobile-always-visible catalog link */}
                            {!navSearchOpen && (
                                <>
                                    <Link
                                        href="/catalog"
                                        className="md:hidden text-sm font-semibold text-jumbo-blue border border-jumbo-blue/30 px-3 py-1.5 rounded-lg hover:bg-jumbo-blue hover:text-white transition-colors whitespace-nowrap"
                                    >
                                        Каталог
                                    </Link>
                                    <Link
                                        href="/za-nas"
                                        className="md:hidden text-sm font-semibold text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:border-jumbo-blue/30 hover:text-jumbo-blue transition-colors whitespace-nowrap"
                                    >
                                        За нас
                                    </Link>
                                </>
                            )}

                            {navSearchOpen ? (
                                <div className="flex-1 min-w-0 sm:w-80">
                                    <SearchDropdown products={products} autoFocus onClose={() => setNavSearchOpen(false)} />
                                </div>
                            ) : (
                                <button
                                    onClick={() => setNavSearchOpen(true)}
                                    aria-label="Пребарај играчки"
                                    className="flex items-center gap-2 bg-jumbo-blue text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors shadow-sm shrink-0"
                                >
                                    <Search size={16} />
                                    <span className="hidden sm:inline">Пребарај</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
}
