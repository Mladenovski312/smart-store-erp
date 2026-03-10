'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import GiftFinderModal from './GiftFinderModal';

export default function GiftFinder() {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();

    if (pathname.startsWith('/admin')) return null;

    return (
        <>
            {!open && (
                <button
                    onClick={() => setOpen(true)}
                    className="fixed bottom-[88px] md:bottom-8 right-3 md:right-5 z-50 bg-[#1A3C5E] hover:bg-[#E8943A]
                               text-white w-14 h-14 rounded-full shadow-lg
                               transition-all duration-200 flex items-center justify-center
                               hover:scale-105 active:scale-95"
                    aria-label="Отвори асистент"
                >
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="scale-x-[-1]">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                </button>
            )}
            {open && <GiftFinderModal onClose={() => setOpen(false)} />}
        </>
    );
}
