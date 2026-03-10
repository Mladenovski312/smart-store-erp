'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { addToCart } from '@/lib/cart';

const SESSION_LIMIT = 10;
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
        category: string;
        price: number;
        image_url: string | null;
        slug: string;
        stock: number;
    };
    reason: string;
}

interface ChatEntry {
    role: 'user' | 'assistant';
    text: string;
    recommendations?: Recommendation[];
}

export default function GiftFinderModal({ onClose }: { onClose: () => void }) {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [chat, setChat] = useState<ChatEntry[]>([]);
    const [errorType, setErrorType] = useState<'quota' | 'session_limit' | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [chat, loading]);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSubmit = async () => {
        if (getSessionCount() >= SESSION_LIMIT) {
            setErrorType('session_limit');
            return;
        }
        if (!query.trim()) return;

        const userMessage = query.trim();
        setQuery('');
        setChat(prev => [...prev, { role: 'user', text: userMessage }]);
        setLoading(true);
        setErrorType(null);
        incrementSessionCount();

        try {
            const res = await fetch('/api/gift-finder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: userMessage }),
            });

            if (res.status === 429) {
                setErrorType('quota');
                setLoading(false);
                return;
            }

            const data = await res.json();
            setChat(prev => [
                ...prev,
                {
                    role: 'assistant',
                    text: data.message || 'Се извинувам, обиди се повторно.',
                    recommendations: data.recommendations?.length ? data.recommendations : undefined,
                },
            ]);
        } catch {
            setChat(prev => [
                ...prev,
                { role: 'assistant', text: 'Се извинувам, настана грешка. Обиди се повторно.' },
            ]);
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

    return (
        <div className="fixed bottom-[88px] md:bottom-8 right-3 md:right-5 z-50 w-[380px] max-w-[calc(100vw-1.5rem)]
                        flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-200
                        overflow-hidden"
            style={{ maxHeight: 'min(726px, calc(100vh - 3rem))' }}
        >
            {/* Header */}
            <div className="bg-[#1A3C5E] px-4 py-3 flex items-center gap-3 shrink-0">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="scale-x-[-1]">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold leading-tight">Интер Стар Џамбо</p>
                    <p className="text-white/70 text-xs">Асистент</p>
                </div>
                <button
                    onClick={onClose}
                    className="text-white/70 hover:text-white transition-colors p-1"
                    aria-label="Затвори"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
            </div>

            {/* Chat area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 min-h-0">
                {/* Welcome message */}
                {chat.length === 0 && !errorType && (
                    <div className="flex gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#1A3C5E] flex items-center justify-center shrink-0 mt-0.5">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="scale-x-[-1]">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-xl rounded-tl-sm px-3 py-2 max-w-[85%]">
                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                Добредојдовте на страната на Интер Стар Џамбо! 👋
                                <br />Јас сум вашиот виртуелен асистент.<br />Како можам да ви помогнам денес?
                            </p>
                        </div>
                    </div>
                )}

                {/* Chat messages */}
                {chat.map((entry, i) => (
                    <div key={i}>
                        {entry.role === 'user' ? (
                            <div className="flex justify-end">
                                <div className="bg-[#1A3C5E] text-white rounded-xl rounded-tr-sm px-3 py-2 max-w-[85%]">
                                    <p className="text-sm">{entry.text}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <div className="w-7 h-7 rounded-full bg-[#1A3C5E] flex items-center justify-center shrink-0 mt-0.5">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="scale-x-[-1]">
                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                    </svg>
                                </div>
                                <div className="max-w-[85%] space-y-2">
                                    <div className="bg-white border border-gray-200 rounded-xl rounded-tl-sm px-3 py-2">
                                        <p className="text-sm text-gray-700 leading-relaxed">{entry.text}</p>
                                    </div>

                                    {/* Product cards */}
                                    {entry.recommendations?.map(({ product, reason }) => (
                                        <div key={product.id} className="bg-white border border-gray-200 rounded-xl p-2.5 flex gap-2.5">
                                            {product.image_url && (
                                                <div className="relative w-14 h-14 flex-shrink-0">
                                                    <Image
                                                        src={product.image_url}
                                                        alt={product.name}
                                                        fill
                                                        className="object-contain rounded-lg"
                                                        sizes="56px"
                                                    />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-xs text-[#1A3C5E] truncate">{product.name}</p>
                                                <p className="text-[11px] text-gray-500 italic mt-0.5">{reason}</p>
                                                <div className="flex items-center justify-between mt-1.5 gap-2">
                                                    <p className="font-bold text-sm text-[#E8943A]">{product.price.toLocaleString()} ден</p>
                                                    <div className="flex gap-1.5">
                                                        <a
                                                            href={`/produkt/${product.slug}`}
                                                            className="text-[11px] text-[#1A3C5E] hover:underline"
                                                        >
                                                            Отвори
                                                        </a>
                                                        <button
                                                            onClick={() => handleAddToCart(product)}
                                                            className="text-[11px] bg-[#1A3C5E] text-white px-2 py-0.5 rounded hover:bg-[#E8943A] transition-colors"
                                                        >
                                                            Купи
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {/* Loading indicator */}
                {loading && (
                    <div className="flex gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#1A3C5E] flex items-center justify-center shrink-0">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="scale-x-[-1]">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-xl rounded-tl-sm px-4 py-2.5">
                            <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Error */}
                {errorType && (
                    <div className="flex gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#1A3C5E] flex items-center justify-center shrink-0">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="scale-x-[-1]">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-xl rounded-tl-sm px-3 py-2 max-w-[85%]">
                            <p className="text-sm text-gray-600">
                                {errorType === 'quota'
                                    ? 'Во моментов не можам да одговорам. Обиди се повторно подоцна.'
                                    : 'Ја искористи границата за оваа сесија. Јави се на +389 31 422 656 за повеќе помош!'}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Input area */}
            <div className="border-t border-gray-200 p-3 bg-white shrink-0">
                <div className="flex gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !loading && handleSubmit()}
                        placeholder="Напиши порака..."
                        maxLength={500}
                        disabled={loading || errorType === 'session_limit'}
                        className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm
                                   focus:outline-none focus:border-[#1A3C5E] focus:ring-1 focus:ring-[#1A3C5E]/20
                                   disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !query.trim() || errorType === 'session_limit'}
                        className="bg-[#1A3C5E] text-white w-9 h-9 rounded-full flex items-center justify-center
                                   hover:bg-[#E8943A] transition-colors disabled:opacity-40 shrink-0"
                        aria-label="Испрати"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13" />
                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
