"use client";

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import Footer from '@/components/Footer';

export default function DeliveryTermsPage() {
    return (
        <div className="min-h-screen bg-gray-50">
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

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-3xl font-bold text-gray-900 mb-10">Услови за испорака</h1>

                <div className="bg-white rounded-2xl border border-gray-100 p-8 md:p-10 space-y-6 text-gray-700 leading-relaxed">
                    <p>
                        Испораката се врши на адресата дефинирана од Купувачот при извршената нарачка исклучиво на подрачјето на Р. Македонија само на лицето со својство на Купувач (име и презиме) или на лицето дефинирано како преземач на нарачката од страна на Купувачот.
                    </p>

                    <p>
                        Испораката се наплаќа во зависност од тежината на производот, без оглед на висината на износот на нарачката, а преземањето може да се изврши исклучиво од страна на Купувачот (или наведеното лице за прием на нарачката) со покажување валиден документ за лична идентификација.
                    </p>

                    <p>
                        Испораката на нарачките ќе се врши преку доставувачка компанија — партнер за логистика на Интер Стар ДОО - Куманово за овој вид испораки.
                    </p>

                    <p>
                        Партнерот за логистика на Интер Стар ДОО за овој вид испораки, има обврска да го контактира Купувачот за да се договори точното време на испорака во рок од 3 до 7 работни дена по извршената онлајн нарачка.
                    </p>

                    <p>
                        Доколку доставувачот — овластеното лице на партнерот за логистика на Интер Стар ДОО - Куманово за овој вид испораки не успее да го најде Купувачот или наведеното лице за прием на нарачката на наведената адреса за испорака, ќе биде оставена писмена информација до испраќачот за направен обид за испорака и информации за контакт, каде што Купувачот е должен да се јави во рок од 2 работни дена, со цел повторно да се договори термин за испорака на нарачката на адресата на Купувачот.
                    </p>

                    <p>
                        Доколку Купувачот не се јави во продолжениот рок од 2 дена, Интер Стар ДОО - Куманово има потполно право да го задржи производот и/или услугата, а парите не ги враќаме назад.
                    </p>
                </div>
            </div>

            <Footer />
        </div>
    );
}
