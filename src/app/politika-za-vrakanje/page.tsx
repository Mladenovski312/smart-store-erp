import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Политика за Враќање',
    description: 'Информации за враќање на производи во Интер Стар Џамбо. Онлајн нарачките сè уште не се активни.',
};

export default function ReturnsPolicyPage() {
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
                                ИНТЕР СТАР <span className="text-red-300">ЏАМБО</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-3xl font-bold text-gray-900 mb-10">Политика за Враќање</h1>

                <div className="bg-white rounded-2xl border border-gray-100 p-8 md:p-10 space-y-8 text-gray-700 leading-relaxed">
                    <section className="rounded-xl border border-blue-100 bg-blue-50 p-5">
                        <h2 className="text-lg font-bold text-gray-900 mb-3">Онлајн продажбата е во подготовка</h2>
                        <p>
                            Онлајн нарачките сè уште не се активни. Оваа страница е информативна и ќе биде финално усогласена пред овозможување на онлајн продажба преку сајтот.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-gray-900 mb-3">Право на враќање</h2>
                        <p>
                            По активирање на онлајн нарачките, условите за враќање, роковите и постапката ќе бидат јасно наведени пред склучување на нарачка.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-gray-900 mb-3">Услови</h2>
                        <ul className="list-disc list-inside space-y-2">
                            <li>Производот мора да биде неотворен и во оригинална амбалажа</li>
                            <li>Придружете го со оригиналниот фискален сметка</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-gray-900 mb-3">Исклучоци</h2>
                        <ul className="list-disc list-inside space-y-2">
                            <li>Отворени друштвени игри и слагалки</li>
                            <li>Употребувани плишани играчки</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-gray-900 mb-3">Одговорност за доцнење</h2>
                        <p>
                            Условите за испорака и одговорноста поврзана со доставувачка служба ќе бидат јасно објавени пред активирање на онлајн нарачките.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-gray-900 mb-3">Процедура</h2>
                        <p>
                            Контактирајте не на{' '}
                            <a href="mailto:interstarmak@yahoo.com" className="text-jumbo-blue font-semibold hover:underline">
                                interstarmak@yahoo.com
                            </a>
                            {' '}или јавете се на{' '}
                            <a href="tel:+38931422656" className="text-jumbo-blue font-semibold hover:underline">
                                +389 31 422 656
                            </a>.
                        </p>
                        <p className="mt-2">
                            Ќе ве упатиме за враќање по пошта или лично во продавницата.
                        </p>
                    </section>
                </div>
            </div>

            <Footer />
        </div>
    );
}
