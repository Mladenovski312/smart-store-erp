"use client";

import Link from 'next/link';
import { MapPin, Phone, Clock, Mail, Facebook } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-white">
            {/* Main Footer */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div>
                        <Link href="/" className="inline-block mb-4">
                            <div className="bg-jumbo-blue text-white px-3 py-1.5 rounded-lg font-black text-sm tracking-tight inline-block">
                                ИНТЕР СТАР <span className="text-jumbo-red">ЏАМБО</span>
                            </div>
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Најголемиот избор на играчки во Куманово. Квалитетни производи за секоја возраст.
                        </p>
                        <div className="flex gap-3 mt-4">
                            <a href="https://www.facebook.com/InterStarJumbo/" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-white/10 hover:bg-jumbo-blue rounded-lg flex items-center justify-center transition-colors">
                                <Facebook size={16} />
                            </a>
                        </div>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-bold text-sm uppercase tracking-wider mb-4">Контакт</h4>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-start gap-2.5 text-gray-400">
                                <MapPin size={16} className="text-jumbo-red mt-0.5 shrink-0" />
                                <span>Народна Револуција 43, Куманово</span>
                            </li>
                            <li className="flex items-center gap-2.5 text-gray-400">
                                <Phone size={16} className="text-jumbo-red shrink-0" />
                                <a href="tel:+38931422656" className="hover:text-white transition-colors">+389 31 422 656</a>
                            </li>
                            <li className="flex items-center gap-2.5 text-gray-400">
                                <Mail size={16} className="text-jumbo-red shrink-0" />
                                <a href="mailto:info@interstarjumbo.mk" className="hover:text-white transition-colors">info@interstarjumbo.mk</a>
                            </li>
                            <li className="flex items-start gap-2.5 text-gray-400">
                                <Clock size={16} className="text-jumbo-red mt-0.5 shrink-0" />
                                <div>
                                    <p>Пон – Саб: 09:00 – 21:00</p>
                                    <p>Недела: Затворено</p>
                                </div>
                            </li>
                        </ul>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-bold text-sm uppercase tracking-wider mb-4">Навигација</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/" className="text-gray-400 hover:text-white transition-colors">Почетна</Link></li>
                            <li><Link href="/catalog" className="text-gray-400 hover:text-white transition-colors">Каталог</Link></li>
                            <li><Link href="/uslovi-za-isporaka" className="text-gray-400 hover:text-white transition-colors">Услови за испорака</Link></li>
                            <li><Link href="/admin" className="text-gray-400 hover:text-white transition-colors">Администрација</Link></li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <p className="text-xs text-gray-500">
                        © {new Date().getFullYear()} Интер Стар Џамбо. Сите права задржани.
                    </p>
                    <div className="flex gap-4 text-xs text-gray-500">
                        <Link href="/uslovi-za-isporaka" className="hover:text-white transition-colors">Услови за испорака</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
