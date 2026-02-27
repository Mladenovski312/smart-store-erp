"use client";

import { useState } from 'react';
import { Product, getCategoryLabel } from '@/lib/types';
import { recordSale } from '@/lib/store';
import { ShoppingCart, CheckCircle2, Search, Package } from 'lucide-react';

interface EmployeePOSProps {
    products: Product[];
    onSaleComplete: () => void;
}

export default function EmployeePOS({ products, onSaleComplete }: EmployeePOSProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [sellTarget, setSellTarget] = useState<Product | null>(null);
    const [sellQty, setSellQty] = useState(1);
    const [justSold, setJustSold] = useState<string | null>(null);

    const inStock = products.filter(p => p.stockQuantity > 0);
    const filtered = inStock.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSell = async () => {
        if (!sellTarget) return;
        if (sellQty > sellTarget.stockQuantity) {
            alert('Нема доволно залиха!');
            return;
        }
        await recordSale(sellTarget, sellQty);
        setJustSold(sellTarget.name);
        setSellTarget(null);
        setSellQty(1);
        onSaleComplete();

        // Clear success message after 2s
        setTimeout(() => setJustSold(null), 2000);
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Success Toast */}
            {justSold && (
                <div className="mb-6 bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl flex items-center gap-3 animate-in fade-in">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    <span className="font-medium">„{justSold}" е продаден!</span>
                </div>
            )}

            {/* Search */}
            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Пребарај артикл..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-jumbo-blue outline-none text-base shadow-sm"
                    autoFocus
                />
            </div>

            {/* Product Grid — Large, touch-friendly tiles */}
            {filtered.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {filtered.map(product => (
                        <button
                            key={product.id}
                            onClick={() => { setSellTarget(product); setSellQty(1); }}
                            className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-left hover:shadow-md hover:border-jumbo-blue/30 active:scale-[0.97] transition-all group"
                        >
                            {/* Image */}
                            <div className="aspect-square bg-gray-50 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                                {product.imageUrl ? (
                                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain p-1" />
                                ) : (
                                    <Package className="w-10 h-10 text-gray-300" />
                                )}
                            </div>

                            {/* Name */}
                            <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 mb-1">
                                {product.name}
                            </h3>
                            <p className="text-xs text-gray-400 mb-2">{getCategoryLabel(product.category)}</p>

                            {/* Price & Stock — employee sees selling price only */}
                            <div className="flex items-end justify-between">
                                <span className="text-lg font-bold text-jumbo-blue">
                                    {product.sellingPrice.toLocaleString()} <span className="text-xs font-normal">ден</span>
                                </span>
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${product.stockQuantity <= 2 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                    {product.stockQuantity}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
                    <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">
                        {searchTerm ? `Нема резултати за „${searchTerm}"` : 'Нема артикли на залиха'}
                    </p>
                </div>
            )}

            {/* Sell Confirmation Modal */}
            {sellTarget && (
                <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                                {sellTarget.imageUrl ? (
                                    <img src={sellTarget.imageUrl} alt="" className="w-full h-full object-contain" />
                                ) : (
                                    <Package className="w-8 h-8 text-gray-300" />
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">{sellTarget.name}</h3>
                                <p className="text-jumbo-blue font-semibold">{sellTarget.sellingPrice.toLocaleString()} ден</p>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-3 mb-4 flex items-center justify-between">
                            <span className="text-sm text-gray-500">На залиха:</span>
                            <span className="font-semibold text-gray-900">{sellTarget.stockQuantity}</span>
                        </div>

                        <label className="block text-sm font-medium text-gray-700 mb-1">Количина</label>
                        <div className="flex items-center gap-3 mb-2">
                            <button
                                onClick={() => setSellQty(Math.max(1, sellQty - 1))}
                                className="w-12 h-12 bg-gray-100 rounded-xl text-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors"
                            >−</button>
                            <input
                                type="number"
                                min={1}
                                max={sellTarget.stockQuantity}
                                value={sellQty}
                                onChange={(e) => setSellQty(parseInt(e.target.value) || 1)}
                                className="flex-1 text-center text-2xl font-bold p-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-jumbo-blue"
                            />
                            <button
                                onClick={() => setSellQty(Math.min(sellTarget.stockQuantity, sellQty + 1))}
                                className="w-12 h-12 bg-gray-100 rounded-xl text-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors"
                            >+</button>
                        </div>

                        <div className="text-center text-sm text-gray-500 mb-4">
                            Вкупно: <span className="font-bold text-lg text-gray-900">{(sellTarget.sellingPrice * sellQty).toLocaleString()} ден</span>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setSellTarget(null)}
                                className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                Откажи
                            </button>
                            <button
                                onClick={handleSell}
                                className="flex-1 py-3 bg-jumbo-red text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <ShoppingCart size={16} />
                                Продај
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
