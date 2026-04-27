"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { Product } from '@/lib/types';
import { matchesSearch } from '@/lib/search';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface SearchDropdownProps {
    products: Product[];
    onClose?: () => void;
    autoFocus?: boolean;
}

export default function SearchDropdown({ products, onClose, autoFocus = false }: SearchDropdownProps) {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Debounce search query (300ms)
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(query), 300);
        return () => clearTimeout(timer);
    }, [query]);

    // Filter products by debounced query (supports Latin↔Cyrillic)
    const results = debouncedQuery.length >= 2
        ? products
            .filter(p => matchesSearch(p.name, debouncedQuery))
            .slice(0, 5)
        : [];

    const showDropdown = isOpen && debouncedQuery.length >= 2;

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
                onClose?.();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    // Close on Escape
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setIsOpen(false);
            onClose?.();
        }
        if (e.key === 'Enter' && query.trim()) {
            setIsOpen(false);
            onClose?.();
            router.push(`/catalog?q=${encodeURIComponent(query.trim())}`);
        }
    }, [query, router, onClose]);

    // Auto-focus when mounted
    useEffect(() => {
        if (autoFocus && inputRef.current) {
            inputRef.current.focus();
        }
    }, [autoFocus]);

    return (
        <div ref={containerRef} className="relative w-full">
            <div className="relative flex items-center bg-gray-50 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-jumbo-blue focus-within:bg-white transition-all">
                <Search className="absolute left-4 w-5 h-5 text-gray-400" />
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Пребарај играчки..."
                    value={query}
                    onChange={e => { setQuery(e.target.value); setIsOpen(true); }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    className="w-full pl-12 pr-10 py-3 text-gray-900 placeholder-gray-400 text-sm bg-transparent outline-none"
                />
                {query && (
                    <button
                        onClick={() => { setQuery(''); setDebouncedQuery(''); inputRef.current?.focus(); }}
                        aria-label="Исчисти пребарување"
                        className="absolute right-4 p-0.5 rounded-full text-gray-400 hover:text-gray-600"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>

            {/* Results Dropdown */}
            {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                    {results.length > 0 ? (
                        <>
                            {results.map(product => (
                                <Link
                                    key={product.id}
                                    href={`/produkt/${product.slug}`}
                                    onClick={() => { setIsOpen(false); onClose?.(); }}
                                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="w-12 h-12 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center shrink-0 relative">
                                        {product.imageUrl ? (
                                            <Image src={product.imageUrl} alt={product.name} fill sizes="48px" className="object-contain p-1" />
                                        ) : (
                                            <span className="text-gray-300 text-lg font-bold">{product.name.charAt(0)}</span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                                        <p className="text-xs text-gray-400">{product.category}</p>
                                    </div>
                                    <span className="text-xs font-semibold text-jumbo-blue whitespace-nowrap">
                                        Во подготовка
                                    </span>
                                </Link>
                            ))}
                            <Link
                                href={`/catalog?q=${encodeURIComponent(query.trim())}`}
                                onClick={() => { setIsOpen(false); onClose?.(); }}
                                className="block px-4 py-3 text-center text-sm font-semibold text-jumbo-blue bg-gray-50 hover:bg-gray-100 transition-colors border-t border-gray-100"
                            >
                                Покажи ги сите резултати
                            </Link>
                        </>
                    ) : (
                        <div className="px-4 py-6 text-center text-sm text-gray-500">
                            Нема резултати за &ldquo;{debouncedQuery}&rdquo;
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
