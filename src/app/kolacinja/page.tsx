import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
    title: 'Колачиња',
    description: 'Информации за користење колачиња на interstarjumbo.com.',
};

export default function CookiesPage() {
    return (
        <div className="min-h-screen bg-gray-50">
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

            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Колачиња</h1>
                <p className="text-sm text-gray-500 mb-10">Последно ажурирање: 27.04.2026</p>

                <div className="bg-white rounded-2xl border border-gray-100 p-8 md:p-10 space-y-8 text-gray-700 leading-relaxed">
                    <section>
                        <h2 className="text-lg font-bold text-gray-900 mb-3">Што се колачиња</h2>
                        <p>
                            Колачиња се мали текстуални датотеки што може да се зачуваат во вашиот уред при посета на веб-страница. Тие помагаат страницата да работи правилно, да биде безбедна и да запомни одредени поставки.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-gray-900 mb-3">Кои колачиња ги користиме</h2>
                        <p>
                            Во моменталната pre-launch состојба, сајтот може да користи неопходни технички колачиња или слични технологии за безбедност, сесија, администраторска најава и основна функционалност. Овие колачиња се потребни за работа на сајтот.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-gray-900 mb-3">Аналитика, маркетинг и AI алатки</h2>
                        <p>
                            Во моментов не е поставен посебен јавен cookie consent банер. Пред активирање на неесенцијални аналитички, маркетинг или AI функционалности за јавни корисници, ќе додадеме соодветна информација и контроли за согласност каде што е потребно.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-gray-900 mb-3">Контрола на колачиња</h2>
                        <p>
                            Колачињата може да ги избришете или блокирате преку поставките на вашиот прелистувач. Блокирањето на неопходни колачиња може да влијае на правилното функционирање на сајтот.
                        </p>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}
