"use client";

import { useState } from 'react';
import { Product, getCategoryLabel } from '@/lib/types';
import { recordSale, deleteProduct } from '@/lib/store';
import { Trash2, MinusCircle, Search, Filter } from 'lucide-react';

interface InventoryListProps {
    products: Product[];
    onRefresh: () => void;
}

export default function InventoryList({ products, onRefresh }: InventoryListProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [sellModal, setSellModal] = useState<Product | null>(null);
    const [sellQty, setSellQty] = useState(1);

    const filtered = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !selectedCategory || p.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleSell = async () => {
        if (!sellModal) return;
        if (sellQty > sellModal.stockQuantity) {
            alert('Нема доволно залиха!');
            return;
        }
        await recordSale(sellModal, sellQty);
        setSellModal(null);
        setSellQty(1);
        onRefresh();
    };

    const handleDelete = async (product: Product) => {
        if (confirm(`Дали сте сигурни дека сакате да го избришете "${product.name}"?`)) {
            await deleteProduct(product.id);
            onRefresh();
        }
    };

    if (products.length === 0) {
        return null; // The parent will show the empty state
    }

    return (
        <div>
            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Пребарај артикли..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-jumbo-blue outline-none text-sm"
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="pl-10 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-jumbo-blue outline-none text-sm appearance-none"
                    >
                        <option value="">Сите категории</option>
                        <option value="Vehicles & Ride-ons">Возила</option>
                        <option value="Dolls & Figures">Кукли</option>
                        <option value="Baby & Toddler">Бебиња</option>
                        <option value="Outdoor & Sports">Спорт</option>
                        <option value="Games & Puzzles">Игри</option>
                        <option value="Clothing & School">Облека</option>
                        <option value="Разно (Miscellaneous)">Разно</option>
                    </select>
                </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map(product => (
                    <div
                        key={product.id}
                        className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
                    >
                        {/* Image */}
                        <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                            {product.imageUrl ? (
                                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain p-2" />
                            ) : (
                                <div className="text-gray-300 text-4xl font-bold">
                                    {product.name.charAt(0)}
                                </div>
                            )}
                        </div>

                        {/* Details */}
                        <div className="p-4">
                            <div className="flex items-start justify-between mb-1">
                                <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">{product.name}</h3>
                            </div>
                            <p className="text-xs text-gray-400 mb-3">{getCategoryLabel(product.category)}</p>

                            <div className="flex items-end justify-between">
                                <div>
                                    <div className="text-lg font-bold text-jumbo-blue">{product.sellingPrice.toLocaleString()} ден</div>
                                    <div className={`text-xs font-medium mt-0.5 ${product.stockQuantity <= 2 ? 'text-red-500' : 'text-green-600'}`}>
                                        {product.stockQuantity > 0 ? `${product.stockQuantity} на залиха` : 'Нема залиха'}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                                <button
                                    onClick={() => { setSellModal(product); setSellQty(1); }}
                                    disabled={product.stockQuantity === 0}
                                    className="flex-1 flex items-center justify-center gap-1.5 bg-jumbo-red/10 text-jumbo-red hover:bg-jumbo-red hover:text-white py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <MinusCircle size={14} />
                                    Продај
                                </button>
                                <button
                                    onClick={() => handleDelete(product)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filtered.length === 0 && products.length > 0 && (
                <div className="text-center py-12 text-gray-400">
                    <p className="font-medium">Нема резултати за &quot;{searchTerm}&quot;</p>
                </div>
            )}

            {/* Sell Modal */}
            {sellModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Продај артикл</h3>
                        <p className="text-sm text-gray-500 mb-4">{sellModal.name}</p>

                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-500">Цена:</span>
                                <span className="font-semibold">{sellModal.sellingPrice.toLocaleString()} ден</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">На залиха:</span>
                                <span className="font-semibold">{sellModal.stockQuantity}</span>
                            </div>
                        </div>

                        <label className="block text-sm font-medium text-gray-700 mb-1">Количина</label>
                        <input
                            type="number"
                            min={1}
                            max={sellModal.stockQuantity}
                            value={sellQty}
                            onChange={(e) => setSellQty(parseInt(e.target.value) || 1)}
                            className="w-full p-2.5 border border-gray-200 rounded-lg mb-2 outline-none focus:ring-2 focus:ring-jumbo-red"
                        />
                        <div className="text-right text-sm text-gray-500 mb-4">
                            Вкупно: <span className="font-bold text-gray-900">{(sellModal.sellingPrice * sellQty).toLocaleString()} ден</span>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setSellModal(null)}
                                className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
                            >
                                Откажи
                            </button>
                            <button
                                onClick={handleSell}
                                className="flex-1 py-2.5 bg-jumbo-red text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors"
                            >
                                Потврди продажба
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
