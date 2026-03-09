'use client';

import { useState } from 'react';
import Image from 'next/image';
import { addToCart } from '@/lib/cart';

const STARTERS = [
    'Играчка за дете на 3 години',
    'LEGO за почетник до 3000 ден',
    'Нешто за бебе',
];

const SESSION_LIMIT = 3;
const SESSION_KEY = 'gf_count';

function getSessionCount(): number {
    if (typeof window === 'undefined') return 0;
    return parseInt(sessionStorage.getItem(SESSION_KEY) ?? '0');
}

function incrementSessionCount() {
    sessionStorage.setItem(SESSION_KEY, String(getSessionCount() + 1));
}

interface Recommendation {
    product: {
        id: string;
        name: string;
        brand: string;
        price: number;
        image_url: string | null;
        slug: string;
        stock: number;
    };
    reason: string;
}

export default function GiftFinderModal({ onClose }: { onClose: () => void }) {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [errorType, setErrorType] = useState<
        'no_results' | 'quota' | 'session_limit' | null
    >(null);

    const handleSubmit = async () => {
        if (getSessionCount() >= SESSION_LIMIT) {
            setErrorType('session_limit');
            return;
        }
        if (!query.trim()) return;

        setLoading(true);
        setErrorType(null);
        setRecommendations([]);
        incrementSessionCount();

        try {
            const res = await fetch('/api/gift-finder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query }),
            });

            if (res.status === 429) {
                setErrorType('quota');
                return;
            }

            const data = await res.json();

            if (!data.recommendations?.length) {
                setErrorType('no_results');
            } else {
                setRecommendations(data.recommendations);
            }
        } catch {
            setErrorType('no_results');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = (product: Recommendation['product']) => {
        addToCart({
            productId: product.id,
            name: product.name,
            price: product.price,
            imageUrl: product.image_url ?? undefined,
            stock: product.stock,
        });
        onClose();
    };

    const catalogButton = (
        <a
            href="/catalog"
            className="inline-block mt-3 px-4 py-2 bg-[#1A3C5E] text-white rounded text-sm hover:bg-[#E8943A] transition-colors"
        >
            Кон каталогот
        </a>
    );

    const errorMessages = {
        no_results: 'Немаме производ што одговара на твоето барање. Разгледај го нашиот каталог!',
        quota: 'Во моментов не можам да пребарувам. Разгледај го нашиот каталог!',
        session_limit: 'Ја искористи границата за оваа сесија. Можеш да го разгледаш целиот каталог!',
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
            <div
                className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 p-6"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <p className="text-[#1A3C5E] font-semibold text-base">
                        Јас сум твојот асистент за производите на Интер Стар Џамбо.
                    </p>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 ml-4 text-xl leading-none"
                        aria-label="Затвори"
                    >
                        ✕
                    </button>
                </div>

                {/* Starter chips */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {STARTERS.map(s => (
                        <button
                            key={s}
                            onClick={() => setQuery(s)}
                            className="text-xs border border-gray-300 rounded-full px-3 py-1
                                       hover:border-[#1A3C5E] hover:text-[#1A3C5E] transition-colors"
                        >
                            {s}
                        </button>
                    ))}
                </div>

                {/* Input */}
                <div className="flex gap-2 mb-4">
                    <input
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                        placeholder="пр. играчка за дете на 3 години до 800 ден"
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm
                                   focus:outline-none focus:border-[#1A3C5E]"
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !query.trim()}
                        className="bg-[#1A3C5E] text-white px-4 py-2 rounded-lg text-sm
                                   hover:bg-[#E8943A] transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Пребаруваме...' : 'Пребарај'}
                    </button>
                </div>

                {/* Error states */}
                {errorType && (
                    <div className="text-center py-4">
                        <p className="text-gray-600 text-sm">{errorMessages[errorType]}</p>
                        {catalogButton}
                    </div>
                )}

                {/* Results */}
                {recommendations.length > 0 && (
                    <div className="space-y-3 mt-2 max-h-80 overflow-y-auto">
                        {recommendations.map(({ product, reason }) => (
                            <div key={product.id} className="flex gap-3 border rounded-lg p-3">
                                {product.image_url && (
                                    <div className="relative w-16 h-16 flex-shrink-0">
                                        <Image
                                            src={product.image_url}
                                            alt={product.name}
                                            fill
                                            className="object-contain rounded"
                                            sizes="64px"
                                        />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm text-[#1A3C5E] truncate">{product.name}</p>
                                    <p className="text-xs text-gray-500 mb-1">{product.brand}</p>
                                    <p className="text-xs text-gray-600 mb-2 italic">{reason}</p>
                                    <p className="font-bold text-sm text-[#E8943A]">{product.price} ден</p>
                                </div>
                                <div className="flex flex-col gap-1 justify-center">
                                    <button
                                        onClick={() => handleAddToCart(product)}
                                        className="text-xs bg-[#1A3C5E] text-white px-2 py-1 rounded hover:bg-[#E8943A] transition-colors whitespace-nowrap"
                                    >
                                        Додади во кошничка
                                    </button>
                                    <a
                                        href={`/produkt/${product.slug}`}
                                        className="text-xs text-center text-gray-500 hover:text-[#1A3C5E] underline"
                                    >
                                        Види повеќе
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
