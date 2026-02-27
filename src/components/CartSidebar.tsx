"use client";

import { useState, useEffect } from 'react';
import { ShoppingCart, X, Trash2, Plus, Minus } from 'lucide-react';
import { getCart, updateCartQuantity, removeFromCart, getCartTotal, getCartCount, CartItem } from '@/lib/cart';
import Link from 'next/link';

interface CartSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
    const [items, setItems] = useState<CartItem[]>([]);

    const refresh = () => {
        setItems(getCart());
    };

    useEffect(() => {
        refresh();
        window.addEventListener('cart-updated', refresh);
        return () => window.removeEventListener('cart-updated', refresh);
    }, []);

    useEffect(() => {
        if (isOpen) refresh();
    }, [isOpen]);

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 transition-opacity" onClick={onClose} />
            )}

            {/* Sidebar */}
            <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
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
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <X size={20} className="text-gray-500" />
                        </button>
                    </div>

                    {/* Items */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <ShoppingCart size={48} className="text-gray-200 mb-4" />
                                <p className="text-gray-500 font-medium">Кошничката е празна</p>
                                <p className="text-gray-400 text-sm mt-1">Додадете артикли од каталогот</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {items.map(item => (
                                    <div key={item.productId} className="flex gap-3 bg-gray-50 rounded-xl p-3">
                                        {/* Image */}
                                        <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                                            {item.imageUrl ? (
                                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain p-1" />
                                            ) : (
                                                <ShoppingCart size={20} className="text-gray-300" />
                                            )}
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight">{item.name}</h4>
                                            <p className="text-sm font-bold text-jumbo-blue mt-1">{item.price.toLocaleString()} ден</p>

                                            {/* Quantity Controls */}
                                            <div className="flex items-center gap-2 mt-2">
                                                <button
                                                    onClick={() => {
                                                        if (item.quantity <= 1) {
                                                            removeFromCart(item.productId);
                                                        } else {
                                                            updateCartQuantity(item.productId, item.quantity - 1);
                                                        }
                                                        refresh();
                                                    }}
                                                    className="w-7 h-7 bg-white border border-gray-200 rounded-md flex items-center justify-center hover:bg-gray-100 transition-colors"
                                                >
                                                    <Minus size={12} />
                                                </button>
                                                <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => { updateCartQuantity(item.productId, item.quantity + 1); refresh(); }}
                                                    className="w-7 h-7 bg-white border border-gray-200 rounded-md flex items-center justify-center hover:bg-gray-100 transition-colors"
                                                >
                                                    <Plus size={12} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Remove */}
                                        <button
                                            onClick={() => { removeFromCart(item.productId); refresh(); }}
                                            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors self-start"
                                        >
                                            <Trash2 size={14} />
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
                                <span className="text-xl font-bold text-gray-900">{total.toLocaleString()} ден</span>
                            </div>
                            <Link
                                href="/kosnicka"
                                onClick={onClose}
                                className="block w-full bg-white border-2 border-gray-200 hover:border-jumbo-blue text-gray-700 hover:text-jumbo-blue text-center py-3 rounded-xl font-bold text-sm transition-colors"
                            >
                                ПОГЛЕДНИ КОШНИЧКА
                            </Link>
                            <Link
                                href="/checkout"
                                onClick={onClose}
                                className="block w-full bg-jumbo-blue hover:bg-blue-800 text-white text-center py-3 rounded-xl font-bold text-sm transition-colors"
                            >
                                ПРОВЕРКА
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
