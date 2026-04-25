"use client";

import { useState, useEffect, useRef } from 'react';
import { ShoppingCart, X, Trash2, Plus, Minus } from 'lucide-react';
import { getCart, updateCartQuantity, removeFromCart, syncCartWithServer, CartItem, SHOP_DISABLED } from '@/lib/cart';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/types';

interface CartSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
    const [items, setItems] = useState<CartItem[]>(() => getCart());
    const prevOpen = useRef(isOpen);

    const refresh = () => {
        setItems(getCart());
    };

    useEffect(() => {
        window.addEventListener('cart-updated', refresh);
        return () => window.removeEventListener('cart-updated', refresh);
    }, []);

    useEffect(() => {
        if (isOpen && !prevOpen.current) {
            syncCartWithServer().then(refresh);
        }
        prevOpen.current = isOpen;
    }, [isOpen]);

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 transition-opacity" onClick={onClose} />
            )}

            {/* Sidebar */}
            <div className={`fixed bg-white shadow-2xl z-50 transform transition-transform duration-300
                bottom-0 left-0 right-0 h-[55%] rounded-t-2xl ${isOpen ? 'translate-y-0' : 'translate-y-full'}
                md:top-0 md:right-0 md:left-auto md:bottom-auto md:h-full md:w-full md:max-w-md md:rounded-none ${isOpen ? 'md:translate-x-0 md:translate-y-0' : 'md:translate-x-full md:translate-y-0'}`}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            <ShoppingCart size={20} className="text-jumbo-blue" />
                            <h2 className="text-lg font-bold text-gray-900">Кошничка</h2>
                            {items.length > 0 && (
                                <span className="bg-jumbo-red text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                    {items.reduce((s, i) => s + i.quantity, 0)}
                                </span>
                            )}
                        </div>
                        <button onClick={onClose} aria-label="Затвори кошничка" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <X size={20} className="text-gray-500" />
                        </button>
                    </div>

                    {/* Items */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center px-4">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <ShoppingCart size={28} className="text-gray-400" />
                                </div>
                                <p className="text-gray-900 font-semibold text-base mb-1">Кошничката е празна</p>
                                <p className="text-gray-500 text-sm mb-6">Додадете производи за да продолжите.</p>
                                <Link href="/catalog" onClick={onClose} className="inline-flex items-center gap-2 bg-jumbo-blue text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
                                    Кон каталогот
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {items.map(item => (
                                    <div key={item.productId} className="flex gap-3 bg-gray-50 rounded-xl p-3">
                                        {/* Image */}
                                        <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                                            {item.imageUrl ? (
                                                <Image src={item.imageUrl} alt={item.name} width={64} height={64} className="w-full h-full object-contain p-1" />
                                            ) : (
                                                <ShoppingCart size={20} className="text-gray-300" />
                                            )}
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight">{item.name}</h4>
                                            <p className="text-sm font-bold text-jumbo-blue mt-1">{formatPrice(item.price)} ден</p>

                                            {/* Quantity Controls */}
                                            <div className="flex items-center gap-2 mt-2">
                                                <button
                                                    onClick={() => {
                                                        if (item.quantity > 1) {
                                                            updateCartQuantity(item.productId, item.quantity - 1);
                                                            refresh();
                                                        }
                                                    }}
                                                    disabled={item.quantity <= 1}
                                                    aria-label="Намали количина"
                                                    className={`w-10 h-10 border rounded-md flex items-center justify-center transition-colors ${item.quantity <= 1 ? 'bg-gray-50 text-gray-200 border-gray-100 cursor-not-allowed' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200 cursor-pointer'}`}
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => { updateCartQuantity(item.productId, item.quantity + 1); refresh(); }}
                                                    disabled={item.quantity >= item.stock}
                                                    aria-label="Зголеми количина"
                                                    title={item.quantity >= item.stock ? `Достапни се само ${item.stock} ком.` : ''}
                                                    className={`w-10 h-10 border rounded-md flex items-center justify-center transition-colors ${item.quantity >= item.stock ? 'bg-gray-50 text-gray-200 border-gray-100 cursor-not-allowed' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200 cursor-pointer'}`}
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Remove */}
                                        <button
                                            onClick={() => { removeFromCart(item.productId); refresh(); }}
                                            aria-label="Отстрани од кошничка"
                                            className="p-2.5 text-gray-400 hover:text-red-500 transition-colors self-start cursor-pointer"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {items.length > 0 && (
                        <div className="border-t border-gray-100 p-4 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-medium">Меѓузбир:</span>
                                <span className="text-xl font-bold text-gray-900">{formatPrice(total)} ден</span>
                            </div>
                            <Link
                                href="/kosnicka"
                                onClick={onClose}
                                className="block w-full bg-white border-2 border-gray-200 hover:border-jumbo-blue text-gray-700 hover:text-jumbo-blue text-center py-3 rounded-xl font-bold text-sm transition-colors"
                            >
                                ПОГЛЕДНИ КОШНИЧКА
                            </Link>
                            {SHOP_DISABLED ? (
                                <div className="block w-full bg-gray-200 text-gray-500 text-center py-3 rounded-xl font-bold text-sm cursor-not-allowed">
                                    ПРИВРЕМЕНО НЕДОСТАПНО
                                </div>
                            ) : (
                                <Link
                                    href="/checkout"
                                    onClick={onClose}
                                    className="block w-full bg-jumbo-blue hover:bg-blue-800 text-white text-center py-3 rounded-xl font-bold text-sm transition-colors"
                                >
                                    КОН НАРАЧКА
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
