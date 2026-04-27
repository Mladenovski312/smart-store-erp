import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
    title: 'Услови за испорака',
    description: 'Условите за испорака за онлајн нарачки од Интер Стар Џамбо се во подготовка.',
};

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
                                ИНТЕР СТАР <span className="text-red-300">ЏАМБО</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-3xl font-bold text-gray-900 mb-10">Услови за испорака</h1>

                <div className="bg-white rounded-2xl border border-gray-100 p-8 md:p-10 space-y-6 text-gray-700 leading-relaxed">
                    <p>
                        Онлајн нарачките сè уште не се активни. Каталогот, цените и условите за испорака се во подготовка додека ги усогласуваме сите правни информации и процеси за онлајн продажба.
                    </p>

                    <p>
                        Условите за испорака, роковите, начинот на плаќање и сите можни трошоци ќе бидат јасно објавени пред да се овозможи склучување на онлајн нарачки преку сајтот.
                    </p>
                </div>
            </div>

            <Footer />
        </div>
    );
}
