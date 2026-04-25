import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft, Building2, MapPin, Phone, Mail, Clock, Receipt, FileText } from 'lucide-react';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
    title: 'За нас',
    description: 'Информации за Интер Стар ДОО — Куманово. Седиште, ЕМБС, ДДВ, контакт и работно време.',
    alternates: { canonical: 'https://interstarjumbo.com/za-nas' },
};

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-jumbo-blue transition-colors">
                            <ChevronLeft size={20} />
                            <span className="text-sm font-medium hidden sm:inline">Почетна</span>
                        </Link>
                        <Link href="/" className="bg-jumbo-blue text-white px-2.5 py-1 rounded-lg font-black text-sm tracking-tight">
                            ИНТЕР СТАР <span className="text-red-300">ЏАМБО</span>
                        </Link>
                        <div className="w-20" />
                    </div>
                </div>
            </nav>

            <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                <header className="mb-10 text-center">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">За нас</h1>
                    <p className="text-gray-600 max-w-xl mx-auto leading-relaxed">
                        Со над 20 години искуство, Интер Стар Џамбо е една од најпознатите продавници за играчки во Куманово. Нашата мисија е да донесеме радост на секое дете преку широк избор на квалитетни играчки од светски брендови.
                    </p>
                </header>

                <section className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 mb-6">
                    <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-5">
                        <Building2 className="w-5 h-5 text-jumbo-blue" />
                        Правни информации
                    </h2>
                    <dl className="space-y-3 text-sm">
                        <div className="grid grid-cols-1 sm:grid-cols-[10rem_1fr] gap-1 sm:gap-4">
                            <dt className="text-gray-500 font-medium">Назив на друштво:</dt>
                            <dd className="text-gray-900 font-semibold">Интер Стар ДОО — Куманово</dd>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-[10rem_1fr] gap-1 sm:gap-4">
                            <dt className="text-gray-500 font-medium">Седиште:</dt>
                            <dd className="text-gray-900">ул. Љупчо Арсовски Табак бр. 1, 1300 Куманово, Република Северна Македонија</dd>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-[10rem_1fr] gap-1 sm:gap-4">
                            <dt className="text-gray-500 font-medium">ЕМБС:</dt>
                            <dd className="text-gray-900 font-mono">5742170</dd>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-[10rem_1fr] gap-1 sm:gap-4">
                            <dt className="text-gray-500 font-medium">ДДВ број (ЕДБ):</dt>
                            <dd className="text-gray-900 font-mono">MK4017003143931</dd>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-[10rem_1fr] gap-1 sm:gap-4">
                            <dt className="text-gray-500 font-medium">Регистриран во:</dt>
                            <dd className="text-gray-900">Централен регистар на Република Северна Македонија</dd>
                        </div>
                    </dl>
                </section>

                <section className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 mb-6">
                    <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-5">
                        <Mail className="w-5 h-5 text-jumbo-blue" />
                        Контакт
                    </h2>
                    <ul className="space-y-4 text-sm">
                        <li className="flex items-start gap-3">
                            <Mail size={18} className="text-jumbo-red shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-0.5">За правни прашања</p>
                                <a href="mailto:interstarmak@yahoo.com" className="text-gray-900 hover:text-jumbo-blue transition-colors break-all">
                                    interstarmak@yahoo.com
                                </a>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <Mail size={18} className="text-jumbo-red shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-0.5">За нарачки</p>
                                <a href="mailto:info@interstarjumbo.mk" className="text-gray-900 hover:text-jumbo-blue transition-colors break-all">
                                    info@interstarjumbo.mk
                                </a>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <Phone size={18} className="text-jumbo-red shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-0.5">Телефон</p>
                                <a href="tel:+38931422656" className="text-gray-900 hover:text-jumbo-blue transition-colors">
                                    +389 31 422 656
                                </a>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <MapPin size={18} className="text-jumbo-red shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-0.5">Физичка продавница</p>
                                <p className="text-gray-900">ул. Народна Револуција 30-4, Куманово</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <Clock size={18} className="text-jumbo-red shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-0.5">Работно време на продавницата</p>
                                <p className="text-gray-900">Понеделник – Сабота: 09:00 – 21:00</p>
                                <p className="text-gray-500 text-xs">Недела: Затворено</p>
                            </div>
                        </li>
                    </ul>
                </section>

                <section className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 mb-6">
                    <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-5">
                        <Receipt className="w-5 h-5 text-jumbo-blue" />
                        Цени и испорака
                    </h2>
                    <p className="text-sm text-gray-700 leading-relaxed mb-3">
                        Сите цени на сајтот се изразени во денари (МКД) и се <strong>со вклучен ДДВ</strong>.
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                        Трошоците за испорака <strong>не се вклучени</strong> во прикажаните цени и ќе бидат договорени со давателот при контакт за нарачка.
                    </p>
                </section>

                <section className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
                    <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-5">
                        <FileText className="w-5 h-5 text-jumbo-blue" />
                        Документи
                    </h2>
                    <ul className="space-y-2 text-sm">
                        <li>
                            <Link href="/uslovi-za-isporaka" className="text-jumbo-blue hover:underline">Услови за испорака</Link>
                        </li>
                        <li>
                            <Link href="/politika-za-vrakanje" className="text-jumbo-blue hover:underline">Политика за враќање</Link>
                        </li>
                    </ul>
                </section>
            </main>

            <Footer />
        </div>
    );
}
