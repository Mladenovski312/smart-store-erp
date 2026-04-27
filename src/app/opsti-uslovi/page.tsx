import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
    title: 'Општи услови',
    description: 'Општи услови за користење на interstarjumbo.com од Интер Стар ДОО - Куманово.',
};

export default function TermsPage() {
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
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Општи услови</h1>
                <p className="text-sm text-gray-500 mb-10">Последно ажурирање: 27.04.2026</p>

                <div className="bg-white rounded-2xl border border-gray-100 p-8 md:p-10 space-y-8 text-gray-700 leading-relaxed">
                    <section className="rounded-xl border border-blue-100 bg-blue-50 p-5">
                        <h2 className="text-lg font-bold text-gray-900 mb-3">Моментален статус</h2>
                        <p>
                            Сајтот моментално работи како каталог во подготовка. Цените, онлајн нарачките, плаќањето и испораката не се активни преку сајтот. Со разгледување на производите во моментов не се склучува договор по електронски пат.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-gray-900 mb-3">Давател на услугата</h2>
                        <p>
                            Давател на услугата е Интер Стар ДОО - Куманово. Правните информации за друштвото, седиште, ЕМБС, ДДВ број и контакт се објавени на страницата{' '}
                            <Link href="/za-nas" className="text-jumbo-blue font-semibold hover:underline">За нас</Link>.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-gray-900 mb-3">Користење на каталогот</h2>
                        <p>
                            Производите, фотографиите, категориите и описите се прикажани како информативен каталог додека сајтот е во подготовка. Можно е дел од содржината да биде тест, непотполна или предмет на промена пред целосно активирање на онлајн продажбата.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-gray-900 mb-3">Склучување на договор</h2>
                        <p>
                            Во моменталната состојба не може да се направи онлајн нарачка и не може да се склучи договор преку сајтот. Пред активирање на продажбата ќе бидат јасно објавени техничките чекори за нарачка, јазикот на склучување, начинот за проверка и исправка на грешки, како и дали и како договорот или нарачката ќе бидат достапни за корисникот.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-gray-900 mb-3">Цени, плаќање и испорака</h2>
                        <p>
                            Цените и онлајн нарачките се во подготовка. Пред овозможување на онлајн продажба ќе бидат јасно наведени валутата, даноците, трошоците за испорака и сите други трошоци кои можат да влијаат на цената.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-gray-900 mb-3">Враќање и рекламации</h2>
                        <p>
                            Информациите за враќање и рекламации се објавени на страницата{' '}
                            <Link href="/politika-za-vrakanje" className="text-jumbo-blue font-semibold hover:underline">Политика за враќање</Link>. Тие ќе бидат финално усогласени пред активирање на онлајн продажбата.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-gray-900 mb-3">Приватност</h2>
                        <p>
                            Обработката на лични податоци е објаснета во{' '}
                            <Link href="/politika-za-privatnost" className="text-jumbo-blue font-semibold hover:underline">Политиката за приватност</Link>.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-gray-900 mb-3">Применливо право</h2>
                        <p>
                            За користењето на сајтот и идните онлајн нарачки се применуваат важечките прописи на Република Северна Македонија.
                        </p>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}
