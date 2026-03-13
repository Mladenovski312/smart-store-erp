'use client';

import { useState, useEffect } from 'react';
import { Search, ShoppingCart } from 'lucide-react';
import { getCartCount } from '@/lib/cart';
import { Product } from '@/lib/types';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SearchDropdown from '@/components/SearchDropdown';
import CartSidebar from '@/components/CartSidebar';

export default function NavBar({ products }: { products: Product[] }) {
    const [cartOpen, setCartOpen] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [navSearchOpen, setNavSearchOpen] = useState(false);
    const pathname = usePathname();

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
                            <a href="#about" className="text-sm font-medium text-gray-600 hover:text-jumbo-blue transition-colors">За нас</a>
                        </div>

                        <div className="flex items-center gap-2 flex-1 justify-end sm:flex-none sm:justify-start">
                            {/* Mobile-always-visible catalog link */}
                            {!navSearchOpen && (
                                <Link
                                    href="/catalog"
                                    className="md:hidden text-sm font-semibold text-jumbo-blue border border-jumbo-blue/30 px-3 py-1.5 rounded-lg hover:bg-jumbo-blue hover:text-white transition-colors whitespace-nowrap"
                                >
                                    Каталог
                                </Link>
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
                            <button
                                onClick={() => setCartOpen(true)}
                                aria-label="Отвори кошничка"
                                className="relative p-2 text-gray-600 hover:text-jumbo-blue transition-colors shrink-0"
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
                </div>
            </nav>

            <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
        </>
    );
}
