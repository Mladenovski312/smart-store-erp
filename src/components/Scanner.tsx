"use client";

import { useState, useRef } from 'react';
import { Camera, ImageUp, Wand2, CheckCircle, Upload, Eraser } from 'lucide-react';
import { CATEGORIES } from '@/lib/types';
import { saveProduct } from '@/lib/store';

interface ScannerProps {
    onProductSaved?: () => void;
}

export default function Scanner({ onProductSaved }: ScannerProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [originalUrl, setOriginalUrl] = useState<string | null>(null);
    const [showOriginal, setShowOriginal] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isRemovingBg, setIsRemovingBg] = useState(false);
    const [saved, setSaved] = useState(false);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form State
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [purchasePrice, setPurchasePrice] = useState('');
    const [sellingPrice, setSellingPrice] = useState('');
    const [stockQuantity, setStockQuantity] = useState('1');

    const handleImageSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
        setOriginalUrl(objectUrl);
        setShowOriginal(false);
        setSaved(false);

        // Run AI recognition and background removal in parallel
        processImageWithAI(file);
        removeBackground(file);
    };

    const processImageWithAI = async (file: File) => {
        setIsProcessing(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch('/api/vision', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('AI Processing Failed');

            const data = await response.json();
            setName(data.name || '');
            setCategory(data.category || '');
        } catch {
            console.warn('AI recognition unavailable – enter details manually.');
        } finally {
            setIsProcessing(false);
        }
    };

    const removeBackground = async (file: File) => {
        setIsRemovingBg(true);
        try {
            const { removeBackground: removeBg } = await import('@imgly/background-removal');
            const blob = await removeBg(file, {
                progress: (key: string, current: number, total: number) => {
                    console.log(`BG Removal [${key}]: ${Math.round((current / total) * 100)}%`);
                },
            });
            const cleanUrl = URL.createObjectURL(blob);
            setPreviewUrl(cleanUrl);
        } catch (err) {
            console.warn('Background removal failed, keeping original image:', err);
        } finally {
            setIsRemovingBg(false);
        }
    };

    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    const submitProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        const errors: string[] = [];

        if (!name.trim()) errors.push('Внесете име на артиклот.');
        if (!category) errors.push('Изберете категорија.');
        if (!purchasePrice || parseFloat(purchasePrice) < 0) errors.push('Внесете валидна набавна цена.');
        if (!sellingPrice || parseFloat(sellingPrice) <= 0) errors.push('Внесете валидна продажна цена.');
        if (!stockQuantity || parseInt(stockQuantity) <= 0) errors.push('Количината мора да биде најмалку 1.');
        if (parseFloat(sellingPrice) < parseFloat(purchasePrice)) {
            errors.push('⚠️ Продажната цена е помала од набавната — нема профит!');
        }

        if (errors.length > 0) {
            setValidationErrors(errors);
            return;
        }

        setValidationErrors([]);

        await saveProduct({
            name: name.trim(),
            category,
            imageUrl: previewUrl || undefined,
            purchasePrice: parseFloat(purchasePrice) || 0,
            sellingPrice: parseFloat(sellingPrice) || 0,
            stockQuantity: parseInt(stockQuantity) || 1,
        });

        setSaved(true);
        onProductSaved?.();

        // Reset form after short delay
        setTimeout(() => {
            setName('');
            setCategory('');
            setPurchasePrice('');
            setSellingPrice('');
            setStockQuantity('1');
            setPreviewUrl(null);
            setOriginalUrl(null);
            setShowOriginal(false);
            setSaved(false);
        }, 1500);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-2xl mx-auto">
            <div className="mb-6 flex justify-between items-center border-b pb-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Нов Артикл</h2>
                    <p className="text-gray-500 text-sm">Сликајте или изберете слика за препознавање.</p>
                </div>
            </div>

            {saved && (
                <div className="mb-6 bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="font-medium">Артиклот е успешно зачуван!</span>
                </div>
            )}

            {validationErrors.length > 0 && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
                    <p className="font-medium mb-1">Поправете ги следните грешки:</p>
                    <ul className="list-disc ml-5 text-sm space-y-0.5">
                        {validationErrors.map((err, i) => <li key={i}>{err}</li>)}
                    </ul>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Col: Image Upload & Preview */}
                <div className="space-y-4">
                    {/* Image Preview Area */}
                    <div className={`relative w-full aspect-square rounded-xl border-2 flex flex-col items-center justify-center overflow-hidden transition-all ${previewUrl ? 'border-jumbo-blue/30' : 'border-gray-200 bg-gray-50'}`}
                        style={previewUrl ? { backgroundImage: 'repeating-conic-gradient(#f0f0f0 0% 25%, white 0% 50%)', backgroundSize: '20px 20px' } : undefined}
                    >
                        {previewUrl ? (
                            <img src={showOriginal ? (originalUrl || previewUrl) : previewUrl} alt="Preview" className="w-full h-full object-contain" />
                        ) : (
                            <div className="text-center p-6 text-gray-400">
                                <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p className="font-medium text-gray-500">Нема слика</p>
                                <p className="text-xs mt-1">Користете ги копчињата подолу</p>
                            </div>
                        )}

                        {/* BG removal loading overlay */}
                        {isRemovingBg && (
                            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
                                <Eraser className="w-8 h-8 text-jumbo-blue animate-bounce mb-2" />
                                <p className="text-sm font-semibold text-jumbo-blue">Се отстранува позадина...</p>
                                <p className="text-xs text-gray-400 mt-1">Првиот пат трае малку подолго</p>
                            </div>
                        )}
                    </div>

                    {/* Original/Clean toggle */}
                    {originalUrl && previewUrl && originalUrl !== previewUrl && !isRemovingBg && (
                        <button
                            type="button"
                            onClick={() => setShowOriginal(!showOriginal)}
                            className="w-full text-xs font-medium text-gray-500 hover:text-jumbo-blue transition-colors py-1"
                        >
                            {showOriginal ? '🖼️ Покажи без позадина' : '📷 Покажи оригинал'}
                        </button>
                    )}

                    {/* Two clear buttons: Camera and File */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => cameraInputRef.current?.click()}
                            className="flex items-center justify-center gap-2 bg-jumbo-blue/10 text-jumbo-blue hover:bg-jumbo-blue hover:text-white py-3 px-4 rounded-xl text-sm font-semibold transition-colors"
                        >
                            <Camera size={18} />
                            <span>📱 Камера</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200 py-3 px-4 rounded-xl text-sm font-semibold transition-colors"
                        >
                            <Upload size={18} />
                            <span>📁 Датотека</span>
                        </button>
                    </div>
                    <p className="text-xs text-gray-400 text-center">
                        💡 Камера работи само на телефон. На компјутер, користете „Датотека".
                    </p>

                    {/* Hidden file inputs */}
                    <input
                        ref={cameraInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleImageSelected}
                        className="hidden"
                    />
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelected}
                        className="hidden"
                    />

                    {isProcessing && (
                        <div className="bg-jumbo-blue-light text-jumbo-blue p-3 rounded-lg flex items-center text-sm font-medium animate-pulse">
                            <Wand2 className="w-4 h-4 mr-2 animate-bounce" />
                            AI ги анализира сликата...
                        </div>
                    )}
                </div>

                {/* Right Col: Details Form */}
                <div>
                    <form onSubmit={submitProduct} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Име на артиклот</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="пр. Кукла Барби"
                                required
                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-jumbo-blue focus:border-jumbo-blue outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Категорија</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                required
                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-jumbo-blue focus:border-jumbo-blue outline-none"
                            >
                                <option value="">Избери категорија</option>
                                {CATEGORIES.map(c => (
                                    <option key={c.value} value={c.value}>{c.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Количина</label>
                            <input
                                type="number"
                                min={1}
                                value={stockQuantity}
                                onChange={(e) => setStockQuantity(e.target.value)}
                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-500 mb-1 font-medium">Набавна цена (ден)</label>
                                <input
                                    type="number"
                                    value={purchasePrice}
                                    onChange={(e) => setPurchasePrice(e.target.value)}
                                    placeholder="0"
                                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Продажна цена (ден)</label>
                                <input
                                    type="number"
                                    value={sellingPrice}
                                    onChange={(e) => setSellingPrice(e.target.value)}
                                    placeholder="0"
                                    required
                                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-jumbo-red outline-none border-b-2 border-b-jumbo-red/30 focus:border-b-jumbo-red"
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isProcessing || !name}
                                className="w-full bg-jumbo-blue hover:bg-blue-800 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center"
                            >
                                <ImageUp className="mr-2" />
                                Зачувај и Објави
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
