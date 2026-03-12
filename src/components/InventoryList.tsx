"use client";

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Product, getCategoryLabel, CATEGORIES, formatPrice } from '@/lib/types';
import { recordSale, deleteProduct, updateProduct, uploadProductImage } from '@/lib/store';
import { Trash2, MinusCircle, Search, Filter, Pencil, Upload, X } from 'lucide-react';

interface InventoryListProps {
    products: Product[];
    onRefresh: () => void;
}

export default function InventoryList({ products, onRefresh }: InventoryListProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [sellModal, setSellModal] = useState<Product | null>(null);
    const [sellQty, setSellQty] = useState(1);
    const [editModal, setEditModal] = useState<Product | null>(null);
    const [editForm, setEditForm] = useState({ name: '', description: '', category: '', purchasePrice: '', sellingPrice: '', stockQuantity: '', imageUrl: '' });
    const [editImageFile, setEditImageFile] = useState<File | null>(null);
    const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const editFileRef = useRef<HTMLInputElement>(null);

    const openEditModal = (product: Product) => {
        setEditModal(product);
        setEditForm({
            name: product.name,
            description: product.description || '',
            category: product.category,
            purchasePrice: String(product.purchasePrice),
            sellingPrice: String(product.sellingPrice),
            stockQuantity: String(product.stockQuantity),
            imageUrl: product.imageUrl || '',
        });
        setEditImageFile(null);
        setEditImagePreview(product.imageUrl || null);
    };

    const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setEditImageFile(file);
        setEditImagePreview(URL.createObjectURL(file));
    };

    const handleEditSave = async () => {
        if (!editModal) return;
        setIsSaving(true);

        let imageUrl = editForm.imageUrl || undefined;

        // Upload new image if one was selected
        if (editImageFile) {
            const url = await uploadProductImage(editImageFile);
            if (url) imageUrl = url;
        }

        await updateProduct(editModal.id, {
            name: editForm.name.trim(),
            description: editForm.description.trim() || undefined,
            category: editForm.category,
            imageUrl,
            purchasePrice: parseFloat(editForm.purchasePrice) || 0,
            sellingPrice: parseFloat(editForm.sellingPrice) || 0,
            stockQuantity: parseInt(editForm.stockQuantity) || 0,
        });

        setIsSaving(false);
        setEditModal(null);
        onRefresh();
    };

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
                        <div className="relative aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                            {product.imageUrl ? (
                                <Image src={product.imageUrl} alt={product.name} fill className="object-contain p-2" sizes="(max-width: 768px) 50vw, 200px" />
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
                                    <div className="text-lg font-bold text-jumbo-blue">{formatPrice(product.sellingPrice)} ден</div>
                                    <div className={`text-xs font-medium mt-0.5 ${product.stockQuantity <= 2 ? 'text-red-500' : 'text-green-600'}`}>
                                        {product.stockQuantity > 0 ? `${product.stockQuantity} на залиха` : 'Нема залиха'}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                                <button
                                    onClick={() => openEditModal(product)}
                                    className="flex-1 flex items-center justify-center gap-1.5 bg-jumbo-blue/10 text-jumbo-blue hover:bg-jumbo-blue hover:text-white py-2 rounded-lg text-xs font-semibold transition-colors"
                                >
                                    <Pencil size={14} />
                                    Измени
                                </button>
                                <button
                                    onClick={() => handleDelete(product)}
                                    className="flex items-center justify-center gap-1.5 px-3 py-2 border border-red-200 text-red-500 hover:bg-red-50 rounded-lg text-xs font-semibold transition-colors"
                                >
                                    <Trash2 size={14} />
                                </button>
                                <button
                                    onClick={() => { setSellModal(product); setSellQty(1); }}
                                    disabled={product.stockQuantity === 0}
                                    className="flex items-center justify-center gap-1 px-3 py-2 text-gray-400 hover:text-jumbo-red hover:bg-red-50 rounded-lg text-xs transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                    title="Продај"
                                >
                                    <MinusCircle size={14} />
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
                                <span className="font-semibold">{formatPrice(sellModal.sellingPrice)} ден</span>
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
                            Вкупно: <span className="font-bold text-gray-900">{formatPrice(sellModal.sellingPrice * sellQty)} ден</span>
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

            {/* Edit Modal */}
            {editModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 animate-in fade-in zoom-in-95 flex flex-col">
                        <div className="flex items-center justify-between mb-5 shrink-0">
                            <h3 className="text-lg font-bold text-gray-900">Измени артикл</h3>
                            <button onClick={() => setEditModal(null)} className="p-1 text-gray-400 hover:text-gray-600 rounded"><X size={20} /></button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-2">
                            {/* Image - Left Column */}
                            <div className="md:col-span-2 flex flex-col">
                                <div className="relative w-full aspect-square bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden mb-3">
                                    {editImagePreview ? (
                                        <Image src={editImagePreview} alt="" fill className="object-contain p-2" sizes="300px" unoptimized />
                                    ) : (
                                        <span className="text-gray-300 text-sm">Нема слика</span>
                                    )}
                                </div>
                                <button type="button" onClick={() => editFileRef.current?.click()} className="w-full flex justify-center items-center gap-2 text-sm text-jumbo-blue hover:underline font-medium py-2.5 bg-blue-50 hover:bg-blue-100 transition-colors rounded-xl">
                                    <Upload size={16} /> Промени слика
                                </button>
                                <input ref={editFileRef} type="file" accept="image/*" onChange={handleEditImageChange} className="hidden" />
                            </div>

                            {/* Form - Right Column */}
                            <div className="md:col-span-3 space-y-3 flex flex-col">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Име</label>
                                    <input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-jumbo-blue" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Категорија</label>
                                    <select value={editForm.category} onChange={e => setEditForm({ ...editForm, category: e.target.value })} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-jumbo-blue">
                                        {CATEGORIES.map(c => (
                                            <option key={c.value} value={c.value}>{c.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex-1 flex flex-col min-h-[100px]">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Опис</label>
                                    <textarea value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} className="w-full flex-1 min-h-[100px] p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-jumbo-blue resize-y" />
                                </div>
                                <div className="grid grid-cols-3 gap-3 pt-2">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Набавна (ден)</label>
                                        <input type="number" min="0" value={editForm.purchasePrice} onChange={e => setEditForm({ ...editForm, purchasePrice: e.target.value })} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-jumbo-blue" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Продажна (ден)</label>
                                        <input type="number" min="0" value={editForm.sellingPrice} onChange={e => setEditForm({ ...editForm, sellingPrice: e.target.value })} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-jumbo-blue" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Залиха</label>
                                        <input type="number" min="0" value={editForm.stockQuantity} onChange={e => setEditForm({ ...editForm, stockQuantity: Math.max(0, parseInt(e.target.value) || 0).toString() })} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-jumbo-blue" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-4 pt-5 border-t border-gray-100 shrink-0">
                            <button onClick={() => setEditModal(null)} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Откажи</button>
                            <button onClick={handleEditSave} disabled={isSaving || !editForm.name.trim()} className="flex-1 py-3 bg-jumbo-blue text-white rounded-xl text-sm font-bold hover:bg-blue-800 transition-colors disabled:opacity-50">
                                {isSaving ? 'Се зачувува...' : 'Зачувај промени'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
