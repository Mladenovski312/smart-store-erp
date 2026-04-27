import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
    title: 'Политика за приватност',
    description: 'Информации за обработка на лични податоци од страна на Интер Стар ДОО - Куманово.',
};

export default function PrivacyPolicyPage() {
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
                <h1 className="text-3xl font-bold text-gray-900 mb-10">Политика за приватност</h1>

                <div className="bg-white rounded-2xl border border-gray-100 p-8 md:p-10 space-y-8 text-gray-700 leading-relaxed">
                    <section className="rounded-xl border border-blue-100 bg-blue-50 p-5">
                        <h2 className="text-lg font-bold text-gray-900 mb-3">Сајтот е во подготовка</h2>
                        <p>
                            Онлајн нарачките сè уште не се активни. Оваа политика е подготвена однапред за транспарентно да објасни кои податоци може да се обработуваат при користење на сајтот и кои податоци ќе се обработуваат кога онлајн продажбата ќе биде активирана.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-gray-900 mb-3">Контролор на лични податоци</h2>
                        <p>
                            Контролор е Интер Стар ДОО - Куманово, со седиште на ул. Љупчо Арсовски Табак бр. 1, 1300 Куманово. За прашања поврзани со приватност може да нè контактирате на{' '}
                            <a href="mailto:interstarmak@yahoo.com" className="text-jumbo-blue font-semibold hover:underline">interstarmak@yahoo.com</a>.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-gray-900 mb-3">Кои податоци може да ги обработуваме</h2>
                        <ul className="list-disc list-inside space-y-2">
                            <li>Податоци што доброволно ќе ги внесете при контакт со нас, како име, е-пошта, телефон и содржина на пораката.</li>
                            <li>Технички податоци потребни за безбедност и работа на сајтот, како IP адреса, податоци за прелистувач и системски логови.</li>
                            <li>Кога онлајн нарачките ќе бидат активирани: податоци за достава, контакт податоци, содржина на нарачка и комуникација за статус на нарачка.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-gray-900 mb-3">Цел и правна основа</h2>
                        <p>
                            Податоците ги обработуваме за да одговориме на барања, да го одржуваме сајтот безбеден, да подготвиме и извршиме нарачки кога продажбата ќе биде активна, да испратиме сервисни известувања и да ги исполниме законските обврски.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-gray-900 mb-3">Услуги што може да се користат</h2>
                        <ul className="list-disc list-inside space-y-2">
                            <li>Supabase - база на податоци, автентикација и техничка инфраструктура.</li>
                            <li>Resend - испраќање сервисни е-пораки, кога е активирано испраќање на пораки.</li>
                            <li>Sentry или слична алатка - технички извештаи за грешки, ако е активирана.</li>
                            <li>AI асистент - моментално е исклучен. Ако повторно се активира, пораките испратени до асистентот може да се обработуваат преку AI услуга за да се подготви одговор.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-gray-900 mb-3">Колачиња</h2>
                        <p>
                            Сајтот може да користи неопходни колачиња за безбедност, сесија и основна функционалност. За повеќе информации погледнете ја страницата{' '}
                            <Link href="/kolacinja" className="text-jumbo-blue font-semibold hover:underline">Колачиња</Link>.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-gray-900 mb-3">Чување на податоци</h2>
                        <p>
                            Податоците се чуваат само онолку колку што е потребно за целта за која се собрани, за техничка безбедност, за законски обврски или за решавање на евентуални барања и спорови.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-gray-900 mb-3">Ваши права</h2>
                        <p>
                            Имате право да побарате пристап, исправка, бришење, ограничување на обработка, приговор и други права согласно применливите прописи за заштита на лични податоци. За остварување на правата контактирајте нè на наведената е-пошта.
                        </p>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}
