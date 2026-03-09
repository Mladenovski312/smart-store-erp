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
            <button
                onClick={() => setOpen(true)}
                className="fixed bottom-6 right-6 z-50 bg-[#1A3C5E] hover:bg-[#E8943A]
                           text-white px-4 py-3 rounded-full shadow-lg
                           transition-colors duration-200 font-semibold text-sm"
                aria-label="Отвори асистент за производи"
            >
                Побарај производ
            </button>
            {open && <GiftFinderModal onClose={() => setOpen(false)} />}
        </>
    );
}
