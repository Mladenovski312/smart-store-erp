import Link from 'next/link';
import { Wrench, ChevronLeft } from 'lucide-react';

export default function SiteUnderConstruction() {
    return (
        <div className="max-w-2xl mx-auto px-4 py-16 sm:py-24">
            <div className="bg-white rounded-2xl border border-gray-100 p-8 sm:p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-yellow-100 flex items-center justify-center">
                    <Wrench className="w-8 h-8 text-yellow-700" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                    Сајтот е во изработка
                </h1>
                <p className="text-gray-600 leading-relaxed mb-6">
                    Онлајн нарачките се привремено оневозможени. За нарачки и информации, ве молиме контактирајте нé:
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
                    <a
                        href="tel:+38931422656"
                        className="inline-flex items-center justify-center gap-2 bg-jumbo-blue text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-800 transition-colors"
                    >
                        031 422 656
                    </a>
                    <a
                        href="mailto:info@interstarjumbo.mk"
                        className="inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-800 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                    >
                        info@interstarjumbo.mk
                    </a>
                </div>
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-gray-500 hover:text-jumbo-blue transition-colors text-sm font-medium"
                >
                    <ChevronLeft size={16} />
                    Назад на почетна
                </Link>
            </div>
        </div>
    );
}
