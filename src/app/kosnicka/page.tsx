"use client";

import { useState, useEffect } from 'react';
import { Minus, Plus, Trash2, ShoppingBag, ChevronLeft, ShoppingCart } from 'lucide-react';
import { getCart, updateCartQuantity, removeFromCart, getCartTotal, getCartCount, CartItem } from '@/lib/cart';
import Link from 'next/link';
import Footer from '@/components/Footer';

export default function CartPage() {
    const [items, setItems] = useState<CartItem[]>([]);
    const [mounted, setMounted] = useState(false);

    const refresh = () => {
        setItems(getCart());
    };

    useEffect(() => {
        setMounted(true);
        refresh();
        window.addEventListener('cart-updated', refresh);
        return () => window.removeEventListener('cart-updated', refresh);
    }, []);

    if (!mounted) {
        return (
            <div className="flex h-screen items-center justify-center bg-white">
                <div className="w-10 h-10 border-4 border-jumbo-blue border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const subtotal = getCartTotal();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Nav */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <Link href="/catalog" className="flex items-center gap-2 text-gray-500 hover:text-jumbo-blue transition-colors">
                                <ChevronLeft size={20} />
                                <span className="text-sm font-medium hidden sm:inline">Продолжи со купување</span>
                            </Link>
                            <Link href="/" className="bg-jumbo-blue text-white px-2.5 py-1 rounded-lg font-black text-sm tracking-tight">
                                ИНТЕР СТАР <span className="text-jumbo-red">ЏАМБО</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Progress Stepper */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-3xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-center gap-3 text-sm font-semibold">
                        <span className="text-jumbo-blue">КОШНИЧКА</span>
                        <span className="text-gray-300">→</span>
                        <span className="text-gray-400">CHECKOUT</span>
                        <span className="text-gray-300">→</span>
                        <span className="text-gray-400">ГОТОВО</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Кошничка</h1>

                {items.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
                        <ShoppingCart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Кошничката е празна</h2>
                        <p className="text-gray-500 mb-6">Додадете играчки од нашиот каталог за да продолжите.</p>
                        <Link
                            href="/catalog"
                            className="inline-flex items-center gap-2 bg-jumbo-blue text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-800 transition-colors"
                        >
                            <ShoppingBag size={18} />
                            Разгледај каталог
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Items Table */}
                        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6">
                            {/* Header */}
                            <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto] gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <span>Продукт</span>
                                <span className="w-28 text-center">Количина</span>
                                <span className="w-24 text-right">Цена</span>
                                <span className="w-10" />
                            </div>

                            {/* Items */}
                            {items.map((item, idx) => (
                                <div
                                    key={item.productId}
                                    className={`grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-6 py-4 ${idx > 0 ? 'border-t border-gray-100' : ''
                                        }`}
                                >
                                    {/* Product */}
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                                            {item.imageUrl ? (
                                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain p-1" />
                                            ) : (
                                                <ShoppingBag className="w-6 h-6 text-gray-300" />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">{item.name}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">{item.price.toLocaleString()} ден / ком</p>
                                        </div>
                                    </div>

                                    {/* Quantity */}
                                    <div className="flex items-center gap-2 w-28 justify-center">
                                        <button
                                            onClick={() => {
                                                if (item.quantity <= 1) removeFromCart(item.productId);
                                                else updateCartQuantity(item.productId, item.quantity - 1);
                                            }}
                                            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span className="w-8 text-center font-semibold text-sm">{item.quantity}</span>
                                        <button
                                            onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                                            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>

                                    {/* Price */}
                                    <div className="w-24 text-right">
                                        <span className="font-bold text-gray-900 text-sm">{(item.price * item.quantity).toLocaleString()} ден</span>
                                    </div>

                                    {/* Remove */}
                                    <button
                                        onClick={() => removeFromCart(item.productId)}
                                        className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Summary */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-gray-600 font-medium">Меѓузбир</span>
                                <span className="text-xl font-bold text-gray-900">{subtotal.toLocaleString()} ден</span>
                            </div>
                            <p className="text-xs text-gray-400 mb-5">
                                *Цената за испорака ќе биде одредена од доставувачката компанија.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Link
                                    href="/catalog"
                                    className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors"
                                >
                                    <ChevronLeft size={16} />
                                    Продолжи со купување
                                </Link>
                                <Link
                                    href="/checkout"
                                    className="flex-1 flex items-center justify-center gap-2 bg-jumbo-red hover:bg-red-700 text-white py-3 rounded-xl font-bold text-sm transition-colors shadow-sm"
                                >
                                    ПРОВЕРКА
                                </Link>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <Footer />
        </div>
    );
}
