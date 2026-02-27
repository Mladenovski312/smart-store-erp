"use client";

import Link from 'next/link';
import { ChevronLeft, MapPin, Phone, Clock, Navigation } from 'lucide-react';
import Footer from '@/components/Footer';

export default function LocationPage() {
    return (
        <div className="min-h-screen flex flex-col">
            {/* Nav */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-jumbo-blue transition-colors">
                                <ChevronLeft size={20} />
                                <span className="text-sm font-medium hidden sm:inline">Назад</span>
                            </Link>
                            <Link href="/" className="bg-jumbo-blue text-white px-2.5 py-1 rounded-lg font-black text-sm tracking-tight">
                                ИНТЕР СТАР <span className="text-jumbo-red">ЏАМБО</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Info Bar */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 mb-1">Најди не</h1>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1.5">
                                    <MapPin size={14} className="text-jumbo-red" />
                                    Народна Револуција 43, Куманово
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Phone size={14} className="text-jumbo-red" />
                                    <a href="tel:+38931422656" className="hover:text-jumbo-blue transition-colors">+389 31 422 656</a>
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Clock size={14} className="text-jumbo-red" />
                                    Пон – Саб: 09:00 – 21:00
                                </span>
                            </div>
                        </div>
                        <a
                            href="https://www.google.com/maps/dir//Jumbo,+Kumanovo"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-jumbo-blue text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-800 transition-colors shadow-sm"
                        >
                            <Navigation size={16} />
                            Добиј насоки
                        </a>
                    </div>
                </div>
            </div>

            {/* Map with padding */}
            <div className="flex-1 bg-gray-100 px-[5%] sm:px-[10%] py-8">
                <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-200 h-full">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2900!2d21.718548680865844!3d42.1330786543227!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x13544f8cf33a150f%3A0xfe7619aec3320047!2sJumbo!5e0!3m2!1sen!2smk!4v1772034178629!5m2!1sen!2smk"
                        width="100%"
                        height="100%"
                        style={{ border: 0, minHeight: '80vh' }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Интер Стар Џамбо — Локација"
                    />
                </div>
            </div>

            <Footer />
        </div>
    );
}
